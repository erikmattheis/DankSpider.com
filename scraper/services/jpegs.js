const axios = require('./rateLimitedAxios.js');
const Tesseract = require('tesseract.js');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

const { recognize, recognizeWithSave } = require('./ocr.js');
const { getCompleteProducts, getIncompleteProducts, getProductsByVendor, getProductsWithAssay, saveProducts, deleteAllDocumentsInCollection } = require('../firebase.js');

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

  console.log(`looking at ${products.length} products`);

  //fs.writeFileSync('products.json', JSON.stringify(products, null, 2));
  const withImages = [];

  for (const product of products) {

    const result = await getProductImages(product.url);

    const best = result.filter(image => image.toLowerCase().includes('terpenes') || image.toLowerCase().includes('potency') || image.toLowerCase().includes('indoor'));
    const theRest = result.filter(image => !image.toLowerCase().includes('terpenes') && !image.toLowerCase().includes('potency'));

    if (best.length === 0) {
      console.log('No good images found for', product.title);
      console.log(JSON.stringify(result, null, 2));
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
        console.log('Skipping', image);
        continue;
      }

      const result = await recognize(image);

      if (!result) {
        continue;
      }

      //const result = await recognize(image, { lang: 'eng', oem: 1, psm: 4 })

      if (result instanceof String) {
        console.log('image rejected', image);
        badImages.push(image);
      }


      if (result.terpenes?.length) {
        console.log('Terpenes: ', result.terpenes.length)
        product.terpenes = JSON.parse(JSON.stringify(result.terpenes))
      }
      else if (result.cannabinoids?.length) {
        console.log('Cannabinoids: ', result.cannabinoids.length)
        product.cannabinoids = JSON.parse(JSON.stringify(result.cannabinoids))
      }

      if (product.terpenes?.length && product.cannabinoids?.length) {
        console.log('both terpenes and cannabinoids found')
        break;
      }

      console.log('Nothing in', image);

    }

    await saveProducts([product], batchId, true);

    console.log('Saved one!')
    withOCRedImages.push({ ...product, terpenes, cannabinoids });

    // console.log(`Found ${terpenes.length} terpenes and ${cannabinoids.length}`);

  }

  //await saveProducts(withOCRedImages, batchId, true);

  console.log(`Saved ${withOCRedImages.length} products to Firebase`);

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
