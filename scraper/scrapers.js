const { saveProducts } = require('./firebase.js')

const ppm = require('./vendors/ppm.js')
const preston = require('./vendors/preston.js')
const flow = require('./vendors/flow.js')
const wnc = require('./vendors/wnc.js')
const enlighten = require('./vendors/enlighten-weebly-few-products.js')
const topcola = require('./vendors/topcola.js')
const arete = require('./vendors/arete.js')
const drGanja = require('./vendors/drganja.js')
const { recognize } = require('./services/ocr.js')
const { transcribeAssay } = require('./services/cortex.js')
const fs = require('fs')

// https://www.reddit.com/r/cannabiscoupons/comments/11apnfz/hemp_flowers_coupons_offers/

const scan = [
  // Dr Ganja Cannabinoids
  'https://www.drganja.com/wp-content/uploads/2023/09/Dr.Ganja-Mellow-Melons-Cannabinoids-Certificate-of-Analysis.jpg',
  // Dr Ganja Terpenes
  'https://www.drganja.com/wp-content/uploads/2023/09/Dr.Ganja-Mellow-Melons-Terpenes-Certificate-of-Analysis.jpg',
  // Dr Ganja Terpenes 2
  'https://www.drganja.com/wp-content/uploads/2019/10/Dr.Ganja-The-White-CBG-Hemp-Terpenes-Certificate-of-Analysis-scaled.jpg',
  //wnc cannabinoids
  'https://cdn11.bigcommerce.com/s-mpabgyqav0/images/stencil/1280x1280/products/389/3613/Indoor_-_THCa_Fiji_Sunset_Hydro_Potency__20263.1696444987.jpg?c=1',
  //wnc terpenes
  'https://cdn11.bigcommerce.com/s-mpabgyqav0/images/stencil/1280x1280/products/389/3614/Indoor_-_THCa_Fiji_Sunset_Hydro_Terpenes__14542.1696444987.jpg?c=1'
];

async function testOCR() {
  for (const url of scan) {
    console.log('url', url)
    const result = await recognize(url)

    fs.appendFileSync('./temp/assay.txt', `${url}\n${result?.length}\n\n`, null, 2)
    console.log('result:', result)
  }
}

function logErrorToFile(str) {
  if (process.env.NODE_ENV !== 'production') {
    fs.appendFileSync('./temp/errors.txt', str + '\n\n')
  }
}

async function run(batchId, vendor) {

  if (!vendor || vendor === 'ppm') {

    try {
      const ppmProducts = await ppm.getAvailableLeafProducts()
      console.log('PPM products', ppmProducts.length)
      await saveProducts(ppmProducts, batchId)
    } catch (error) {
      console.error(error)
      logErrorToFile(error)
    }


  }

  /*

  if (!vendor || vendor === 'drGanja') {

    try {
      const drGanjaProducts = await drGanja.getAvailableLeafProducts()
      console.log('Dr Ganja products', drGanjaProducts.length)
      await saveProducts(drGanjaProducts, batchId)
    } catch (error) {
      console.error(error)
      logErrorToFile(error)
    }


  }
    

  if (!vendor || vendor === 'WNC') {
    try {
      const wncProducts = await wnc.getAvailableLeafProducts()
      console.log('WNC products', wncProducts.length)
      await saveProducts(wncProducts, batchId)
    } catch (error) {
      console.error(error)
      logErrorToFile(error)
    }

  }
  
  */

  if (!vendor || vendor === 'Preston') {
    try {
      const prestonProducts = await preston.getAvailableLeafProducts()
      console.log('Preston products', prestonProducts.length)
      await saveProducts(prestonProducts, batchId)
    } catch (error) {
      console.error(error)
      logErrorToFile(error)
    }
  }

  if (!vendor || vendor === 'Flow') {

    try {
      const flowProducts = await flow.getAvailableLeafProducts()
      console.log('Flow products', flowProducts.length)
      await saveProducts(flowProducts, batchId)
    } catch (error) {
      console.error(error)

      logErrorToFile(error)
    }
  }

  if (!vendor || vendor === 'Arete') {
    try {
      console.log('Artete products')
      const areteProducts = await arete.getAvailableLeafProducts()
      console.log('Artete products', areteProducts.length)
      await saveProducts(areteProducts, batchId)
    } catch (error) {
      console.error(error)
      logErrorToFile(error)
    }
  }

  if (!vendor || vendor === 'Enlighten') {

    try {
      const enlightenProducts = await enlighten.getAvailableLeafProducts()
      console.log('Enlighten products', enlightenProducts.length)
      await saveProducts(enlightenProducts, batchId)
    } catch (error) {
      console.error(error)
      logErrorToFile(error)
    }
  }

  if ((!vendor || vendor === 'TopCola')) {

    try {
      const topcolaProducts = await topcola.getAvailableLeafProducts()
      // console.log('Top Cola products', topcolaProducts.length);
      await saveProducts(topcolaProducts, batchId)
    } catch (error) {
      console.error(error)
      logErrorToFile(error)
    }

    console.log('Data has been written to Firebase for all vendors.')
  }
}


module.exports = {
  run,
  testOCR
}
