const axios = require('../services/rateLimitedAxios');
const cheerio = require('cheerio');
const strings = require('../services/strings');
const { recognize } = require('../services/ocr');
const fs = require('fs');

const atomFeedUrl = 'https://www.drganja.com/thca-flower';

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

  const $ = cheerio.load(response.data);

  const products = [];

  $('.drganja_products_list').each((_, entry) => {
    const title = strings.normalizeProductTitle($(entry).find('.drganja_list_product_image').attr('title'));
    const url = $(entry).find('.drganja_list_product_image').attr('href');
    const image = $(entry).find('.attachment-woocommerce_thumbnail').attr('src');
    const vendor = 'Dr Ganja';
    products.push({ title, url, image, vendor });
  });

  console.log('products', products.length);
  return products;
}

async function addDetails(products) {
  const result = [];
  for (const product of products) {
    const response = await axios.get(product.url);
    fs.writeFileSync('drganja.html', response.data);
    const $ = cheerio.load(response.data);
    const productWithVariants = await addVariants(product, $);
    const productWithAssays = await addAssays(productWithVariants, $);

    result.push(productWithAssays);

  }
  return result;
}

async function addVariants(product, $) {

  // const variants = $('variable-item-span').map((_, el) => $(el).text()).get();
  const values = $('ul[data-attribute_name="attribute_pa_weight"] li').map((_, el) => $(el).attr('data-value')).get();
  const variants = values.map(value => strings.normalizeVariantName(value));

  return { ...product, variants };
}

function addImage(product, $) {
  const imageDataSrc = $('img.photoswipe__image').data('src');

  const image = imageDataSrc?.startsWith('//') ? `https:${imageDataSrc}` : imageDataSrc;

  if (image) {
    const image_360x = image.replace('{width}', '360');
    product.image = image_360x;
  }

  return { ...product, image };;

}

async function addAssays(product, $) {

  const imgSrcs = $('meta[property="og:image"]').map((_, el) => $(el).attr('content')).get();

  const assayLinks = imgSrcs.filter((el) => el.toLowerCase().includes('certificate'));

  let terpenes = [];
  let cannabinoids = [];

  if (assayLinks.length === 0) {
    console.log('no images', product.url);
    return {
      ...product, cannabinoids, terpenes
    };
  }

  for (const imgStr of assayLinks) {
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



