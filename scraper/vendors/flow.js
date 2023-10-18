const axios = require('../services/rateLimitedAxios');
const cheerio = require('cheerio');
const strings = require('../services/strings');

const atomFeedUrl = 'https://flowgardens.com/collections/thca.atom';

const products = [];
const productLinks = [];
let currentPage = 1;

async function getProducts() {
  const response = await axios.get(atomFeedUrl);
  const $ = cheerio.load(response.data, { xmlMode: true });
  const products = [];

  $('entry').each((index, entry) => {
    const productType = $(entry).find('s\\:type').text();
    if (productType === 'Flower') {
      const image$ = cheerio.load($(entry).html());
      const title = strings.normalizeProductTitle($(entry).children('title').first().text());
      if (title?.toLowerCase().includes('sugar leaf')) {
        return;
      }

      const product = {
        title: title,
        url: $(entry).children('link').first().attr('href'),
        image: image$('img')?.attr('src'),
        variants: [],
        vendor: 'Flow',
      }

      products.push(product);
    }
  });

  return products;
}

async function addCannabinoids(product, $) {
  const result = { ...product };

  const cannabinoids = [];

  const images = $('.product__thumb-item[index="2"] a').map((index, el) => $(el).attr('href')).get();
  console.log(images);
  process.exit()
  result.variants = labels.map((index, el) => strings.normalizeVariantName($(el).text())).get();


  return result;
}

async function addVariants(product, $) {
  const result = { ...product };

  const variants = [];
  const variantObjs = [];

  const labels = $('label.variant__button-label:not(.disabled)');

  result.variants = labels.map((index, el) => strings.normalizeVariantName($(el).text())).get();


  return result;
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

async function addDetails(products) {
  const result = [];
  for (const product of products) {
    const response = await axios.get(product.url);
    const $ = cheerio.load(response.data);
    const productWithVariants = await addVariants(product, $);
    if (productWithVariants.variants.length > 0) {
      const productWithImage = addImage(productWithVariants, $);
      const productWithCannabinoids = await addCannabinoids(product, $);
      result.push(productWithImage);
    }
  }
  return result;
}

async function getAvailableLeafProducts() {

  const products = await getProducts();
  const result = await addDetails(products);
  return result;
}

if (require.main === module) {
  // console.log('This script is being executed directly by Node.js');
  getAvailableLeafProducts();
}


module.exports = {
  getAvailableLeafProducts
}
