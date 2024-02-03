const { getAllProducts } = require('./firebase.js');
const { saveStats } = require('./firebase.js');



async function makeStats() {
  const products = await getAllProducts();

  const vendors = {};

  let numProducts = 0;
  let numCannabinoids = 0;
  let numCannabinoidsWithValues = 0;
  let numTerpenes = 0;
  let numTerpenesWithValues = 0;;

  for (const product of products) {

    if (!vendors[product.vendor]) {
      vendors[product.vendor] = {
        numProducts: 0,
        numCannabinoids: 0,
        numCannabinoidsWithValues: 0,
        numTerpenes: 0,
        numTerpenesWithValues: 0
      };
    }

    vendors[product.vendor].numProducts += 1
    numProducts += 1;
    vendors[product.vendor].numCannabinoids += product.cannabinoids?.length
    numCannabinoids += numCannabinoids;
    vendors[product.vendor].numCannabinoidsWithValues += product.cannabinoids && product.cannabinoids.filter? product.cannabinoids?.filter(c => c.pct > 0).length : 0;
    numCannabinoidsWithValues += product.cannabinoids?.filter(c => c.pct > 0).length;
    vendors[product.vendor].numTerpenes += product.terpenes?.length;
    numTerpenes++;
    vendors[product.vendor].numTerpenesWithValues += product.terpenes && product.terpenes.filter ? product.terpenes?.filter(t => t.pct > 0).length : 0;
    numTerpenesWithValues++;

  }

  console.log( vendors);

  console.log('numProducts', numProducts)
  console.log('numCannabinoids', numCannabinoids, (numCannabinoids/numProducts).toFixed(2));
  console.log('numCannabinoidsWithValues', numCannabinoidsWithValues, (numCannabinoidsWithValues/numProducts).toFixed(2));
  console.log('numTerpenes', numTerpenes);
  console.log('numTerpenesWithValues', numTerpenesWithValues, (numTerpenesWithValues/numProducts).toFixed(2));

  saveStats(vendors);

}

module.exports = {
  makeStats,
};