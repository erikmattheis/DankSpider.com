const { performance } = require('perf_hooks')
const fs = require('fs')
const { recordAssays, fixValues, deleteProductsByVendor, getProductsByBatchId,  cleanProductsCollection, getProductsByPPM, getProductsByTerpene, getProductsByVariant,  getTerpenes, getCannabinoids, saveArticles, getproducts, getAllProducts, getUniqueChemicals, saveChemical, normalizeVariantName, saveProducts } = require('./services/firebase.js')
const scrapers = require('./services/scrapers.js')
const { makeStats } = require('./services/stats.js')
const jpegs = require('./services/jpegs.js')
const { getArticle } = require('./services/ai-author.js')
const logger = require('./services/logger.js')
const {read} = require('./services/pdf.js')
const { makeProductsFile } = require('./services/memory.js')

const batchId = '0F'

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



async function run(batchId, vendor) {

 await scrapers.run(batchId, vendor)

 // await makeProductsFile()

 // await makeTerpenesFile()

 // await makeStats()

  // await makeStrainsFile()

  // await makeCannabinoidsFile()

  // await jpegs.run(batchId)

  // await getArticle()

  // await saveArticles()

  // await getUniqueChemicals()

  // await saveChemical()

  // await getproducts()
// await read()

 // await cleanProductsCollection()


  logger.log({level:'info', message: `Done with batch ${batchId}`})

  process.exit(0)
}

run(batchId, 'PPM')


