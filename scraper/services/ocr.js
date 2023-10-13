const axios = require('./rateLimitedAxios.js');
const spellings = require('spellchecker');
const fs = require('fs');
const gm = require('gm').subClass({ imageMagick: true });
const { createWorker, OEM, PSM } = require('tesseract.js');
const path = require('path');
const { normalizeTerpene, normalizeCannabinoid } = require('./strings.js');

const badImages = [];

const configWNCTerpenesTitle = {
  rectangle: { top: 1397, left: 292, width: 365, height: 119 },
  // tessedit_char_whitelist: '\ - ΔαβγabcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
}

const configWNCCannabinoidsTitle = {
  rectangle: { top: 2100, left: 301, width: 485, height: 94 },
  // tessedit_char_whitelist: '\ - ΔαβγabcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
}

/*
'ambigs_debug_level'
'user_words_suffix'
'user_patterns_suffix'
'user_patterns_suffix',
'load_system_dawg',
 'load_freq_dawg',
 'load_unambig_dawg','load_punc_dawg', 'load_number_dawg', 'load_bigram_dawg',
'tessedit_ocr_engine_mode', 'tessedit_init_config_only', 'language_model_ngram_on', 'language_model_use_sigmoidal_certainty'];
*/

const configWNCTerpenes = {
  rectangle: { top: 1768, left: 341, width: 1939, height: 1273 },
  // tessedit_char_whitelist: '\ - ΔαβγabcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
}

const configWNCCannabinoids = {
  rectangle: { top: 2506, left: 571, width: 2470, height: 1503 },
  // tessedit_char_whitelist: '\ - ΔαβγabcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
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

    if (response.status !== 200) {
      console.log(`Failed to download image 1`);
      return { name: null, data: null };
    }

    const contentType = response.headers['content-type'];
    if (contentType !== 'image/jpeg') {
      console.log(`Invalid content type: ${contentType}`);
      return { name: null, data: null };
    }

    const jpgName = jpgNameFromUrl(url);
    console.log('jpgName', jpgName);
    const gmResponse = await gm(response.data, jpgName).resize(4000); //quality(100).setFormat('jpg')

    //sconsole.log('gmResponse', Object.keys(gmResponse));
    const jpgBuffer = await gmToBuffer(gmResponse);
    console.log('buffer length', jpgBuffer?.length);
    //return response.data;
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

async function recognize(url) {
  try {
    console.log('url', url)
    if (url.includes('Pineapple') ||
      url.includes('CBD-Diamond') ||
      url.includes('BagsGroupSho')) {
      console.log('pineapple')
      return null;
    }

    const worker = await createWorker("eng", 1, {
      user_patterns_file: './tessdata/eng.user-patterns',
      tessdata: './tessdata',
      userPatterns: './tessdata/eng.user-patterns',
      tessedit_write_images: true,
    });

    await worker.loadLanguage('eng');

    await worker.initialize();

    await worker.setParameters({
      tessedit_pageseg_mode: 4,
      tessedit_rejection_debug: 1,
    });

    const isDev = process.env.NODE_ENV !== 'production';
    console.log('recognizing', url)


    const jpgBuffer = await getAndProcessJpg(url, isDev);
    if (!jpgBuffer) {
      console.log('skipping', url);
      badImages.push(url);
      await worker.terminate();
      return null;
    }
    fs.writeFileSync('image.jpg', jpgBuffer);
    const base64Data = jpgBuffer.toString('base64');
    const decodedBuffer = Buffer.from(base64Data, 'base64');
    let title = await worker.recognize('image.jpg', configWNCTerpenesTitle);
    console.log('title', title.data.text)

    const terpenes = [];

    const cannabinoids = [];

    let text = title.data.text;

    if (text.toLowerCase().includes('terpenes')) {

      console.log('----- terpenes -----');

      const result = await worker.recognize(jpgBuffer, configWNCTerpenes);

      text = result.data.text;

      const textArray = text.split('\n');

      // console.log('textArray', textArray.length)

      for (const text of textArray) {

        let split = text.split(' ');

        if (text.includes('0.750 3.000')) {

          split = text.split('0.750 3.000');

        }

        else if (text.includes('3.000 3.000')) {

          split = text.split('3.000 3.000');

        }

        split = split.map(member => member.trim());

        const name = normalizeTerpene(split[0]);

        if (parseInt(split[1])) {
          terpenes.push({ name, pct: parseInt(split[1]) });
        }
      }
    }

    title = await worker.recognize(jpgBuffer, configWNCCannabinoidsTitle);

    if (title.data.text.toLowerCase().includes('cannabinoids')) {

      console.log('----- cannabinoids -----');

      const file = await getAndProcessJpg(url, true);

      // console.log('file', file)

      const result = await worker.recognize(file, configWNCCannabinoids);
      // console.log(result.data.text
      const textArray = result.data.text.split('\n');

      for (const text of textArray) {
        const split = text.split(' ');

        cannabinoids.push({
          name: split[0], pct: parseInt(split[3])
        });

      }
    }
    await worker.terminate();
    return { terpenes, cannabinoids }
  } catch (error) {
    if (worker) {
      await worker.terminate();
    }
    fs.appendFileSync('badImages.txt', `${url}\n`);
    fs.appendFileSync('errors.txt', `${error}\n`);
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
