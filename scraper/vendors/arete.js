const axios = require('../services/rateLimitedAxios')
const fs = require('fs')

const { recognize } = require('../services/ocr')
const cheerio = require('cheerio')

const { normalizeVariantName, normalizeProductTitle } = require('../services/strings')

const feedUrl = 'https://aretehemp.com/product-category/high-thca/'
const logger = require('../services/logger.js');
const { stringContainsNonFlowerProduct, transcribeAssay } = require('../services/cortex.js')
const { cannabinoidNameList, terpeneNameList } = require('../services/memory')
const { readImage } = require('../services/image.js');

const vendor = 'Arete'

const numProductsToSave = 333;
let numSavedProducts = 0;

let count = 0;
let batchId;

async function parseSingleProduct(html, url) {
  if (!html) {
    return null;
  }
  const $ = cheerio.load(html)

  fs.writeFileSync('./temp/vendors/arete-product.html', html)

  const variants = []
  const images = []
  let cannabinoids = []
  let terpenes = []

  $('#size option').each(function () {
    let value = $(this).attr('value');

    if (value) {
      value = normalizeVariantName(value);
      variants.push(value);
    }
  });

  const imgElements = $('picture[data-large_image]')

  let productImages = imgElements.map((_, imgEl) => $(imgEl).attr('data-large_image')).get();

  productImages = Array.from(productImages)
  productImages = productImages.filter(img => !img.includes('Legal-Opinon-Letter'));
  productImages = productImages.map(img => img.startsWith('//') ? `https:${img}` : img)

  const assayLinks = productImages.sort((a, b) => {
    if (a.toLowerCase().includes('labs')) {
      return -1
    }
    if (b.toLowerCase().includes('labs')) {
      return 1
    }
    return 0
  })



  if (assayLinks.length === 0) {
    console.log('No assay images found')
    fs.writeFileSync('./temp/vendors/arete-no-assay.html', html)
    return { cannabinoids, terpenes, image: productImages[0], variants }
  }

  let lastModified = new Date(0)

  for (const imgStr of assayLinks) {

    const image = imgStr?.startsWith('//') ? `https:${imgStr}` : imgStr

    const buffer = await readImage(image, url);
    const raw = await recognize(buffer.value, url);

    if (new Date(buffer.lastModified) > new Date(lastModified)) {
      lastModified = buffer.lastModified;
    }

    if (!raw) {
      console.log('no text found', image);
      continue;
    }

    const result = transcribeAssay(raw, image, vendor);

    if (result.cannabinoids.length) {
      cannabinoids = result.cannabinoids;
    }
    // Arete has no terpene assays as of 2/26/2024
    if (result.terpenes.length) {
      terpenes = result.terpenes;
    }
    if (terpenes.length && cannabinoids.length) {
      break;
    }
  }

  return { image: productImages[0], variants, cannabinoids, terpenes, lastModified }
}

function get3003image(html) {
  const $ = cheerio.load(html);

  let desiredImageUrl = '';

  const srcset = $('source, img').first().attr('srcset');

  const sources = srcset.split(', ');

  sources.forEach(source => {
    if (source.endsWith('300w')) {
      [desiredImageUrl] = source.split(' ');
    }
  });

  return desiredImageUrl;
}

async function getProducts(feedUrl) {
  try {
    const result = await axios.get(feedUrl)
    const $ = cheerio.load(result.data)
    fs.writeFileSync('./temp/vendors/arete.html', result.data)

    const items = $('.nm-shop-loop-product-wrap');

    const products = []
    for (let i = 0; i < items.length; i++) {

      if (numSavedProducts >= numProductsToSave) {
        break;
      }

      const el = items[i]

      let title = $(el).find('.nm-shop-loop-title-link').text();

      title = normalizeProductTitle(title.trim());
      if (stringContainsNonFlowerProduct(title)) {
        continue
      }

      const url = $(el).find('.nm-shop-loop-thumbnail-link').attr('href')
      console.log('getting product', title, url)
      const resultP = await axios.get(url)
      const more = await parseSingleProduct(resultP.data, url)

      const vendor = 'Arete'
      const product = {
        ...more, url, title, vendor
      }

      numSavedProducts++;
      products.push(product)

    }

    return products
  }
  catch (e) {
    console.log('error', e.message)
    fs.writeFileSync('./temp/vendors/arete-error.html', e.message)
  }
}

async function getAvailableLeafProducts(id, vendor) {
  console.log(`getting ${vendor} products`)
  batchId = id
  const products = await getProducts(feedUrl, vendor)
  return products
}

if (require.main === module) {
  logger.log({
    level: 'info',
    message: `This script is being executed directly by Node.js`
  });
  getAvailableLeafProducts(batchId, vendor)
}

module.exports = {
  getAvailableLeafProducts
}
