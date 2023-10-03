const { createWorker } = require('tesseract.js');
const path = require('path');

const configWNC = {
  lang: 'eng',
  rectangle: { top: 318, left: 10, width: 507, height: 497 },
  tessedit_char_whitelist: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789αβγδεζηθικλμνξοπρστυφχψωΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ'
};

async function run() {

  const worker = await createWorker();

  console.log('got worker')

  const result = await worker.recognize('https://cdn11.bigcommerce.com/s-mpabgyqav0/images/stencil/1280x1280/products/313/2469/Indoor_-_THCa_Black_Cherry_Gelato_Terpenes__76784.1689100186.jpg?c=1', configWNC);

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
