const axios = require('./rateLimitedAxios.js');
const gm = require('gm').subClass({ imageMagick: true });
const fs = require('fs');
const logger = require('./logger.js');


async function processImage(buffer, url) {
  try {
    return await new Promise((resolve, reject) => {
      gm(buffer)
        .quality(100)
        .resize(4000)
        .toBuffer((err, buffer) => {
          if (err) {
            logger.error(`GraphicsMagick processing error: ${err.message}`, { url });
            reject(err);
          } else {
            resolve(buffer);
          }
        });
    });
  } catch (error) {
    logger.error(`Error processing image: ${error.message}`, { url });
    return null;
  }
}

async function readImage(url) {
  let buffer = await getBuffer(url);
  buffer.value = await processImage(buffer.value, url);
  return buffer;
}

async function getBuffer(url) {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const lastModified = response.headers['last-modified'];
    const value = Buffer.from(response.data, 'binary');
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
