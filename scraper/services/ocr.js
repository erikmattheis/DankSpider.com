const axios = require('./rateLimitedAxios.js');
const spellings = require('spellchecker');
const fs = require('fs');
const gm = require('gm').subClass({ imageMagick: true });
const { createWorker, OEM, PSM } = require('tesseract.js');
const path = require('path');
const { normalizeTerpene, normalizeCannabinoid } = require('./strings.js');

const badImages = [];

const configWNCTerpenesTitle = {
  rectangle: { top: 292, left: 70, width: 118, height: 151 },
  // tessedit_char_whitelist: '\ - ΔαβγabcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
}

const configWNCCannabinoidsTitle = {
  rectangle: { top: 492, left: 71, width: 130, height: 76 },
  tessedit_char_whitelist: '\ - ΔαβγabcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
}

const configWNCTerpenes = {
  rectangle: { top: 318, left: 10, width: 507, height: 497 },
  tessedit_char_whitelist: '\ - ΔαβγabcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
}

const configWNCCannabinoids = {
  rectangle: { top: 600, left: 80, width: 700, height: 420 },
  tessedit_char_whitelist: '\ - ΔαβγabcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
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
    return null;
  }
}

const getAndProcessJpg = async (url, isDev) => {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    console.log('getAndProcessJpg', response.data);
    if (response.status !== 200) {
      console.log(`Failed to download image 1 server response: ${Object.keys(response.data)}`);
      return { name: null, data: null };
    }

    const contentType = response.headers['content-type'];
    if (contentType !== 'image/jpeg') {
      console.log(`Invalid content type: ${contentType}`);
      return { name: null, data: null };
    }

    const jpgName = jpgNameFromUrl(url);
    console.log('jpgName', jpgName);
    const gmResponse = gm(response.data, jpgName).density(300, 300).quality(100).setFormat('jpg');

    console.log('gmResponse', Object.keys(gmResponse));
    const jpgBuffer = await gmToBuffer(gmResponse);
    console.log('buffer length', jpgBuffer?.length);
    return jpgBuffer;
    /*
    if (buffer.noProfile) {
      if (image.length !== response.data.byteLength) {
        console.log('image length error', image.length, response.data.byteLength, jpgName);
      } else {
        // console.log('resolving', buffer);
        return buffer;
      }
    });
    */
  }
  catch (error) {
    console.log('error', error);
    console.error(`Failed to process image 2`);

    // console.log('image', image)
    return null;
  }
}
let first = 0;
async function recognize(url) {

  console.log('url', url)
  if (url.includes('Pineapple') || url.includes('CBD-Diamond') || url.includes('BagsGroupSho')) {
    console.log('pineapple')
    return null;
  }


  first = first + 1;
  if (first > 2) {
    console.log('skipping', first, url);
    return null;
  }

  const worker = await createWorker("eng", 1, {
    errorHandler: m => console.log(m)
  });


  const isDev = process.env.NODE_ENV !== 'production';
  console.log('recognizing', url)

  try {
    const jpgBuffer = await getAndProcessJpg(url, isDev);
    if (!jpgBuffer) {
      console.log('skipping', jpgBuffer, url);
      badImages.push(url);
      await worker.terminate();
      return null;
    }

    const base64Data = jpgBuffer.toString('base64');
    const decodedBuffer = Buffer.from(base64Data, 'base64');
    let title = await worker.recognize(decodedBuffer, configWNCTerpenesTitle);
    console.log('title', title.data.text)
    const terpenes = [];

    const cannabinoids = [];

    let text = title.data.text;

    if (text.toLowerCase().includes('terpenes')) {

      // console.log('----- terpenes -----');

      const result = await worker.recognize(jpgBuffer, configWNCTerpenes);

      text = result.data.text;

      const textArray = text.split('\n');

      // console.log('textArray', textArray.length)

      for (const text of textArray) {

        let split = [];

        let name = '';

        if (text.includes('0750 3000')) {

          split = text.split('0750 3000');

          split = split.map(member => member.trim());

          const name = normalizeTerpene(split[0]);

          if (parseInt(split[1])) {
            terpenes.push({ name, pct: parseInt(split[1]) });
          }
        }
      }
      await worker.terminate();
      return {
        terpenes
      }
    }

    title = await worker.recognize(jpgBuffer, configWNCCannabinoidsTitle);

    if (title.data.text.toLowerCase().includes('cannabinoids')) {

      // console.log('----- cannabinoids -----');

      const file = await getAndProcessJpg(url, true);

      // console.log('file', file)

      const result = await worker.recognize(file, configWNCCannabinoids);
      // console.log(result.data.text)
      const textArray = result.data.text.split('\n');

      for (const text of textArray) {

        cannabinoids.push({
          name: text, pct: parseInt(text)
        });

      }

      await worker.terminate();
      return {
        cannabinoids
      }
    }
    /*
      if (title.data.text.toLowerCase().includes('bellieveau')) {
        // reached legal stuff, npthing else will ever follow

        await worker.terminate();
        return 'STOP';
      }
    */
    await worker.terminate();
  } catch (error) {
    console.error(`Failed to recognize image: ${error} `);
    return null;
  }
}

function normalizeName(name) {
  return name;
}

module.exports = {
  recognize
};
