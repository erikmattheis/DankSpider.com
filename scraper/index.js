const { performance } = require('perf_hooks')
const fs = require('fs')
const { deleteProductsByVendor, getProductsByBatchId,  cleanProductsCollection, getProductsByPPM, getProductsByTerpene, getProductsByVariant,  getTerpenes, getCannabinoids, saveArticles, getproducts, getAllProducts, getProductsByVendor, cleanProductsCollections, getUniqueChemicals, saveChemical, normalizeVariantName, saveProducts } = require('./services/firebase.js')
const scrapers = require('./services/scrapers.js')
const { makeStats } = require('./services/stats.js')
const jpegs = require('./services/jpegs.js')
const { getArticle } = require('./services/ai-author.js')
const logger = require('./services/logger.js')

const batchId = '0C'

async function makeProductsFile(vendor, limit, useDevCollection) {

  let products

  if (vendor && useDevCollection) {
    products = await getProductsByVendor(vendor, limit, useDevCollection)
  } else if (vendor) {
    products = await getProductsByVendor(vendor, limit)
  } else {
    products = await getAllProducts(batchId)
  }

  products = products.map(product => {
    product.cannabinoids = filterAssay(product.cannabinoids)
    product.terpenes = filterAssay(product.terpenes)
    return product
  })

  const updatedAt = new Date().toISOString()

  fs.writeFileSync('../app/src/assets/data/products.json', JSON.stringify({ products, updatedAt }))

  logger.log({level:'info', message: `Wrote ${products.length} products to products.json`});
}

async function makeTerpenesFile() {
  const result = await getTerpenes()
  fs.writeFileSync('../app/src/assets/data/terpenes.json', JSON.stringify(result))
  logger.log({level:'info', message: `Wrote ${result.length} terpenes to terpenes.json`});
}

async function makeStrainsFile() {
  const result = await getStrains()
  fs.writeFileSync('../app/src/assets/data/strains.json', JSON.stringify(result))
  logger.log({level:'info', message: `Wrote ${result.length} strains to terpenes.json`});
}

async function makeCannabinoidsFile() {
  const result = await getStrains()
  fs.writeFileSync('../app/src/assets/data/strains.json', JSON.stringify(result))
  logger.log({level:'info', message: `Wrote ${result.length} strains to terpenes.json`});
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

 // await scrapers.run(batchId, vendor)

 //await makeProductsFile()

  //await saveProducts([{'title':'car'}], 'aaa')

  //  await scrapers.testOCR()


  //await cleanProductsCollections()
// await makeProductsFile()


await makeStats()
  //await makeArticles();

 // await makeTerpenesFile();
  logger.log({
    level: 'info',
    message: `done`}
    )

  logger.log({level:'info', message: `Done with batch ${batchId}`})

  process.exit(0)
}

run(batchId,'WNC')

