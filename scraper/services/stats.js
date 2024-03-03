const { getAllProducts, saveStats } = require('./firebase.js');

async function makeStats() {
  const products = await getAllProducts('products');

  const vendors = {};

  let totalProducts = 0;
  let totalCannabinoids = 0;
  let totalCannabinoidsWithValues = 0;
  let totalTerpenes = 0;
  let totalTerpenesWithValues = 0;;

  for (const product of products) {

    if (!vendors[product.vendor]) {
      vendors[product.vendor] = {
        vendor: product.vendor,
        totalProducts: 0,
        totalCannabinoids: 0,
        totalCannabinoidsWithValues: 0,
        totalmTerpenes: 0,
        totalTerpenesWithValues: 0
      };
    }

    vendors[product.vendor].totalProducts += 1;

    totalProducts += 1;

    if (product?.cannabinoids?.filter && product?.terpenes?.filter) {

      vendors[product.vendor].titalCannabinoids += product.cannabinoids.length;
      vendors[product.vendor].totalTerpenes += product.terpenes.length;

      totalCannabinoids += product.cannabinoids.length;
      totalTerpenes += product.terpenes.length;

      vendors[product.vendor].totalCannabinoidsWithValues += product?.cannabinoids.filter(c => Number(c?.pct) > 0).length;
      vendors[product.vendor].totalTerpenesWithValues += product.terpenes.filter(c => Number(c?.pct) > 0).length;

      totalCannabinoidsWithValues += product.cannabinoids.filter(c => Number(c?.pct) > 0).length;
      totalTerpenesWithValues += product?.terpenes?.filter(t => Number(t?.pct) > 0).length;
    }

  }

  for (const vendor in vendors) {
    console.log(vendor, vendors[vendor]);
  }

  console.log('Total Products', totalProducts);
  console.log('Total Cannabinoids', totalCannabinoids, (totalCannabinoids / totalProducts).toFixed(2));
  console.log('Total CannabinoidsWithValues', totalCannabinoidsWithValues, (totalCannabinoidsWithValues / totalProducts).toFixed(2));
  console.log('Total Terpenes', totalTerpenes, (totalTerpenes / totalProducts).toFixed(2));
  console.log('Total TerpenesWithValues', totalTerpenesWithValues, (totalTerpenesWithValues / totalProducts).toFixed(2));

  saveStats(vendors);

}

module.exports = {
  makeStats,
};