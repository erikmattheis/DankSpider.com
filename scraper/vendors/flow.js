const axios = require('../services/rateLimitedAxios');
const cheerio = require('cheerio');
const strings = require('../services/strings');
const { recognize } = require('../services/ocr');
const fs = require('fs');

const atomFeedUrl = 'https://flowgardens.com/collections/thca.atom';

const products = [];
const productLinks = [];
let currentPage = 1;

async function getProducts() {
  const response = await axios.get(atomFeedUrl);

  fs.writeFileSync('./temp/vendors/flow.xml', response.data);

  const $ = cheerio.load(response.data, { xmlMode: true });

  const products = [];

  $('entry').each((_, entry) => {
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

async function addVariants(product, $) {

  const labels = $('label.variant__button-label').map((_, el) => $(el)).get();

  // variants is array from cheerio label text() values

  const variants = labels.map(label => strings.normalizeVariantName(label.text()));

  if (variants.some(variant => variant === 'Name')) {
 
    throw new Error('ooops');
  }

  return { ...product, variants };
}

async function addDetails(products) {
  const result = [];
  for (const product of products) {

    const response = await axios.get(product.url);

    fs.writeFileSync('./temp/vendors/flow-product.html', response.data);

    const $ = cheerio.load(response.data);
    const productWithVariants = await addVariants(product, $);

    const productWithAssays = await addAssays(productWithVariants, $);
    result.push(productWithAssays);

  }
  return result;
}

async function addAssays(product, $) {

  let cannabinoids = [];
  let terpenes = [];

  const images = $('.lazyload').map((_, el) => $(el).attr('data-photoswipe-src')).get();

  if (images.length === 0) {
    console.log('no images', product.url);
    return {
      ...product, cannabinoids: [], terpenes: []
    };
  }

  for (const imgStr of images) {
    const image = imgStr?.startsWith('//') ? `https:${imgStr}` : imgStr;

    const result = await recognize(image);

    if (!result) {
      console.log('nothing interesting, continuing ...', image);
      continue;
    }

    if (result instanceof String) {
      console.log('image rejected', image);
      console.error(result);
      continue;
    }

    if (result.terpenes?.length) {
      console.log('Terpenes: ', result.terpenes.length)
      terpenes = JSON.parse(JSON.stringify(result.terpenes))
    }
    if (result.cannabinoids?.length) {
      console.log('Cannabinoids: ', result.cannabinoids.length)
      cannabinoids = JSON.parse(JSON.stringify(result.cannabinoids))
    }

    if (terpenes?.length && cannabinoids?.length) {
      console.log('both terpenes and cannabinoids found')
      break;
    }
  }

  return { ...product, cannabinoids, terpenes };
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
