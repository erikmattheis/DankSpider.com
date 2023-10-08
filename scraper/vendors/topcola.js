const axios = require('../services/rateLimitedAxios');
const xml2js = require('xml2js');
const cheerio = require('cheerio');
const strings = require('../services/strings');

const atomFeedUrl = 'https://topcolatn.com/collections/t1-thca.atom?filter.v.availability=1';

const products = [];
const productLinks = [];
let currentPage = 1;

async function getAvailableLeafProducts() {

  // console.log('Getting Top Cola products');
  try {
    const response = await axios.get(atomFeedUrl);
    const xmlData = response.data;

    // Parse the XML data
    const parser = new xml2js.Parser({ explicitArray: false });
    const parsedData = await parser.parseStringPromise(xmlData);

    if (parsedData.feed && parsedData.feed.entry) {
      const entries = parsedData.feed.entry;

      entries.forEach((entry) => {

        const productType = entry['s:type'] ? entry['s:type'].toLowerCase() : '';
        const variants = entry['s:variant'] ? [].concat(entry['s:variant']) : [];

        const filteredVariants = variants.filter((variant) => strings.variantNameContainsWeightUnitString(variant.title));

        if (filteredVariants.length && (productType === 'flower')) {

          const resolvedVariants = variants.map((variant) => strings.normalizeVariantTitle(variant.title));

          const productTitle = entry.title ? strings.normalizeProductTitle(entry.title) : '';

          // console.log('Top Cola: ', productTitle);

          const productUrl = entry.link?.$?.href || '';

          const contentHtml = entry.summary && entry.summary._ ? entry.summary._ : '';

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

          products.push(product);
        }
      });
    }
    return products;
  } catch (error) {
    console.error(`Error fetching Top Cola data: ${error}`);
    throw new Error(`Error fetching Top Cola data: ${error}`);
  }
}

if (require.main === module) {
  // console.log('This script is being executed directly by Node.js');
  getAvailableLeafProducts();
}

module.exports = {
  getAvailableLeafProducts
}
