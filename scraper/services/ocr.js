const axios = require('./rateLimitedAxios.js');
const spellings = require('spellchecker');
const fs = require('fs');
const gm = require('gm').subClass({ imageMagick: true });
const { createWorker, OEM, PSM, setLogging } = require('tesseract.js');

//setLogging(true);

// reinitialize = function(langs = 'eng', oem, config, jobId)
// load = ({ workerId, jobId, payload: { options: { lstmOnly, corePath, logging } } }, res)
const path = require('path');
const { getCannabinoidObj, getTerpeneObj } = require('./strings.js');

const badImages = [];

const configWNCTerpenesTitle = {
  rectangle: { top: 1397, left: 292, width: 365, height: 380 },
}

const configWNCCannabinoidsTitle = {
  rectangle: { top: 2100, left: 301, width: 485, height: 94 },
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
  rectangle: { top: 1722, left: 320, width: 1939, height: 1361 },
}

const configWNCCannabinoids = {
  rectangle: { top: 2511, left: 555, width: 2457, height: 1484 },
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
      console.log(`Failed to download image 1`);
      badImages.push({ url, error: response.status });
      return null;
    }

    const contentType = response.headers['content-type'];

    if (contentType !== 'image/jpeg') {
      console.log(`Invalid content type: ${contentType}`);
      badImages.push({ url, error: contentType });
      return null
    }

    const jpgName = jpgNameFromUrl(url);

    const gmResponse = await gm(response.data, jpgName).resize(4000).sharpen(0.5, 0.5).quality(100).setFormat('jpg')

    const jpgBuffer = await gmToBuffer(gmResponse);
    fs.writeFileSync('image.jpg', jpgBuffer);
    return jpgBuffer;

  }
  catch (error) {

    console.error(`Failed to process image 2`, error);
    badImages.push({ url, error });

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

    const terpenes = [];

    const cannabinoids = [];

    let title = await worker.recognize(jpgBuffer, configWNCTerpenesTitle);

    if (title.data.text.toLowerCase().includes('terpenes')) {

      console.log('----- terpenes -----');

      const result = await worker.recognize('image.jpg', configWNCTerpenes);

      const textArray = result.data.text.split('\n');

      for (const text of textArray) {

        const line = getTerpeneObj(text);
        console.log('line', line);
        terpenes.push(line);

      }

      await worker.terminate();
      return {
        terpenes
      }
    }

    title = await worker.recognize('image.jpg', configWNCCannabinoidsTitle);

    title = await worker.recognize(jpgBuffer, configWNCCannabinoidsTitle);

    if (title.data.text.toLowerCase().includes('cannabinoids')) {

      console.log('----- cannabinoids -----');

      const result = await worker.recognize(jpgBuffer, configWNCCannabinoids);

      const textArray = result.data.text.split('\n');

      for (const text of textArray) {

        const line = getCannabinoidObj(text);
        if (!line) {
          console.log('not line');
        }
        cannabinoids.push(line);

      }

    }

    await worker.terminate();

    return { terpenes, cannabinoids }

  }
  catch (error) {
    if (worker) {
      await worker.terminate();
    }
    console.error(`Failed to recognize image: ${error} `);
    fs.writeFileSync('error.txt', JSON.stringify(error, null, 2));
    return null;
  }


}
/*
(async () => {
  const result = await recognize('http://localhost:5173/BUFFER.jpg');
  //console.log(JSON.stringify(result, null, 2));
})();
*/
module.exports = {
  recognize
};
