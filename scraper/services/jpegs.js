const axios = require('./rateLimitedAxios.js');
const Tesseract = require('tesseract.js');
const OpenAI = require('openai');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

const { recognize } = require('./ocr.js');

const { getProductsByVendor, getProductsWithAssay2, getProductsWithoutAssay2, saveProducts } = require('../firebase.js');

async function run() {
  const products = await getProductsByVendor('WNC', 3);

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
    const images = [...product.images];
    product.images.forEach((image, i) => {
      if (image.toLowerCase().includes('terpe') || image.toLowerCase().includes('poten')) {
        const member = images.splice(i, 1)[0];
        console.log('moving to front:', member)
        images.unshift(member);
      }
    });

    console.log('best images.length', images.length);

    bestImages.push({ ...product, images });
  }

  const withOCRedImages = [];

  for (const product of bestImages) {

    const assays = [];

    for (const image of product.images) {

      const assay = await recognize(image);

      if (assay === 'STOP') {
        break;
      }

      else if (assay) {
        assays.push({
          image: image,
          assay,
        });
      }

      if (assays.length === 2) {
        console.log('found terpenes and cannabinoids');
        break;
      }

    }

    if (assays.length) {
      withOCRedImages.push({ ...product, assays: assays });
      console.log('assays`', assays.length)
    }

  }
  console.log(`Saving ${withOCRedImages.length} products to Firebase`);
  await saveProducts(withOCRedImages, 'terpenes', true);
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

if (process.env.NODE_ENV !== 'production') {
  const dotenv = require('dotenv');
  dotenv.config();
}

module.exports = {
  run,
}