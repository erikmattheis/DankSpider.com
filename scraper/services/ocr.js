const fs = require('fs');

const { createWorker, OEM, PSM } = require('tesseract.js');

const logger = require('../services/logger.js');

// Initialize Tesseract worker at the start to reuse throughout the application
let worker 

async function initWorker(options = {}) {

  let worker = await createWorker('eng');

  try {
    await worker.setParameters(options);
  } catch (error) {
    console.log('Error initializing Tesseract worker:', error);
    process.exit(1);
    // Handle initialization error
  }

  return worker;
}

const opt = {
  tessedit_pageseg_mode: 6,
  tessjs_create_hocr: '0',
  tessjs_create_tsv: '0',
  presets: ['bazaar'],
  tessedit_char_whitelist: ' 0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩαβγδεζηθικλμνξοπρστυφχψω-<>,.',
}

async function recognize(buffer, url, options = opt, worker = null) {
  console.log('Recognizing:', buffer?.length, typeof buffer);

  if (!worker) {
    worker = await initWorker(options);
  }

  try {
    if (options) {
      let start = performance.now();
      await worker.setParameters(options);
      let end = performance.now();
      console.log('Set parameters in', (end - start).toFixed(2), 'ms');
    }

    const result = await worker.recognize(buffer);

    const text = result?.data?.text.replace(/Δ|∆|△/g, '∆');

    return text;
  } catch (error) {
    logger.error(`Error in recognize: ${error.message}`, { url });
    return null;
  }
}

module.exports = {
  recognize,
  initWorker
};
