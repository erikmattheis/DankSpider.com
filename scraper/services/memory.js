const gm = require("gm");
const axios = require("../services/rateLimitedAxios");
const fs = require("fs");
const logger = require('../services/logger.js');

function jpgNameFromUrl(url) {
  const name = url.split('/').pop().split('#')[0].split('?')[0];
  return name.endsWith('.jpg') ? name : `${name}.jpg`;
}

const path = require('path');

async function getBuffer(url) {
  const name = makeImageName(url);
  const dir = path.join(__dirname, '../temp/scan');
  const filePath = path.join(dir, name);

  if (fs.existsSync(filePath)) {
    buffer = fs.readFileSync(filePath);
  } else {
    buffer = await getImageBuffer(url);
    fs.writeFileSync(filePath, buffer);
  }

  return buffer;
}

function makeImageName(url) {
  const name = jpgNameFromUrl(url)

  const domain = url.split('/')[2] ? url.split('/')[2] : 'unknown'

  return `${domain}_${name}`
}

async function getImageBuffer(url) {

  try {


    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data, 'binary');


    if (!buffer || buffer.length === 0) {
      logger.error(`Error getting image buffer: ${url}`);
      return ''
    } else {

      return new Promise((resolve, reject) => {

        gm(buffer)
          .quality(100)
          .resize(4000)
          .sharpen(5, 5)
          .toBuffer('JPEG', function (err, resizedBuffer) {

            if (err) {

              logger.error(`Error resizing image: ${err}`);
              reject(err);

            } else {

              resolve(resizedBuffer);

            }

          });

      });
    }

  } catch (error) {

    logger.error(`Error around getImageBuffer: ${error}`);

    fs.appendFileSync('./temp/errors.txt', `\nUrl: ${url}\n${JSON.stringify(error, null, 2)}\n\n`)

  }

}

async function makeProductsFile(vendor, limit, useDevCollection) {

  let products

  if (vendor && useDevCollection) {
    products = await getProductsByVendor(vendor, limit, useDevCollection)
  } else if (vendor) {
    products = await getProductsByVendor(vendor, limit)
  } else {
    products = await getAllProducts(batchId)
  }

  products = products.map(product => {
    product.cannabinoids = filterAssay(product.cannabinoids)
    product.terpenes = filterAssay(product.terpenes)
    return product
  })

  const updatedAt = new Date().toISOString()

  fs.writeFileSync('../app/src/assets/data/products.json', JSON.stringify({ products, updatedAt }))

  logger.log({level:'info', message: `Wrote ${products.length} products to products.json`});
}


module.exports = {
  getBuffer,
  makeProductsFile
}