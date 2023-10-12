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

  // console.log('products.length', products.length);

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

    const assays = {};

    for (const image of product.images) {

      const assay = await recognize(image);

      if (!assay) {
        console.log('image rejected', image);
      }

      if (assay === 'STOP') {
        // console.log('wont finbe finding more assays')
        break;
      }

      if (assay?.terpenes?.length) {
        assays.terpenes = [...assay.terpenes];
      }

      if (assay?.cannabinoids?.length) {
        assays.cannabinoids = [...assay.cannabinoids];
      }

      if (assays.length === 2) {
        console.log('found terpenes and cannabinoids');
        break;
      }
    }

    if (assays.terpenes || assays.cannabinoids) {

      withOCRedImages.push({ ...product, assays });

    }

  }

  console.log(JSON.stringify(withOCRedImages));
  await deleteAllDocumentsInCollection('productsWithAssay2');
  await saveProducts(withOCRedImages, batchId, true);
  await cleanProductsWithAssaysCollection();
  console.log(`Viewed ${withImages.length} products to Firebase`);
  console.log(`Found ${bestImages.length} candidate products`);
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

if (process.env.NODE_ENV !== 'production') {
  const dotenv = require('dotenv');
  dotenv.config();
}

module.exports = {
  run
}
