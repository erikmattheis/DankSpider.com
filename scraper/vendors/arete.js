const axios = require('../services/rateLimitedAxios')
const fs = require('fs')

const { recognize } = require('../services/ocr')
const cheerio = require('cheerio')

const { normalizeVariantName, normalizeProductTitle } = require('../services/strings')

const feedUrl = 'https://aretehemp.com/product-category/high-thca/'
const logger = require('../services/logger.js');
const { stringContainsNonFlowerProduct, transcribeAssay, cannabinoidNameList, terpeneNameList } = require('../services/cortex.js')
let numProductsToSave = 555;
let numSavedProducts = 0;

let count = 0;
let batchId;

async function parseSingleProduct(html, url) {
  const $ = cheerio.load(html)

  fs.writeFileSync('./temp/vendors/arete-product.html', html)

  const variants = []
  const images = []
  let terpenes = []
  let cannabinoids = []


  // Iterate over each option element within the select
  $('#size option').each(function () {
    const value = $(this).attr('value');
    // Skip the placeholder option
    if (value) {
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

    fs.writeFileSync('./temp/vendors/arete-no-assay.html', html)
    return { cannabinoids, terpenes, image: productImages[0], variants }

  }

  for (const imgStr of assayLinks) {

    const image = imgStr?.startsWith('//') ? `https:${imgStr}` : imgStr

    const raw = await recognize(image);
    console.log('raw', raw.length)
    const result = transcribeAssay(raw, image, 'Arete');
    console.log('result', result.length)

    if (!result) {
      continue
    }

    if (result.length) {
      if (cannabinoids.length > 0 && cannabinoidNameList[result[0].name]) {
        console.log('found cannabinoids', cannabinoids.length)
        cannabinoids = result.filter(a => cannabinoidNameList.includes(a.name))
      }
      if (terpenes.length > 0 && terpeneNameList[result[0].name]) {
        console.log('found terpenes', terpenes.length)
        terpenes = result.filter(a => terpeneNameList.includes(a.name))
      }
    }

    if (terpenes.length && cannabinoids.length) {
      console.log('found both')
      break;
    }
  }

  const properties = { image: productImages[0], variants, cannabinoids, terpenes }
  console.log('properties', variants?.length, cannabinoids?.length, terpenes?.length)
  return properties
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
  const result = await axios.get(feedUrl)
  const $ = cheerio.load(result.data)
  fs.writeFileSync('./temp/vendors/arete.html', result.data)

  const items = $('ul.nm-products li.product');

  const products = []
  for (let i = 0; i < items.length; i++) {

    if (numSavedProducts >= numProductsToSave) {
      break;
    }

    const el = items[i]

    let title = $(el).find('.nm-shop-loop-title-link').text();
    title = normalizeProductTitle(title.trim());
    console.log('title', title)
    if (stringContainsNonFlowerProduct(title)) {
      continue
    }

    const url = $(el).find('.nm-shop-loop-thumbnail-link').attr('href')
    const resultP = await axios.get(url)
    const more = await parseSingleProduct(resultP.data, url)

    const vendor = 'Arete'
    const product = {
      ...more, url, title, vendor
    }

    numSavedProducts++;
    products.push(product)
    console.log(products.length, "products")
  }

  return products
}

async function getAvailableLeafProducts(id, vendor) {
  batchId = id
  const products = await getProducts(feedUrl)
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
