const axios = require('../services/rateLimitedAxios.js');
const cheerio = require('cheerio');
const { normalizeVariantName, normalizeProductTitle } = require('../services/strings.js')
const { recognize } = require('../services/ocr.js');
const fs = require('fs');
const { transcribeAssay } = require('../services/cortex.js');
const { terpeneNameList, cannabinoidNameList } = require('../services/memory');
const logger = require('../services/logger.js');

let currentPage = 1;
const startUrl = 'https://eighthorseshemp.com/collections/hemp-flower.atom';

const uniqueVariants = [];
let batchId;

const numProductsToSave = 555;
let numSavedProducts = 0;

async function getProduct(url) {

  if (numSavedProducts >= numProductsToSave) {
    return;
  }

  const response = await axios.get(url);

  fs.writeFileSync(`./temp/vendors/ehh-product.html`, response.data);
  const $ = cheerio.load(response.data);

  const title = normalizeProductTitle($('.product-section').attr('data-product-title'));

  let image = $('.starting-slide .product-image-main img').attr('data-photoswipe-src');

  image = image?.startsWith('https:') ? image : `https:${image}`;

  let imageUrls = $('a[data-product-thumb][data-index!="0"]').map((i, el) => $(el).attr('href')).get();

  imageUrls = imageUrls.map((url) => url.startsWith('https:') ? url : `https:${url}`);


  if (!imageUrls || !imageUrls.length) {
    fs.writeFileSync(`./temp/vendors/ehh-product-no-image.html`, response.data);
  }

  let terpenes = [];
  let cannabinoids = [];

  const variants = [];

  for (const image of imageUrls) {
    const raw = await recognize(image);

    const result = transcribeAssay(raw, image, 'EHH');

    if (result.length) {
      if (cannabinoidNameList.includes(result[0].name)) {
        cannabinoids = result.filter(a => cannabinoidNameList.includes(a.name))
      }
      if (terpeneNameList.includes(result[0].name)) {
        terpenes = result.filter(a => terpeneNameList.includes(a.name))
      }
    }

    if (terpenes.length && cannabinoids.length) {
      break;
    }
  }

  const product = {
    title,
    url,
    image,
    imageUrls,
    variants,
    terpenes,
    cannabinoids,
    vendor: 'EHH',
  };


  numSavedProducts++;

  return product;
}

async function scrapePage(url, currentPage, productLinks) {

  try {
    const response = await axios.get(url);

    fs.writeFileSync(`./temp/vendors/ehh-page-${currentPage}.html`, response.data);
    const $ = cheerio.load(response.data, { xmlMode: true })

    const cards = $('entry');

    for (const card of cards) {

      const title = $(card).find('entry > title').text().trim();


      if (isDesiredProduct(title)) {

        const href = $(card).find('link').attr('href');
        productLinks.push(href);

      }
    }

    const nextPageLink = $('.pagination-item--next a').attr('href');
    if (nextPageLink) {
      currentPage++;
      await scrapePage(nextPageLink, currentPage, productLinks);
    }
  } catch (e) {
    logger.error('scraper:');
  }
  return productLinks;
}

function isDesiredProduct(productTitle) {
  if (!productTitle) {
    return false;
  }
  const lowerTitle = productTitle.toLowerCase();

  if (lowerTitle.includes('artisan mix')) {
    return false;
  }

  return ['living soil', 'indoor', 'greenhouse'].some((keyword) =>
    lowerTitle.includes(keyword)
  );
}

async function getEHHProductsInfo(productLinks) {

  const products = [];

  for (const productLink of productLinks) {
    const product = await getProduct(productLink);
    if (!product) {
      continue;
    }
    product.vendor = 'EIGHT HORSES';

    //if (product.variants.length > 0) {

    product.variants = product.variants.map((variant) => normalizeVariantName(variant));

    products.push(product);

    //}

  }
  return products;
}

async function getAvailableLeafProducts(id, vendor) {
  batchId = id;
  const productLinks = await scrapePage(startUrl, currentPage, []);

  const products = await getEHHProductsInfo(productLinks);

  return products;

}

if (require.main === module) {
  logger.log({
    level: 'info',
    message: `This script is being executed directly by Node.js`
  });
  getAvailableLeafProducts(batchId, vendor);
}

module.exports = {
  getAvailableLeafProducts,
  getProduct
}

const skippableImages = ["https://cdn11.bigcommerce.com/s-mpabgyqav0/images/stencil/1280x1280/products/268/1807/1683224189.1280.1280__66714.1683226369.jpg?c=1",
  "https://cdn11.bigcommerce.com/s-mpabgyqav0/images/stencil/1280x1280/products/268/1813/1683223605.1280.1280__73189.1683225192.jpg?c=1",
  "https://cdn11.bigcommerce.com/s-mpabgyqav0/images/stencil/1280x1280/products/268/1811/1683223605.1280.1280__28436.1683225192.jpg?c=1",
  "https://cdn11.bigcommerce.com/s-mpabgyqav0/images/stencil/1280x1280/products/268/1814/1683223605.1280.1280__52678.1683225192.jpg?c=1",
  "https://cdn11.bigcommerce.com/s-mpabgyqav0/images/stencil/1280x1280/products/268/1808/1683223605.1280.1280__47191.1683225192.jpg?c=1",
  "https://cdn11.bigcommerce.com/s-mpabgyqav0/images/stencil/1280x1280/products/268/1809/1683223605.1280.1280__02816.1683225192.jpg?c=1",
  "https://cdn11.bigcommerce.com/s-mpabgyqav0/images/stencil/1280x1280/products/268/1815/1683223605.1280.1280__19110.1683225192.jpg?c=1",
  "BagsGroupShot",
  "Diamond-Sticker",
];
