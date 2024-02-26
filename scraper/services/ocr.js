const axios = require('./rateLimitedAxios.js');
const fs = require('fs');
const gm = require('gm').subClass({ imageMagick: true });

const { createWorker, OEM, PSM } = require('tesseract.js');
const { getBuffer } = require('./memory.js');
const logger = require('../services/logger.js');

// Initialize Tesseract worker at the start to reuse throughout the application
let worker = null;

async function initWorker() {

  const worker = await createWorker('eng');

  try {
    await worker.setParameters({
      tessedit_pageseg_mode: PSM.AUTO,
    });
  } catch (error) {
    console.log('Error initializing Tesseract worker:', error);
    process.exit(1);
    // Handle initialization error
  }

  return worker;
}

async function recognize(url) {
  console.log('Recognizing:', url);
  worker = await initWorker();

  try {
    const buffer = await Promise.race([
      getBuffer(url),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
    ]);

    if (!buffer || buffer.length === 0) {
      logger.warn(`No image buffer: ${url}`);
      return null;
    }

    // Process image with GraphicsMagick for better OCR results
    const processedBuffer = await processImage(buffer, url);
    if (!processedBuffer) {
      console.log('No processed buffer for url:', url);
      return null; // Error logged and handled in processImage
    }
    const result = await worker.recognize(processedBuffer);
    console.log('Recognized:', Object.keys(result.data));
    return result?.data?.text;
  } catch (error) {
    logger.error(`Error in recognize: ${error.message}`, { url });
    return null;
  }
}

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

module.exports = {
  recognize
};
