const { getAllProducts } = require('./firebase.js');
const { saveStats } = require('./firebase.js');



async function makeStats() {
  const products = await getAllProducts();

  const vendors = {};

  let totalProducts = 0;
  let totalCannabinoids = 0;
  let totalCannabinoidsWithValues = 0;
  let totalTerpenes = 0;
  let totalTerpenesWithValues = 0;;

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
    totalProducts += 1;
    vendors[product.vendor].numCannabinoids += product?.cannabinoids?.length ? product?.cannabinoids?.length : 0;
    totalCannabinoids += product?.cannabinoids?.length ? product?.cannabinoids?.length : 0;
    vendors[product.vendor].numCannabinoidsWithValues += product.cannabinoids?.filter ? product.cannabinoids.filter(c => c.pct > 0).length : 0;
    totalCannabinoidsWithValues += product.cannabinoids?.filter(c => c.pct > 0).length;
    vendors[product.vendor].numTerpenes += product.terpenes?.length;
    totalTerpenes += product.terpenes?.filter(t => t.pct > 0).length;
    vendors[product.vendor].numTerpenesWithValues += product.terpenes?.filter ? product.terpenes?.filter(t => t.pct > 0).length : 0;
    totalTerpenesWithValues += product.terpenes?.filter(c => c.pct > 0).length;

  }

  console.log('numProducts', totalProducts)
  console.log('numCannabinoids', totalCannabinoids, (totalCannabinoids/totalProducts).toFixed(2));
  console.log('numCannabinoidsWithValues', totalCannabinoidsWithValues, (totalCannabinoidsWithValues/totalProducts).toFixed(2));
  console.log('numTerpenes', totalTerpenes);
  console.log('numTerpenesWithValues', totalTerpenesWithValues, (totalTerpenesWithValues/totalProducts).toFixed(2));

  saveStats(vendors);

}

module.exports = {
  makeStats,
};