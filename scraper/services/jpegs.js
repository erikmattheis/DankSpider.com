const axios = require('./rateLimitedAxios.js');
const Tesseract = require('tesseract.js');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const logger = require('../services/logger.js');

const { recognize, recognizeWithSave } = require('./ocr.js');
const { transcribeAssay } = require('../services/cortex.js');
const { getCompleteProducts, getIncompleteProducts, getProductsByVendor, getproducts, saveProducts, deleteAllDocumentsInCollection } = require('../firebase.js');

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

async function run(batchId) {

  const products = await getProductsByVendor('WNC', 1000);
  //const complete = await getCompleteProducts('WNC');
  //const products = await getIncompleteProducts('WNC');

  logger.log({level:'info', message: `looking at ${products.length} products`});

  //fs.writeFileSync('products.json', JSON.stringify(products, null, 2));
  const withImages = [];

  for (const product of products) {

    const result = await getProductImages(product.url);

    const best = result.filter(image => image.toLowerCase().includes('terpenes') || image.toLowerCase().includes('potency') || image.toLowerCase().includes('indoor'));
    const theRest = result.filter(image => !image.toLowerCase().includes('terpenes') && !image.toLowerCase().includes('potency'));

    if (best.length === 0) {

      continue;
    }
    const images = [...best];

    withImages.push({ ...product, images });
  }

  const withOCRedImages = [];

  for (const product of withImages) {

    let terpenes = [];
    let cannabinoids = [];

    for (const image of product.images) {

      if (skippableImages.includes(image)) {

        continue;
      }

      const raw = await recognize(image);
      const result = await transcribeAssay(raw);

      if (!result) {
        continue;
      }

      //const result = await recognize(image, { lang: 'eng', oem: 1, psm: 4 })

      if (result instanceof String) {
        badImages.push(image);
      }


      if (result.terpenes?.length) {

        logger.log({
  level: 'info',
  message: `Terpenes: ${result.terpenes.length}`});

        product.terpenes = JSON.parse(JSON.stringify(result.terpenes))
      }
      else if (result.cannabinoids?.length) {
        logger.log({
  level: 'info',
  message: `Cannabinoids: ${result.cannabinoids.length}`});}
        product.cannabinoids = JSON.parse(JSON.stringify(result.cannabinoids))
      }

      if (product.terpenes?.length && product.cannabinoids?.length) {

        break;
      }


    await saveProducts([product], batchId, true);


    withOCRedImages.push({ ...product, terpenes, cannabinoids });

     logger.log({level:'info', message: `Found ${terpenes.length} terpenes and ${cannabinoids.length}`});

  }

  //await saveProducts(withOCRedImages, batchId, true);

  logger.log({level:'info', message: `Saved ${withOCRedImages.length} products to Firebase`});

}

async function getProductImages(url) {
  const response = await axios.get(url);
  const $ = cheerio.load(response.data);
  const images = $('a.productView-thumbnail-link');
  const imageUrls = images.map((index, el) => $(el).attr('href')).get();
  return imageUrls;
}

function nameContains(imageNames, str) {
  return name.toLowerCase().includes(str.toLowerCase());
}

module.exports = {
  run
}
