const axios = require('./rateLimitedAxios.js')
const fs = require('fs')
const gm = require('gm').subClass({ imageMagick: true })
const { createWorker, OEM, PSM, setLogging } = require('tesseract.js')

const { getBuffer } = require('./memory.js')

setLogging(false)

const { getConfig } = require('../config/config.ocr.js')

let worker;

(async () => {
  worker = await createWorker('eng', OEM.DEFAULT, {
    cachePath: './tessdata',
    languagePath: './tessdata',
    errorHandler: (err) => { console.error('Tesseract Error:', err) },
  });
  console.log('worker created', JSON.stringify(worker, null, 2));
})();

async function recognize(url) {
  try {
    const buffer = await getImageBuffer(url);
    console.log('buffer.length', buffer.length);
    console.log('worker.recognize', JSON.stringify(worker.recognize, null, 2));
    const data = await worker.recognize(buffer, configFirstLook);
    // rest of your code
  } catch (error) {
    console.error(error);
  }
}

/*

let worker;


(async () => {
  worker = await createWorker('eng', 1, {
    cachePath: './tessdata',
    languagePath: './tessdata',
    logger: m => console.log(m),
    errorHandler: (err) => { console.error('Tesseract Error:', err) },
  });
  console.log('worker created', JSON.stringify(worker, null, 2))
})();

async function recognize(url) {

  try {


    const buffer = await getImageBuffer(url)

    console.log('buffer.length', buffer.length)

    console.log('worker.recognize', JSON.stringify(worker.recognize, null, 2));

    const data = await worker.recognize(buffer, configFirstLook)

    const headingText = data.data.text

    console.log('here', headingText)

    const config = getConfig(headingText, url)

    console.log('config', config)

    worker = await getWorker(4).finally(async () => {
      await worker.terminate();
    });

    const { data: { text: bodyText } } = await worker.recognize(buffer, config);

    const assay = await getAssay(bodyText, config)



    return assay


  } catch (error) {

    console.error(`Error in recognize: ${error}: ${url}`)

    fs.appendFileSync('./temp/errors.txt', `\nError in recognize: ${url}\n${JSON.stringify(error, null, 2)}\n\n`)

    return null

  }

}
*/


const configFirstLook = {
  rectangle: { top: 222, left: 1217, width: 1648, height: 777 }
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

async function getAssay(url, config) {

  const result = await worker.recognize(buffer, config)

  const textArray = result.data.text.split('\n')

  const assay = getCannalyzeAssay(textArray, url)

  return assay;

}

function getCannalyzeAssay(textArray, url) {

  for (const text of textArray) {

    if (text.split && text.split(' ').length === 4) {

      const line = getCannalyzeAssayLine(text, url)

      if (line && line.name === 'Unknown') {

        fs.appendFileSync('unknownCannabinoidSpellings.txt', `URl: ${url}\n${JSON.stringify(text, null, 2)}\n${url}\nnconfigCannalyzeCannabinoids\n\n`)
      }
      else {
        cannabinoids.push(line)
      }
    }

  }

  if (cannabinoids.length) {
    cannabinoids.sort((a, b) => b.pct - a.pct)
  }

  return { cannabinoids }
}

const getWorker = async (PSM) => {

  if (worker) {

    worker.reinitialize()

    worker.setParameters({
      tessedit_pageseg_mode: PSM
    });

    return worker

  }

  try {
    console.log('GETTING WORKER')
    const worker = await createWorker("eng", OEM.DEFAULT, {
      cachePath: './tessdata',
      logger: m => console.log(m),
      errorHandler: (err) => { console.error('Tesseract Error:', err) },
    })
    console.log('worker created', JSON.stringify(worker, null, 2))
    await worker.setParameters({
      tessedit_pageseg_mode: PSM,
    });
    console.log('params set')
    await worker.loadLanguage('eng');
    console.log('lang loaded')
    await worker.initialize('eng');
    console.log('worker initialized')
    return worker

  } catch (error) {

    console.error('Error in getWorker:', error)

    fs.appendFileSync('./temp/errors.txt', `\nError in getWorker\n${JSON.stringify(error, null, 2)}\n\n`)

    return null
  }

}

async function getImageBuffer(url) {

  try {


    let response;
    let buffer;


    if (url.startsWith('http')) {

      response = await axios.get(url, { responseType: 'arraybuffer' });
      buffer = Buffer.from(response.data, 'binary');

    } else {

      buffer = fs.readFileSync(url);

    }


    if (!buffer || buffer.length === 0) {

      console.log('skipping empty', url)

      fs.appendFileSync('./temp/no-buffer.txt', `\ngetImageBuffer\nNo image buffer\n${url}\n\n`)

    }

    console.log('resolved getImageBuffer')

    return new Promise((resolve, reject) => {

      gm(buffer)

        .quality(100)
        .resize(4000)
        .sharpen(5, 5)
        .toBuffer('JPEG', function (err, resizedBuffer) {

          if (err) {

            console.error(`Error resizing image: ${err}`);
            reject(err);

          } else {

            console.log(`Resized image buffer`);
            resolve(resizedBuffer);

          }

        });

    });

  } catch (error) {

    console.error(`Error around getImageBuffer: ${error}`);

    fs.appendFileSync('./temp/errors.txt', `\nUrl: ${url}\n${JSON.stringify(error, null, 2)}\n\n`)

  }

}

module.exports = {

  recognize

}
