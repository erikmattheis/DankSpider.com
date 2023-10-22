const { saveProducts } = require('./firebase.js')

const preston = require('./vendors/preston.js')
const flow = require('./vendors/flow.js')
const wnc = require('./vendors/wnc.js')
const enlighten = require('./vendors/enlighten.js')
const topcola = require('./vendors/topcola.js')
const arete = require('./vendors/arete.js')
const drGanja = require('./vendors/drganja.js')

const fs = require('fs')

function logErrorToFile (str) {
  if (process.env.NODE_ENV !== 'production') {
    fs.appendFileSync('errors.txt', str + '\n\n\n')
  }
}

async function run (uuid) {
  try {
    const drGanjaProducts = await drGanja.getAvailableLeafProducts()
    console.log('Dr Ganja products', drGanjaProducts.length)
    await saveProducts(drGanjaProducts, uuid)
  } catch (error) {
    console.error(error)

    logErrorToFile(error)
  }

  try {
    const wncProducts = await wnc.getAvailableLeafProducts()
    console.log('WNC products', wncProducts.length)
    await saveProducts(wncProducts, uuid)
  } catch (error) {
    console.error(error)

    logErrorToFile(error)
  }

  try {
    const prestonProducts = await preston.getAvailableLeafProducts()
    console.log('Preston products', prestonProducts.length)
    await saveProducts(prestonProducts, uuid)
  } catch (error) {
    console.error(error)

    logErrorToFile(error)
  }

  try {
    const flowProducts = await flow.getAvailableLeafProducts()
    console.log('Flow products', flowProducts.length)
    await saveProducts(flowProducts, uuid)
  } catch (error) {
    console.error(error)

    logErrorToFile(error)
  }

  try {
    console.log('Artete products')
    const areteProducts = await arete.getAvailableLeafProducts()
    console.log('Artete products', areteProducts.length)
    await saveProducts(areteProducts, uuid)
  } catch (error) {
    console.error(error)

    logErrorToFile(error)
  }

  try {
    const enlightenProducts = await enlighten.getAvailableLeafProducts()
    console.log('Enlighten products', enlightenProducts.length)
    await saveProducts(enlightenProducts, uuid)
  } catch (error) {
    console.error(error)

    logErrorToFile(error)
  }

  try {
    const topcolaProducts = await topcola.getAvailableLeafProducts()
    // console.log('Top Cola products', topcolaProducts.length);
    await saveProducts(topcolaProducts, uuid)
  } catch (error) {
    console.error(error)

    logErrorToFile(error)
  }

  console.log('Data has been written to Firebase for all vendors.')
}

module.exports = {
  run
}
