const { saveProducts } = require("./firebase.js");

const ppm = require("../vendors/ppm.js");
const preston = require("../vendors/preston.js");
const flow = require("../vendors/flow.js");
const wnc = require("../vendors/wnc.js");
const enlighten = require("../vendors/enlighten-weebly-few-products.js");
const topcola = require("../vendors/topcola.js");
const arete = require("../vendors/arete.js");
const drGanja = require("../vendors/drganja.js");


const hch = require("../vendors/hch.js");
const hcf = require("../vendors/hcf.js");

const fs = require("fs");

// https://www.reddit.com/r/cannabiscoupons/comments/11apnfz/hemp_flowers_coupons_offers/

function numVendors(vendors) {
  let num = 0;
  for (const vendor in vendors) {
    num += vendorList[vendor] > 0 ? 1 : 0;
  }
  return num;
}

function logErrorToFile(str) {
  if (process.env.NODE_ENV !== "production") {
    fs.appendFileSync("./temp/errors.txt", str + "\n\n");
  }
}

async function run(batchId, vendor, vList) {

  let vendorList;
  if (vList && vList.length) {
    vendorList = vList
  }
  else {
    vendorList = [
      { name: 'PPM', service: ppm },
      { name: 'Arete', service: arete },
      { name: 'drGanja', service: drGanja },
      { name: 'WNC', service: wnc },
      { name: 'Preston', service: preston },
      { name: 'TopCola', service: topcola },
      { name: 'HCH', service: hch },
      { name: 'HCF', service: hcf },
    ];
  }

  let tasks;

  if (vendorList && vendorList.length) {
    console.log(`1 Getting products for ${vendorList.length} vendors`);
    tasks = vendorList
      .filter(v => !vendor || v.name === vendor) // Only process the passed vendor
      .map(async (v) => {

        let products;
        console.log('um', v.service.getAvailableLeafProducts)
        try {
          console.log(`2 Getting products for ${v.name}`);

          products = await v.service.getAvailableLeafProducts(batchId, v);
          console.log(`Got ${products.length} products for ${v.name}`);
        } catch (error) {
          console.error(`Error getting products for ${v.name}: ${error}`);
        }

        if (!products || !products.length) {
          console.log(`No products found for ${v.name} on batch ${batchId}`);
          logErrorToFile(`No products found for ${v.name} on batch ${batchId}`);
          return; // Return early if no products
        }

        console.log(`Saving ${products.length} products for ${vendor.name}`);

        await saveProducts(products, batchId);
      });
  } else {
    console.log(`3 Getting products for ${vendorList.length} vendors`);
    console.log('um', v.service.getAvailableLeafProducts)
    tasks = vList
      .filter(({ name }) => !vendor || name === vendor) // Only process the passed vendor
      .map(({ service }) => {
        return (async () => {
          console.log(`4 Getting products for ${service.name}`);
          const products = await service.getAvailableLeafProducts(batchId, vendor);

          if (!products || !products.length) {
            return; // Return early if no products
          }
          await saveProducts(products, batchId);

        })();
      });
  }

  await Promise.all(tasks);

  return;

}

module.exports = {
  run,
};
