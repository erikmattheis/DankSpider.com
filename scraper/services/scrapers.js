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

const scan = [
  // Dr Ganja Cannabinoids
//   "https://cdn.drganja.com/wp-content/uploads/2023/05/Tropaya-Cannabinoids-Certificate-of-Analysis-1184x1536.jpg",
  // Dr Ganja Terpenes
//  "https://www.drganja.com/wp-content/uploads/2023/09/Dr.Ganja-Mellow-Melons-Terpenes-Certificate-of-Analysis.jpg",
  // Dr Ganja Terpenes 2
 // "https://www.drganja.com/wp-content/uploads/2019/10/Dr.Ganja-The-White-CBG-Hemp-Terpenes-Certificate-of-Analysis-scaled.jpg",
  //wnc cannabinoids
  "https://cdn11.bigcommerce.com/s-mpabgyqav0/images/stencil/1280x1280/products/389/3613/Indoor_-_THCa_Fiji_Sunset_Hydro_Potency__20263.1696444987.jpg?c=1",
  //wnc terpenes
  "https://cdn11.bigcommerce.com/s-mpabgyqav0/images/stencil/1280x1280/products/389/3614/Indoor_-_THCa_Fiji_Sunset_Hydro_Terpenes__14542.1696444987.jpg?c=1",
];

async function testOCR() {
  for (const url of scan) {
    logger.log({
      level: "info",
      message: `url: ${url}`,
    });
    const result = await recognize(url);
    logger.log({
      level: "info",
      message: `result: ${JSON.stringify(result, null, 2)}`,
    });
  }
}

function logErrorToFile(str) {
  if (process.env.NODE_ENV !== "production") {
    fs.appendFileSync("./temp/errors.txt", str + "\n\n");
  }
}

async function run(batchId, vendor) {

  if (!vendor || vendor === 'PPM') {

    try {
      //const doit = await ppm.recordAssays()
      const ppmProducts = await ppm.getAvailableLeafProducts()

     await saveProducts(ppmProducts, batchId)
    } catch (error) {
      logger.error(error)
      logErrorToFile(error)
    }

  }

    if (!vendor || vendor === "Arete") {
    try {
      const areteProducts = await arete.getAvailableLeafProducts();

      await saveProducts(areteProducts, batchId);
    } catch (error) {
      logger.error(error);
      logErrorToFile(error);
    }
  }


  if (!vendor || vendor === 'drGanja') {

    try {
      const drGanjaProducts = await drGanja.getAvailableLeafProducts()

      await saveProducts(drGanjaProducts, batchId)
    } catch (error) {
      logger.error(error)
      logErrorToFile(error)
    }
  }


    if (false || !vendor || vendor === 'WNC') {
      try {
        const wncProducts = await wnc.getAvailableLeafProducts()

        await saveProducts(wncProducts, batchId)
      } catch (error) {
        logger.error(error)
        logErrorToFile(error)
      }

    }



  if (!vendor || vendor === 'Preston') {
    try {
      const prestonProducts = await preston.getAvailableLeafProducts()

      await saveProducts(prestonProducts, batchId)
    } catch (error) {
      logger.error(error)
      logErrorToFile(error)
    }
  }
/*
  if (!vendor || vendor === 'Flow') {

    try {
      const flowProducts = await flow.getAvailableLeafProducts()

      await saveProducts(flowProducts, batchId)
    } catch (error) {
      logger.error(error)

      logErrorToFile(error)
    }
  }



    if (!vendor || vendor === 'Enlighten') {

      try {
        const enlightenProducts = await enlighten.getAvailableLeafProducts()

        await saveProducts(enlightenProducts, batchId)
      } catch (error) {
        logger.error(error)
        logErrorToFile(error)
      }
    }
*/
  if ((!vendor || vendor === 'TopCola')) {

    try {
      const topcolaProducts = await topcola.getAvailableLeafProducts()

      await saveProducts(topcolaProducts, batchId)
    } catch (error) {
      logger.error(error)
      logErrorToFile(error)
    }

    logger.log({
    level: 'info',
    message: `Data has been written to Firebase for all vendors.`
    })
  }

}

module.exports = {
  run,
  testOCR,
};
