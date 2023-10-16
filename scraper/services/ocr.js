const axios = require('./rateLimitedAxios.js');
const spellings = require('spellchecker');
const fs = require('fs');
const gm = require('gm').subClass({ imageMagick: true });
const { createWorker, OEM, PSM, setLogging } = require('tesseract.js');

//setLogging(true);
// reinitialize = function(langs = 'eng', oem, config, jobId)
// load = ({ workerId, jobId, payload: { options: { lstmOnly, corePath, logging } } }, res);

const path = require('path');

const { getCannabinoidObj, getCannabinoidObj2, getTerpeneObj } = require('./strings.js');

const badImages = [];

const configWNCTerpenesTitle = {
  rectangle: { top: 1352, left: 284, width: 400, height: 188 },
}

const configWNCCannabinoidsTitle = {
  rectangle: { top: 2055, left: 123, width: 660, height: 209 },
}

const configWNCCannabinoidsTitle2 = {
  rectangle: { top: 1522, left: 86, width: 621, height: 313 },
}

const configWNCTerpenes = {
  rectangle: { top: 1722, left: 320, width: 1939, height: 1361 },
}

const configWNCCannabinoids = {
  rectangle: { top: 2505, left: 413, width: 2658, height: 1708 },
}

const configWNCCannabinoids2 = {
  rectangle: { top: 1756, left: 108, width: 3181, height: 1556 },
}

const jpgNameFromUrl = (url) => {
  const split = url.split('/');
  const last = split[split.length - 1];
  const split2 = last.split('?');
  return split2[0];
}

async function gmToBuffer(data) {
  try {
    const chunks = [];
    const stream = data.stream();
    stream.on('data', (chunk) => { chunks.push(chunk) });

    return await new Promise((resolve, reject) => {
      stream.on('end', () => { resolve(Buffer.concat(chunks)) });
      stream.on('error', (err) => { reject(err) });
    });
  } catch (error) {
    console.error(`Failed to convert image to buffer: ${error}`);
    badImages.push({ url, error });
    return null;
  }
}

const getAndProcessJpg = async (url, isDev) => {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });

    if (response.status !== 200) {
      // console.log(`Failed to download image 1`);
      badImages.push({ url, error: response.status });
      return null;
    }

    const contentType = response.headers['content-type'];

    if (contentType !== 'image/jpeg') {
      // console.log(`Invalid content type: ${contentType}`);
      badImages.push({ url, error: contentType });
      return null
    }

    const jpgName = jpgNameFromUrl(url);

    const gmResponse = await gm(response.data, jpgName).resize(4000).sharpen(0.5, 0.5).quality(100).setFormat('jpg')

    const jpgBuffer = await gmToBuffer(gmResponse);

    return jpgBuffer;

  }
  catch (error) {

    console.error(`Failed to process image 2`, error);
    badImages.push({ url, error });

    return JSON.stringify(error);
  }
}

async function recognize(url) {

  try {

    const worker = await createWorker("eng", 1, {
      user_patterns_file: './tessdata/eng.user-patterns',
      "tessdata-dir": './tessdata',
      userPatterns: './tessdata/eng.user-patterns',
      tessedit_write_images: true,
      errorHandler: (err) => { console.error('Error:', err) },
    });

    await worker.loadLanguage('eng');

    await worker.initialize('eng');

    await worker.setParameters({
      tessedit_pageseg_mode: 4,
    });

    const isDev = process.env.NODE_ENV !== 'production';

    const jpgBuffer = await getAndProcessJpg(url, isDev);

    if (!jpgBuffer) {
      console.log('skipping empty', url);
      badImages.push(url);
      fs.appendFileSync('badImages.json', JSON.stringify(badImages, null, 2));
      await worker.terminate();

      return null;
    }

    //fs.writeFileSync('image.jpg', jpgBuffer);

    const terpenes = [];

    const cannabinoids = [];

    const jpgName = jpgNameFromUrl(url);

    let title = await worker.recognize(jpgBuffer, configWNCTerpenesTitle);

    if (title.data.text.toLowerCase().includes('terpenes')) {

      console.log('----- terpenes -----');

      const result = await worker.recognize(jpgBuffer, configWNCTerpenes);

      const textArray = result.data.text.split('\n');

      for (const text of textArray) {

        const line = getTerpeneObj(text);

        terpenes.push(line);

      }

      await worker.terminate();

      terpenes.sort((a, b) => b.pct - a.pct);

      return { terpenes }

    }

    title = await worker.recognize(jpgBuffer, configWNCCannabinoidsTitle);

    if (title.data.text.toLowerCase().includes('cannabinoids')) {

      console.log('----- cannabinoids -----');

      const result = await worker.recognize(jpgBuffer, configWNCCannabinoids);

      const textArray = result.data.text.split('\n');

      for (const text of textArray) {

        const line = getCannabinoidObj(text);

        cannabinoids.push(line);

      }

      await worker.terminate();

      cannabinoids.sort((a, b) => b.pct - a.pct);

      return { cannabinoids }

    }

    title = await worker.recognize(jpgBuffer, configWNCCannabinoidsTitle2);

    if (title.data.text.toLowerCase().includes('cannabinoids')) {

      console.log('----- cannabinoids 2 -----');

      const result = await worker.recognize(jpgBuffer, configWNCCannabinoids2);

      const textArray = result.data.text.split('\n');

      for (const text of textArray) {

        const line = getCannabinoidObj2(text);

        cannabinoids.push(line);

      }

      await worker.terminate();

      cannabinoids.sort((a, b) => b.pct - a.pct);

      return { cannabinoids }

    }

  }
  catch (error) {

    // await worker.terminate();

    console.error(`Failed to recognize image: ${error} `);
    fs.writeFileSync('error.txt', JSON.stringify(error, null, 2));

    return error;
  }

}

const recognizeWithSave = async (imagePath, options) => {
  // Process the image with Tesseract.js and save the optimized image to disk
  const worker = await createWorker();
  await worker.loadLanguage('eng');
  await worker.initialize('eng');
  await worker.setParameters(options);
  const { data, hocr } = await worker.recognize(imagePath);
  const optimizedImagePath = `${imagePath}.optimized.jpg`;
  const optimizedImageBuffer = await worker.getBuffer('jpg');
  fs.writeFileSync(optimizedImagePath, optimizedImageBuffer);
  await worker.terminate();

  // Return the OCR result and the path to the optimized image
  return { data, hocr, optimizedImagePath };
};
/*
(async () => {
  const result = await recognize('http://localhost:5173/BUFFER.jpg');
  //console.log(JSON.stringify(result, null, 2));
})();
*/
module.exports = {
  recognize,
  recognizeWithSave
};
