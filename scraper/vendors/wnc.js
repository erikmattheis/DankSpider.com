const axios = require('../services/rateLimitedAxios');
const cheerio = require('cheerio');
const stringsService = require('../services/strings');


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

    $('span.form-option-variant:not(.unavailable)').each((index, element) => {
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
