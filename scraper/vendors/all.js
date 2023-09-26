wnc.js -

const axios = require('../services/rateLimitedAxios');
const xml2js = require('xml2js');
const cheerio = require('cheerio');
const stringsService = require('../services/strings');
const { get } = require('cheerio/lib/api/traversing.js');

const products = [];

let currentPage = 1;
const startUrl = 'https://wnc-cbd.com/categories/high-thca.html';

const uniqueVariants = [];

function addUniqueVariant(variant) {
  if (!uniqueVariants.includes(variant)) {
    uniqueVariants.push(variant);
  }
}

async function getWNCProductInfo(productInfoUrl) {
  try {
    console.log('Building WNC product');
    const response = await axios.get(productInfoUrl);
    const $ = cheerio.load(response.data);
    const variants = [];

    $('span.form-option-variant').each((index, element) => {
      console.log('vatiant html', $(element).html())
      variants.push($(element).text());
    });

    console.log('variants', variants);

    const title = $('meta[property="og:title"]').attr('content').replace('THCa ', '');;
    const url = $('meta[property="og:url"]').attr('content');
    console.log('url', url);
    console.log('productInfoUrl', productInfoUrl);

    const image = $('meta[property="og:image"]').attr('content');

    return {
      title,
      url,
      image,
      variants,
    }
  }
  catch (error) {
    throw new Error(`Error getting WNC product info: ${error.message}`);
  }
}

const productLinks = [];
async function scrapePage(url, currentPage) {

  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const cards = $('.card');

    for (const card of cards) {
      const anchorElement = $(card).find('a.card-figure__link');
      const productTitle = $(card).find('h3.card-title a').text().trim();
      console.log('Finding if available: ', productTitle);

      const chooseOptionsButton = $(card).find('a.card-figcaption-button');
      if (isDesiredProduct(productTitle) && chooseOptionsButton && chooseOptionsButton.text().includes('Choose Options')) {

        console.log('Product title:', productTitle);
        const href = anchorElement.attr('href');

        console.log('href', href);

        productLinks.push(href);
      }
    }

    const nextPageLink = $('.pagination-item--next a').attr('href');
    if (nextPageLink && currentPage < 3) {
      currentPage++;
      console.log(`Scraping page ${currentPage}`);
      await scrapePage(nextPageLink, currentPage);
    } else {
      console.log('No more WNC pages to scrape.', productLinks);

      await getWNCProductsInfo(productLinks);
    }
  } catch (error) {
    console.log(`Error scraping page: ${error.message}`);
  }
}

function isDesiredProduct(productTitle) {
  if (!productTitle) {
    return false;
  }
  const lowerTitle = productTitle.toLowerCase();

  if (lowerTitle.includes('artisan mix')) {
    return false;
  }

  return ['living soil', 'indoor', 'greenhouse'].some((keyword) =>
    lowerTitle.includes(keyword)
  );
}

async function getWNCProductsInfo(productLinks) {
  console.log('Getting this many products from WNC', productLinks.length)

  for (const productLink of productLinks) {
    const product = await getWNCProductInfo(productLink);
    if (!product) {
      console.log('skipping null product');
      continue;
    }
    console.log('Found product.title', product.title, ' with ', product.variants.length, ' variants');
    product.vendor = 'WNC';

    if (product.variants.length > 0) {

      console.log('product', product)




      product.variants = product.variants.map((variant) => stringsService.normalizeTitle(variant));
      console.log('ADDING', product.title, ' variants: ', product.variants.length)
      products.push(product);

    }
    else {
      console.log('product has no variants', product);
    }
  }
}
getWNCProductInfo('https://wnc-cbd.com/products/thca-black-cherry-gelato-indoor-hydro.html');
async function getAvailableLeafProducts() {

  await scrapePage(startUrl, currentPage);

  return products;

}

module.exports = {
  getAvailableLeafProducts
}

  ../ services / strings.js -

  function normalizeTitle(title) {
    if (!title) {
      return title;
    }
    if (title === 'Sugar leaf trim - 28 grams') {
      return '28 g';
    }
    if (title === 'Mixed T1 Sugar leaf/ trim - 28 grams') {
      return '28 g';
    }
    if (title === 'Dry Sift 1g') {
      return '1 g';
    }
    if (title === '14 grams') {
      return '14 g';
    }
    if (title === '7 grams') {
      return '7 g';
    }
    if (title === '3.5 grams') {
      return '3.5 g';
    }
    if (title === '14g') {
      return '14 g';
    }
    if (title === '7g') {
      return '7 g';
    }
    if (title === '3.5g') {
      return '3.5 g';
    }
    if (title === '1g') {
      return '1 g';
    }
    title = title?.replace(/(\d)([a-zA-Z])/g, '$1 $2');
    title = title?.replace(/(\s+)/g, ' ');
    title = title?.replace('SMALLS', 'smalls');
    title = title?.replace('MINIS', 'minis');
    title = title?.replace('Smalls', 'smalls');
    title = title?.replace('Minis', 'minis');
    title = title?.replace(' (1/8 oz)', '');
    title = title?.replace(' (1/4 oz)', '');
    title = title?.replace(' (1/2 oz)', '');
    title = title?.replace(' (1 oz)', '');
    title = title?.replace('(small/minis)', 'smalls/minis');
    title = title?.trim().replace(/\s+/g, ' ');
    return title;
  }

const regexMatchingPossibleWeightString = /\d\s(oz|g)/i;

function variantNameContainsWeightUnitString(variantName) {

  return regexMatchingPossibleWeightString.test(variantName);

}

function printPathToKey(obj, keyString, path = []) {
  for (const [key, value] of Object.entries(obj)) {
    const currentPath = [...path, key];
    if (key === keyString) {
      console.info(currentPath.join('.'));
    } else if (typeof value === 'object') {
      printPathToKey(value, keyString, currentPath);
    }
  }
}

module.exports = {
  normalizeTitle,
  variantNameContainsWeightUnitString,
  printPathToKey
}

package.json -

{
  "name": "scraper",
  "version": "1.0.0",
  "description": "Scraper for DankSpider.com",
  "type": "module",
  "main": "index.js",
  "scripts": {
    "default": "node index.js"
  },
  "author": "",
  "license": "ISC",
  "dependencies": {
    "axios": "^1.5.0",
    "axios-rate-limit": "^1.3.0",
    "cheerio": "^1.0.0-rc.12",
    "xml2js": "^0.6.2"
  }
}

