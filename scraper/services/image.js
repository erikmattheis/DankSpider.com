const axios = require('./rateLimitedAxios.js');
const gm = require('gm').subClass({ imageMagick: true });
const fs = require('fs');
const logger = require('./logger.js');
const path = require('path');
const { getBufferFromFile } = require('./memory.js');

async function processImage(buffer, url, options = { sharpen: 1.5, resize: 4000 }) {
  try {
    return await new Promise((resolve, reject) => {
      gm(buffer)
        .quality(100)
        .density(300, 300)
        .sharpen(options.sharpen)
        .resize(options.resize)
        // to jpeg
        .setFormat('jpeg')
        .toBuffer((err, buffer) => {
          if (err) {
            console.log(`Error processing imageA: ${err.message}`, { url });
            fs.appendFileSync('./temp/errors.processImage1.txt', `\nurl: ${url}\n${JSON.stringify(err, null, 2)}\n\n`);
            reject(err);
          } else {
            resolve(buffer);
          }
        });
    });
  } catch (error) {
    logger.error(`Error processing imageB: ${error.message}`, { url });
    fs.appendFileSync('./temp/errors.processImage2.txt', `\nurl: ${url}\n${JSON.stringify(error, null, 2)}\n\n`);
    return null;
  }
}

async function readImage(url, options = {}) {

  try {

    console.log('readImage', url);
    let buffer = await getBuffer(url, options);

    if (!buffer?.value || buffer?.value?.length === 0) {
      console.log('buffer has no value');
      return {
        value: null,
        lastModified: null
      }
    }

    // buffer.value = await processImage(buffer.value, url);
    return buffer;
  }
  catch (error) {
    logger.error(`Error around readImage: ${error}`);
    fs.appendFileSync('./temp/errors.readImage.txt', `\nUrl: ${url}\n${JSON.stringify(error, null, 2)}\n\n`);
    return null;
  }
}

async function getBuffer(url) {
  try {

    if (!url) {
      return null;
    }

    let value = null;
    let lastModified = null;

    let buffer = await getBufferFromFile(url);

    console.log('got Buffer', url, buffer);

    if (buffer) {
      value = buffer.value;
      lastModified = buffer.lastModified;
    }

    if (url.startsWith('http')) {
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      lastModified = response.headers['last-modified'];
      value = Buffer.from(response.data, 'binary');
    }

    if (!value || buffer?.value.length === 0) {
      console.log('buffer has no value', buffer);
      console.log(`Error getting image buffer: ${url}`);

      fs.appendFileSync('./temp/errors.buffer.txt', `Error getting image buffer: ${url}`);

      return null;

    } else {
      return buffer
    }
  } catch (error) {
    logger.error(`Error around getImageBuffer: ${error}`);
    fs.appendFileSync('./temp/errors.buffer.txt', `\nUrl: ${url}\n${JSON.stringify(error, null, 2)}\n\n`);
  }
}

module.exports = {
  readImage
};
