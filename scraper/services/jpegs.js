const axios = require('./rateLimitedAxios.js');
const Tesseract = require('tesseract.js');
const OpenAI = require('openai');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

const { recognize } = require('./ocr.js');

const { getProductsByVendor, getProductsWithAssay, getProductsWithoutAssay, saveProducts } = require('../firebase.js');

async function run() {
  const products = await getProductsByVendor('WNC', 3);

  console.log('products.length', products.length);

  const withImages = [];

  for (const product of products) {
    console.log('product.url', product.url);

    const images = await getProductImages(product.url);

    console.log('found images', images.length);

    withImages.push({ ...product, images });
  }

  const bestImages = [];

  for (const product of withImages) {
    if (!product.image.length) {
      continue;
    }
    const images = [...product.images];
    product.images.forEach((image, i) => {
      if (image.toLowerCase().includes('terp') || image.toLowerCase().includes('pot')) {
        const member = images.splice(i, 1)[0];
        console.log('moving to front:', member)
        images.unshift(member);
      }
    });

    console.log('best images.length', images.length);

    bestImages.push({ ...product, images });
  }

  const withOCRedImages = [];

  for (const images of bestImages) {
    if (!images.length) {
      continue;
    }

    const imagesWithText = [];

    for (const image of product.images) {

      const terpenes = await recognize(image);
      console.log('terpenes', terpenes)
      if (terpenes === 'STOP') {
        break;
      }

      if (terpenes.length) {
        withOCRedImages.push({ ...product, terpenes });
      }
      else {
        console.log('No terpenes');
      }
      // we have the terpene and cannabinoid images or the the presence of 'Bellieveau' means it's a legal document
      console.log('terpenes.length', terpenes.length)
      if (withOCRedImages.length === 2) {
        break;
      }
    }

    if (withOCRedImages.length) {

      console.log('withOCRedImages`', withOCRedImages.length)


      await saveProducts(withOCRedImages);

    }

    console.log('Done with');
  }
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