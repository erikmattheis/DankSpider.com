const fs = require('fs');

// const scraper = require('./services/scraper.js');

//const flow = require('./vendors/flow.js');
//const wnc = require('./vendors/wnc.js');
const enlighten = require('./vendors/enlighten.js');



function writeFile(products) {
  const jsonContent = JSON.stringify(products, null, 2);
  fs.writeFileSync('../src/assets/data/products.json', jsonContent, 'utf8');
}

async function run() {

  /*
  const flowProducts = await flow.getAvailableLeafProducts();
  console.log('flow products', flowProducts.length);

  const wncProducts = await wnc.getAvailableLeafProducts();
  console.log('wnc products', wncProducts.length);

*/
  const enlightenProducts = await enlighten.getAvailableLeafProducts();
  console.log('enlighten products', enlightenProducts.length);

  writeFile(JSON.stringify(enlightenProducts));






  //const products = [...flowProducts, ...wncProducts, ...enlightenProducts];

  // const enlightenProducts = await enlighten.getAvailableLeafProducts();
  //console.log(enlightenProducts);
  // const products = [];

  // writeFile(enlightenProducts);

  // console.log(`Data has been written to file for ${enlightenProducts.length} products`);

  //upstateHempProducts();

  // prestoHempProducts();

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
