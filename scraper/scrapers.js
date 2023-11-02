const { saveProducts } = require('./firebase.js')

const preston = require('./vendors/preston.js')
const flow = require('./vendors/flow.js')
const wnc = require('./vendors/wnc.js')
const enlighten = require('./vendors/enlighten-weebly-few-products.js')
const topcola = require('./vendors/topcola.js')
const arete = require('./vendors/arete.js')
const drGanja = require('./vendors/drganja.js')

const fs = require('fs')

fs.writeFileSync('./temp/errors.txt', '')
fs.writeFileSync('./temp/no-buffer.txt', '')
fs.writeFileSync('./temp/unknownCannabinoidSpellings.txt', '')
fs.writeFileSync('./temp/unknownTerpinoidSpellings.txt', '')
fs.writeFileSync('./temp/reached-end.txt', '')

function logErrorToFile (str) {
  if (process.env.NODE_ENV !== 'production') {
    fs.appendFileSync('./temp/errors.txt', str + '\n\n')
  }
}

async function run (batchId, vendor) {

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
    */

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

  if(!vendor || vendor === 'Enlighten') {

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
  run
}
