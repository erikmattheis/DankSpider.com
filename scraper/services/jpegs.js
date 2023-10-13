const axios = require('./rateLimitedAxios.js');
const Tesseract = require('tesseract.js');
const OpenAI = require('openai');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

const { recognize } = require('./ocr.js');

const { getProductsByVendor, getProductsWithAssay2, saveProducts } = require('../firebase.js');
const { AxiosHeaders } = require('axios');
const { log } = require('console');
const { deleteApp } = require('firebase-admin/app');

async function run() {

  const products = await getProductsByVendor('WNC', 8);

  console.log('products.length', products.length);

  const withImages = [];

  for (const product of products) {

    const images = await getProductImages(product.url);

    console.log('found images', images.length);

    if (images.length) {
      withImages.push({ ...product, images });
    }
  }

  const bestImages = [];

  for (const product of withImages) {
    const images = [];
    product.images.forEach((image, i) => {
      if (image.toLowerCase().includes('terpenes') || image.toLowerCase().includes('potency')) {
        images.push(image);
      }
    });

    console.log('best images.length', images.length);

    bestImages.push({ ...product, images });
  }

  const withOCRedImages = [];

  deleteAllDocumentsInCollection('productsWithAssay2');

  for (const product of bestImages) {

    const terpenes = [];
    const cannabinoids = [];

    for (const image of product.images) {

      const results = await recognize(image);

      if (!results) {
        console.log('image rejected', image);
      }

      if (results === 'STOP') {
        // console.log('wont finbe finding more assays')
        break;
      }

      if (results.terpenes?.length) {
        console.log('terpenes has length')
        terpenes.push(...results.terpenes);
      }
      else if (results.cannabinoids?.length) {
        cannabinoids.push(...results.cannabinoids)
      }

      if (terpenes.length && cannabinoids.length) {
        // console.log('found terpenes and cannabinoids');
        break;
      }

    }

    withOCRedImages.push({ ...product, terpenes, cannabinoids });

  }

  await saveProducts(withOCRedImages, 'c3', true);

  console.log(`Saved ${withOCRedImages.length} products to Firebase`);

}

async function deleteAllDocumentsInCollection(collectionPath) {
  const snapshot = await admin.firestore().collection(collectionPath).get();
  const batch = admin.firestore().batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();
}

run();

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
