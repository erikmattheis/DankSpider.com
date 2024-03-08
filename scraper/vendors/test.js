const { readImage } = require('../services/image');
const { recognize } = require('../services/ocr');
const { transcribeAssay } = require('../services/cortex');
const { saveTest } = require('../services/firebase');
const fs = require('fs');

async function readProductImage(image, config) {

  const buffer = await readImage(image, image, config.gm);

  console.log('buffer', image, buffer.lastModified, buffer.value?.length);

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

  for (const mode of [1, 2, 3, 4, 5, 6]) {
    for (const preset of ['bazaar', '']) {
      for (const image of images) {

        const start = performance.now();
        const config = {
          tesseract: {
            tessedit_pageseg_mode: mode,
            presets: [preset],
            tessedit_char_whitelist: ' 0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩαβγδεζηθικλμνξοπρστυφχψω-<>,.',
          },
          gm: {}
        }
        const result = await readProductImage(image, config);
        const end = performance.now();
        const time = ((end - start) / 1000).toFixed(2);
        console.log(`Mode: ${mode} Preset: ${preset} Image: ${image} Time: ${time}s`);
        console.log(JSON.stringify({ config, image, result }, null, 2));
        // saveTest(result, image, config);
        await saveTest(result, image, config, batchId, time);
        results.push({ config, image, result, batchId, time });

      }
    }
  }
  fs.writeFileSync('test-results.json', JSON.stringify(results, null, 2));
}



exports.doTest = doTest;