const axios = require('../services/rateLimitedAxios');
const cheerio = require('cheerio');

const strings = require('../services/strings');

const feedUrl = 'https://aretehemp.com/product-category/high-thca/feed/';

function parseSingleProduct(html) {
  const $ = cheerio.load(html);

  const title = strings.normalizeProductTitle($('h1.product_title').text().trim());
  // console.log('Arete: ', title);
  const variants = [];

  const variationsData = $('form.variations_form').attr('data-product_variations');
  const variations = JSON.parse(variationsData.replace(/&quot;/g, '"'));

  variations.forEach(variation => {
    const size = variation.attributes.attribute_size;
    const sizeString = strings.normalizeVariantTitle(size);
    const availability = $(variation.availability_html).text().trim();

    if (availability.toLowerCase().includes('in stock')) {
      variants.push(sizeString);
    }
  });

  const imgElements = $('img');

  let image;

  for (let j = 0; j < imgElements.length; j++) {
    const imgEl = imgElements[j];
    const srcset = $(imgEl).attr('srcset') || $(imgEl).attr('data-srcset');
    if (srcset && srcset.includes('768w')) {
      image = srcset.split(',').find(s => s.includes('768w')).trim().split(' ')[0];
      break;
    }
  }

  return { title, image, variants };
}

async function getProducts(feedUrl) {
  const result = await axios.get(feedUrl);
  const $ = cheerio.load(result.data, { xmlMode: true });
  const items = $('item');
  const products = [];

  for (let i = 0; i < items.length; i++) {
    const el = items[i];
    const url = $(el).find('link').text();
    const resultP = await axios.get(url);
    const vendor = 'Arete';
    const vendorDate = $(el).find('pubDate').text();

    const more = parseSingleProduct(resultP.data);
    const variants = more.variants;
    const image = more.image;
    const title = more.title;

    const product = {
      title,
      url,
      image,
      variants,
      vendor,
      vendorDate,
    }

    products.push(product);
  }

  return products;
}

async function getAvailableLeafProducts() {
  // console.log('Getting Arete products');
  const products = await getProducts(feedUrl);
  return products;
}

if (require.main === module) {
  // console.log('This script is being executed directly by Node.js');
  getAvailableLeafProducts();
}

module.exports = {
  getAvailableLeafProducts
};