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


async function run(batchId, v, vendorList) {

  for (const vendor of vendorList) {
    console.log(vendor);
    console.log(`Getting products ${v} for ${vendor}`);

    if (!v || v === vendor.name) {
      console.log(vendor.service);
      const products = await vendor.service.getAvailableLeafProducts(batchId, vendor.name);

      console.log(`Got ${products?.length} products for ${vendor.name}`);


      await saveProducts(products, batchId);
    }
  }

  return;
}
module.exports = {
  run,
};
