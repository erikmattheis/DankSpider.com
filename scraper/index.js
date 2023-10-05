const { performance } = require('perf_hooks');
const fs = require('fs');
const { getProductsWithAssay, getAllProducts, getProductsByVendor } = require('./firebase.js');
const scrapers = require('./scrapers.js');
const { v4: uuidv4 } = require('uuid');

async function makeProductsFile(vendor, limit) {

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

  for (const product of products) {
    if (product.images) {
      console.log(product.images)
    }
    if (product.lines) {
      console.log(product.lines)
    }
  }
  const updatedAt = new Date().toISOString();
  fs.writeFileSync('../app/src/assets/data/products.json', JSON.stringify({ products: products, updatedAt: updatedAt }));
}
async function init() {
  await makeProductsFile('WNC', 30, true);
}
init();

async function run() {
  const startTime = performance.now();
  const uuid = uuidv4();
  await scrapers.run(uuid);
  const endTime = performance.now();

  console.log(`Scraping took ${((endTime - startTime) / 1000).toFixed(1)} seconds`);

  makeProductsFile();

  console.log('Done');

}

//run();


