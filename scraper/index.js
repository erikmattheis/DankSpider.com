const { performance } = require('perf_hooks');
const fs = require('fs');
const { getAllProducts } = require('./firebase.js');
const scrapers = require('./scrapers.js');

async function run() {
  const startTime = performance.now();
  await scrapers.run();
  const endTime = performance.now();

  console.log(`Scraping took ${endTime - startTime} milliseconds`);
  console.log('Done');

}

//run();

async function makeProductsFile() {
  const products = await getAllProducts();
  const updatedAt = new Date().toISOString();
  fs.writeFileSync('../app/src/assets/data/products.json', JSON.stringify({ products: products, updatedAt: updatedAt }));
}

makeProductsFile();
