const axios = require('../services/rateLimitedAxios');
const xml2js = require('xml2js');
const cheerio = require('cheerio');
const { normalizeVariantName, normalizeProductTitle, variantNameContainsWeightUnitString } = require('../services/strings')

const atomFeedUrl = 'https://topcolatn.com/collections/t1-thca.atom?filter.v.availability=1';
const logger = require('../services/logger.js');
const { saveProducts } = require('../services/firebase.js');

const { writeFileSync } = require('fs');

const products = [];
const productLinks = [];
let currentPage = 1;

let numProductsToSave = 1;
let numSavedProducts = 0;

async function getAvailableLeafProducts() {

  try {
    const response = await axios.get(atomFeedUrl);
    const xmlData = response.data;

    // Parse the XML data
    const parser = new xml2js.Parser({ explicitArray: false });
    const parsedData = await parser.parseStringPromise(xmlData);

    if (parsedData.feed && parsedData.feed.entry) {
      const entries = parsedData.feed.entry;
      for (const entry of entries) {

        if (numSavedProducts >= numProductsToSave) {
          break;
        }

        const productType = entry['s:type'] ? entry['s:type'].toLowerCase() : '';
        const variants = entry['s:variant'] ? [].concat(entry['s:variant']) : [];

        const filteredVariants = variants.filter((variant) => variantNameContainsWeightUnitString(variant.title));

        if (filteredVariants.length && (productType === 'flower')) {

          if (entry.title?.toLowerCase().includes('sugar leaf')) {
            return;
          }

          let resolvedVariants = variants.map((variant) => normalizeVariantName(variant.title));

          resolvedVariants = resolvedVariants.filter((variant) => !variant.includes('SL'));

          const productTitle = entry.title ? normalizeProductTitle(entry.title) : '';

          const productUrl = entry.link?.$?.href || '';

          const contentHtml = entry.summary && entry.summary._ ? entry.summary._ : '';

         // writeFileSync('topcola.html', contentHtml);

          const $content = cheerio.load(contentHtml);

          const firstImage = $content('img').attr('src');

          const productImage = firstImage || '';

          const product = {
            title: productTitle,
            url: productUrl,
            image: productImage,
            variants: resolvedVariants,
            vendor: 'Top Cola',
          };

          numSavedProducts++;
          await saveProducts([product]);
          products.push(product);
        }
      }
    }
    return products;
  } catch (error) {
    logger.error(`Error fetching Top Cola data: ${error}`);
    throw new Error(`Error fetching Top Cola data: ${error}`);
  }
}

if (require.main === module) {
   logger.log({
  level: 'info',
  message: `This script is being executed directly by Node.js`});
  getAvailableLeafProducts();
}

module.exports = {
  getAvailableLeafProducts,

}
