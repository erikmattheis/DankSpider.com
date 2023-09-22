const axios = require('../services/rateLimitedAxios');
const xml2js = require('xml2js');
const cheerio = require('cheerio');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
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
    console.log('get Preston product info');
    const response = await axios.get(product.url);
    const $ = cheerio.load(response.data);
    const select = $('.sizes-dropdown .size-dropdown-link');

    const variants = select.map((i, el) => $(el).text()).get();
    const image = getImageSrc(html);
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
      console.log('Card HTML:', $(card).html());

      const productPicWrap = $(card).find('div.product-pic-wrap');

      console.log('Product Pic Wrap HTML:', productPicWrap);

      const productPicWrap2 = $(card).find('div.product-pic-wrap').attr('src');

      console.log('Product Pic Wrap HTML2:', productPicWrap2);


      throw new Error('stop');

      const title = $(card).find('div.product-name').text().trim();

      if (isDesiredProduct(title)) {
        const url = $(card).attribs['href'];

        console.log('Available: ', title);
        console.log('url', url);

        productLinks.push({ title, url });
      }
    }

    await getPrestonProductsInfo(productLinks);

  } catch (error) {
    console.log(`Error scraping page: ${error.message}`);
  }
}

scrapePage(startUrl, currentPage)

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
    //console.log('product', product)
    const variants = await getPrestonProductInfo(product.url);
    if (!variants) {
      continue;
    }
    console.log('product.title', product.title);
    product.vendor = 'Preston';
    const size = parseFloat(variants[0].trim());
    if (size) {
      product.variants = variants.map((variant) => parseFloat(variants[0].trim()) + ' g');

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
  await scrapePage(startUrl, currentPage);

  return products;

}


module.exports = {
  getAvailableLeafProducts
}
