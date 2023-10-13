const axios = require('./rateLimitedAxios.js');
const Tesseract = require('tesseract.js');
const OpenAI = require('openai');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

const { recognize } = require('./ocr.js');

const { getProductsByVendor, getProductsWithAssay2, saveProducts, cleanProductsWithAssaysCollection, deleteAllDocumentsInCollection } = require('../firebase.js');
const { AxiosHeaders } = require('axios');
const { log } = require('console');
const { deleteApp } = require('firebase-admin/app');

async function run(batchId) {

  const products = await getProductsByVendor('WNC', 10);

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
