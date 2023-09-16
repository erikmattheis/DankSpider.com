const fs = require('fs');

const flow = require('./vendors/flow.js');
const wnc = require('./vendors/wnc.js');

function writeFile(products) {
  const jsonContent = JSON.stringify(products, null, 2);
  fs.writeFileSync('../data/products.json', jsonContent, 'utf8');
}

async function run() {
  const flowProducts = await flow.getAvailableLeafProducts();
  console.log('flow products', flowProducts.length);

  const wncProducts = await wnc.getAvailableLeafProducts();
  console.log('wnc products', wncProducts.length);

  const products = [...flowProducts, ...wncProducts];

  writeFile(products);

  console.log(`Data has been written to file for ${products.length} products`);
}

run();
