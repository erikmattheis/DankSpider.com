const axios = require('../services/rateLimitedAxios')
const fs = require('fs')

const { recognize } = require('../services/ocr')
const cheerio = require('cheerio')

const { normalizeVariantName, normalizeProductTitle } = require('../services/strings')

const feedUrl = 'https://aretehemp.com/product-category/high-thca/'
const logger = require('../services/logger.js');
const { stringContainsNonFlowerProduct, transcribeAssay, cannabinoidList, terpeneList } = require('../services/cortex.js')

let count = 0;

async function parseSingleProduct(html, url) {
  const $ = cheerio.load(html)

  fs.writeFileSync('./temp/vendors/sarete.html', html)

  const variants = []


// Iterate over each option element within the select
$('#size option').each(function() {
  const value = $(this).attr('value');
  // Skip the placeholder option
  if (value) {
    variants.push(value);
  }
});
/*
  const variationsData = $('#size option').text()
  console.log('variationsData', variationsData)
  const variations = JSON.parse(variationsData.replace(/&quot;/g, '"'))

  variations.forEach(variation => {
    const size = variation.attributes.attribute_size
    console.log('size', size)
    const sizeString = normalizeVariantName(size)
    console.log('sizeString', sizeString)
    variants.push(sizeString)
  })
*/
  const imgElements = $('picture[data-large_image]')


  let productImages = imgElements.map((_, imgEl) => $(imgEl).attr('data-large_image')).get();

  productImages = Array.from(productImages)
  productImages = productImages.filter(img => img.includes('Lab'))
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

  console.log('assayLinks', assayLinks.length)

  if (assayLinks.length === 0) {

    console.log('no assay links', url)
    return { cannabinoids, terpenes, image:productImages[0], variants }

  }

  let terpenes = []
  let cannabinoids = []

  for (const imgStr of assayLinks) {

    const image = imgStr?.startsWith('//') ? `https:${imgStr}` : imgStr

    const raw = await recognize(image);
    const result = transcribeAssay(raw, image);

    if (!result) {
      logger.log({
        level: 'info',
        message: `nothing interesting, continuing ... ${image}`})
      continue
    }

    if (result.length) {
      console.log('result', result.length)
      cannabinoids = result.filter(a => cannabinoidList.includes(a.name))
      console.log('cannabinoids', cannabinoids.length)
      terpenes = result.filter(a => terpeneList.includes(a.name))
      console.log('terpenes', terpenes.length)
    }

    if (terpenes?.length && cannabinoids?.length) {
      break
    }

    console.log('cannabinoids', cannabinoids, terpenes)
    console.log('terpenes', terpenes)

  }

  const properties = { image:productImages[0], variants, cannabinoids, terpenes }
  console.log('WE ARE DONE ')
  console.log('more', properties)

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
 //fs.writeFileSync('./temp/vendors/arete.html', result.data)

  const items = $('ul.nm-products li.product');

  const products = []
  for (let i = 0; i < items.length; i++) {

    const el = items[i]

    let title = $(el).find('.nm-shop-loop-title-link').text();
    title = normalizeProductTitle(title.trim());
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

    products.push(product)

  }

  return products
}

async function getAvailableLeafProducts() {
  const products = await getProducts(feedUrl)
  return products
}

if (require.main === module) {
   logger.log({
  level: 'info',
  message: `This script is being executed directly by Node.js`});
  getAvailableLeafProducts()
}

module.exports = {
  getAvailableLeafProducts
}
