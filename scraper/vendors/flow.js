const axios = require('../services/rateLimitedAxios');
const xml2js = require('xml2js');
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
      const product = {
        title: $(entry).children('title').first().text(),
        url: $(entry).children('link').first().attr('href'),
        image: $(entry).find('image').first().text(),
        variants: [],
        vendor: 'Flow',
      }
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

  $('input[name=Weight]:not(.unavailable)').each((index, element) => {
    const variant = {
      title: $(element).find('.form-option-variant').text(),
      price: $(element).next('label').find('.form-option-variant').data('price'),
      available: !$(element).hasClass('unavailable')
    };
    variants.push(variant.title);
    variantObjs.push(variant);
  });

  result.variants = variants;
  result.variantObjs = variantObjs;

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

async function init() {
  const products = await getAvailableLeafProducts();
  const result = await addDetails(products);
  console.log('result', result)
  return result;
}

init();

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
