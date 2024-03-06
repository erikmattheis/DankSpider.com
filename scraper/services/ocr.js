const fs = require('fs');

const { createWorker, OEM, PSM } = require('tesseract.js');

const logger = require('../services/logger.js');

// Initialize Tesseract worker at the start to reuse throughout the application
let worker = null;

async function initWorker(options = {}) {

  const worker = await createWorker('eng');

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
  tessjs_create_tsv: '1',
  presets: ['bazaar'],
  tessedit_char_whitelist: ' 0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩαβγδεζηθικλμνξοπρστυφχψω-<>,.',
}

async function recognize(buffer, url, options = opt) {
  console.log('Recognizing:', buffer?.length, typeof buffer);

  try {
    worker = await initWorker(options);

    const result = await worker.recognize(buffer);

    const text = result?.data?.text.replace(/Δ|∆|△/g, '∆');

    return text;
  } catch (error) {
    logger.error(`Error in recognize: ${error.message}`, { url });
    return null;
  }
}

module.exports = {
  recognize
};
