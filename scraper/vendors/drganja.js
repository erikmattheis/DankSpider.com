const axios = require('../services/rateLimitedAxios');
const cheerio = require('cheerio');
const { normalizeVariantName, normalizeProductTitle } = require('../services/strings')
const { recognize } = require('../services/ocr');
const fs = require('fs');
const logger = require('../services/logger.js');

let numProductsToSave = 555;
let numSavedProducts = 0;

const { transcribeAssay, cannabinoidNameList, terpeneNameList } = require('../services/cortex.js')

const atomFeedUrl = 'https://www.drganja.com/thca-flower';

const products = [];
const productLinks = [];
let currentPage = 1;
let batchId;



if (require.main === module) {
  logger.log({
    level: 'info',
    message: `This script is being executed directly by Node.js`,
  })
}

async function getAvailableLeafProducts(id, vendor) {
  batchId = id;

  const products = await getProducts();

  const results = await addDetails(products);

  return results;

}


async function getProducts() {
  const response = await axios.get(atomFeedUrl);
  fs.writeFileSync('./temp/vendors/drganja.html', response.data);

  const $ = cheerio.load(response.data);

  const products = [];

  $('.drganja_products_list').each((_, entry) => {

    const title = normalizeProductTitle($(entry).find('.drganja_list_product_image').attr('title'));

    const url = $(entry).find('.drganja_list_product_image').attr('href');
    const image = $(entry).find('.attachment-woocommerce_thumbnail').attr('src');
    const vendor = 'Dr Ganja';
    products.push({ title, url, image, vendor });
  });

  return products;
}

async function addDetails(products) {
  const result = [];
  for (const product of products) {
    if (numSavedProducts >= numProductsToSave) {
      break;
    }
    const response = await axios.get(product.url);
    //fs.writeFileSync('./temp/vendors/drganja-product.html', response.data);
    const $ = cheerio.load(response.data);
    const productWithVariants = await addVariants(product, $);
    const productWithAssays = await addAssays(productWithVariants, $);

    numSavedProducts++;

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

async function addAssays(product, $) {

  let terpenes = [];
  let cannabinoids = [];

  const imgSrcs = $('meta[property="og:image"]').map((_, el) => $(el).attr('content')).get();

  const assayLinks = imgSrcs.filter((el) => el.toLowerCase().includes('certificate') || el.toLowerCase().includes('labs'))

  for await (const imgStr of assayLinks) {
    const image = imgStr?.startsWith('//') ? `https:${imgStr}` : imgStr;

    const raw = await recognize(image);
    const result = transcribeAssay(raw, image, 'drGanja');

    if (result?.length) {
      if (cannabinoidNameList.includes(result[0].name)) {
        cannabinoids = result//;.filter(a => cannabinoidNameList.includes(a.name))
      }
      if (terpeneNameList.includes(result[0].name)) {
        terpenes = result//;.filter(a => terpeneNameList.includes(a.name))
      }
    }

    if (terpenes?.length && cannabinoids?.length) {
      break
    }

  }

  return { ...product, cannabinoids, terpenes };
}

module.exports = {
  getAvailableLeafProducts
}

