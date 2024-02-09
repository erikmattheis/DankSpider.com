const axios = require('./rateLimitedAxios.js')
const fs = require('fs')
const gm = require('gm').subClass({ imageMagick: true })
const { createWorker, OEM, PSM, setLogging } = require('tesseract.js')


const { getBuffer } = require('./memory.js')

setLogging(false)

const { getConfig } = require('../config/config.ocr.js')
const logger = require('../services/logger.js');

/*
(async () => {
  worker = await createWorker('eng', OEM.DEFAULT, {
    cachePath: './tessdata',
    languagePath: './tessdata',
    errorHandler: (err) => { logger.error('Error in worker:', err); fs.appendFileSync('./temp/errors.txt', `\nError in worker: ${url}\n${JSON.stringify(err, null, 2)}\n\n`) },
  });

  await worker.setParameters({
    tessedit_pageseg_mode: PSM.SPARSE_TEXT
  });
})();
*/

let worker;

async function recognize(url) {
  logger.log({
    level: 'info',
    message: `\n\nrecognize ${url}`
  });

  let worker;

  try {
    worker = await createWorker('eng', OEM.DEFAULT, {
      cachePath: './tessdata',
      languagePath: './tessdata',
      errorHandler: (err) => {
        logger.error('Error in worker:', err);
        fs.appendFileSync('./temp/errors.txt', `\nError in worker: ${url}\n${JSON.stringify(err, null, 2)}\n\n`);
      },
    });

    await worker.setParameters({
      tessedit_pageseg_mode: PSM.DEFAULT
    });

    // Add a timeout to the getBuffer function
    const buffer = await Promise.race([
      getBuffer(url),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000)) // 5 seconds timeout
    ]);

    if (!buffer || buffer.length === 0) {
      logger.warn(`No image buffer: ${url}`);
      return null;
    }

    // Add error handling to gm
    let size;
    try {
      size = await new Promise((resolve, reject) => {
        gm(buffer).size((err, size) => {
          if (err) {
            reject(err);
          } else {
            resolve(size);
          }
        });
      });
    } catch (error) {
      logger.error(`Error in gm: ${error}`);
      return null;
    }

    if (size.width < 3 || size.height < 3) {
      logger.warn(`Image too small: ${url}`);
      return null;
    }

    // Add error handling to tesseract
    let result;
    try {
      result = await worker.recognize(buffer);
    } catch (error) {
      logger.error(`Error in tesseract: ${error}`);
      return null;
    }

    if (!result.data.text || result.data.text.length === 0) {
      logger.warn(`No text: ${url}`);
      return null;
    }

    return result.data.text;
  } catch (error) {
    logger.error(error);
    logger.error(`Error in recognize: ${url}\n${JSON.stringify(error, null, 2)}`);
  } finally {
    if (worker) {
      await worker.terminate();
    }
  }
}


const configFirstLook = {
  rectangle: { top: 182, left: 940, width: 1900, height: 817 }
}

/*
function getConfig(headingText, url) {

  if (['certificate','analysis','consolidated'].some(word => headingText.toLowerCase().includes(word))) {

    // Cannalyze Cannabinoids
    return { rectangle: { top: 1410, left: 322, width: 3411, height: 2362 }}

  }

  if (['terps', 'terpene'].some(word => headingText.toLowerCase().includes(word))) {
  // New Bloom Terpenes
    return { rectangle: { top: 1722, left: 320, width: 1939, height: 1361 } }
  }


  if (url.toLowerCase().includes('canna')) {
    // New Bloom Cannabinoids
    return { rectangle: { top: 2471, left: 202, width: 3094, height: 1744 } }
  }


  // New Bloom Cannabinoids
  return { rectangle: { top: 1756, left: 108, width: 3181, height: 1556 } }


}
*/


const getWorker = async (PSM) => {

  if (worker) {

    // await worker.reinitialize()

    await worker.setParameters({
      tessedit_pageseg_mode: PSM
    });

    return worker

  }

  try {

    const worker = await createWorker("eng", OEM.DEFAULT, {
      cachePath: './tessdata',
      logger: m => logger.log(m),
      errorHandler: (err) => { logger.error('Tesseract Error:', err); fs.appendFileSync('./temp/errors.txt', `\nError in Tesseract worker\n${JSON.stringify(err, null, 2)}\n\n`) },
    })

    await worker.setParameters({
      tessedit_pageseg_mode: PSM.SINGLE_COLUMN,
    });

    await worker.loadLanguage('eng');

    await worker.initialize('eng');

    return worker

  } catch (error) {

    logger.error('Error in getWorker:', error)

    fs.appendFileSync('./temp/errors.txt', `\nError in getWorker\n${JSON.stringify(error, null, 2)}\n\n`)

    return null
  }

}


module.exports = {

  recognize

}
