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

    const gmResponse = await gm(response.data, jpgName).resize(4000).sharpen(0.5, 0.5); //quality(100).setFormat('jpg')

    const jpgBuffer = await gmToBuffer(gmResponse);

    return jpgBuffer;

  }
  catch (error) {

    console.error(`Failed to process image 2`, error);
    badImages.push({ url, error });

    return null;
  }
}

async function recognize(url) {

  const worker = await createWorker({
    oem: OEM.DEFAULT,
    cachePath: path.join(__dirname, '../tessdata'),
    errorHandler: (err) => { console.error(err); },
    tessedit_write_images: path.join(__dirname, '../tessdata'),
  });

  await worker.loadLanguage('eng');

  await worker.initialize('eng');

  await worker.setParameters({
    tessedit_pageseg_mode: PSM.SINGLE_COLUMN,
    tessedit_char_whitelist: 'ΔαβγabcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 .()-',
    user_patterns_file: path.join(__dirname, '../tessdata/eng.user-patterns'),
    user_words_file: path.join(__dirname, '../tessdata/eng.user-words'),
    preserve_interword_spaces: 1,
    chop_enable: 'T',
    use_new_state_cost: 'F',
    segment_segcost_rating: 'F',
    enable_new_segsearch: 0,
    textord_force_make_prop_words: 'F',
    edges_max_children_per_outline: 40
  });

  const isDev = process.env.NODE_ENV !== 'production';

  try {
    const jpgBuffer = await getAndProcessJpg(url, isDev);
    if (!jpgBuffer) {
      console.log('skipping', url);
      badImages.push(url);
      await worker.terminate();
      return null;
    }
    fs.writeFileSync('image.jpg', jpgBuffer);
    //const base64Data = jpgBuffer.toString('base64');
    //const decodedBuffer = Buffer.from(base64Data, 'base64');
    let title = await worker.recognize(jpgBuffer, configWNCTerpenesTitle);


    const terpenes = [];

    const cannabinoids = [];

    let text = title.data.text;

    if (text.toLowerCase().includes('terpenes')) {

      console.log('----- terpenes -----');

      const result = await worker.recognize('image.jpg', configWNCTerpenes);

      text = result.data.text;

      const textArray = text.split('\n');

      for (const text of textArray) {

        const line = getTerpeneObj(text);

        terpenes.push(line);

      }

      await worker.terminate();

      return {
        terpenes
      }
    }

    title = await worker.recognize('image.jpg', configWNCCannabinoidsTitle);

    if (title.data.text.toLowerCase().includes('cannabinoids')) {

      console.log('----- cannabinoids -----');

      const result = await worker.recognize(jpgBuffer, configWNCCannabinoids);

      const textArray = result.data.text.split('\n');

      for (const text of textArray) {

        const line = getCannabinoidObj(text);
        if (!line) {
          console.log('not line');
          process.exit(1);
        }
        cannabinoids.push(line);

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
    return null;

  } catch (error) {
    await worker.terminate();
    badImages.push(url, error);
    console.error(`Failed to recognize image: ${error} `);
    fs.writeFileSync('error.txt', JSON.stringify(error, null, 2));
    return null;
  }
}

module.exports = {
  recognize
};
