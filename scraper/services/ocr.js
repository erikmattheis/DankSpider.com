const axios = require('./rateLimitedAxios.js')
const fs = require('fs')
const gm = require('gm').subClass({ imageMagick: true })
const { createWorker, OEM, PSM, setLogging } = require('tesseract.js')
const { getBuffer } = require('./memory.js')

setLogging(false)

const { getConfig } = require('../config/config.ocr.js')
const logger = require('../services/logger.js');

let worker;

fs.writeFileSync('./skipped.txt', '')

async function recognize(url) {

  console.log('recognize', url)
  let worker;

  try {

    worker = await createWorker('eng', OEM.DEFAULT, {
      cachePath: './tessdata',
      languagePath: './tessdata',
      errorHandler: (err) => {
        logger.error('Error in worke:', err);
        fs.appendFileSync('./skipped.txt', `Error in worker: ${url}\n`)
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
      fs.appendFileSync('./skipped.txt', `No buffer: ${url}\n`)
      return null;
    }
    /*
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
          fs.appendFileSync('./skipped.txt', `Error in gm: ${url}\n`)
          return null;
        }
    
        if (size.width < 100 || size.height < 100) {
          logger.warn(`Image too small: ${url}`);
          fs.appendFileSync('./skipped.txt', `Too small: ${url}\n`)
    
          return null;
        }
    
        const left = (size.width - squareSize) / 2;
        const top = size.height - squareSize;
    
        const croppedBuffer = await new Promise((resolve, reject) => {
          gm(buffer)
            .crop(squareSize, squareSize, left, top)
            .toBuffer((err, buffer) => {
              if (err) {
                fs.appendFileSync('./skipped.txt', `Error in gm crop: ${url}\n`)
                reject(err);
              } else {
                resolve(buffer);
              }
            });
        });
    
        let result = await worker.recognize(croppedBuffer);
    
        const lettersAndNumbers = result.data.text.match(/[a-zA-Z0-9]/g);
    
        if (!['potency', 'analysis', 'terpene', 'cannabinoid', lettersAndNumbers && lettersAndNumbers.length < result.data.text.length / 2) {
          logger.warn(`Image probably not text: ${url}`);
          fs.appendFileSync('./skipped.txt', `Probably not text: ${url}\n`)
          return null;
        }
    */
    let tweakedBuffer;
    try {
      tweakedBuffer = await new Promise((resolve, reject) => {
        gm(buffer)
          .quality(100)
          .resize(4000)
          // .sharpen(5, 5)
          .toBuffer(function (err, buffer) {
            if (err) {
              console.log('Error creating buffer:', err);
              fs.appendFileSync('./skipped.txt', `Error creating buffer: ${url}\n`)
              reject('Error creating buffer:' + err);
            } else {
              resolve(buffer);
            }
          });
      });
    }
    catch (error) {
      logger.error('Error in gm:', error);
      fs.appendFileSync('./skipped.txt', `Error in gm (2): ${url}\n`)
      return null;
    }


    try {
      result = await worker.recognize(tweakedBuffer);
    } catch (error) {
      console.log(`Error in tesseract: ${error}`);
      fs.appendFileSync('./skipped.txt', `Error in tesseract: ${url}\n`)
      return null;
    }

    return result.data.text;
  } catch (error) {
    logger.error('Error in recognize', { error: error.toString(), stack: error.stack });
    fs.appendFileSync('./skipped.txt', `Error in recognize: ${url}\n`)
    return 'Error in recognize'
  } finally {
    if (worker) {
      await worker.terminate();
    }
  }
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
