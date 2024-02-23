const axios = require('../services/rateLimitedAxios.js');
const cheerio = require('cheerio');
const { normalizeVariantName, normalizeProductTitle } = require('../services/strings.js')
const { recognize } = require('../services/ocr.js');
const fs = require('fs');
const { transcribeAssay } = require('../services/cortex.js');
const { terpeneNameList, cannabinoidNameList } = require('../services/cortex.js');
const logger = require('../services/logger.js');
const { saveAssays, getAssays } = require('../services/firebase.js');
const coaURL = 'https://handcraftedfarmers.com/pages/compliances'

async function recordAssays(links) {

  const assays = [];

  try {

    for (const link of links) {
      let result = await recognize(link.url);

      result = transcribeAssay(result);

      assays.push({ result, vendor: 'HCF', title: link.title, url: link.url });

    }

    await saveAssays('HCF', assays);
  }
  catch (error) {

    logger.error(error)

    return [];
  }
}



async function getProductList() {

  let html = await axios.get(coaURL);

  html = html.data;

  const $ = cheerio.load(html);

  const links = [];

  const nodes = $("#shopify-section-template--16331977490629__main a");

  for (const element of nodes) {

    const href = $(element).attr('href');

    let title = $(element).text().trim();

    title = title.replace('COA - ', '').trim();

    const page = await axios.get(href);

    const _$ = cheerio.load(page.data);

    const url = _$('main img').attr('src');
    console.log('url', title)
    if (url) {
      links.push({ title, url });
    }

  };
  console.log('links', links)

  return links;

}


let currentPage = 1;
const startUrl = 'https://handcraftedfarmers.com/collections/all-products?filter.v.availability=1&filter.v.price.gte=&filter.v.price.lte=&sort_by=manual';

const uniqueVariants = [];
let batchId;

const numProductsToSave = 100;
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
  console.log('get ', title)
  if (numSavedProducts >= numProductsToSave) {
    return;
  }

  const response = await axios.get(url);

  fs.writeFileSync(`./temp/vendors/hcf-product.html`, response.data);

  const $ = cheerio.load(response.data);

  let image = $('.product__media img').attr('srcset');

  image = !image.startsWith('http') ? `https://dankspider.com${image}` : image;

  console.log('image', image)

  image = findImageUrlByWidth(image, 246);

  if (!image) {
    image = $('.product__media').attr('src');
  }

  const variants = [];
  let cannabinoids = [];
  let terpenes = [];

  $('variant-radios label').each(function () {
    let variantName = $(this).text().trim();
    if (variantName) {
      variantName = parseFloat(variantName) + ' g';
      variants.push(variantName);
    }
  });
  console.log('variants', variants)

  let allAssays = await getAssays();
  allAssays = allAssays.filter(a => a.vendor === 'HCF');
  console.log('candidate assays:', allAssays.length)
  console.log('candidate assays:', allAssays[0])
  fs.writeFileSync('./temp/hcf-assays.json', JSON.stringify(allAssays, null, 2));

  let assay = allAssays.find(p => {
    const condition = p.vendor === 'HCF'; // p.title === title &&
    return condition;
  });

  if (!assay || !assay.assay) {
    console.log('no assays!', assay)
    const partialProduct = { title, image, url, vendor, variants }
    fs.appendFileSync('./temp/no-assay.txt', `no assays found for ${title.toLowerCase()}, \n`)
    return false
  }
  else {
    assay = assay.assay;
    cannabinoids = assay.assay?.filter(a => cannabinoidNameList.includes(a.name)) || [];
    terpenes = assay.assay?.filter(a => terpeneNameList.includes(a.name)) || [];
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

    // fs.writeFileSync(`./temp / vendors / hcf - page - ${currentPage}.html`, response.data);

    const $ = cheerio.load(response.data)

    const items = $('.card__inner');

    for (const item of items) {

      let title = $(item).find('.full-unstyled-link').text().trim();
      title = title.replace('(Premium THCA Hemp Flower)', '').trim();

      const url = 'https://handcraftedfarmers.com/' + $(item).find('.full-unstyled-link').attr("href");


      productLinks.push({ title, url });

    }

  } catch (e) {
    console.log('scraper:', e.message);
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
    console.log('productLink', productLink)
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

  //const links = await getProductList();
  //console.log('links', links.length)
  //await recordAssays(links);

  const productLinks = await scrapePage(startUrl, currentPage, []);
  console.log('productLinks', productLinks.length)
  const products = await getProducts(productLinks);

  console.log('products', products.length)
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
