const axios = require('../services/rateLimitedAxios')
const fs = require('fs')

const { recognize } = require('../services/ocr')
const cheerio = require('cheerio')

const { normalizeVariantName, normalizeProductTitle } = require('../services/strings')

const feedUrl = 'https://aretehemp.com/product-category/high-thca/page/'
const logger = require('../services/logger.js');
const { stringContainsNonFlowerProduct, transcribeAssay } = require('../services/cortex.js')

async function parseSingleProduct(html, url) {
  const $ = cheerio.load(html)

  const variants = []

  const variationsData = $('form.variations_form').attr('data-product_variations')
  const variations = JSON.parse(variationsData.replace(/&quot;/g, '"'))

  variations.forEach(variation => {
    const size = variation.attributes.attribute_size
    const sizeString = normalizeVariantName(size)
      variants.push(sizeString)
  })

  const imgElements = $('picture')

  const productImages = imgElements.map((_, imgEl) => $(imgEl).attr('data-large_image')).get();

  const filteredLinks = productImages.filter(imgStr => !imgStr?.includes('Legal') && !imgStr?.includes('Rosin') && !imgStr?.includes('Resin') && !imgStr?.includes('Full Melt'));

    // move to beginning of array any members that contain the word 'la&&

  const assayLinks = filteredLinks.sort((a, b) => {
    if (a.toLowerCase().includes('lab')) {
      return -1
    }
    if (b.toLowerCase().includes('lab')) {
      return 1
    }
    return 0
  })


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

    const raw = await recognize(image);
    const result = transcribeAssay(raw, image);

    //fs.writeFileSync('./temp/vendors/arete-raw.js', JSON.stringify(result, null, 2))

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

  return { title, url, image:productImages[0], variants, cannabinoids, terpenes, vendor: 'Arete' }
}

async function getProducts(feedUrl) {
  const result = await axios.get(feedUrl)
  const $ = cheerio.load(result.data)
 //fs.writeFileSync('./temp/vendors/arete.xml', result.data)

  const items = $('ul.nm-products')
  const products = []
  for (let i = 0; i < items.length; i++) {

    const el = items[i]

    let title = $('.nm-shop-loop-title-link').text();
    title = normalizeProductTitle(title.trim());
    if (stringContainsNonFlowerProduct(title)) {
        continue
    }
    const url = $(el).find('.nm-shop-loop-thumbnail-link').attr('href')
    const resultP = await axios.get(url)
    const vendor = 'Arete'

    const more = await parseSingleProduct(resultP.data, url)

    const product = {
      ...more, title, vendor
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
