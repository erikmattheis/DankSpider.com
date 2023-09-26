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
      console.log('image html', image$.html())
      const imgSrc = image$('img').attr('src');

      const product = {
        title: $(entry).children('title').first().text(),
        url: $(entry).children('link').first().attr('href'),
        image: imgSrc,
        variants: [],
        vendor: 'Flow',
      }
      console.log('------------------------')
      console.log($(entry).html())
      console.log('------------------------')
      console.log('product.url', product.url);
      console.log('product.image', product.image);
      // throw new Error('stop')
      products.push(product);
    }
  });

  return products;
}

async function addVariants(product) {
  const result = { ...product };

  const response = await axios.get(product.url);
  const $ = cheerio.load(response.data);
  const variants = [];
  const variantObjs = [];

  //$('input[name=Weight]:not(.unavailable)').each((index, element) => {

  const labels = $('label.variant__button-label:not(.disabled)');

  console.log('labels', labels.length)
  result.variants = labels.map((index, el) => strings.normalizeTitle($(el).text())).get();
  //result.variants = labels.map((el) => $(el).text()).get();
  console.log('result.variants', result.variants);
  /*
      const variant = {
        title: $(element).find('.variant__button-label:not(.disabled)').text(),
        price: $(element).next('label').find('.form-option-variant').data('price'),
        available: !$(element).hasClass('unavailable')
      };
      */
  //});

  return result;
}

async function addDetails(products) {
  const result = [];
  for (const product of products) {
    const variants = []; variants
    const productWithVariants = await addVariants(product);
    if (productWithVariants.variants.length > 0) {
      result.push(productWithVariants);
    }
  }
  return result;
}

async function getAvailableLeafProducts() {
  const products = await getProducts();
  const result = await addDetails(products);
  console.log('result', result)
  return result;
}

getAvailableLeafProducts()



module.exports = {
  getAvailableLeafProducts
}
