const axios = require('../services/rateLimitedAxios')
const { saveProducts } = require('../firebase')

const { recognize } = require('../services/ocr')
const cheerio = require('cheerio')

const strings = require('../services/strings')

const feedUrl = 'https://aretehemp.com/product-category/high-thca/feed/'

async function parseSingleProduct (html, url) {
  const $ = cheerio.load(html)

  const title = strings.normalizeProductTitle($('h1.product_title').text().trim())

  const variants = []

  const variationsData = $('form.variations_form').attr('data-product_variations')
  const variations = JSON.parse(variationsData.replace(/&quot;/g, '"'))

  variations.forEach(variation => {
    const size = variation.attributes.attribute_size
    const sizeString = strings.normalizeVariantName(size)
    const availability = $(variation.availability_html).text().trim()

    if (availability.toLowerCase().includes('in stock')) {
      variants.push(sizeString)
    }
  })

  const imgElements = $('img')

  let image

  for (let j = 0; j < imgElements.length; j++) {
    const imgEl = imgElements[j]
    const srcset = $(imgEl).attr('srcset') || $(imgEl).attr('data-srcset')
    if (srcset && srcset.includes('768w')) {
      image = srcset.split(',').find(s => s.includes('768w')).trim().split(' ')[0]
      break
    }
  }

  const images = $('meta[property="og:image"]').map((_, el) => $(el).attr('content')).get()

  // remove any that contain the words "legal" abd "opinion

  const productImages = images.filter(image => !image.toLowerCase().includes('legal') && !image.toLowerCase().includes('opinion'))

  // move to beginning of array any members that contain the word 'lab' and

  const assayLinks = productImages.sort((a, b) => {
    if (a.toLowerCase().includes('lab')) {
      return 1
    }
    if (b.toLowerCase().includes('lab')) {
      return -1
    }
    return 0
  })

  let terpenes = []
  let cannabinoids = []

  if (assayLinks.length === 0) {
    console.log('Arete no images')
    return { title, url, cannabinoids, terpenes, image, variants, vendor: 'Arete' }
  }

  for (const imgStr of assayLinks) {
    const image = imgStr?.startsWith('//') ? `https:${imgStr}` : imgStr

    const result = await recognize(image)

    if (!result) {
      console.log('nothing interesting, continuing ...', image)
      continue
    }

    if (result.terpenes?.length) {
      console.log('Found arete terpenes: ', result.terpenes.length)
      terpenes = JSON.parse(JSON.stringify(result.terpenes))
    }
    if (result.cannabinoids?.length) {
      console.log('Found arete cannabinoids: ', result.cannabinoids.length)
      cannabinoids = JSON.parse(JSON.stringify(result.cannabinoids))
    }

    if (terpenes?.length && cannabinoids?.length) {
      console.log('arete both terpenes and cannabinoids found')
      break
    }
  }
  await saveProducts([{ title, url, image, variants, cannabinoids, terpenes, vendor: 'Arete' }], 'aaa')
  return { title, url, image, variants, cannabinoids, terpenes, vendor: 'Arete' }
}

async function getProducts (feedUrl) {
  const result = await axios.get(feedUrl)
  const $ = cheerio.load(result.data, { xmlMode: true })
  const items = $('item')
  const products = []

  for (let i = 0; i < items.length; i++) {
    const el = items[i]
    const url = $(el).find('link').text()
    const resultP = await axios.get(url)
    const vendor = 'Arete'
    const vendorDate = $(el).find('pubDate').text()

    const more = await parseSingleProduct(resultP.data, url)

    const product = {
      ...more, vendor, vendorDate
    }

    products.push(product)
  }

  return products
}

async function getAvailableLeafProducts () {
  const products = await getProducts(feedUrl)
  return products
}

if (require.main === module) {
  // console.log('This script is being executed directly by Node.js');
  getAvailableLeafProducts()
}

module.exports = {
  getAvailableLeafProducts
}
