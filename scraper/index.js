const { performance } = require('perf_hooks');
const fs = require('fs');
const { getProductsWithAssay2, getAllProducts, getProductsByVendor, deleteAllButMostRecentDocumentsWithMatchingTitlesAndVendors } = require('./firebase.js');
const scrapers = require('./scrapers.js');
const { v4: uuidv4 } = require('uuid');

async function makeProductsFile(vendor, limit) {

  let products;

  if (0 === 1) {
    const useDevCollection = true;
    products = await getProductsByVendor(vendor, limit, useDevCollection);
  }
  else if (vendor) {
    products = await getProductsByVendor(vendor, limit);
  }
  else {
    products = await getAllProducts();
  }
  const updatedAt = new Date().toISOString();
  fs.writeFileSync('../app/src/assets/data/products.json', JSON.stringify({ products: products, updatedAt: updatedAt }));
}

async function init() {
  const uuid = uuidv4();
  await scrapers.run(uuid);
  await makeProductsFile();
}

init();

async function run() {
  const startTime = performance.now();
  const uuid = uuidv4();
  await scrapers.run(uuid);
  const endTime = performance.now();

  console.log(`Scraping took ${((endTime - startTime) / 1000).toFixed(2)} seconds`);

  await deleteAllButMostRecentDocumentsWithMatchingTitlesAndVendors();
  await makeProductsFile();

}

//run();


