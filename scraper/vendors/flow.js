const axios = require('axios');
const xml2js = require('xml2js');
const cheerio = require('cheerio');
const stringsService = require('../services/strings');

const atomFeedUrl = 'https://flowgardens.com/collections/thca.atom';

const products = [];
const productLinks = [];
let currentPage = 1;

async function getAvailableLeafProducts() {
  try {
    const response = await axios.get(atomFeedUrl);
    const xmlData = response.data;

    // Parse the XML data
    const parser = new xml2js.Parser({ explicitArray: false });
    const parsedData = await parser.parseStringPromise(xmlData);

    if (parsedData.feed && parsedData.feed.entry) {
      const entries = parsedData.feed.entry;

      entries.forEach((entry) => {
        console.log("entry['s: type']", entry['s:type'])
        const productType = entry['s:type'] ? entry['s:type'].toLowerCase() : '';
        const variants = entry['s:variant'] ? [].concat(entry['s:variant']) : [];

        const filteredVariants = variants.filter((variant) => stringsService.variantNameContainsWeightUnitString(variant.title));

        if (filteredVariants.length && (productType === 'flower')) {
          const resolvedVariants = variants.map((variant) => stringsService.normalizeTitle(variant.title));

          const productTitle = entry.title ? entry.title : '';

          const productUrl = entry.link?.$?.href || '';

          const contentHtml = entry.summary && entry.summary._ ? entry.summary._ : '';

          console.log('contentHtml exists', entry.summary._);

          const $content = cheerio.load(contentHtml);

          const firstImage = $content('img').attr('src');

          console.log('found :image', firstImage);

          const productImage = firstImage || '';

          const product = {
            title: productTitle,
            url: productUrl,
            image: productImage,
            variants: resolvedVariants,
            vendor: 'Flow Gardens',
          };

          products.push(product);
        }
        else {
          console.log('Skipping product type', productType);

        }
      });
    }

    console.log('Data has been extracted from flow');
    return products;
  } catch (error) {
    console.error(`Error fetching Flow Gardens data: ${error}`);
    throw new Error(`Error fetching Flow Gardens data: ${error}`);
  }
}

module.exports = {
  getAvailableLeafProducts
}
