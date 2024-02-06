const axios = require('../services/rateLimitedAxios')
const fs = require('fs')
const { saveProducts, getAssays, saveAssays } = require('../services/firebase.js')

const { recognize } = require('../services/ocr')
const cheerio = require('cheerio')
const logger = require('../services/logger.js');
const strings = require('../services/strings')
const { readPDFs } = require('../services/pdf')

const html = require('./data/ppm-pdfs.js');

const feedUrl = 'https://perfectplantmarket.com/collections/thca-flower.atom'
const url = 'https://perfectplantmarket.com/pages/lab-reports'

let allAssays;

async function getListOfTHCAPDFs() {
  console.log('url', url)

 // await axios.get(url);

  //fs.writeFileSync('./temp/vendors/ppm.html', htmlContent.data)

  const $ = cheerio.load(html);

  const results = [];

  $('[data-pf-type="Accordion.Content.Wrapper"]').each(function() {
    // This assumes every product block starts with a 'span' within a 'button' for its name
    const productName = $(this).find('button span').text().trim();

    // The PDF link is expected to be the second 'a', but let's check for safety
    const links = $(this).find('div[data-pf-expandable="true"] a');
    if(links.length >= 2) { // Ensure there are at least two links
      const pdfUrl = links.eq(1).attr('href'); // Get the second link
      if(pdfUrl) {
        results.push({ name: productName, url: pdfUrl });
      }
    } else if(links.length === 1) { // If there's only one link, decide what to do
      const pdfUrl = links.eq(0).attr('href'); // Get the first link
      if(pdfUrl) {
        results.push({ name: productName, url: pdfUrl });
      }
    }
  });

  return results;
}

async function parseSingleProduct(html, url) {
  const $ = cheerio.load(html)

  let title = $('h1[data-product-type="title"]').text().trim();
  title = strings.normalizeProductTitle(title)

  // get textvalue of clild options
  const variants = $('select[data-option-name="Size"] option').map((_, el) => $(el).text()).get()

  if (!variants?.length) {
    return { title, url, variants, vendor: 'PPM' }
  }

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

console.log('title', title)
  const product = allAssays.find(p => p.name === title && p.vendor === 'PPM')

  if (!product) {
    return { title, url, variants, cannabinoids: [], terpenes: [], vendor: 'PPM' }
  }

  let terpenes = [];
  if (product.terpenes) {
    terpenes = JSON.parse(JSON.stringify(product.terpenes))
  }

  let cannabinoids = [];
  if (product.cannabinoids) {
    cannabinoids = JSON.parse(JSON.stringify(product.cannabinoids))
  }


  return { title, url, image, variants, cannabinoids, terpenes, vendor: 'PPM' }

}

async function recordAssays() {

  try {

  const pdfs = await getListOfTHCAPDFs();

  console.log('pdfs', pdfs.length)

  const result = await readPDFs(pdfs);

  const assays = result.map(r => {
    return {
      ...r,
        vendor: 'PPM'
  }})

  //console.log('assays ->', JSON.stringify(assays))

  await saveAssays('PPM', assays);

}
catch (error) {
  logger.error(error)
  logErrorToFile(error)

}
}

async function getProducts(feedUrl) {

  const result = await axios.get(feedUrl)

  const $ = cheerio.load(result.data, { xmlMode: true })

  //fs.writeFileSync('./temp/vendors/ppm.xml', result.data)

  const items = $('entry')
  const products = []
  allAssays = await getAssays()

  for (let i = 0; i < items.length; i++) {
    const el = items[i]
    const url = $(el).find('link').attr('href')
    const resultP = await axios.get(url)
    fs.writeFileSync('./temp/vendors/ppm-product.html', resultP.data)
    const vendor = 'PPM'
    const vendorDate = $(el).find('pubDate').text()

    const more = await parseSingleProduct(resultP.data, url)

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
  getAvailableLeafProducts,
  recordAssays
}
