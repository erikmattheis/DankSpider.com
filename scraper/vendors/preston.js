const axios = require('../services/rateLimitedAxios');
const cheerio = require('cheerio');
const strings = require('../services/strings');

const products = [];

let currentPage = 1;
const startUrl = 'https://www.prestonhempco.com/categories/high-thca';

function getImageSrc(html) {
  const $ = cheerio.load(html);

  const imageSrcset = $('img.main-product-image').attr('srcset');
  const regex = /([^,\s]+) 500w/;
  const match = imageSrcset.match(regex);
  const image = match ? match[1] : null;
  return image;
}

async function getPrestonProductInfo(product) {
  try {

    const response = await axios.get(product.url);

    if (response.status < 400) {
      const $ = cheerio.load(response.data);
      const select = $('.sizes-dropdown .size-dropdown-link');
      const variants = select.map((i, el) => $(el).text()).get();

      return {
        variants: variants,
      }
    }
  }
  catch (error) {

    throw new Error(`Error getting product info: ${error.message}`);
  }

}

async function scrapePage(url, currentPage) {

  const productLinks = [];

  try {

    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const cards = $('.w-dyn-item');

    for (const card of cards) {

      const title = $(card).find('div.product-name').text().trim();

      if (isDesiredProduct(title)) {

        const url = 'https://www.prestonhempco.com' + $(card).find('a.product-card').attr('href');

        const image = getImageSrc(card);

        productLinks.push({ title: strings.normalizeProductTitle(title), url: url, image: image });
      }
    }
    return productLinks;
  } catch (error) {
    throw new Error(`Error scraping page: ${error.message}`);
  }
}

function isDesiredProduct(productTitle) {
  if (!productTitle) {
    return false;
  }
  const lowerTitle = productTitle.toLowerCase();

  if (lowerTitle.slice(-4) === 'hemp') {
    return true;
  }

  return false
}

function extractNumberFromString(inputString) {
  const regex = /^(\d+(\.\d+)?)/;

  const match = inputString.match(regex);

  if (match) {
    return parseFloat(match[0]);
  } else {
    return false;
  }
}

async function getPrestonProductsInfo(products) {

  const finalProducts = [];
  for (const product of products) {

    if (!product?.url) {
      continue;
    }

    const info = await getPrestonProductInfo(product);
    if (!info.variants || info.variants.length === 0) {
      continue;
    }

    product.vendor = 'Preston';

    product.variants = info.variants.map((variant) => parseFloat(variant.trim()) + ' g');

    const size = parseFloat(product.variants[0].trim());

    if (size) {
      finalProducts.push(product);
    }
  }

  return finalProducts;
}

async function getAvailableLeafProducts() {


  const products = await scrapePage(startUrl, currentPage);

  const finalProducts = await getPrestonProductsInfo(products);

  return finalProducts;

}

if (require.main === module) {
  // console.log('This script is being executed directly by Node.js');
  getAvailableLeafProducts();
}

module.exports = {
  getAvailableLeafProducts
}
