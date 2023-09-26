const fs = require('fs');

const preston = require('./vendors/preston.js');
const flow = require('./vendors/flow.js');
const wnc = require('./vendors/wnc.js');
const enlighten = require('./vendors/enlighten.js');
const topcola = require('./vendors/topcola.js');

function writeFile(products) {
  const data = {
    updatedAt: new Date(),
    products: products,
  }
  const jsonContent = JSON.stringify(data, null, 2);
  fs.writeFileSync('../src/assets/data/productsxxx.json', jsonContent, 'utf8');
}

async function run() {

  const prestonProducts = await preston.getAvailableLeafProducts();
  console.log('preston products', prestonProducts.length);

  const flowProducts = await flow.getAvailableLeafProducts();
  console.log('flow products', flowProducts.length);

  const wncProducts = await wnc.getAvailableLeafProducts();
  console.log('wnc products', wncProducts.length);

  const enlightenProducts = await enlighten.getAvailableLeafProducts();
  console.log('enlighten products', enlightenProducts);

  const topcolaProducts = await topcola.getAvailableLeafProducts();
  console.log('top cola products', topcolaProducts);

  const final = [...prestonProducts, ...enlightenProducts, ...flowProducts, ...wncProducts, ...topcolaProducts];
  //const final = [...topcolaProducts];
  // const final = [1, 2, 3];
  writeFile(final, null, 2);


  console.log(`Data has been written to file for ${final.length} products`);

  //upstateHempProducts();


  // sugarTreeHempProducts();

  // artisanHempProducts();

  // hempHopProducts();

  // hempireDirectProducts();

  // hempireStateSmokeProducts();

  // hempireStateSmokeProducts();

  // hempireStateSmokeProducts();

  // industrialHempFarmsProducts();

  //justHempProducts();

  // kushProducts();

  // lulaProducts();




}

run();
