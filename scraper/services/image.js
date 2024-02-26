async function processImage(buffer, url) {
  try {
    return await new Promise((resolve, reject) => {
      gm(buffer)
        .quality(100)
        .resize(4000)
        .toBuffer((err, buffer) => {
          if (err) {
            logger.error(`GraphicsMagick processing error: ${err.message}`, { url });
            reject(err);
          } else {
            resolve(buffer);
          }
        });
    });
  } catch (error) {
    logger.error(`Error processing image: ${error.message}`, { url });
    return null;
  }
}

async function readImage(url) {
  const buffer = await getBuffer(url);
  const processedBuffer = await processImage(buffer, url);
  const text = await ocr(processedBuffer);
  return text;
}

async function getBuffer(url) {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data, 'binary');
    if (!buffer || buffer.length === 0) {
      logger.error(`Error getting image buffer: ${url}`);
      return null;
    } else {
      return buffer;
    }
  } catch (error) {
    logger.error(`Error around getImageBuffer: ${error}`);
    fs.appendFileSync('./temp/errors.buffer.txt', `\nUrl: ${url}\n${JSON.stringify(error, null, 2)}\n\n`);
  }
}

// Process image with GraphicsMagick for better OCR results
const processedBuffer = await processImage(buffer, url);
if (!processedBuffer) {
  console.log('No processed buffer for url:', url);
  return null; // Error logged and handled in processImage
}

const buffer = await Promise.race([
  getBuffer(url),
  new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
]);

if (!buffer || buffer.length === 0) {
  logger.warn(`No image buffer: ${url}`);
  return null;
}

module.exports = {
  readImage
};
