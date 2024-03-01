const axios = require('../services/rateLimitedAxios');
const cheerio = require('cheerio');
const { normalizeVariantName, normalizeProductTitle } = require('../services/strings')
const { recognize } = require('../services/ocr');
const fs = require('fs');
const { transcribeAssay } = require('../services/cortex.js')
const { cannabinoidNameList, terpeneNameList } = require('../services/memory')
const logger = require('../services/logger.js');
const { readImage } = require('../services/image.js');
const { saveProducts } = require('../services/firebase.js');

const products = [];
const vendor = 'Preston';

let numSavedProducts = 0;

let currentPage = 1;
const startUrl = 'https://www.prestonhempco.com/categories/high-thca';

function getImageSrc(html) {
  const $ = cheerio.load(html);

  const imageSrcset = $('img.main-product-image').attr('srcset');
  const regex = /([^,\s]+) 500w/;
  const match = imageSrcset.match(regex);
  const image = match ? match[1] : null;
  return image;
}

async function getPrestonProductInfo(product) {

  // try {
  if (!product.url) {
    return null;
  }
  const response = await axios.get(product.url);

  if (response.status < 400) {
    const $ = cheerio.load(response.data);
    const select = $('.sizes-dropdown .size-dropdown-link');
    product.variants = select.map((i, el) => $(el).text()).get();
    product.variants = product.variants.map(variant => normalizeVariantName(variant));
    product.variants = product.variants.map(variant => variant.replace(product.title, '').trim());

    product.images = [];

    $('script.w-json').each((i, el) => {
      const json = $(el).html();
      const data = JSON.parse(json);
      if (data.group === 'Product Shots') {
        data.items.forEach(item => {
          if (item.type === 'image') {
            product.images.push(item.url);
          }
        });
      }
    });

    let terpenes = [];
    let cannabinoids = [];

    for (const image of product.images) {


      const buffer = await readImage(image, product.url);
      const raw = await recognize(buffer.value, product.url);

      if (!raw) {
        console.log('no text found', image);
        continue;
      }

      const result = transcribeAssay(raw, image, vendor);

      if (result.cannabinoids.length) {
        cannabinoids = result.cannabinoids;
      }
      if (result.terpenes.length) {
        terpenes = result.terpenes;
      }
      if (terpenes.length && cannabinoids.length) {
        break;
      }
    }
    return {
      ...product,
      terpenes,
      cannabinoids
    }
  }
  else {
    logger.error(`Error getting product info: ${response.status}`);
    return null;
  }
  /*
    }
    catch (error) {
      logger.error(`Error getting product info2: ${error.message}`);
      return null;
    }
  */
}

async function scrapePage(url, currentPage) {

  const productLinks = [];

  try {

    const response = await axios.get(url);
    fs.writeFileSync('./temp/vendors/preston.html', response.data);
    const $ = cheerio.load(response.data);

    const cards = $('.w-dyn-item');

    for (const card of cards) {

      const title = $(card).find('div.product-name').text().trim();

      if (['Rosin', 'Resin', 'Full Melt', 'Bubble Hash', 'Sift Hash', 'Macaroons', 'Cannacookies', 'Pre-Rolls', 'Pre Rolls', 'Mixed Smalls', 'Mixed Shake', 'Diamonds', 'Cereal Bars', 'Bundles', 'Vape '].some(s => title.includes(s))) {
        continue
      }
      const path = $(card).find('a.product-card').attr('href');

      if (!path) {
        continue;
      }

      const url = 'https://www.prestonhempco.com' + $(card).find('a.product-card').attr('href');

      productLinks.push({ title: normalizeProductTitle(title), url, vendor: 'Preston' });
    }

    return productLinks;

  } catch (error) {
    throw new Error(`Error scraping page: ${error.message}`);
  }
}

async function getPrestonProductsInfo(products, numProductsToSave, batchId) {

  const finalProducts = [];

  for (const product of products) {

    if (numSavedProducts >= numProductsToSave) {
      break;
    }

    if (!product?.url) {
      continue;
    }

    const info = await getPrestonProductInfo(product);

    if (!info || !info.variants || info.variants.length === 0) {

      continue;
    }

    product.vendor = 'Preston';

    product.variants = info.variants.map((variant) => parseFloat(variant.trim()) + ' g');

    product.images = [...info.images];

    const size = parseFloat(product.variants[0].trim());


    if (size) {
      numSavedProducts++;

      await saveProducts([product], batchId);

      finalProducts.push(product);
    }
  }

  return finalProducts;
}

async function getAvailableLeafProducts(id, vendor, numProductsToSave = 1000) {
  console.log(`getting up to ${numProductsToSave} ${vendor} products`)

  batchId = id;
  const products = await scrapePage(startUrl, currentPage, numProductsToSave);

  const finalProducts = await getPrestonProductsInfo(products, numProductsToSave);

  return finalProducts;

}

if (require.main === module) {
  logger.log({
    level: 'info',
    message: `This script is being executed directly by Node.js`
  });
  getAvailableLeafProducts(batchId, vendor);
}

module.exports = {
  getAvailableLeafProducts
}
