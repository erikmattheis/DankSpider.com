const axios = require('../services/rateLimitedAxios.js');
const cheerio = require('cheerio');
const { normalizeVariantName, normalizeProductTitle } = require('../services/strings.js')
const fs = require('fs');
const { transcribeAssay } = require('../services/cortex.js');
const { terpeneNameList, cannabinoidNameList } = require('../services/memory');
const logger = require('../services/logger.js');
const { saveAssays, saveProducts } = require('../services/firebase.js');
const { readPDFs } = require('../services/pdf.js');
const { readImage } = require('../services/image.js');
const vendor = 'HCH';


const coaURL = 'https://harborcityhemp.com/about/product-coa/'
async function getAssays() {

  let html = await axios.get(coaURL);
  html = html.data;

  const $ = cheerio.load(html);

  html = $('body#text-796809227 > h3 > span').html();

  const products = [];

  $("#row-1678248903 a button span").each((index, element) => {
    const url = $(element).attr('href');
    const name = $(element).text().trim();

    if (url.endsWith('.pdf')) {
      products.push({ name, url });
    }
  });

  return products;
}

async function recordAssays(name, vendor) {

  try {

    const pdfs = await getAssays();

    const result = await readPDFs(pdfs, 'HCH');

    const assays = result.map(r => {
      return {
        ...r,
        vendor: 'HCH'
      }
    })

    // await saveAssays('HCH', assays);


  }
  catch (error) {

    logger.error(error)

    return [];
  }
}

let currentPage = 1;
const startUrl = 'https://harborcityhemp.com/product-category/cannabinoids/thca-products/feed/';

const uniqueVariants = [];
let batchId;

let numSavedProducts = 0;

async function getProduct(url, numProductsToSave = 1000) {

  if (numSavedProducts >= numProductsToSave) {
    return;
  }

  const response = await axios.get(url);

  fs.writeFileSync(`./temp/vendors/hch-product.html`, response.data);
  const $ = cheerio.load(response.data);

  const title = normalizeProductTitle($('.product-title').text());

  let image = $('.starting-slide .product-image-main img').attr('data-photoswipe-src');

  image = image?.startsWith('https:') ? image : `https:${image}`;

  const variants = [];

  $('select.woovr-variation-select option').each(function () {
    let variantName = $(this).text().trim();
    // Only add variant names that are not 'Choose an option'
    if (variantName && variantName !== 'Choose an option') {
      variantName = variantName.split(' – ')
      const variant = variantName[1];
      variants.push(variant);
    }
  });

  let allAssays = await getAssays();
  allAssays = allAssays.filter(a => a.vendor === 'HCF');

  const assay = allAssays.find(p => {
    const condition = p.name === title && p.vendor === 'PPM';
    return condition;
  });

  if (!assay?.assay) {
    fs.appendFileSync('./temp/no-assay.txt', `no assays found for ${title.toLowerCase()}, \n`)
    return
  }
  const cannabinoids = assay.assay.filter(a => cannabinoidNameList.includes(a.name))
  const terpenes = assay.assay.filter(a => terpeneNameList.includes(a.name))

  const product = {
    title,
    url,
    image,
    imageUrls,
    variants,
    terpenes,
    cannabinoids,
    vendor: 'HCH',
  };


  numSavedProducts++;

  return product;
}

async function scrapePage(url, currentPage, productLinks) {

  try {
    const response = await axios.get(url);

    fs.writeFileSync(`./temp/vendors/hch-page-${currentPage}.html`, response.data);

    const $ = cheerio.load(response.data, { xmlMode: true })

    const items = $('item');

    for (const item of items) {

      const title = $(item).find('title').text().trim();

      const url = $(item).find('link').text().trim();

      const vendorDate = $(item).find('pubDate').text().trim();

      if (isDesiredProduct(title)) {

        productLinks.push({ title, url, vendorDate });

      }
    }

    const nextPageLink = $('.pagination-item--next a').attr('href');

    if (nextPageLink) {
      currentPage++;
      await scrapePage(nextPageLink, currentPage, productLinks);
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

    let product = await getProduct(productLink.url);

    if (!product) {
      continue;
    }


    product = { ...product, ...productLink, vendor: 'HCH' }

    if (product.variants.length > 0) {

      product.variants = product.variants.map((variant) => normalizeVariantName(variant));

      await saveProducts([product], batchId);

      products.push(product);

    }

  }

  return products;

}

async function getAvailableLeafProducts(id, vendor, numProductsToSave = 1000) {
  console.log(`getting up to ${numProductsToSave} ${vendor} products`)

  batchId = id;

  await recordAssays(vendor);

  const links = await scrapePage(startUrl, currentPage, []);

  const products = await getProducts(links, numProductsToSave);

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
  getProduct,
  recordAssays
}

const skippableImages = ["https://cdn11.bigcommerce.com/s-mpabgyqav0/images/stencil/1280x1280/products/268/1807/1683224189.1280.1280__66714.1683226369.jpg?c=1",
  "https://cdn11.bigcommerce.com/s-mpabgyqav0/images/stencil/1280x1280/products/268/1813/1683223605.1280.1280__73189.1683225192.jpg?c=1",
  "https://cdn11.bigcommerce.com/s-mpabgyqav0/images/stencil/1280x1280/products/268/1811/1683223605.1280.1280__28436.1683225192.jpg?c=1",
  "https://cdn11.bigcommerce.com/s-mpabgyqav0/images/stencil/1280x1280/products/268/1814/1683223605.1280.1280__52678.1683225192.jpg?c=1",
  "https://cdn11.bigcommerce.com/s-mpabgyqav0/images/stencil/1280x1280/products/268/1808/1683223605.1280.1280__47191.1683225192.jpg?c=1",
  "https://cdn11.bigcommerce.com/s-mpabgyqav0/images/stencil/1280x1280/products/268/1809/1683223605.1280.1280__02816.1683225192.jpg?c=1",
  "https://cdn11.bigcommerce.com/s-mpabgyqav0/images/stencil/1280x1280/products/268/1815/1683223605.1280.1280__19110.1683225192.jpg?c=1",
  "BagsGroupShot",
  "Diamond-Sticker",
];

const html = `<div id="accordion-3207240488" class="accordion-item">
<a id="accordion-3207240488-label" class="accordion-title plain active" href="#accordion-item-tropical-punch" aria-expanded="true" aria-controls="accordion-3207240488-content">
<button class="toggle" aria-label="Toggle"><i class="icon-angle-down"></i></button>
<span>TROPICAL PUNCH</span>
</a>
<div id="accordion-3207240488-content" class="accordion-inner" aria-labelledby="accordion-3207240488-label" style="display: block;">
<div id="text-2657889776" class="text">
<p><span style="font-size: 100%; font-family: lm-pro-ultra-light; color: #000000;"><a style="color: #000000;" href="https://harborcityhemp.com/wp-content/uploads/2023/10/09-19-2023-38769W3292.pdf">HF-TP-01</a></span></p>
<style>
#text-2657889776 {
  color: rgb(0,0,0);
}
#text-2657889776 > * {
  color: rgb(0,0,0);
}
</style>
</div>
</div>
</div>`