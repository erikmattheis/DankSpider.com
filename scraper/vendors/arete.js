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

  const imgElements = $('picture[data-large_image]')

  let productImages = imgElements.map((_, imgEl) => $(imgEl).attr('data-large_image')).get();

  productImages = Array.from(productImages)
  console.log(productImages)
  productImages = productImages.filter(img => img.includes('Lab'))
  productImages = productImages.map(img => img.startsWith('//') ? `https:${img}` : img)


  const assayLinks = filteredLinks.sort((a, b) => {
    if (a.toLowerCase().includes('lab')) {
      return -1
    }
    if (b.toLowerCase().includes('lab')) {
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
