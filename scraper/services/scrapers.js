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

async function run(batchId, v, vendorList, numProductsToSave = 1000) {

  for (const vendor of vendorList) {

    console.log(`Getting products for ${v}`);

    if (!v || v === vendor.name) {
      return (async () => {

        try {
          const products = await vendor.service.getAvailableLeafProducts(batchId, vendor.name, numProductsToSave);
          console.log(`Saving ${products?.length} products for ${vendor.name}`);
          await saveProducts(products, batchId);
        } catch (error) {
          console.error(`Error processing ${vendor.name}: ${error}`);
        }
      })();
    }
  }

  console.log('All tasks completed.');
}

module.exports = {
  run,
};
