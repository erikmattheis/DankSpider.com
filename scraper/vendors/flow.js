const axios = require('../services/rateLimitedAxios');
const cheerio = require('cheerio');
const { normalizeVariantName, normalizeProductTitle } = require('../services/strings')
const { recognize } = require('../services/ocr');
const fs = require('fs');
const { transcribeAssay } = require('../services/cortex.js');
const logger = require('../services/logger.js');
const { readImage } = require('../services/image.js');

const vendor = 'Flow';

let numProductsToSave = 3;
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

  for await (const entry of $('entry')) {

    if (numSavedProducts >= numProductsToSave) {
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
      products.push(product);
    }
  }

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

    const productWithAssays = await addFlowAssays(productWithVariants, $);
    result.push(productWithAssays);

  }
  return result;
}

async function addFlowAssays(product, $) {

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

  return { ...product, cannabinoids, terpenes };
}

async function getAvailableLeafProducts(id, vendor) {
  console.log(`getting ${vendor} products`)
  batchId = batchId;
  const products = await getProducts();
  const result = await addDetails(products);
  return result;

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
