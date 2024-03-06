const axios = require('./rateLimitedAxios.js');
const gm = require('gm').subClass({ imageMagick: true });
const fs = require('fs');
const logger = require('./logger.js');
const path = require('path');


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
            logger.error(`Error processing imageA: ${err.message}`, { url });
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

async function readImage(url, options = { sharpen: 1.5, resize: 4000 }) {
  let buffer = await getBuffer(url, options);
  if (!buffer?.value || buffer?.value?.length === 0) {
    console.log('buffer has no value')
    return {
      value: null,
      lastModified: null
    }
  }

  buffer.value = await processImage(buffer.value, url);
  return buffer;
}

async function getBuffer(url, options) {
  try {
    let value;
    let lastModified;

    if (url.startsWith('http')) {
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      lastModified = response.headers['last-modified'];
      value = Buffer.from(response.data, 'binary');
    } else {

      const filePath = path.join(__dirname, '../temp/scan', url);
      lastModified = fs.statSync(filePath)?.mtime;
      value = fs.readFileSync(filePath);
    }
    if (!value || value.length === 0) {
      logger.error(`Error getting image buffer: ${url}`);
      return null;
    } else {
      return {
        value,
        lastModified
      }
    }
  } catch (error) {
    logger.error(`Error around getImageBuffer: ${error}`);
    fs.appendFileSync('./temp/errors.buffer.txt', `\nUrl: ${url}\n${JSON.stringify(error, null, 2)}\n\n`);
  }
}

module.exports = {
  readImage
};
