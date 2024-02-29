const axios = require('../services/rateLimitedAxios');
const cheerio = require('cheerio');
const { normalizeVariantName, normalizeProductTitle } = require('../services/strings')
const { recognize } = require('../services/ocr');
const fs = require('fs');
const logger = require('../services/logger.js');
const { readImage } = require('../services/image.js');
const { saveProducts } = require("../services/firebase.js");

let numSavedProducts = 0;

const { transcribeAssay } = require('../services/cortex.js')
const { cannabinoidNameList, terpeneNameList } = require('../services/memory')
const atomFeedUrl = 'https://www.drganja.com/thca-flower';

const products = [];
const productLinks = [];
let currentPage = 1;
let batchId;

const vendor = 'drGanja';



if (require.main === module) {
  logger.log({
    level: 'info',
    message: `This script is being executed directly by Node.js`,
  })
}

async function getAvailableLeafProducts(id, vendor, numProductsToSave = 1000) {
  console.log(`getting up to ${numProductsToSave} ${vendor} products`)

  batchId = id;

  const products = await getProducts(numProductsToSave);

  const results = await addDetails(products);

  return results;

}

async function getProducts() {

  const response = await axios.get(atomFeedUrl);
  fs.writeFileSync('./temp/vendors/drganja.html', response.data);

  const $ = cheerio.load(response.data);

  const products = [];

  const entries = $('.drganja_products_list').toArray();

  for await (const entry of entries) {

    const title = normalizeProductTitle($(entry).find('.drganja_list_product_image').attr('title'));

    const url = $(entry).find('.drganja_list_product_image').attr('href');
    const image = $(entry).find('.attachment-woocommerce_thumbnail').attr('src');
    const vendor = 'Dr Ganja';
    products.push({ title, url, image, vendor });

  };

  return products;
}

async function addDetails(products, batchId, vendor, numProductsToSave = 1000) {
  const result = [];
  for await (const product of products) {

    if (numSavedProducts >= numProductsToSave) {
      break;
    }
    const response = await axios.get(product.url);
    //fs.writeFileSync('./temp/vendors/drganja-product.html', response.data);
    const $ = cheerio.load(response.data);
    const productWithVariants = await addVariants(product, $);
    const productWithAssays = await addDrGanjaAssays(productWithVariants, $);

    numSavedProducts++;

    await saveProducts([productWithAssays], batchId);

    result.push(productWithAssays);

  }
  return result;
}

async function addVariants(product, $) {

  // const variants = $('variable-item-span').map((_, el) => $(el).text()).get();
  const values = $('ul[data-attribute_name="attribute_pa_weight"] li').map((_, el) => $(el).attr('data-value')).get();
  const variants = values.map(value => normalizeVariantName(value));

  return { ...product, variants };
}

async function addDrGanjaAssays(product, $) {

  let terpenes = [];
  let cannabinoids = [];

  const imgSrcs = $('meta[property="og:image"]').map((_, el) => $(el).attr('content')).get();

  const assayLinks = imgSrcs.filter((el) => el.toLowerCase().includes('certificate') || el.toLowerCase().includes('labs'))

  for await (const imgStr of assayLinks) {
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

  product = { ...product, cannabinoids, terpenes };

  saveProducts([product], batchId);

  return product;
}

module.exports = {
  getAvailableLeafProducts
}

