const axios = require('./rateLimitedAxios.js');
const fs = require('fs');
const gm = require('gm').subClass({ imageMagick: true });

const { createWorker, OEM, PSM } = require('tesseract.js');

const logger = require('../services/logger.js');

// Initialize Tesseract worker at the start to reuse throughout the application
let worker = null;

async function initWorker() {

  const worker = await createWorker('eng');

  try {
    await worker.setParameters({
      tessedit_pageseg_mode: PSM.AUTO,
    });
  } catch (error) {
    console.log('Error initializing Tesseract worker:', error);
    process.exit(1);
    // Handle initialization error
  }

  return worker;
}

async function recognize(buffer) {

  try {
    worker = await initWorker();

    const result = await worker.recognize(processedBuffer);
    console.log('Recognized:', Object.keys(result.data));
    return result?.data?.text;
  } catch (error) {
    logger.error(`Error in recognize: ${error.message}`, { url });
    return null;
  }
}
async function getBuffer(url) {
  const name = makeImageName(url);
  if (!url) {
    return null;
  }

  const dir = path.join(__dirname, '../temp/scan');
  const filePath = path.join(dir, name);

  if (fs.existsSync(filePath)) {
    buffer = fs.readFileSync(filePath);
  } else {
    buffer = await getImageBuffer(url);
    fs.writeFileSync(filePath, buffer);
  }

  return buffer;
}

module.exports = {
  recognize
};
