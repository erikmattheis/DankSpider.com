const axios = require('./rateLimitedAxios.js')
const fs = require('fs')
const gm = require('gm').subClass({ imageMagick: true })
const { createWorker, OEM, PSM, setLogging } = require('tesseract.js')
const { getBuffer } = require('./memory.js')

setLogging(false)

const { getConfig } = require('../config/config.ocr.js')
const logger = require('../services/logger.js');

let worker;

async function recognize(url) {

  console.log('recognize', url)
  let worker;

  try {

    worker = await createWorker('eng', OEM.DEFAULT, {
      cachePath: './tessdata',
      languagePath: './tessdata',
      errorHandler: (err) => {
        logger.error('Error in worke:', err);
      },
    });

    await worker.setParameters({
      tessedit_pageseg_mode: PSM.DEFAULT
    });

    const buffer = await Promise.race([
      getBuffer(url),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000)) // 5 seconds timeout
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
    console.log('size', size)
    if (size.width < 100 || size.height < 100) {
      logger.warn(`Image too small: ${url}`);
      return null;
    }

    const squareSize = 100;

    const left = (4000 - squareSize) / 2;
    const top = (6000 - squareSize) / 2;

    const croppedBuffer = await new Promise((resolve, reject) => {
      gm(buffer)
        .crop(squareSize, squareSize, left, top)
        .toBuffer((err, buffer) => {
          if (err) {
            reject(err);
          } else {
            resolve(buffer);
          }
        });
    });

    let result = await worker.recognize(croppedBuffer);

    const lettersAndNumbers = result.data.text.match(/[a-zA-Z0-9]/g);

    if (lettersAndNumbers && lettersAndNumbers.length < result.data.text.length / 2) {
      logger.warn(`Image probably not text: ${url}`);
      return null;
    }

    let tweakedBuffer;
    try {
      tweakedBuffer = await new Promise((resolve, reject) => {
        gm(buffer)
          .quality(100)
          .resize(4000)
          .sharpen(5, 5)
          .toBuffer(function (err, buffer) {
            if (err) {
              reject('Error creating buffer:' + err);
            } else {
              resolve(buffer);
            }
          });
      });
    }
    catch (error) {
      logger.error('Error in gm:', error);
      return null;
    }
    console.log('t buffer', tweakedBuffer instanceof Buffer, buffer.length)
    try {
      result = await worker.recognize(tweakedBuffer);
    } catch (error) {
      console.log(`Error in tesseract: ${error}`);
      return null;
    }

    return result.data.text;
  } catch (error) {
    logger.error('Error in recognize', { error: error.toString(), stack: error.stack });
    return 'Error in recognize'
  } finally {
    if (worker) {
      await worker.terminate();
    }
  }
}


const configFirstLook = {
  rectangle: { top: 182, left: 940, width: 1900, height: 817 }
}

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
