const axios = require('../services/rateLimitedAxios');
const cheerio = require('cheerio');
const strings = require('../services/strings');
const { recognize } = require('../services/ocr');
const fs = require('fs');
const { transcribeAssay } = require('../services/cortex.js');
const logger = require('../services/logger.js');
let currentPage = 1;
const startUrl = 'https://wnc-cbd.com/categories/high-thca.html';

async function getProduct(url) {
  logger.log({
  level: 'info',
  message: `getProduct called with, ${url}`});

  const response = await axios.get(url);
  const $ = cheerio.load(response.data);
fs.writeFileSync(`./temp/vendors/wnc-product.html`, response.data);
  const variants = [];

  const bcDataScript = $('script:contains("var BCData")').html();
  const bcData = JSON.parse(bcDataScript.match(/var BCData = ({.*});/)[1]);
  const availableVariantValues = bcData.product_attributes.available_variant_values;

  $('div.form-field[data-product-attribute="set-rectangle"] label.form-option').each((_, element) => {
    const variantValue = $(element).attr('for').split('_').pop();
    if (availableVariantValues.includes(parseInt(variantValue))) {
      variants.push($(element).text().trim());
    }
  });

  const title = strings.normalizeProductTitle($('h1.productView-title').text().trim());

  const image = $('figure.productView-image img').attr('src');

  const srcsets = $('img.lazyload').map((index, el) => $(el).attr('data-srcset')).get();
  console.log('srcsets', srcsets);

  const imageUrls = srcsets.map(srcset => {
      console.log('mapping')

      const sources = srcset.split(',').map(s => s.trim());

      console.log('sources', sources.length)

      let maxImageWidth = 0;
      let largestImageUrl = '';

      sources.forEach(source => {
          const [url, width] = source.split(' ');
          console.log(url, width)

          const imageWidth = parseInt(width.replace('w', ''));

          if (imageWidth > maxImageWidth) {
              maxImageWidth = imageWidth;
              largestImageUrl = url;
          }
      });

      return largestImageUrl;
  });

  console.log('imageUrls', imageUrls);

  const images = imageUrls.filter(image => image.toLowerCase().includes('terpenes') || image.toLowerCase().includes('potency'));

  console.log('images', images.length);

  let terpenes = [];
  let cannabinoids = [];

  for (const image of images) {

    if (skippableImages.includes(image)) {
      logger.log({
        level: 'info',
        message: `Skipping: url`});

      continue;
    }

    const raw = await recognize(image);
    const result = transcribeAssay(raw, image);

    if (result?.terpenes?.length) {
      terpenes = JSON.parse(JSON.stringify(result.terpenes))
    }

    if (result?.cannabinoids?.length) {
      cannabinoids = JSON.parse(JSON.stringify(result.cannabinoids))
    }

    if (terpenes?.length && cannabinoids?.length) {
      logger.log({
        level: 'info',
        message: `both terpenes and cannabinoids found`});
      break;
    }

  }

  // await saveProducts([{ title, url, image, terpenes, cannabinoids }], batchId, true);


  logger.log({level:'info', message: `${title} has ${terpenes.length} terpenes and ${cannabinoids.length} cannabinoids`});

  return {
    title,
    url,
    image,
    images,
    variants,
    terpenes,
    cannabinoids,
    vendor: 'WNC',
  };
}

async function scrapePage(url, currentPage, productLinks) {
  const response = await axios.get(url);
  fs.writeFileSync(`./temp/vendors/wnc.html`, response.data);
  const $ = cheerio.load(response.data);

  const cards = $('.card');

  for (const card of cards) {
    const anchorElement = $(card).find('a.card-figure__link');
    const productTitle = $(card).find('h3.card-title a').text().trim();

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

async function getWNCProductsInfo(productLinks) {

  const products = [];
  for (const productLink of productLinks) {
    const product = await getProduct(productLink);
    if (!product) {
      continue;
    }
    product.vendor = 'WNC';

    if (product.variants.length > 0) {

      product.variants = product.variants.map((variant) => strings.normalizeVariantName(variant));

      products.push(product);

    }

  }
  return products;
}

async function getAvailableLeafProducts() {

  const productLinks = await scrapePage(startUrl, currentPage, []);

  const products = await getWNCProductsInfo(productLinks);

  return products;

}

if (require.main === module) {
   logger.log({
  level: 'info',
  message: `This script is being executed directly by Node.js`});
  getAvailableLeafProducts();
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
