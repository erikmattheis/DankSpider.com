const { performance } = require('perf_hooks')
const fs = require('fs')
const { deleteProductsByVendor,getExampleRecordWithUniqueChemicalAsCannabinoid, getProductsByBatchId, fixProducts, deleteAllDocumentsInCollection, cleanProductsCollection, deleteProductsWithObjectsInVariants, thinkAboutCannabinoids, getProductsByPPM, getProductsByTerpene, thinkAboutTerpenes, getProductsByVariant, normalizeVariants, getUniqueTerpenes, getUniqueCannabinoids, getTerpenes, saveArticles, getproducts, getAllProducts, getProductsByVendor, cleanProductsCollections, getUniqueChemicals, saveChemical, normalizeVariantName, saveProducts } = require('./firebase.js')
const scrapers = require('./scrapers.js')
const jpegs = require('./services/jpegs.js')
const { getArticle } = require('./services/ai-author.js')

const batchId = 'a8'

async function makeProductsFile (vendor, limit, useDevCollection) {
  console.log('makeProductsFile', vendor, limit, useDevCollection)
  let products

  if (vendor && useDevCollection) {
    products = await getProductsByVendor(vendor, limit, useDevCollection)
  } else if (vendor) {
    products = await getProductsByVendor(vendor, limit)
  } else {
    products = await getAllProducts()
    console.log('products ->', products.length)
  }

  products = products.map(product => {
    product.cannabinoids = filterAssay(product.cannabinoids)
    product.terpenes = filterAssay(product.terpenes)

    return product
  })

  const updatedAt = new Date().toISOString()

  const terpenes = await getTerpenes()

  fs.writeFileSync('../app/src/assets/data/products.json', JSON.stringify({ products, terpenes, updatedAt }))

  console.log(`Wrote ${products.length} products to products.json`)
}

function filterAssay (assay) {
  return assay?.filter(chem => parseFloat(chem.pct) > 0 && chem.name !== 'Unknown')
}

async function makeTerpenes () {
  const cannabisTerpenes = [
    '1,8 Cineole',
    'Eucalyptol',
    'Bisabolol',
    'Borneol',
    'Borreol',
    'Camphene',
    'Carene',
    'Caryophyllene',
    'Citral',
    'Dihydrocarveol',
    'Fenchone',
    'Humulene',
    'Limonene',
    'Linalool',
    'Menthol',
    'Myrcene',
    'Nerolidol',
    'Ocimene',
    'Pinene',
    'Pulegone',
    'Terpinene',
    'Terpinolene']
  const terpenes = []
  const updatedAt = new Date().toISOString()
  for (const terpene of cannabisTerpenes) {
    const result = await getArticle(terpene, 500)
    await saveArticles([result])
    terpenes.push(result)
  }

  // console.log(`Wrote ${terpenes.length} terpenes to Firebase`);
}

async function makeTerpenesFile () {
  const result = await getTerpenes()
  fs.writeFileSync('../app/src/assets/data/terpenes.json', JSON.stringify(result))
  // console.log(`Wrote ${result.length} terpenes to terpenes.json`);
}

async function run (batchId, vendor) {

  let startTime = performance.now()

  await scrapers.run(batchId, vendor)
  
  let endTime = performance.now()

  console.log(`Scraping took ${((endTime - startTime) / 1000).toFixed(2)} seconds`)

  startTime = performance.now()

  //await cleanProductsCollections()

  endTime = performance.now()

  console.log(`Deleting old duplicates took ${((endTime - startTime) / 1000).toFixed(2)} seconds`)

  startTime = performance.now()
  await makeProductsFile()
  endTime = performance.now()

  console.log(`Making JSON file took ${((endTime - startTime) / 1000).toFixed(2)} seconds`)
}

// run(batchId)


async function utils () {
  
  //const cans = await getUniqueCannabinoids();

  //console.log(JSON.stringify(cans, null, 2));
  
 // await cleanProductsCollections()
 await makeProductsFile()
console.log('done')
}

//utils()


