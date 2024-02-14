const axios = require('../services/rateLimitedAxios.js');
const cheerio = require('cheerio');
const { normalizeVariantName, normalizeProductTitle } = require('../services/strings.js')
const { recognize } = require('../services/ocr.js');
const fs = require('fs');
const { transcribeAssay } = require('../services/cortex.js');
const logger = require('../services/logger.js');

let currentPage = 1;
const startUrl = 'https://eighthorseshemp.com/collections/hemp-flower.atom';

const uniqueVariants = [];
let batchId;

function addUniqueVariant(variant) {
  if (!uniqueVariants.includes(variant)) {
    uniqueVariants.push(variant);
  }
}

async function getProduct(url) {

  const response = await axios.get(url);

  fs.writeFileSync(`./temp/vendors/ehh-product.html`, response.data);
  const $ = cheerio.load(response.data);

  const variants = [];

  // Extract available variant values from BCData object
  const bcDataScript = $('script:contains("var BCData")').html();
  const bcData = JSON.parse(bcDataScript.match(/var BCData = ({.*});/)[1]);
  const availableVariantValues = bcData.product_attributes.available_variant_values;

  // Filter variants by available variant values
  $('div.form-field[data-product-attribute="set-rectangle"] label.form-option').each((index, element) => {
    const variantValue = $(element).attr('for').split('_').pop();
    if (availableVariantValues.includes(parseInt(variantValue))) {
      variants.push($(element).text().trim());
    }
  });

  const title = normalizeProductTitle($('h1.productView-title').text().trim());

  const image = $('figure.productView-image img').attr('src');

  const imageNodes = $('a.productView-thumbnail-link');

  const imageUrls = imageNodes.map((index, el) => $(el).attr('href')).get();

  const images = imageUrls.filter(image => image.toLowerCase().includes('terpenes') || image.toLowerCase().includes('potency') || image.toLowerCase().includes('indoor'));
  const theRest = imageUrls.filter(image => !image.toLowerCase().includes('terpenes') && !image.toLowerCase().includes('potency') && image.toLowerCase().includes('indoor'));



  let terpenes = [];
  let cannabinoids = [];

  for (const image of images) {


    const raw = await recognize(image);
    const result = transcribeAssay(raw, image);

    if (result?.terpenes?.length) {

      terpenes = JSON.parse(JSON.stringify(result.terpenes))
    }
    if (result?.cannabinoids?.length) {
      cannabinoids = JSON.parse(JSON.stringify(result.cannabinoids))
    }

    if (terpenes?.length && cannabinoids?.length) {

      break;
    }

  }

  return {
    title,
    url,
    image,
    images,
    variants,
    terpenes,
    cannabinoids,
    vendor: 'EHH',
  };
}

async function scrapePage(url, currentPage, productLinks) {

  try {
    const response = await axios.get(url);

    fs.writeFileSync(`./temp/vendors/ehh-page-${currentPage}.html`, response.data);
    const $ = cheerio.load(response.data, { xmlMode: true })

    const cards = $('entry');

    for (const card of cards) {
      const anchorElement = $(card).find('a.card-figure__link');
      const productTitle = $(card).find('h3.card-title a').text().trim();
      const title = $(card).find('title').text().trim();
      const vendorDate = $(card).find('updated').text().trim();

      const chooseOptionsButton = $(card).find('a.card-figcaption-button');
      if (isDesiredProduct(productTitle) && chooseOptionsButton && chooseOptionsButton.text().includes('Choose Options')) {

        const href = anchorElement.attr('href');

        productLinks.push(href);
      }
    }

    const nextPageLink = $('.pagination-item--next a').attr('href');
    if (nextPageLink) {
      currentPage++;
      await scrapePage(nextPageLink, currentPage, productLinks);
    }
  } catch (e) {
    logger.error(e);
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

    if (product.variants.length > 0) {

      product.variants = product.variants.map((variant) => normalizeVariantName(variant));

      products.push(product);

    }

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
