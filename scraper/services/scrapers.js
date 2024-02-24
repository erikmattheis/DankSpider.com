const { saveProducts } = require("./firebase.js");

const ppm = require("../vendors/ppm.js");
const preston = require("../vendors/preston.js");
const flow = require("../vendors/flow.js");
const wnc = require("../vendors/wnc.js");
const enlighten = require("../vendors/enlighten-weebly-few-products.js");
const topcola = require("../vendors/topcola.js");
const arete = require("../vendors/arete.js");
const drGanja = require("../vendors/drganja.js");
const { recognize } = require("./ocr.js");
const fs = require("fs");
const logger = require("./logger.js");

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
    tasks = vendorList.map(async (vendor) => {
      const products = await vendor.service.getAvailableLeafProducts(batchId, vendor);

      if (!products || !products.length) {
        logErrorToFile(`No products found for ${vendor.name} on batch ${batchId}`);
        return; // Return early if no products
      }

      console.log(`Saving ${products.length} products for ${vendor.name}`);

      return await saveProducts(products, batchId);
    });
  } else {
    tasks = vList
      .filter(({ name }) => !vendor || vendor === name)
      .map(({ service }) => {
        return (async () => {
          const products = await service.getAvailableLeafProducts(batchId, vendor);

          if (!products || !products.length) {
            return; // Return early if no products
          }

          return await saveProducts(products, batchId);
        })();
      });
  }

  await Promise.all(tasks);

}

module.exports = {
  run,
};
