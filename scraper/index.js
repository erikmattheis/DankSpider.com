const { performance } = require('perf_hooks');
const fs = require('fs');
const { getProductsWithAssay2, getAllProducts, getProductsByVendor, cleanProductsCollections } = require('./firebase.js');
const scrapers = require('./scrapers.js');
const { v4: uuidv4 } = require('uuid');
const jpegs = require('./services/jpegs.js');
const { firebase } = require('./firebase.js');

async function makeProductsFile(vendor, limit) {
  console.log('makeProductsFile', vendor, limit); //, useDevCollection);
  let products;

  if (0 === 0) {
    const useDevCollection = true;
    products = await getProductsByVendor(vendor, limit, useDevCollection);
  }
  else if (vendor) {
    products = await getProductsByVendor(vendor, limit);
  }
  else {
    products = await getAllProducts();
  }

  products = products.map(product => {

    product.cannabinoids = filterAssay(product.cannabinoids);
    product.terpenes = filterAssay(product.terpenes);

    return product;
  });

  const updatedAt = new Date().toISOString();

  fs.writeFileSync('../app/src/assets/data/products.json', JSON.stringify({ products: products, updatedAt: updatedAt }));

  console.log(`Wrote ${products.length} products to products.json`);

}

function filterAssay(assay) {
  return assay.filter(chem => parseFloat(chem.pct) > 0 && chem.name !== 'Unknown');
}

async function init() {
  //const uuid = uuidv4();
  //await scrapers.run('c3');
  await makeProductsFile('WNC', 8);

  // await jpegs.run('c2');


}

init();


async function run() {
  let startTime = performance.now();
  const uuid = uuidv4();
  await scrapers.run('c3');
  let endTime = performance.now();

  console.log(`Scraping took ${((endTime - startTime) / 1000).toFixed(2)} seconds`);

  startTime = performance.now();
  await cleanProductsCollections();
  endTime = performance.now();

  console.log(`Deleting old duplicates took ${((endTime - startTime) / 1000).toFixed(2)} seconds`);

  startTime = performance.now();
  await makeProductsFile();
  endTime = performance.now();

  console.log(`Making JSON file took ${((endTime - startTime) / 1000).toFixed(2)} seconds`);

}

//run();


