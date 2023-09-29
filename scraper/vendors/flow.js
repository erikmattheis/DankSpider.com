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
    console.log('productType', productType);
    if (productType === 'Flower') {
      const image$ = cheerio.load($(entry).html());

      // console.log('image html', image$.html())
      /*

      <div class="product-image-main product-image-main--7360445644983">
      <div class="image-wrap" style="height: 0; padding-bottom: 100.0%;">
      <img class="photoswipe__image lazyautosizes lazyloaded" data-photoswipe-src="//flowgardens.com/cdn/shop/files/20A55C7D-6132-4149-B2CE-84615AFE4F4C_1800x1800.jpg?v=1692978169" data-photoswipe-width="800" data-photoswipe-height="800" data-index="1" data-widths="[360, 540, 720, 900, 1080]" data-aspectratio="1.0" data-sizes="auto" alt="Sour Sex Wax"
      data-srcset="//flowgardens.com/cdn/shop/files/20A55C7D-6132-4149-B2CE-84615AFE4F4C_360x.jpg?v=1692978169 360w,
      //flowgardens.com/cdn/shop/files/20A55C7D-6132-4149-B2CE-84615AFE4F4C_540x.jpg?v=1692978169 540w,
      //flowgardens.com/cdn/shop/files/20A55C7D-6132-4149-B2CE-84615AFE4F4C_720x.jpg?v=1692978169 720w, //flowgardens.com/cdn/shop/files/20A55C7D-6132-4149-B2CE-84615AFE4F4C_900x.jpg?v=1692978169 900w, //flowgardens.com/cdn/shop/files/20A55C7D-6132-4149-B2CE-84615AFE4F4C_1080x.jpg?v=1692978169 1080w" sizes="604px" srcset="//flowgardens.com/cdn/shop/files/20A55C7D-6132-4149-B2CE-84615AFE4F4C_360x.jpg?v=1692978169 360w,
       //flowgardens.com/cdn/shop/files/20A55C7D-6132-4149-B2CE-84615AFE4F4C_540x.jpg?v=1692978169 540w, //flowgardens.com/cdn/shop/files/20A55C7D-6132-4149-B2CE-84615AFE4F4C_720x.jpg?v=1692978169 720w, //flowgardens.com/cdn/shop/files/20A55C7D-6132-4149-B2CE-84615AFE4F4C_900x.jpg?v=1692978169 900w, //flowgardens.com/cdn/shop/files/20A55C7D-6132-4149-B2CE-84615AFE4F4C_1080x.jpg?v=1692978169 1080w"><button type="button" class="btn btn--body btn--circle js-photoswipe__zoom product__photo-zoom">
            <svg aria-hidden="true" focusable="false" role="presentation" class="icon icon-search" viewBox="0 0 64 64"><path d="M47.16 28.58A18.58 18.58 0 1 1 28.58 10a18.58 18.58 0 0 1 18.58 18.58zM54 54L41.94 42"></path></svg>
            <span class="icon__fallback-text">Close (esc)</span>
          </button></div></div>
      */



      const product = {
        title: strings.normalizeProductTitle($(entry).children('title').first().text()),
        url: $(entry).children('link').first().attr('href'),
        image: image$('img')?.attr('src'),
        variants: [],
        vendor: 'Flow',
      }
      console.log('product.url', product.url);
      console.log('product.image', product.image);
      // throw new Error('stop')
      products.push(product);
    }
  });

  return products;
}

async function addVariants(product, $) {
  const result = { ...product };

  const variants = [];
  const variantObjs = [];

  //$('input[name=Weight]:not(.unavailable)').each((index, element) => {

  const labels = $('label.variant__button-label:not(.disabled)');



  result.variants = labels.map((index, el) => strings.normalizeVariantTitle($(el).text())).get();


  return result;
}

function addImage(product, $) {
  const result = { ...product };
  const imageDataSrc = $('img.photoswipe__image').data('src');

  const image = imageDataSrc?.startsWith('//') ? `https:${imageDataSrc}` : imageDataSrc;
  //flowgardens.com/cdn/shop/files/DSC06750_{width}x.jpg?v=1695412809

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
      result.push(productWithImage);
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

if (require.main === module) {
  console.log('This script is being executed directly by Node.js');
  getAvailableLeafProducts();
}


module.exports = {
  getAvailableLeafProducts
}
