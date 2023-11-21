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
const end = [];
/*
async function recognize(url) {

  //for (let psm = 1; psm < 13; psm++) {

  //for (let oem = 0; oem < 3; oem++) {

  const result = await recognizeIt(url, PSM.AUTO, OEM.DEFAULT)

  //}



  end.sort((a, b) => b.n - a.n)

  fs.writeFileSync('./temp/results.txt', JSON.stringify(end, null, 2));


}
*/
async function recognize(url) {

  console.log('\n\nrecognize', url)

  try {

    worker = await createWorker('eng', OEM.DEFAULT, {
      cachePath: './tessdata',
      languagePath: './tessdata',

      errorHandler: (err) => { console.error('Error in worker:', err); fs.appendFileSync('./temp/errors.txt', `\nError in worker: ${url}\n${JSON.stringify(err, null, 2)}\n\n`) },
    });

    await worker.setParameters({
      tessedit_pageseg_mode: PSM.SINGLE_COLUMN,
      tessedit_char_whitelist: ' 0123456789.[a-zA-Z]-&\''

    });

    const buffer = await getBuffer(url);

    if (!buffer || buffer.length === 0) {
      console.log('skipping empty', url)
      fs.appendFileSync('./temp/no-buffer.txt', `\nNo image buffer\n${url}\n\n`)
      return null
    }

    // const headline = await worker.recognize(buffer, configFirstLook, { textonly: true });

    const result = await worker.recognize(buffer);

    if (!result.data.text || result.data.text.length === 0) {
      console.log('no text')
      fs.appendFileSync('./temp/no-text.txt', `\nNo text\n${url}\n\n`)
      return null
    }

    const assay = transcribeAssay(result.data.text, url)

    //console.log('assay', JSON.stringify(assay, null, 2))

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
