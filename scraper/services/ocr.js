
const fs = require('fs');

const { createWorker, OEM, PSM } = require('tesseract.js');

const logger = require('../services/logger.js');

// Initialize Tesseract worker at the start to reuse throughout the application
let worker = null;

async function initWorker() {

  const worker = await createWorker('eng');

  try {
    await worker.setParameters({
      tessedit_pageseg_mode: PSM.AUTO,
      tessedit_char_whitelist: ' 0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩαβγδεζηθικλμνξοπρστυφχψω-<>,.',
    });
  } catch (error) {
    console.log('Error initializing Tesseract worker:', error);
    process.exit(1);
    // Handle initialization error
  }

  return worker;
}

async function recognize(buffer, url) {
  console.log('Recognizing:', url);

  try {
    worker = await initWorker();

    const result = await worker.recognize(buffer);

    return result?.data?.text;
  } catch (error) {
    logger.error(`Error in recognize: ${error.message}`, { url });
    return null;
  }
}

module.exports = {
  recognize
};
