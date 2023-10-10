const { performance } = require('perf_hooks');
const fs = require('fs');
await
const { getProductsWithAssay2, getAllProducts, getProductsByVendor, cleanProductsCollections } = require('./firebase.js');
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
  let startTime = performance.now();
  const uuid = uuidv4();
  await scrapers.run(uuid);
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


