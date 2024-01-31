const axios = require('../services/rateLimitedAxios')
const fs = require('fs')
const { saveProducts } = require('../firebase')

const { recognize } = require('../services/ocr')
const cheerio = require('cheerio')

const strings = require('../services/strings')

const feedUrl = 'https://aretehemp.com/product-category/high-thca/feed/'
const logger = require('../services/logger.js');

async function parseSingleProduct(html, url) {
  const $ = cheerio.load(html)

  const title = strings.normalizeProductTitle($('h1.product_title').text().trim())

  const variants = []

  const variationsData = $('form.variations_form').attr('data-product_variations')
  const variations = JSON.parse(variationsData.replace(/&quot;/g, '"'))

  variations.forEach(variation => {
    const size = variation.attributes.attribute_size
    const sizeString = strings.normalizeVariantName(size)
      variants.push(sizeString)
  })

  const imgElements = $('picture')

  const productImages = imgElements.map((_, imgEl) => $(imgEl).attr('data-large_image')).get();
console.log('productImages', productImages.length)

  const filteredLinks = productImages.filter(imgStr => !imgStr?.includes('Legal'))

    // move to beginning of array any members that contain the word 'lab'

  const assayLinks = filteredLinks.sort((a, b) => {
    if (a.toLowerCase().includes('lab')) {
      return -1
    }
    if (b.toLowerCase().includes('lab')) {
      return 1
    }
    return 0
  })

  console.log('assayLinks', assayLinks)

  let terpenes = []
  let cannabinoids = []

  if (assayLinks.length === 0) {
    logger.log({
  level: 'info',
  message: `Arete no images`})
    return { title, url, cannabinoids, terpenes, image:productImages[0], variants, vendor: 'Arete' }
  }

  for (const imgStr of assayLinks) {
    const image = imgStr?.startsWith('//') ? `https:${imgStr}` : imgStr

    const result = await recognize(image)

    //fs.writeFileSync('./temp/vendors/arete-raw.js', JSON.stringify(result, null, 2))

    if (!result) {
      logger.log({
        level: 'info',
        message: `nothing interesting, continuing ... ${image}`})
      continue
    }

    if (result?.terpenes?.length) {

      logger.log({
        level: 'info',
        message: `TERPENES ... ${result.terpenes.length}`})

      terpenes = JSON.parse(JSON.stringify(result.terpenes))
    }
    if (result?.cannabinoids?.length) {

      logger.log({
        level: 'info',
        message: `CANNABINOIDS ... ${result.cannabinoids.length}`})

      cannabinoids = JSON.parse(JSON.stringify(result.cannabinoids))
    }

    if (terpenes?.length && cannabinoids?.length) {
      logger.log({
  level: 'info',
  message: `arete both terpenes and cannabinoids found`})
      break
    }
  }

  return { title, url, image:productImages[0], variants, cannabinoids, terpenes, vendor: 'Arete' }
}

async function getProducts(feedUrl) {
  const result = await axios.get(feedUrl)
  const $ = cheerio.load(result.data, { xmlMode: true })
 fs.writeFileSync('./temp/vendors/arete.xml', result.data)

  const items = $('item')
  const products = []

  for (let i = 0; i < items.length; i++) {
    const el = items[i]
    const url = $(el).find('link').text()
    const resultP = await axios.get(url)
    fs.writeFileSync('./temp/vendors/arete-product.html', resultP.data)
    const vendor = 'Arete'
    const vendorDate = $(el).find('pubDate').text()

    const more = await parseSingleProduct(resultP.data, url)

    logger.log({
      level: 'info',
      message: `MORE ARETE: ${JSON.stringify(more)}`})

    const product = {
      ...more, vendor, vendorDate
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
