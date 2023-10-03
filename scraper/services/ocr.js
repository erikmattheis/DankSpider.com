const { createWorker } = require('tesseract.js');
const path = require('path');

const configWNC = {
  lang: 'eng',
  rectangle: { top: 318, left: 10, width: 507, height: 497 },
  tessedit_char_whitelist: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789αβγδεζηθικλμνξοπρστυφχψωΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ'
};

async function run(url) {

  const worker = await createWorker();

  console.log('got worker')

  const result = await worker.recognize(url, configWNC);

  console.log('recognized text', Object.keys(result.data));

  console.log('result', result.data.text);

  console.log('recognized text', Object.keys(result.data));

  console.log('result', result.data.text)

  const textArray = result.data.text.split('\n');

  const terpenes = [];

  for (const text of textArray) {

    let split = text.split('07503000');

    split = split.map(member => member.trim());

    if (parseInt(split[1])) {
      terpenes.push({ name: split[0], pct: split[1] });
    }

  }

  await worker.terminate();
  console.log('terpenes', terpenes);
  return terpenes;
}

run();
