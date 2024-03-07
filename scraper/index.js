const { performance } = require('perf_hooks')
const fs = require('fs')

const { deleteAllDocumentsInCollection, getCompleteProducts, getProductsWithTerpenes, deleteNonFlowerProducts, deleteAssaysByVendors, copyProducts, recalculateChemicalValues, deleteProductsByVendors, normalizeVariants, copyAndDeleteProducts, recordAssays, fixValues, deleteProductsByVendor, getProductsByBatchId, cleanProductsCollection, getProductsByPPM, getProductsByTerpene, getProductsByVariant, saveArticles, getproducts, getAllProducts, getUniqueChemicals, saveChemical, normalizeVariantName, saveProducts } = require('./services/firebase.js')
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
const { doTest } = require("./vendors/test.js");

const test = require("./vendors/test.js");

//const batchId = '4000sharp1.5'
const batchId = 'many'
const numProductsToSave = 555;

const vendors = [
  { name: 'Arete', service: arete },
  { name: 'drGanja', service: drGanja },
  { name: 'test', service: test },
  { name: 'WNC', service: wnc },
  { name: 'Preston', service: preston },
  { name: 'TopCola', service: topcola },
  { name: 'EHH', service: ehh },
  { name: 'HCH', service: hch },
  { name: 'HCF', service: hcf },
  { name: 'PPM', service: ppm },
];

run(batchId, 'test', vendors, numProductsToSave)

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

async function run(batchId, vendor, vendorList, numProductsToSave) {

  const timer = performance.now();

  //await deleteAssaysByVendors(['HCF', 'HCH'])

  //await deleteProductsByVendors(['WNC'])

  //await showBatch()

  //await copyAndDeleteProducts([batchId]);

  //await scrapers.run(batchId, vendor, vendorList, numProductsToSave)
  //await deleteAllDocumentsInCollection('tests')
  // await doTest(batchId);

  //await copyProducts()

  //await deleteNonFlowerProducts()

  //await normalizeVariants()

  //await recalculateChemicalValues()

  //await makeProductsFile()

  //await makeStats(batchId)

  // await makeStrainsFile()

  // await makeCannabinoidsFile()

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


async function makeProductsFile(vendor, limit, useDevCollection) {
  console.log('makeProductsFile')
  let products = await getProductsByBatchId(batchId);

  let result = [];

  const red = {}

  for (let i = 0; i < products.length; i++) {
    /*
    if (products[i].cannabinoids?.length) {
      console.log(products[i].cannabinoids[0].pct, products[i].cannabinoids[0].pct)
    }
    if (products[i].terpenes?.length) {
      console.log(products[i].terpoenes[0].pct, products[i].tepenes[0].pct)
    }
    */
    if (!products[i].cannabinoids?.length && !products[i].terpenes?.length) {
      console.log(`At all ${products[i].title} ${products[i].vendor}`)
      fs.appendFileSync('./temp/no-cannabinoids-no-terpenes.txt', `${products[i].title} ${products[i].vendor}\n`)
      continue;
    }
    if (!products[i].cannabinoids?.some(c => c.pct > 0) && !products[i].terpenes?.some(t => t.pct > 0)) {
      console.log(`Values ${products[i].title} ${products[i].vendor}`)
      fs.appendFileSync('./temp/no-cannabinoid-values-no-terpene-values.txt', `${products[i].title} ${products[i].vendor}\n`)
      continue;
    }
    const vendor = products[i].vendor
    if (!red[vendor]) {
      red[products[i].vendor] = {
        numWithCannabinoidAssays: 0,
        numWithTerpeneAssays: 0,
        numWithVariants: 0,
      }
    }

    if (products[i].cannabinoids && products[i].cannabinoids.length > 0) {
      products[i].cannabinoids = products[i].cannabinoids.filter(c => parseFloat(c.pct) > 0.08)
      products[i].cannabinoids = products[i].cannabinoids.map(c => {
        if (parseFloat(c.pct) > 50) {
          c.pct = (parseFloat(c.pct) / 10).toFixed(2);
        }
        return c;
      });
      red[vendor].numWithCannabinoidAssays += 1
    }

    if (products[i].terpenes && products[i].terpenes.length > 0) {
      products[i].terpenes = products[i].terpenes.filter(t => parseFloat(t.pct) > 0.08)
      products[i].terpenes = products[i].terpenes.map(t => {
        if (parseFloat(t.pct) > 50) {
          t.pct = (parseFloat(t.pct) / 10).toFixed(2);
        }
        return t;
      }); red[vendor].numWithTerpeneAssays += 1
    }

    if (products[i].variants && products[i].variants.length > 0) {
      red[vendor].numWithVariants += 1
    }
    result.push(products[i])
  }
  /*
    // remove cannabinoids and terpenes that have pct < 0.08
    for (let i = 0; i < result.length; i++) {
      if (result[i].cannabinoids) {
        result[i].cannabinoids = result[i].cannabinoids.filter(c => parseFloat(c.pct) > 0.08)
      }
      if (result[i].terpenes) {
        result[i].terpenes = result[i].terpenes.filter(t => parseFloat(t.pct) > 0.08)
      }
    }
  */

  const chemicals = new Set();

  result.forEach(product => {
    product.cannabinoids?.forEach(cannabinoid => {
      console.log(cannabinoid?.name)
      if (cannabinoid && cannabinoid.name) {

        chemicals.add(cannabinoid.name);
      }
    });

    product.terpenes?.forEach(terpene => {
      if (terpene && terpene.name) {
        chemicals.add(terpene.name);
      }
    });
  });

  console.log('unique chemicals', Array.from(chemicals).length, 'num products', result.length);
  const updatedAt = new Date().toISOString()

  fs.writeFileSync('../app/src/assets/data/products.json', JSON.stringify({ products: result, updatedAt }))

  logger.log({ level: 'info', message: `Wrote ${result.length} products to products.json` });
}