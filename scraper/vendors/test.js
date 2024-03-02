const { readImage } = require('../services/image.js')
const { recognize } = require('../services/ocr.js')
const { transcribeAssay } = require('../services/cortex.js')

const fs = require('fs');
const path = require('path');

let name = 'terpenes.jpg'

async function getAvailableLeafProducts() {

  const dir = path.join(__dirname, '../temp/scan');
  const filePath = path.join(dir, name);
  const buffer = fs.readFileSync(filePath);

  //const buffer = await readImage(image, 'test');
  const raw = await recognize(buffer, 'test');
  const result = transcribeAssay(raw, name, 'test');

  console.log(JSON.stringify(result));
}

module.exports = {
  getAvailableLeafProducts
}