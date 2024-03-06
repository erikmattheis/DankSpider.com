const { getTestResults, getAllProducts, saveStats, getProductsByBatchId } = require('./firebase.js');

async function makeStats(batchId, p = null) {

  let products;

  if (!p) {
    //products = await await getProductsByBatchId(batchId);
    products = await getTestResults();
    // add vendor to each product

    products = products.map(p => {
      p.vendor = p.vendor || 'Test';
      return p;
    });

  }
  else {
    products = [...products];
  }

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
        totalTerpenes: 0,
        totalTerpenesWithValues: 0
      };
    }

    vendors[product.vendor].totalProducts += 1;

    totalProducts += 1;

    if (product?.result?.cannabinoids?.length) {

      vendors[product.vendor].totalCannabinoids += product.result?.cannabinoids.length;
      totalCannabinoids += product.result?.cannabinoids.length;
      vendors[product.vendor].totalCannabinoidsWithValues += product?.result?.cannabinoids.filter(c => Number(c?.pct) > 0).length;
      totalCannabinoidsWithValues += product.result?.cannabinoids.filter(c => Number(c?.pct) > 0).length;
    }
    if (product?.result?.terpenes?.length) {
      vendors[product.vendor].totalTerpenes += product.result?.terpenes.length;
      totalTerpenes += product.result?.terpenes.length;
      vendors[product.vendor].totalTerpenesWithValues += product.result?.terpenes.filter(c => Number(c?.pct) > 0).length;
      totalTerpenesWithValues += product?.result?.terpenes?.filter(t => Number(t?.pct) > 0).length;
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