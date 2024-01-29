const { performance } = require('perf_hooks')
const fs = require('fs')
const { deleteProductsByVendor, getExampleRecordWithUniqueChemicalAsCannabinoid, getProductsByBatchId, deleteAllDocumentsInCollection, cleanProductsCollection, deleteProductsWithObjectsInVariants, thinkAboutCannabinoids, getProductsByPPM, getProductsByTerpene, thinkAboutTerpenes, getProductsByVariant, normalizeVariants, getUniqueTerpenes, getUniqueCannabinoids, getTerpenes, saveArticles, getproducts, getAllProducts, getProductsByVendor, cleanProductsCollections, getUniqueChemicals, saveChemical, normalizeVariantName, saveProducts } = require('./firebase.js')
const scrapers = require('./scrapers.js')
const jpegs = require('./services/jpegs.js')
const { getArticle } = require('./services/ai-author.js')
const logger = require('./services/logger.js')

const batchId = '0A'

async function makeProductsFile(vendor, limit, useDevCollection) {

  let products

  if (vendor && useDevCollection) {
    products = await getProductsByVendor(vendor, limit, useDevCollection)
  } else if (vendor) {
    products = await getProductsByVendor(vendor, limit)
  } else {
    products = await getProductsByBatchId(batchId)
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

  //await scrapers.run(batchId, vendor)

  // await cleanProductsCollections()

  await makeProductsFile()

  //await saveProducts([{'title':'car'}], 'aaa')

  logger.log({level:'info', message: `Done with batch ${batchId}`})

  process.exit(0)
}

//run(batchId)

async function utils() {

  // await thinkAboutCannabinoids()

  //await scrapers.testOCR()

  // const cans = await getUniqueCannabinoids();

  //logger.log(JSON.stringify(cans, null, 2));

  // await cleanProductsCollections()
  await makeProductsFile()
  //await makeArticles();
  logger.log({
  level: 'info',
  message: `done`}
  )
}

utils()


