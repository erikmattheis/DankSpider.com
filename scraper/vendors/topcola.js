const axios = require('../services/rateLimitedAxios');
const xml2js = require('xml2js');
const cheerio = require('cheerio');
const { normalizeVariantName, normalizeProductTitle, variantNameContainsWeightUnitString } = require('../services/strings')
const { recognize } = require('../services/ocr');
const { transcribeAssay } = require('../services/cortex.js')
const { cannabinoidNameList, terpeneNameList } = require('../services/memory')
const { readImage } = require('../services/image.js');
const vendor = 'TopCola';



const atomFeedUrl = 'https://topcolatn.com/collections/t1-thca.atom?filter.v.availability=1';
const logger = require('../services/logger.js');


const { writeFileSync } = require('fs');

const products = [];
let productTitle
let productUrl
let productImage
let cannabinoids
let terpenes

const productLinks = [];
let currentPage = 1;
let batchId;

let numSavedProducts = 0;

async function getAvailableLeafProducts(id, vendor) {
  console.log(`getting ${vendor} products`)
  batchId = id;

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

          productTitle = entry.title ? normalizeProductTitle(entry.title) : '';

          productUrl = entry.link?.$?.href || '';

          const contentHtml = entry.summary && entry.summary._ ? entry.summary._ : '';

          // writeFileSync('topcola.html', contentHtml);

          const $content = cheerio.load(contentHtml);
          const images = $content('img').map((i, el) => $content(el).attr('src')).get();

          const firstImage = images[0] || '';

          const productImage = firstImage || '';

          for (const image of images) {

            const buffer = await readImage(image, productUrl);
            const raw = await recognize(buffer.value, productUrl);

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
        }

        if (productTitle && productUrl && productImage) {

          const product = {
            title: productTitle,
            url: productUrl,
            image: productImage,
            cannabinoids,
            terpenes,
            variants: resolvedVariants,
            vendor: 'Top Cola',
          };

          numSavedProducts++;

          products.push(product);

        }
      }
    }
    return products;
  }
  catch (error) {
    logger.error(`Error fetching Top Cola data: ${error}`);
    throw new Error(`Error fetching Top Cola data: ${error}`);
  }
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

}
