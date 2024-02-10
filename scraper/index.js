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


const ppm = require("./vendors/ppm.js");
const preston = require("./vendors/preston.js");
const flow = require("./vendors/flow.js");
const wnc = require("./vendors/wnc.js");
const enlighten = require("./vendors/enlighten-weebly-few-products.js");
const topcola = require("./vendors/topcola.js");
const arete = require("./vendors/arete.js");
const drGanja = require("./vendors/drganja.js");

const batchId = '00y'

process.on('uncaughtException', (err) => {
  console.error('There was an uncaught error', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled Rejection at:', p, 'reason:', reason);
  process.exit(1); //mandatory (as per the Node.js docs)
});

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

async function run(batchId, vendor, vendorList) {

  const timer = performance.now()

  await scrapers.run(batchId, vendor, vendorList)

  //await cleanProductsCollection()

  //await makeProductsFile()

  //await makeProductsFile()

  // await makeTerpenesFile()

  await makeStats()

  // await makeStrainsFile()

  // await makeCannabinoidsFile()

  // await jpegs.run(batchId)

  // await getArticle()

  // await saveArticles()

  // await getUniqueChemicals()

  // await saveChemical()

  // await getproducts()

  // await read()

  const time = ((performance.now() - timer)/1000).toFixed(2)

  logger.log({level:'info', message: `Done with batch ${batchId} in ${time} seconds`});

  process.exit(0)
}
/*
[{ name: 'PPM', service: ppm },
{ name: 'Arete', service: arete },
{ name: 'drGanja', service: drGanja },
{ name: 'WNC', service: wnc },
{ name: 'Preston', service: preston },
{ name: 'TopCola', service: topcola },]*/

run(batchId, 'x', [{ name: 'drGanja', service: drGanja },
{ name: 'WNC', service: wnc },
{ name: 'Preston', service: preston },
{ name: 'TopCola', service: topcola },])


