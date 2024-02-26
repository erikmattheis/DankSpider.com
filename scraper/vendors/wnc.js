const axios = require('../services/rateLimitedAxios');
const cheerio = require('cheerio');
const { normalizeVariantName, normalizeProductTitle } = require('../services/strings')
const { recognize } = require('../services/ocr');
const fs = require('fs');
const { transcribeAssay, organizeAssays, stringContainsNonFlowerProduct } = require('../services/cortex.js');
const { readImage } = require('../services/image.js');

const { cannabinoidNameList, terpeneNameList } = require('../services/memory')

const logger = require('../services/logger.js');

let numProductsToSave = 3;

const vendor = 'WNC';
let numSavedProducts = 0;
let batchId;

let currentPage = 1;

//const startUrl = 'https://wnc-cbd.com/categories/high-thca.html';
const startUrl = 'https://wnc-cbd.com/categories/high-thca.html?_bc_fsnf=1&Flower%20Size[]=3.5g&Flower%20Size[]=14g%20(small/minis)&Flower%20Size[]=7g&Flower%20Size[]=28g%20(small/minis)&sort=newest';

async function getProduct(url) {

  let cannabinoids = [];
  let terpenes = [];

  try {

    const response = await axios.get(url);

    fs.writeFileSync(`./temp/vendors/wnc-product.html`, response.data);

    const $ = cheerio.load(response.data);

    const variants = [];

    const title = normalizeProductTitle($('h1.productView-title').text().trim());

    if (stringContainsNonFlowerProduct(title)) {
      return null;
    }

    const bcDataScript = $('script:contains("var BCData")').html();
    const bcData = JSON.parse(bcDataScript.match(/var BCData = ({.*});/)[1]);
    const availableVariantValues = bcData.product_attributes.available_variant_values;

    $('div.form-field[data-product-attribute="set-rectangle"] label.form-option').each((_, element) => {
      const variantValue = $(element).attr('for').split('_').pop();
      if (availableVariantValues.includes(parseInt(variantValue))) {
        variants.push($(element).text().trim());
      }
    });

    const image = $('figure.productView-image img').attr('src');

    const srcsets = $('img.lazyload').map((index, el) => $(el).attr('data-srcset')).get();

    const imageUrls = srcsets.map(srcset => {

      const sources = srcset.split(',').map(s => s.trim());
      let maxImageWidth = 0;
      let largestImageUrl = '';

      sources.forEach(source => {

        const [url, width] = source.split(' ');

        const imageWidth = parseInt(width.replace('w', ''));

        if (imageWidth > maxImageWidth) {

          maxImageWidth = imageWidth;

          largestImageUrl = url;

        }
      });

      return largestImageUrl;
    });

    const images = imageUrls.filter(image => image.toLowerCase().includes('terpenes') || image.toLowerCase().includes('potency') || image.toLowerCase().includes('certificate'));

    for (const image of images) {

      if (skippableImages.includes(image)) {
        continue;
      }

      const buffer = await readImage(image, url);
      const raw = await recognize(buffer.value, url);

      if (!raw) {
        console.log('no text found', image);
        continue;
      }

      const result = transcribeAssay(raw, image, vendor);

      if (result.cannabinoids.length) {
        cannabinoids = result.cannabinoids;
      }
      if (result.terpenes.length) {
        terpenes = result.terpenes;
      }
      if (terpenes.length && cannabinoids.length) {
        break;
      }
    }

    const product = {
      title,
      url,
      image,
      images,
      variants,
      cannabinoids,
      terpenes,
      vendor,
    }

    numSavedProducts++;
    return product;
  }
  catch (e) {
    logger.error(e);

  }
}

async function scrapePage(url, currentPage, productLinks) {

  const response = await axios.get(url);
  fs.writeFileSync(`./temp/vendors/wnc.html`, response.data);
  const $ = cheerio.load(response.data);

  const cards = $('.card');

  for (const card of cards) {
    const anchorElement = $(card).find('a.card-figure__link').first();
    const productTitle = $(card).find('h3.card-title a').text().trim();


    if (stringContainsNonFlowerProduct(productTitle)) {
      console.log('skipping', productTitle);
      continue;
    }

    const chooseOptionsButton = $(card).find('a.card-figcaption-button');


    if (isDesiredProduct(productTitle) && chooseOptionsButton && chooseOptionsButton.text()) {

      const href = anchorElement.attr('href');

      productLinks.push(href);
    }
  }

  const nextPageLink = $('.pagination-item--next a').attr('href');
  if (nextPageLink && currentPage <= numProductsToSave) {
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

  if (lowerTitle.includes('sampler')) {
    return false;
  }

  return ['living soil', 'indoor', 'greenhouse'].some((keyword) =>
    lowerTitle.includes(keyword)
  );
}

async function getWNCProductsInfo(productLinks) {

  const products = [];
  for await (const productLink of productLinks) {

    if (numSavedProducts >= numProductsToSave) {
      continue;
    }

    const product = await getProduct(productLink);

    if (!product) {
      continue;
    }

    product.vendor = 'WNC';

    if (product.variants.length > 0) {

      product.variants = product.variants.map((variant) => normalizeVariantName(variant));

      numSavedProducts++;

      products.push(product);

    }

  }
  return products;
}

async function getAvailableLeafProducts(id, vendor) {
  console.log(`getting ${vendor} products`)
  batchId = id;

  const productLinks = await scrapePage(startUrl, currentPage, []);

  const products = await getWNCProductsInfo(productLinks);

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
