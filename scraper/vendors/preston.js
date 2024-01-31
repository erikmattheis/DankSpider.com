const axios = require('../services/rateLimitedAxios');
const cheerio = require('cheerio');
const strings = require('../services/strings');
const { recognize } = require('../services/ocr');
const fs = require('fs');
const { transcribeAssay } = require('../services/cortex.js');
const logger = require('../services/logger.js');

const products = [];

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

  const response = await axios.get(product.url);
  fs.writeFileSync('./temp/vendors/preston-product.html', response.data);

  if (response.status < 400) {
    const $ = cheerio.load(response.data);
    const select = $('.sizes-dropdown .size-dropdown-link');
    product.variants = select.map((i, el) => $(el).text()).get();

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

      const raw = await recognize(image);
      const result = transcribeAssay(raw, image);

      if (!result) {
        logger.log({
          level: 'info',
          message: `Nothing interesting, continuing ... ${image}`});

        continue;
      }

      if (result instanceof String) {
        logger.log({
        level: 'info',
        message: `image rejected: ${url}`});

        continue;
      }

      if (result?.terpenes?.length) {
        terpenes = JSON.parse(JSON.stringify(result.terpenes))
      }

      if (result?.cannabinoids?.length) {
        cannabinoids = JSON.parse(JSON.stringify(result.cannabinoids))
      }

      if (terpenes?.length && cannabinoids?.length) {
        break;
      }

    // await saveProducts([{ title, url, image, terpenes, cannabinoids }], batchId, true);


    logger.log({level:'info', message: `${product.title} has ${product.terpenes?.length} terpenes and ${product.cannabinoids?.length} cannabinoids`});

    return {
      ...product,
      terpenes,
      cannabinoids
    }
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

      if (isDesiredProduct(title)) {

        const image = getImageSrc(card);

        const url = 'https://www.prestonhempco.com' + $(card).find('a.product-card').attr('href');

        productLinks.push({ title: strings.normalizeProductTitle(title), url: url, vendor: 'Preston' });

      }
    }

    return productLinks;

  } catch (error) {
    throw new Error(`Error scraping page: ${error.message}`);
  }
}

function isDesiredProduct(productTitle) {
  if (!productTitle) {
    return false;
  }
  const lowerTitle = productTitle.toLowerCase();

  if (lowerTitle.slice(-4) === 'hemp') {
    return true;
  }

  return false
}

function extractNumberFromString(inputString) {
  const regex = /^(\d+(\.\d+)?)/;

  const match = inputString.match(regex);

  if (match) {
    return parseFloat(match[0]);
  } else {
    return false;
  }
}

async function getPrestonProductsInfo(products) {

  const finalProducts = [];

  for (const product of products) {

    if (!product?.url) {
      continue;
    }

    const info = await getPrestonProductInfo(product);

    if (!info || !info.variants || info.variants.length === 0) {
      logger.log({
  level: 'info',
  message: `no variants or error, skipping ${product.url}`});
      continue;
    }

    product.vendor = 'Preston';

    product.variants = info.variants.map((variant) => parseFloat(variant.trim()) + ' g');

    product.images = [...info.images];

    const size = parseFloat(product.variants[0].trim());

    if (size) {
      finalProducts.push(product);
    }
  }

  return finalProducts;
}

async function getAvailableLeafProducts() {

   logger.log({
  level: 'info',
  message: `Getting Preston products`});

  const products = await scrapePage(startUrl, currentPage);

  const finalProducts = await getPrestonProductsInfo(products);

  return finalProducts;

}

if (require.main === module) {
   logger.log({
  level: 'info',
  message: `This script is being executed directly by Node.js`});
  getAvailableLeafProducts();
}

module.exports = {
  getAvailableLeafProducts
}
