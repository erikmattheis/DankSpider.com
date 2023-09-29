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
  console.log('image', image);
  return image;
}

async function getPrestonProductInfo(product) {
  try {
    console.log('get Preston product info');

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

    console.log('error', error)

    return {
      variants: [],
      images: []
    }
  }

}

/*


*/
async function scrapePage(url, currentPage) {
  console.log('scraping preston');

  const productLinks = [];

  try {

    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const cards = $('.w-dyn-item');

    for (const card of cards) {

      const title = $(card).find('div.product-name').text().trim();
      console.log('Product: ', title)
      if (isDesiredProduct(title)) {

        const url = 'https://www.prestonhempco.com' + $(card).find('a.product-card').attr('href');
        /*
                const imageSrcset = $('img.main-product-image').attr('srcset');
                const regex = /([^,\s]+) 500w/;
                const match = imageSrcset.match(regex);
                */
        const image = getImageSrc(card);

        console.log('Using it with', image);

        productLinks.push({ title: strings.normalizeProductTitle(title), url: url, image: image });
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
  console.log('Getting more products info from Preston')
  const finalProducts = [];
  for (const product of products) {

    if (!product?.url) {
      continue;
    }
    console.log('At Url', product.url);

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
    else {
      console.log('Skipping product size ', product.title);
    }
  }
  console.log('finalProducts', finalProducts.length);

  console.log('First is', finalProducts[0]);

  console.log('Done');

  return finalProducts;
}

async function getAvailableLeafProducts() {

  const products = await scrapePage(startUrl, currentPage);

  const finalProducts = await getPrestonProductsInfo(products);

  return finalProducts;

}

if (require.main === module) {
  console.log('This script is being executed directly by Node.js');
  getAvailableLeafProducts();
}

module.exports = {
  getAvailableLeafProducts
}
