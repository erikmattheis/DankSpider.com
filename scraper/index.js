const { performance } = require('perf_hooks')
const fs = require('fs')

const { deleteAllDocumentsInCollection, getCompleteProducts, getProductsWithTerpenes, deleteNonFlowerProducts, deleteAssaysByVendors, copyProducts, recalculateChemicalValues, deleteProductsByVendors, normalizeVariants, copyAndDeleteProducts, recordAssays, fixValues, deleteProductsByVendor, getProductsByBatchId, cleanProductsCollection, getProductsByPPM, getProductsByTerpene, getProductsByVariant, saveArticles, getproducts, getAllProducts, getUniqueChemicals, saveChemical, normalizeVariantName, saveProducts } = require('./services/firebase.js')
const scrapers = require('./services/scrapers.js')
const { makeStats } = require('./services/stats.js')

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
const batchId = '2024-03-12a'
const numProductsToSave = 555;

const vendors = [
  /* { name: 'Arete', service: arete },
  { name: 'drGanja', service: drGanja },
  { name: 'WNC', service: wnc },
  { name: 'Preston', service: preston },
  { name: 'TopCola', service: topcola },*/
  { name: 'EHH', service: ehh },
  { name: 'HCH', service: hch },
  { name: 'HCF', service: hcf },
  { name: 'PPM', service: ppm },
];

run(batchId, '', vendors, numProductsToSave)

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

  //await copyAndDeleteProducts([batchId]);

  //await scrapers.run(batchId, vendor, vendorList, numProductsToSave)

  //await doTest(batchId);

  //await normalizeVariants()

  //await recalculateChemicalValues()

  await makeProductsFile()

  //await makeStats(batchId)

  const time = ((performance.now() - timer) / 1000).toFixed(2)

  logger.log({ level: 'info', message: `Done with batch ${batchId} in ${time} seconds` });

  process.exit(0)
}


async function makeProductsFile(vendor, limit, useDevCollection) {
  console.log('makeProductsFile')
  let products = await getAllProducts()

  let result = [];

  const red = {}

  for (let i = 0; i < products.length; i++) {
    const vendor = products[i].vendor
    if (!red[vendor]) {
      red[products[i].vendor] = {
        numWithCannabinoidAssays: 0,
        numWithTerpeneAssays: 0,
        numWithVariants: 0,
      }
    }

    if (products[i].cannabinoids && products[i].cannabinoids.length > 0) {
      products[i].cannabinoids = products[i].cannabinoids.filter(c => parseFloat(c.pct) > 0.09)
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

  const cannabinoids = new Set();
  const terpenes = new Set();
  const variants = new Set();

  result.forEach(product => {
    product.cannabinoids?.forEach(cannabinoid => {
      if (cannabinoid && cannabinoid.name) {
        cannabinoids.add(cannabinoid.name);
      }
    });

    product.terpenes?.forEach(terpene => {
      if (terpene && terpene.name) {
        terpenes.add(terpene.name);
      }
    });

    product.variants?.forEach(variant => {
      if (variants && variant.name) {
        variant.add(variant.name);
      }
    });
  });


  const updatedAt = new Date().toISOString()

  fs.writeFileSync('../app/src/assets/data/products.json', JSON.stringify({ products: result, cannabinoids, terpenes, variants, updatedAt }))
  fs.writeFileSync('../vuetify/src/assets/data/products.json', JSON.stringify({ products: result, cannabinoids, terpenes, variants, updatedAt }))
  fs.writeFileSync('../vue-ssr/public/data/products.json', JSON.stringify({ products: result, cannabinoids, terpenes, variants, updatedAt }))


  logger.log({ level: 'info', message: `Wrote ${result.length} products to products.json` });
}