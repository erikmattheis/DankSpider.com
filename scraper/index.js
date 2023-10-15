const { performance } = require('perf_hooks');
const fs = require('fs');
const { getUniqueTerpenes, getUniqueCannabinoids, getTerpenes, saveArticles, getProductsWithAssay, getAllProducts, getProductsByVendor, cleanProductsCollections, getUniqueChemicals, saveChemical } = require('./firebase.js');
const scrapers = require('./scrapers.js');
const { v4: uuidv4 } = require('uuid');
const jpegs = require('./services/jpegs.js');
const { getArticle } = require('./services/ai-author.js');

async function makeProductsFile(vendor, limit, useDevCollection) {
  // console.log('makeProductsFile', vendor, limit, useDevCollection);
  let products;

  if (vendor && useDevCollection) {
    products = await getProductsByVendor(vendor, limit, useDevCollection);
  }
  else if (vendor) {
    products = await getProductsByVendor(vendor, limit);
  }
  else {
    products = await getAllProducts();
  }
  if (products[0]?.cannabinoids) {
    products = products.map(product => {

      product.cannabinoids = filterAssay(product.cannabinoids);
      product.terpenes = filterAssay(product.terpenes);

      return product;
    });
  }
  const updatedAt = new Date().toISOString();

  const terpenes = await getTerpenes()

  fs.writeFileSync('../app/src/assets/data/products.json', JSON.stringify({ products, terpenes, updatedAt }));

  console.log(`Wrote ${products.length} products to products.json`);

}

function filterAssay(assay) {
  if (!assay || !assay.filter) {
    return assay;
  }
  return assay.filter(chem => parseFloat(chem.pct) > 0 && chem.name !== 'Unknown');
}

async function makeTerpenes() {
  const cannabisTerpenes = [
    "1,8 Cineole",
    "Eucalyptol",
    "Bisabolol",
    "Borneol",
    "Borreol",
    "Camphene",
    "Carene",
    "Caryophyllene",
    "Citral",
    "Dihydrocarveol",
    "Fenchone",
    "Humulene",
    "Limonene",
    "Linalool",
    "Menthol",
    "Myrcene",
    "Nerolidol",
    "Ocimene",
    "Pinene",
    "Pulegone",
    "Terpinene",
    "Terpinolene"];
  const terpenes = [];
  const updatedAt = new Date().toISOString();
  for (const terpene of cannabisTerpenes) {
    const result = await getArticle(terpene, 500);
    await saveArticles([result]);
    terpenes.push(result);
  }

  // console.log(`Wrote ${terpenes.length} terpenes to Firebase`);
}

async function makeTerpenesFile() {
  const result = await getTerpenes();
  fs.writeFileSync('../app/src/assets/data/terpenes.json', JSON.stringify(result));
  // console.log(`Wrote ${result.length} terpenes to terpenes.json`);
}

async function run() {
  let startTime = performance.now();

  await scrapers.run('xIx');
  let endTime = performance.now();

  // console.log(`Scraping took ${((endTime - startTime) / 1000).toFixed(2)} seconds`);

  startTime = performance.now();
  await cleanProductsCollections();

  endTime = performance.now();

  // console.log(`Deleting old duplicates took ${((endTime - startTime) / 1000).toFixed(2)} seconds`);

  startTime = performance.now();
  await makeProductsFile();
  endTime = performance.now();

  // console.log(`Making JSON file took ${((endTime - startTime) / 1000).toFixed(2)} seconds`);

}

run();

async function util() {

  //await makeProductsFile('WNC', 300, true);

  /*
    const terps = await getUniqueTerpenes();
    console.log(terps);
    const canns = await getUniqueCannabinoids();
    console.log(canns);
  */
  await cleanProductsCollections();

  // await jpegs.run('HMC6');

  // await cleanProductsCollections();
  console.log("Done.")

  //await makeTerpenes();

}

//util();


