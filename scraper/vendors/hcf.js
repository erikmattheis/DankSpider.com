const axios = require('../services/rateLimitedAxios.js');
const cheerio = require('cheerio');
const { normalizeVariantName, normalizeProductTitle } = require('../services/strings.js')
const { recognize } = require('../services/ocr.js');
const fs = require('fs');
const { transcribeAssay } = require('../services/cortex.js');
const { terpeneNameList, cannabinoidNameList } = require('../services/cortex.js');
const logger = require('../services/logger.js');
const { saveAssays, getAssays } = require('../services/firebase.js');

async function getListOfTHCAPDFs() {

  let html = await axios.get(coaURL);
  html = html.data;

  const $ = cheerio.load(html);

  const products = [];

  $("#row-1678248903 a button span").each((index, element) => {

    const url = $(element).attr('href');
    const name = $(element).text().trim();


    products.push({ name, url });
    console.log('products', name, url)
  });

  return products;
}

async function recordAssays() {

  try {

    const links = await getListOfTHCAPDFs();

    let result = await recognize(links);

    result = transcribeAssay(result);

    const assays = result.map(a => {
      return {
        ...a,
        vendor: 'HCF'
      }
    })

    await saveAssays('HCF', assays);

  }
  catch (error) {

    logger.error(error)

    return [];
  }
}


const coaURL = 'https://handcraftedfarmers.com/pages/compliances'
async function getProductList() {

  let html = await axios.get(coaURL);
  html = html.data;

  const $ = cheerio.load(html);

  const products = [];

  const nodes = $("#shopify-section-template--16331977490629__main a");

  for (const element of nodes) {

    const url = $(element).attr('href');

    let title = $(element).text().trim();

    title = title.replace('COA - ', '').trim();

    const page = await axios.get(url);

    const _$ = cheerio.load(page.data);

    const coa = _$('main img').attr('src');

    products.push({ title, url, images: [coa] });

  };

  return products;
}


let currentPage = 1;
const startUrl = 'https://handcraftedfarmers.com/collections/all-products?filter.v.availability=1&filter.v.price.gte=&filter.v.price.lte=&sort_by=manual';

const uniqueVariants = [];
let batchId;

const numProductsToSave = 2;
let numSavedProducts = 0;

function findImageUrlByWidth(str, width) {

  const urls = str.split(', ');

  const url = urls.find(url => url.includes(`${width}w`));

  if (url) {
    return url.split(' ')[0];
  }

  return null;
}

let products = [];

async function getProduct(url, title, vendor) {

  if (numSavedProducts >= numProductsToSave) {
    return;
  }

  const response = await axios.get(url);

  fs.writeFileSync(`./temp/vendors/hcf-product.html`, response.data);

  const $ = cheerio.load(response.data);

  let image = $('.product__media img').attr('srcset');

  image = !image.startsWith('http') ? `https://dankspider.com${image}` : image;

  //console.log('image', image)

  image = findImageUrlByWidth(image, 246);



  if (!image) {
    image = $('.product__media').attr('src');
  }
  console.log('image', image)
  const variants = [];

  $('variant-radios label').each(function () {
    let variantName = $(this).text().trim();
    if (variantName) {
      variantName = parseFloat(variantName) + ' g';
      variants.push(variantName);
    }
  });

  const allAssays = await getAssays();

  const assay = allAssays.find(p => {
    const condition = p.name === title && p.vendor === 'HCF';
    return condition;
  });

  if (!assay?.assay) {
    const partialProduct = { title, image, url, vendor, variants }
    fs.appendFileSync('./temp/no-assay.txt', `no assays found for ${title.toLowerCase()}, \n`)
    return false
  }

  else {

    const cannabinoids = assay.assay.filter(a => cannabinoidNameList.includes(a.name))
    const terpenes = assay.assay.filter(a => terpeneNameList.includes(a.name))
  }

  const product = {
    title,
    url,
    image,
    imageUrls: [],
    variants,
    terpenes,
    cannabinoids,
    vendor: 'HCF',
  };


  numSavedProducts++;

  return product;
}

async function scrapePage(url, currentPage, productLinks) {


  try {
    const response = await axios.get(url);

    fs.writeFileSync(`./ temp / vendors / hcf - page - ${currentPage}.html`, response.data);

    const $ = cheerio.load(response.data)

    const items = $('.card__inner');

    for (const item of items) {

      let title = $(item).find('.full-unstyled-link').text().trim();
      title = title.replace('(Premium THCA Hemp Flower)', '').trim();

      const url = 'https://handcraftedfarmers.com/' + $(item).find('.full-unstyled-link').attr("href");


      productLinks.push({ title, url });

    }

  } catch (e) {
    logger.error('scraper:', e.message);
  }

  return productLinks;
}

function isDesiredProduct(productTitle) {
  if (!productTitle) {
    return false;
  }
  const lowerTitle = productTitle.toLowerCase();

  if (lowerTitle.includes('artisan mix')) {
    return false;
  }

  return ['living soil', 'indoor', 'greenhouse'].some((keyword) =>
    lowerTitle.includes(keyword)
  );
}

async function getProducts(productLinks) {

  const products = [];

  for (const productLink of productLinks) {

    let product = await getProduct(productLink.url, productLink.title, 'HCF');

    if (!product) {
      continue;
    }


    product = { ...product, ...productLink, vendor: 'HCF' }

    if (product.variants.length > 0) {

      product.variants = product.variants.map((variant) => normalizeVariantName(variant));

      products.push(product);

    }

  }

  return products;

}

async function getAvailableLeafProducts(id, vendor) {
  batchId = id;
  const assays = await recordAssays();
  process.exit();
  console.log('batchId', batchId)

  const links = await scrapePage(startUrl, currentPage, []);
  console.log('links', links.length)
  const products = await getProducts(links);

  return products;

}

if (require.main === module) {
  logger.log({
    level: 'info',
    message: `This script is being executed directly by Node.js`
  });
  getAvailableLeafProducts(batchId, vendor);
}

module.exports = {
  getAvailableLeafProducts,
  getProduct
}
