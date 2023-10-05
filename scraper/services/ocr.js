const { createWorker } = require('tesseract.js');
const path = require('path');
const { normalizeTerpene } = require('./strings.js');

const configWNCTitle = {
  lang: 'eng',
  rectangle: { top: 292, left: 70, width: 118, height: 151 },
  tessedit_char_whitelist: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789αβγδεζηθικλμνξοπρστυφχψωΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ'
}

const configWNCTerpenes = {
  lang: 'eng',
  rectangle: { top: 318, left: 10, width: 507, height: 497 },
  tessedit_char_whitelist: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789αβγδεζηθικλμνξοπρστυφχψωΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ'
};

const configWNCCannabinoids = {
  lang: 'eng',
  rectangle: { top: 439, left: 75, width: 483, height: 330 },
  tessedit_char_whitelist: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789αβγδεζηθικλμνξοπρστυφχψωΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ'
};

async function recognize(url) {

  const worker = await createWorker();

  console.log('got worker')

  const title = await worker.recognize(url, configWNCTitle);

  if (title.data.text.toLowerCase().includes('bellieveau')) {
    // reached legal stuff, npthing else will ever follow

    await worker.terminate();
    return 'STOP';
  }

  if (title.data.text.toLowerCase().includes('terpenes')) {
    console.log('TERPENES');
    const result = await worker.recognize(url, configWNCTerpenes);

    const textArray = result.data.text.split('\n');

    const terpenes = [];

    for (const text of textArray) {

      let split = [];
      let name = '';

      if (text.includes('07503000')) {

        split = text.split('07503000');

        split = split.map(member => member.trim());

        const name = normalizeName(split[0]);

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

  const cannabinoids = [];
  if (title.data.text.toLowerCase().includes('thc')) {
    console.log('THC');
    const result = await worker.recognize(url, configWNCCannabinoids);

    const textArray = result.data.text.split('\n');

    for (const text of textArray) {

      let split = [];
      let name = '';

      if (!text.includes('bbbbbx087xbb')) {

        split = text.split('07503000');

        split = split.map(member => member.trim());

        //const name = normalizeName(split[0]);
        cannabinoids.push({
          name: text, pct: parseInt(split[1])
        });

      }
    }
    await worker.terminate();
    return {
      cannabinoids
    }
  }
}

function normalizeName(name) {
  return name;
}

module.exports = {
  recognize
};
