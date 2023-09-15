const fs = require('fs');

const flow = require('./vendors/flow.js');

function writeFile(products) {
  const jsonContent = JSON.stringify(products, null, 2);
  fs.writeFileSync('../data/products.json', jsonContent, 'utf8');
}

async function run() {
  const products = await flow.getAvailableLeafProducts();
  console.log('products', products);
  writeFile(products);
  console.log(`Data has been written to file for ${products.length} products`);
}

run();
