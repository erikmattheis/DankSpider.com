const axios = require('../services/rateLimitedAxios');
const cheerio = require('cheerio');
const stringsService = require('../services/strings');

const products = [];

let currentPage = 1;
const startUrl = 'https://www.prestonhempco.com/categories/high-thca';

const uniqueVariants = [];

function addUniqueVariant(variant) {
  if (!uniqueVariants.includes(variant)) {
    uniqueVariants.push(variant);
  }
}


function getImageSrc(html) {
  const $ = cheerio.load(html);
  const img = $('img[srcset*=800w]');

  const src = img.attr('src');

  return src;
}

async function getPrestonProductInfo(product) {
  try {
    console.log('get Preston product info', product);
    const response = await axios.get(product.url);
    const $ = cheerio.load(response.data);
    const select = $('.sizes-dropdown .size-dropdown-link');

    const variants = select.map((i, el) => $(el).text()).get();
    const image = getImageSrc(response.data);
    console.log('image', image)

    return {
      variants, image
    }
  }
  catch (error) {
    throw new Error(`Error getting Preston product info: ${error.message}`);
  }
}

/*


*/
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
        const image = $(card).find('img.main-product-image').attr('src');
        console.log('image', image)
        console.log('Available: ', title);
        console.log('url', url);


        productLinks.push({ title, url, image });
      }
    }

    return productLinks;

  } catch (error) {
    console.log(`Error scraping page: ${error.message}`);
  }
}

function isDesiredProduct(productTitle) {
  if (!productTitle) {
    return false;
  }
  const lowerTitle = productTitle.toLowerCase();
  // console.log('last four characters', lowerTitle.slice(-4));
  if (lowerTitle.slice(-4) === 'hemp') {
    return true;
  }

  return false
}

function extractNumberFromString(inputString) {
  // Define a regular expression pattern to match a number at the beginning of the string
  const regex = /^(\d+(\.\d+)?)/;

  // Use the regular expression to match the number in the string
  const match = inputString.match(regex);

  if (match) {
    // If a match is found, return the matched number as a float
    return parseFloat(match[0]);
  } else {
    // If no match is found, return false
    return false;
  }
}

async function getPrestonProductsInfo(products) {
  console.log('Getting products info from Preston')
  console.log('products', products);
  const finalProducts = [];
  for (const product of products) {
    console.log('product', product)
    if (!product?.url) {
      continue;
    }
    console.log('product.url', product.url)
    const info = await getPrestonProductInfo(product);
    if (!info.variants || info.variants.length === 0) {
      continue;
    }
    console.log('product', product);
    product.vendor = 'Preston';
    product.variants = info.variants.map((variant) => parseFloat(variant.trim()) + ' g');

    const size = parseFloat(product.variants[0].trim());
    if (size) {

      finalProducts.push(product);
    }
    else {
      console.log('Skipping product size ', product.title);
    }
  }
  console.log('finalProducts', finalProducts);

  console.log('Done');

  return finalProducts;
}




async function getAvailableLeafProducts() {

  //await fetchFlowGardensData();
  const products = await scrapePage(startUrl, currentPage);
  const finalProducts = await getPrestonProductsInfo(products);

  return finalProducts;

}

module.exports = {
  getAvailableLeafProducts
}
