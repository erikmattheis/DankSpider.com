const axios = require('../services/rateLimitedAxios')
const fs = require('fs')

const { recognize } = require('../services/ocr')
const cheerio = require('cheerio')

const { normalizeVariantName, normalizeProductTitle } = require('../services/strings')

const feedUrl = 'https://aretehemp.com/product-category/high-thca/'
const logger = require('../services/logger.js');
const { stringContainsNonFlowerProduct, transcribeAssay } = require('../services/cortex.js')

async function parseSingleProduct(html, url) {
  const $ = cheerio.load(html)

  fs.writeFileSync('./temp/vendors/sarete.html', html)

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

  const variants = []

  const variationsData = $('form.variations_form').attr('data-product_variations')
  const variations = JSON.parse(variationsData.replace(/&quot;/g, '"'))

  variations.forEach(variation => {
    const size = variation.attributes.attribute_size
    const sizeString = normalizeVariantName(size)
      variants.push(sizeString)
  })


  let terpenes = []
  let cannabinoids = []

  if (assayLinks.length === 0) {

    return { cannabinoids, terpenes, image:productImages[0], variants }
  }

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

    if (result?.terpenes?.length) {

      terpenes = JSON.parse(JSON.stringify(result.terpenes))
    }
    if (result?.cannabinoids?.length) {


      cannabinoids = JSON.parse(JSON.stringify(result.cannabinoids))
    }

    if (terpenes?.length && cannabinoids?.length) {
      break
    }
  }

  return { image:productImages[0], variants, cannabinoids, terpenes }
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
  console.log('items', items.length)
  const products = []
  for (let i = 0; i < items.length; i++) {



    const el = items[i]

    let title = $(el).find('.nm-shop-loop-title-link').text();
    title = normalizeProductTitle(title.trim());
    if (stringContainsNonFlowerProduct(title)) {
        continue
    }
    console.log('arete', title)
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
