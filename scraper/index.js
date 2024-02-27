const { performance } = require('perf_hooks')
const fs = require('fs')
const { deleteAssaysByVendors, copyProducts, recalculateChemicalValues, deleteProductsByVendors, normalizeVariants, copyAndDeleteProducts, recordAssays, fixValues, deleteProductsByVendor, getProductsByBatchId, cleanProductsCollection, getProductsByPPM, getProductsByTerpene, getProductsByVariant, saveArticles, getproducts, getAllProducts, getUniqueChemicals, saveChemical, normalizeVariantName, saveProducts } = require('./services/firebase.js')
const scrapers = require('./services/scrapers.js')
const { makeStats } = require('./services/stats.js')
const jpegs = require('./services/jpegs.js')
const { getArticle } = require('./services/ai-author.js')
const { read } = require('./services/pdf.js')
const logger = require('./services/logger.js')

const ppm = require("./vendors/ppm.js");
const preston = require("./vendors/preston.js");
const flow = require("./vendors/flow.js");
const wnc = require("./vendors/wnc.js");
const enlighten = require("./vendors/enlighten-weebly-few-products.js");
const topcola = require("./vendors/topcola.js");
const arete = require("./vendors/arete.js");
const drGanja = require("./vendors/drganja.js");
const ehh = require("./vendors/ehh.js");
const hch = require("./vendors/hch.js");
const hcf = require("./vendors/hcf.js");

async function makeProductsFile(vendor, limit, useDevCollection) {

  let products = await getAllProducts()

  const red = []

  for (let i = 0; i < products.length; i++) {
    console.log('vendor', products[i].vendor)
    if (!red.includes(products[i]?.vendor)) {
      red[vendor] = {
        numWithCannabinoidAssays: 0,
        numWithTerpeneAssays: 0,
        numWithVariants: 0,
      }
    }

    if (products[i].cannabinoids && products[i].cannabinoids.length > 0) {
      products[i].numWithCannabinoidAssays += 1
    }

    if (products[i].terpenes && products[i].terpenes.length > 0) {
      products[i].numWithTerpeneAssays += 1
    }

    if (products[i].variants && products[i].variants.length > 0) {
      products[i].numWithVariants += 1
    }
  }

  console.log(red)

  const updatedAt = new Date().toISOString()

  fs.writeFileSync('../app/src/assets/data/products.json', JSON.stringify({ products, updatedAt }))

  logger.log({ level: 'info', message: `Wrote ${products.length} products to products.json` });
}

async function showBatch() {
  const products = await getProductsByBatchId(batchId)
  console.log('batch', products)
  fs.writeFileSync(`./temp/batch${batchId}.json`, JSON.stringify(products, null, 2))
}

process.on('uncaughtException', (err) => {
  console.error('There was an uncaught error', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled Rejection at:', p, 'reason:', reason);
  process.exit(1);
});

async function run(batchId, vendor, vendorList) {
  console.log('run')
  const timer = performance.now();

  //await deleteAssaysByVendors(['HCF', 'HCH'])
  //await deleteProductsByVendors(['WNC'])

  //await showBatch()

  //await copyAndDeleteProducts([batchId]);

  //await scrapers.run(batchId, vendor, vendorList)

  //await copyProducts()

  await makeProductsFile()

  //await recalculateChemicalValues()

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

  const time = ((performance.now() - timer) / 1000).toFixed(2)

  logger.log({ level: 'info', message: `Done with batch ${batchId} in ${time} seconds` });

  process.exit(0)
}
/*
  { name: 'Arete', service: arete },
  { name: 'drGanja', service: drGanja },
  { name: 'WNC', service: wnc },
  { name: 'Preston', service: preston },
  { name: 'TopCola', service: topcola },
  { name: 'EHH', service: ehh },
  { name: 'HCH', service: hch },
  { name: 'HCF', service: hcf },
  { name: 'PPM', service: ppm },
  // { name: 'Flow', service: flow },
 // { name: 'Enlighten', service: enlighten
*/
const batchId = 'e86'


run(batchId, '', [
  { name: 'Arete', service: arete },
  { name: 'drGanja', service: drGanja },
  { name: 'WNC', service: wnc },
  { name: 'Preston', service: preston },
  { name: 'TopCola', service: topcola },
  { name: 'EHH', service: ehh },
  { name: 'HCH', service: hch },
  { name: 'HCF', service: hcf },
  { name: 'PPM', service: ppm },
]);
