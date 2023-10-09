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

async function run() {

  const products = await getProductsByVendor('WNC', 9);

  // console.log('products.length', products.length);

  const withImages = [];

  for (const product of products) {

    if (product.title.includes('Pineapple')) {
      continue
    }

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

    const assays = [];

    for (const image of product.images) {
      console.log('IMAGE')
      const assay = await recognize(image);

      if (!assay) {
        console.log('image rejected', image);
      }
      console.log('GOT ASSAY')
      // console.log('------------------------');
      // console.log(assay);

      if (assay === 'STOP') {
        // console.log('wont finbe finding more assays')
        break;
      }
      if (assay?.terpenes?.length) {
        console.log('terpenes has length')
        assays.push({
          image: image,
          terpenes: assay.terpenes,
        });
      }
      else if (assay?.cannabinoids?.length) {
        console.log('cannabinoids has length')
        assays.push({
          image: image,
          cannabinoids: assay.cannabinoids,
        });
      }

      if (assays.length === 2) {
        // console.log('found terpenes and cannabinoids');
        break;
      }

    }

    await saveProducts([{ ...product, assays: assays }], 'terpenes-0', true);

    if (assays.length) {
      withOCRedImages.push({ ...product, assays: assays });
    }

  }
  console.log(`Saved ${withOCRedImages.length} products to Firebase`);

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