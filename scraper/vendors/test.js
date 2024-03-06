const { readImage } = require('../services/image');
const { recognize } = require('../services/ocr');
const { transcribeAssay } = require('../services/cortex');
const { makeStats } = require('../services/stats');
const { saveTest } = require('../services/firebase');
const fs = require('fs');

async function readProductImage(image, config) {

  const buffer = await readImage(image, image, config.gm);
  const raw = await recognize(buffer.value, image, config.tesseract);

  if (!raw) {
    console.log('no text found', image);
  }

  const result = transcribeAssay(raw, image, image);

  let cannabinoids = [];
  let terpenes = [];

  if (result.cannabinoids.length) {
    cannabinoids = result.cannabinoids;
  }
  if (result.terpenes.length) {
    terpenes = result.terpenes;
  }

  return { terpenes, cannabinoids };

}

const images = [
  '01-pinnacle-cannabinoids.jpg',
  '02_bloom-terpenes.jpg',
  '03_blooom-cannabinoids.jpg',
  '04-cannalyze-cannabinoids.jpg',
]

async function doTest(batchId) {

  const configs = [];
  const results = [];

  for (const mode of [4, 5, 6]) {
    for (const preset of ['bazaar', '']) {
      for (const resize of [3000]) {
        for (const sharpen of [1.5]) {
          const config = {
            tesseract: {
              tessedit_pageseg_mode: mode,
              presets: [preset],
              tessedit_char_whitelist: ' 0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩαβγδεζηθικλμνξοπρστυφχψω-<>,.',
            },
            gm: { sharpen, resize }
          }
          for await (const image of images) {
            const result = await readProductImage(image, config);
            console.log(JSON.stringify({ config, image, result }, null, 2));
            // saveTest(result, image, config);
            await saveTest(result, image, config, batchId);
            results.push({ config, image, result });
          }
        }
      }
    }
    fs.writeFileSync('test-results.json', JSON.stringify(results, null, 2));
  }
}

exports.doTest = doTest;