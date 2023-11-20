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

async function recognize(url) {

  for (let psm = 1; psm < 13; psm++) {

    for (let oem = 0; oem < 3; oem++) {

      const result = await recognizeIt(url, psm, oem)

      if (result) {
        return result
      }

    }

  }

  end.sort((a, b) => b.n - a.n)

  fs.writeFileSync('./temp/results.txt', JSON.stringify(end, null, 2));


}

async function recognizeIt(url, psm, oem) {

  console.log('\n\nrecognize', url)

  try {

    worker = await createWorker('eng', oem, {
      cachePath: './tessdata',
      languagePath: './tessdata',
      errorHandler: (err) => { console.error('Error in worker:', err); fs.appendFileSync('./temp/errors.txt', `\nError in worker: ${url}\n${JSON.stringify(err, null, 2)}\n\n`) },
    });

    await worker.setParameters({
      tessedit_pageseg_mode: psm
    });

    const buffer = await getBuffer(url);

    if (!buffer || buffer.length === 0) {
      console.log('skipping empty', url)
      fs.appendFileSync('./temp/no-buffer.txt', `\nNo image buffer\n${url}\n\n`)
      return null
    }

    // const headline = await worker.recognize(buffer, configFirstLook, { textonly: true });

    const headline = await worker.recognize(buffer);
    //console.log('./temp/blocks.json', JSON.stringify(headline.data.blocks[0]))
    console.log(headline.data.blocks.length)

    console.log(Object.keys(headline.data.blocks))
    const types = headline.data.blocks.map(block => block.blocktype);

    const str = `+++++++++++++++++++++++\n${url}\nOEM:${oem} PSM:${psm} BLOCKS:${types.length}\n${types.join(' ')}\n+++++++++++++++++++++++\n\n`

    end.push({ n: types.length, url, oem, psm, types })

    fs.appendFileSync('./temp/blocks.txt', str);

    console.log(str)

    return

    const tableTexts = tables.map(table => table.paragraphs.map(paragraph => paragraph.lines.map(line => line.words.map(word => word.text).join(' ')).join('\n')).join('\n'));

    const headlineText = JSON.stringify(headline.data.blocks, null, 2);

    fs.writeFileSync('./temp/headline.txt', `${url}\n${headlineText}`)



    fs.appendFileSync('./temp/final.txt', `${url}\n${headline.data.text}`)

    const config = await getConfig(headline.data.text, url)

    fs.appendFileSync('./temp/final.txt', `${config}`)

    fs.appendFileSync('./temp/config.txt', `${JSON.stringify(config, null, 2)}\n------------------\n\n`)

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

    if (!result.data.text || result.data.text.length === 0) {
      console.log('no text')
      fs.appendFileSync('./temp/no-text.txt', `\nNo text\n${url}\n\n`)
      return null
    }

    const assay = transcribeAssay(result.data.text, config, url)

    console.log('assay', JSON.stringify(assay, null, 2))

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
