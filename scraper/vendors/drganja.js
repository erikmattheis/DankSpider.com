const axios = require('../services/rateLimitedAxios');
const cheerio = require('cheerio');
const strings = require('../services/strings');
const fs = require('fs');

const atomFeedUrl = 'https://www.drganja.com/thca-flower/feed';

const products = [];
const productLinks = [];
let currentPage = 1;

if (require.main === module) {
  // console.log('This script is being executed directly by Node.js');
  getAvailableLeafProducts();
}

module.exports = {
  getAvailableLeafProducts
}

async function getAvailableLeafProducts() {

  const products = await getProducts();

  const results = await addDetails(products);

  return results;

}

async function getProducts() {
  const response = await axios.get(atomFeedUrl);
  
  const $ = cheerio.load(response.data, { xmlMode: true });

  const products = [];

  $('item').each((_, entry) => {
    const title = strings.normalizeProductTitle($(entry).children('title').first().text());
    const url = $(entry).children('link').first().text();
    const vendor = 'Dr Ganja';
    products.push({ title, url, vendor });
  });

  console.log('products', products.length);
  return products;
}

async function addDetails(products) {
  const result = [];
  for (const product of products) {
    const response = await axios.get(product.url);
    const $ = cheerio.load(response.data);
    const productWithVariants = await addVariants(product, $);
    console.log('productWithVariants', productWithVariants)
    if (productWithVariants.variants.length > 0) {
      const productWithImage = addImage(productWithVariants, $);
      const productWithAssays = await addAssays(productWithImage, $);
      result.push(productWithAssays);
    }
  }
  return result;
}

async function addVariants(product, $) {
  const result = { ...product };

  const labels = $('ul[aria-label=Amount] li div').map((index, el) => $(el).text()).get();

   const variants = labels.map((_, el) => strings.normalizeVariantName(el));

  return {...product, variants};
}

function addImage(product, $) {
  const result = { ...product };

  const imageDataSrc = $('img.photoswipe__image').data('src');

  const image = imageDataSrc?.startsWith('//') ? `https:${imageDataSrc}` : imageDataSrc;

  if (image) {
    const image_360x = image.replace('{width}', '360');
    product.image = image_360x;
  }

  return product;

}

async function addAssays(product, $) {
  const result = { ...product };

  const cannabinoids = [];

  const images = $('.product__thumb-item[index="2"] a').map((index, el) => $(el).attr('href')).get();
  if (result.variants) {
    result.variants = $('label').map((index, el) => strings.normalizeVariantName($(el).text())).get();

  }
  return result;
}




