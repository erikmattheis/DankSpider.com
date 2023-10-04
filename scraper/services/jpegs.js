const axios = require('./rateLimitedAxios.js');
const Tesseract = require('tesseract.js');
const OpenAI = require('openai');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const { recognize } = require('./ocr.js');

const admin = require('firebase-admin');

const { getProductsByVendor, getProductsWithAssay, getProductsWithoutAssay, saveProducts } = require('../firebase.js');

async function run() {
  const products = await getProductsByVendor('WNC', 2);

  if (process.env.NODE_ENV !== 'production') {
    //fs.writeFileSync('./products.json', JSON.stringify(products, null, 2));
  }

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
        console.log('member', member)
        images.unshift(member);
      }
    });

    console.log('best images.length', images.length);

    bestImages.push({ ...product, images });
  }

  const withOCRedImages = [];

  for (const product of bestImages) {
    if (!product.images.length) {
      continue;
    }

    const images = [];

    for (const image of product.images) {

      const terpenes = await recognize(image);

      if (terpenes.length) {
        images.push({ image, terpenes });
      }
      else {
        console.log('No terpenes');
      }

      if (images.length === 2) {
        break;
      }
    }
    if (images.length) {
      withOCRedImages.push({ ...product, images });
      console.log('withOCRedImages.`', withOCRedImages[withOCRedImages.length - 1])
    }
  }


  await saveProducts(withOCRedImages);

  console.log('Done', withOCRedImages.length);
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