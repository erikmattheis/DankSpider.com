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
const test = require("../vendors/test.js");

const fs = require("fs");

// https://www.reddit.com/r/cannabiscoupons/comments/11apnfz/hemp_flowers_coupons_offers/

async function run(batchId, v, vendorList, numProductsToSave = 1000) {
  console.log(batchId, v, vendorList, numProductsToSave);
  for (const vendor of vendorList) {


    if (!v || vendor.name === v) {
      console.log(`Getting products for ${vendor.name}`);
      const products = await vendor.service.getAvailableLeafProducts(batchId, vendor.name, numProductsToSave);
      console.log(`Saving ${products?.length} products for ${vendor.name}`);
      //await saveProducts(products, batchId);

    }
  }

  console.log('All tasks completed.');
}

module.exports = {
  run,
};
