const { readImage } = require('../services/image');
const { recognize } = require('../services/ocr');
const { transcribeAssay } = require('../services/cortex');

async function getAvailableLeafProducts() {
  const image = 'https://cdn.drganja.com/wp-content/uploads/2023/05/Blue-Dream-Cannabinoids-Certificate-of-Analysis.jpg';
  const buffer = await readImage(image, image);
  const raw = await recognize(buffer.value, image);

  if (!raw) {
    console.log('no text found', image);
  }

  const result = transcribeAssay(raw, image, image);

  if (result.cannabinoids.length) {
    cannabinoids = result.cannabinoids;
    console.log('cannabinoids', cannabinoids.length);
  }
  if (result.terpenes.length) {
    terpenes = result.terpenes;
    console.log('terpenes', terpenes.length);
  }

}

exports.getAvailableLeafProducts = getAvailableLeafProducts;