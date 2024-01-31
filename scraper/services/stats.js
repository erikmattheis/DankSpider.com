const { getAllProducts } = require('./firebase.js');
const { saveStats } = require('./firebase.js');



async function makeStats() {
  const products = await getAllProducts();

  const vendors = {};

  for (const product of products) {

    const numCannabinoids = product.cannabinoids?.length;
    const numCannabinoidsWithValues = product.cannabinoids?.filter(c => c.pct > 0).length;
    const numTerpenes = product.terpenes?.length;
    const numTerpenesWithValues = product.terpenes?.filter(t => t.pct > 0).length;

    if (!vendors[product.vendor]) {
      vendors[product.vendor] = {
        numProducts: 0,
        numCannabinoids: 0,
        numCannabinoidsWithValues: 0,
        numTerpenes: 0,
        numTerpenesWithValues: 0,
      }
    }

    vendors[product.vendor].numProducts++;
    vendors[product.vendor].numCannabinoids += numCannabinoids;
    vendors[product.vendor].numCannabinoidsWithValues += numCannabinoidsWithValues;
    vendors[product.vendor].numTerpenes += numTerpenes;
    vendors[product.vendor].numTerpenesWithValues += numTerpenesWithValues;

  }

  saveStats(vendors);

  console.log('stats', vendors);

}

module.exports = {
  makeStats,
};