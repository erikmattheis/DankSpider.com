const { performance } = require('perf_hooks')
const fs = require('fs')
const { deleteProductsByVendor, getExampleRecordWithUniqueChemicalAsCannabinoid, getProductsByBatchId, fixProducts, deleteAllDocumentsInCollection, cleanProductsCollection, deleteProductsWithObjectsInVariants, thinkAboutCannabinoids, getProductsByPPM, getProductsByTerpene, thinkAboutTerpenes, getProductsByVariant, normalizeVariants, getUniqueTerpenes, getUniqueCannabinoids, getTerpenes, saveArticles, getproducts, getAllProducts, getProductsByVendor, cleanProductsCollections, getUniqueChemicals, saveChemical, normalizeVariantName, saveProducts } = require('./firebase.js')
const scrapers = require('./scrapers.js')
const jpegs = require('./services/jpegs.js')
const { getArticle } = require('./services/ai-author.js')
const logger = require('./services/logger.js')


fs.writeFileSync('./temp/errors.txt', '')
fs.writeFileSync('./temp/no-buffer.txt', '')
fs.writeFileSync('./temp/unknownCannabinoidSpellings.txt', '')
fs.writeFileSync('./temp/unknownTerpinoidSpellings.txt', '')
fs.writeFileSync('./temp/reached-end.txt', '')
fs.writeFileSync('./temp/assay.txt', '')
fs.writeFileSync('./temp/no-config.txt', '')
fs.writeFileSync('./temp/no-text.txt', '')
fs.writeFileSync('./temp/config.txt', '')
fs.writeFileSync('./temp/tables.txt', '')

const batchId = '0J01'

async function makeProductsFile(vendor, limit, useDevCollection) {

  let products

  if (vendor && useDevCollection) {
    products = await getProductsByVendor(vendor, limit, useDevCollection)
  } else if (vendor) {
    products = await getProductsByVendor(vendor, limit)
  } else {
    products = await getAllProducts()
  }

  products = products.map(product => {
    product.cannabinoids = filterAssay(product.cannabinoids)
    product.terpenes = filterAssay(product.terpenes)

    return product
  })

  const updatedAt = new Date().toISOString()

  const terpenes = await getTerpenes()

  fs.writeFileSync('../app/src/assets/data/products.json', JSON.stringify({ products, terpenes, updatedAt }))

  logger.log({level:'info', message: `Wrote ${products.length} products to products.json`});
}

function filterAssay(assay) {
  return assay?.filter(chem => parseFloat(chem.pct) > 0 && chem.name !== 'Unknown')
}

async function makeTerpenesFile() {
  const result = await getTerpenes()
  fs.writeFileSync('../app/src/assets/data/terpenes.json', JSON.stringify(result))
  logger.log({level:'info', message: `Wrote ${result.length} terpenes to terpenes.json`});
}

async function run(batchId, vendor) {

  let startTime = performance.now()

  await scrapers.run(batchId, vendor)

  let endTime = performance.now()

  logger.log({level:'info', message: `Scraping took ${((endTime - startTime) / 1000).toFixed(2)} seconds`})

  startTime = performance.now()

  await cleanProductsCollections()

  endTime = performance.now()

  logger.log({level:'info', message: `Deleting old duplicates took ${((endTime - startTime) / 1000).toFixed(2)} seconds`})

  startTime = performance.now()

  await makeProductsFile()

  endTime = performance.now()

  logger.log({level:'info', message: `Making JSON file took ${((endTime - startTime) / 1000).toFixed(2)} seconds`})

  process.exit(0)
}

run(batchId)

async function utils() {

  // await thinkAboutCannabinoids()

  //await scrapers.testOCR()

  // const cans = await getUniqueCannabinoids();

  //logger.log(JSON.stringify(cans, null, 2));

  await cleanProductsCollections()
  await makeProductsFile()
  //await makeArticles();
  logger.log({
  level: 'info',
  message: `done`}
  )
}

//utils()


