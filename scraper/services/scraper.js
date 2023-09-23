
const axios = require('../services/rateLimitedAxios');
const cheerio = require('cheerio');

async function scrape({ url, linkSelector, titleSelector, imageSelector, variantSelector }) {
  console.log('scraper');
  let productData = null;

  try {

    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const bootstrapState = $('script:not([src])')
      .filter((i, el) => $(el).html().includes('window.__BOOTSTRAP_STATE__'))
      .html();

    const startIndex = bootstrapState.indexOf('{');
    const endIndex = bootstrapState.lastIndexOf('}');
    const siteData = JSON.parse(bootstrapState.substring(startIndex, endIndex + 1)).siteData;

    const products = [];

    for (const link of links) {
      const productResponse = await axios.get(link);
      const product$ = cheerio.load(productResponse.data);
      console.log('products', products.length)
      const title = product$('p.w-product-title').text().trim();
      console.log('title', title)
      const queryString = '?utm_source=shockingelk%40gmail.com&utm_medium=directory';
      const campaignLink = ${ link } + ${ queryString };
      console.log('cl', campaignLink)
      const image = product$(imageSelector).attr('src');
      const variants = product$(variantSelector).map((i, el) => product$(el).text().trim()).get();
      products.push({ title, url: campaignLink, image, variants });
    }

    return products;

  } catch (error) {
    throw new Error(error);
  }
};

module.exports = { scrape }

