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
        vendor: product.vendor,
        numProducts: 0,
        numCannabinoids: 0,
        numCannabinoidsWithValues: 0,
        numTerpenes: 0,
        numTerpenesWithValues: 0
      };
    }

    vendors[product.vendor].numProducts += 1;

    totalProducts += 1;

    vendors[product.vendor].numCannabinoids += product?.cannabinoids?.length ? product?.cannabinoids?.length : 0;

    totalCannabinoids += product?.cannabinoids?.filter ? product?.cannabinoids?.filter(c => typeof c?.pct === 'string' && Number(c?.pct) > 0).length : 0;

    vendors[product.vendor].numCannabinoidsWithValues += product?.cannabinoids?.filter ? product?.cannabinoids.filter(c => typeof c?.pct === 'string' && Number(c?.pct) > 0).length : 0;

    totalCannabinoidsWithValues += product?.cannabinoids?.filter ? product?.cannabinoids?.filter(c => typeof c?.pct === 'string' && Number(c?.pct) > 0).length : 0;

    vendors[product.vendor].numTerpenes += product?.terpenes?.length ? product?.terpenes?.length : 0;

    totalTerpenes += product?.terpenes?.filter ? product?.terpenes?.filter(t => typeof t?.pct === 'string' && Number(t?.pct) > 0).length : 0;

    vendors[product.vendor].numTerpenesWithValues += product?.terpenes?.filter ? product.terpenes?.filter(t => typeof t?.pct === 'string' && Number(t?.pct) > 0).length : 0;

    totalTerpenesWithValues += product?.terpenes?.filter ? product?.terpenes?.filter(t => typeof t?.pct === 'string' && Number(t?.pct) > 0).length : 0;

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