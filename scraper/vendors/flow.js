const axios = require('../services/rateLimitedAxios');
const cheerio = require('cheerio');
const stringsService = require('../services/strings');

const atomFeedUrl = 'https://flowgardens.com/collections/thca.atom';

const products = [];
const productLinks = [];
let currentPage = 1;

async function getAvailableLeafProducts() {
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
  result.variants = labels.map((i, el) => $(el).text()).get();

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
    const productWithVariants = await addVariants(product);
    result.push(productWithVariants);
  }
  return result;
}

async function getAvailableVariants() {
  const products = await getAvailableLeafProducts();
  const result = await addDetails(products);
  console.log('result', result)
  return result;
}


/*

async function getAvailableVariants(products) {
  const response = await axios.get(atomFeedUrl);
  const $ = cheerio.load(response.data);

  const variants = $('input[name=Weight]:not(.unavailable)').text();


  variants.each((index, element) => {
    console.log('variant html', $(element).html())
    variants.push($(element).text());
  });
  const filteredVariants = variants.filter((variant) => stringsService.variantNameContainsWeightUnitString(variant.title));


  const resolvedVariants = variants.map((variant) => stringsService.normalizeTitle(variant.title));


  products.push(product);

}
*/

/*
else {
console.log('Skipping product type', productType);

}
*/

/*

console.log('Data has been extracted from flow');
return products;

}
*/
module.exports = {
  getAvailableLeafProducts
}
