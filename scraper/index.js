const { performance } = require('perf_hooks');
const fs = require('fs');
const { getAllProducts } = require('./firebase.js');
const scrapers = require('./scrapers.js');
const { v4: uuidv4 } = require('uuid');


async function makeProductsFile() {
  const products = await getAllProducts();
  const updatedAt = new Date().toISOString();
  fs.writeFileSync('../app/src/assets/data/products.json', JSON.stringify({ products: products, updatedAt: updatedAt }));
}

async function run() {
  const startTime = performance.now();
  const uuid = uuidv4();
  await scrapers.run(uuid);
  const endTime = performance.now();

  console.log(`Scraping took ${((endTime - startTime) / 1000).toFixed(1)} seconds`);

  makeProductsFile();

  console.log('Done');

}

run();


