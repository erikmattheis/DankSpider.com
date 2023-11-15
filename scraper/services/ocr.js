const axios = require('./rateLimitedAxios.js')
const fs = require('fs')
const gm = require('gm').subClass({ imageMagick: true })
const { createWorker, OEM, PSM, setLogging } = require('tesseract.js')

const { getBuffer } = require('./memory.js')

setLogging(false)

const { getConfig } = require('../config/config.ocr.js')

const { transcribeAssay } = require('./cortex.js')


/*
(async () => {
  worker = await createWorker('eng', OEM.DEFAULT, {
    cachePath: './tessdata',
    languagePath: './tessdata',
    errorHandler: (err) => { console.error('Error in worker:', err); fs.appendFileSync('./temp/errors.txt', `\nError in worker: ${url}\n${JSON.stringify(err, null, 2)}\n\n`) },
  });

  await worker.setParameters({
    tessedit_pageseg_mode: PSM.SPARSE_TEXT
  });
})();
*/

let worker;
async function recognize(url) {

  console.log('\n\nrecognize', url)

  try {

    worker = await createWorker('eng', OEM.DEFAULT, {
      cachePath: './tessdata',
      languagePath: './tessdata',
      errorHandler: (err) => { console.error('Error in worker:', err); fs.appendFileSync('./temp/errors.txt', `\nError in worker: ${url}\n${JSON.stringify(err, null, 2)}\n\n`) },
    });

    const buffer = await getBuffer(url);

    const headline = await worker.recognize(buffer, configFirstLook, { textonly: true });

    console.log('headline:\n', headline.data.text)

    const config = await getConfig(headline.data.text, url)

    if (!config) {
      console.log('no config')
      fs.appendFileSync('./temp/no-config.txt', `\nNo config\n${url}\n\n`)
      return null
    }

    await worker.setParameters({
      tessedit_pageseg_mode: PSM.SINGLE_COLUMN,
    });

    console.log('config:', config.name)

    const result = await worker.recognize(buffer, config)

    // console.log('assay', JSON.stringify(assay.data.text, null, 2))

    const assay = transcribeAssay(result.data.text, config, url)

    return assay;

  } catch (error) {

    console.error(error);

    fs.appendFileSync('./temp/errors.txt', `\nError in recognize: ${url}\n${JSON.stringify(error, null, 2)}\n\n`)
  }

  finally {


    await worker?.terminate();


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
      logger: m => console.log(m),
      errorHandler: (err) => { console.error('Tesseract Error:', err) },
    })

    await worker.setParameters({
      tessedit_pageseg_mode: PSM.SINGLE_COLUMN,
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


module.exports = {

  recognize

}
