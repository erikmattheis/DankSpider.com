const axios = require('../services/rateLimitedAxios');
const cheerio = require('cheerio');
const { normalizeVariantName, normalizeProductTitle } = require('../services/strings')
const { recognize } = require('../services/ocr');
const fs = require('fs');
const { transcribeAssay } = require('../services/cortex.js');
const logger = require('../services/logger.js');
const { saveProducts } = require('../services/firebase.js');
let numProductsToSave = 1;
let numSavedProducts = 0;

const atomFeedUrl = 'https://flowgardens.com/collections/thca.atom';

const products = [];
const productLinks = [];
let currentPage = 1;

async function getProducts() {
  const response = await axios.get(atomFeedUrl);

  fs.writeFileSync('./temp/vendors/flow.xml', response.data);

  const $ = cheerio.load(response.data, { xmlMode: true });

  const products = [];

  $('entry').each((_, entry) => {

    if (numSavedProducts > numProductsToSave) {
      return;
    }
    const productType = $(entry).find('s\\:type').text();
    if (productType === 'Flower') {
      const image$ = cheerio.load($(entry).html());
      const title = normalizeProductTitle($(entry).children('title').first().text());
      if (title?.toLowerCase().includes('sugar leaf')) {
        return;
      }

      const product = {
        title: title,
        url: $(entry).children('link').first().attr('href'),
        image: image$('img')?.attr('src'),
        variants: [],
        vendor: 'Flow',
      }

      numSavedProducts++;
      saveProducts([product]);
      products.push(product);
    }
  });

  return products;
}

async function addVariants(product, $) {

  const labels = $('label.variant__button-label').map((_, el) => $(el)).get();

  // variants is array from cheerio label text() values

  const variants = labels.map(label => normalizeVariantName(label.text()));

  if (variants.some(variant => variant === 'Name')) {

    throw new Error('ooops');
  }

  return { ...product, variants };
}

async function addDetails(products) {
  const result = [];
  for (const product of products) {

    const response = await axios.get(product.url);

    fs.writeFileSync('./temp/vendors/flow-product.html', response.data);

    const $ = cheerio.load(response.data);
    const productWithVariants = await addVariants(product, $);

    const productWithAssays = await addAssays(productWithVariants, $);
    result.push(productWithAssays);

  }
  return result;
}

async function addAssays(product, $) {

  let cannabinoids = [];
  let terpenes = [];

  const images = $('.lazyload').map((_, el) => $(el).attr('data-photoswipe-src')).get();

  if (images.length === 0) {
    return {
      ...product, cannabinoids: [], terpenes: []
    };
  }

  for (const imgStr of images) {
    const image = imgStr?.startsWith('//') ? `https:${imgStr}` : imgStr;

    const raw = await recognize(image);
    const result = transcribeAssay(raw, image);

    if (!result) {
      continue;
    }

    if (result instanceof String) {

      logger.error(result);
      continue;
    }

    if (result?.terpenes?.length) {

      terpenes = JSON.parse(JSON.stringify(result.terpenes))
    }
    if (result.cannabinoids?.length) {

      cannabinoids = JSON.parse(JSON.stringify(result.cannabinoids))
    }

    if (terpenes?.length && cannabinoids?.length) {

      break;
    }
  }

  return { ...product, cannabinoids, terpenes };
}

async function getAvailableLeafProducts() {

  const products = await getProducts();
  const result = await addDetails(products);
  return result;

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
