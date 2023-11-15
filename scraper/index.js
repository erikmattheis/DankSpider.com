const { performance } = require('perf_hooks')
const fs = require('fs')
const { deleteProductsByVendor, getExampleRecordWithUniqueChemicalAsCannabinoid, getProductsByBatchId, fixProducts, deleteAllDocumentsInCollection, cleanProductsCollection, deleteProductsWithObjectsInVariants, thinkAboutCannabinoids, getProductsByPPM, getProductsByTerpene, thinkAboutTerpenes, getProductsByVariant, normalizeVariants, getUniqueTerpenes, getUniqueCannabinoids, getTerpenes, saveArticles, getproducts, getAllProducts, getProductsByVendor, cleanProductsCollections, getUniqueChemicals, saveChemical, normalizeVariantName, saveProducts } = require('./firebase.js')
const scrapers = require('./scrapers.js')
const jpegs = require('./services/jpegs.js')
const { getArticle } = require('./services/ai-author.js')

const batchId = 'a8'

async function makeProductsFile(vendor, limit, useDevCollection) {
  console.log('makeProductsFile', vendor, limit, useDevCollection)
  let products

  if (vendor && useDevCollection) {
    products = await getProductsByVendor(vendor, limit, useDevCollection)
  } else if (vendor) {
    products = await getProductsByVendor(vendor, limit)
  } else {
    products = await getAllProducts()
    console.log('products ->', products.length)
  }

  for (const product of products) {
    console.log(`'${product.title}',`)
  }

  products = products.map(product => {
    product.cannabinoids = filterAssay(product.cannabinoids)
    product.terpenes = filterAssay(product.terpenes)

    return product
  })

  const updatedAt = new Date().toISOString()

  const terpenes = await getTerpenes()

  fs.writeFileSync('../app/src/assets/data/products.json', JSON.stringify({ products, terpenes, updatedAt }))

  console.log(`Wrote ${products.length} products to products.json`)
}

function filterAssay(assay) {
  return assay?.filter(chem => parseFloat(chem.pct) > 0 && chem.name !== 'Unknown')
}

async function makeArticles() {
  const cannabisTerpenes = [
    '1,8 Cineole',
    'Eucalyptol',
    'Bisabolol',
    'Borneol',
    'Camphene',
    'Carene',
    'Caryophyllene',
    'Citral',
    'Dihydrocarveol',
    'Fenchone',
    'Humulene',
    'Limonene',
    'Linalool',
    'Menthol',
    'Myrcene',
    'Nerolidol',
    'Ocimene',
    'Pinene',
    'Pulegone',
    'Terpinene',
    'Terpinolene']

  const strains = ['41 Cherry',
    'Acai Berry Frost',
    'Alien Apple Kush',
    'Alien OG',
    'Alien Sherbet',
    'Alpha Runtz',
    'Apple Tartz',
    'Bacio Gelato',
    'Banana Bread',
    'Bangers + MAC',
    'Berry White x Mango Haze',
    'Billy Kimber',
    'Black Cherry Gelato',
    'Black Mamba',
    'Black Truffle',
    'Black Velvet',
    'Blockberry',
    'Blue Cheese #3',
    'Blue Sunset Sherbert',
    'Blue Unicorn',
    'Blueberry Apple Fritter',
    'Blueberry Cough Drops',
    'Bordeaux',
    'Bread + Butter',
    'Bruce Banner',
    'Caked Up Cherries',
    'Cali Raisin',
    'Cantaloupe',
    'Cap Junkies',
    'Cheetah Piss',
    'Chem Cake',
    'Chem Cookies',
    'Cherry Muffins',
    'Cookie Mintz',
    'Cookies and Cream',
    'Cream Cake',
    'Dante\'s Inferno',
    'Death Star Destroyer',
    'Divine Banana',
    'Do-Si-Dos',
    'Dragon Breath',
    'Dutch Cake',
    'Fabled',
    'Fiji Sunset',
    'Fish Scales',
    'Fried Bananas',
    'Frosted Flakes',
    'Frosted Hog',
    'Frozen Gelato',
    'Gary Payton',
    'Gas Face',
    'Gasteroids',
    'GBJ',
    'Gelato',
    'Georgia Pie',
    'GG #4',
    'Glitter Bomb',
    'GMO',
    'Godfather OG',
    'Goofiez',
    'Granddaddy Purple',
    'Grape Cake (Light Assist)',
    'Grape Gas',
    'Grape Pie',
    'Greenhouse Mixed Smalls (MT)',
    'Gush Mints',
    'Han Solo',
    'Hard Cider',
    'Headband',
    'Honey Bee',
    'Horchata',
    'Ice Cream Cake',
    'Ice Cream Runtz',
    'Ice Cream Waffle Cone',
    'Jack Frost',
    'Jack Herer',
    'Karma 20/20',
    'Key Lime Pie',
    'King Louis Xiii',
    'Kush Mintz',
    'LA Gas Face',
    'LA Sunrise',
    'Lamb’s Bread',
    'Lazarus MAC (Slightly Seeded - )',
    'Lemon Cherry Gelato',
    'Lemon Cherry Sherbet',
    'Lemon Pound Cake',
    'Lemon Vanilla OG (LVOG)',
    'London Pound Cake',
    'MAC 1',
    'Magic Knight',
    'Mellow Melons',
    'Melon Blossoms',
    'Mendo Breath',
    'Milk',
    'Moon Berry',
    'Northern Lights',
    'Olympus Mons Greenhouse',
    'Orange Creamsicle',
    'Orange Crush',
    'Orange Dreamsicle',
    'Orange Glaze #3',
    'Pablo\'s Revenge',
    'Pancakes',
    'Papaya (Light Assist)',
    'Papaya Bomb',
    'Paradise OG',
    'Pixie Stix',
    'Pluto',
    'Point Break (Light Assist)',
    'Pressure Drop',
    'Purple Candy Gas',
    'Purple Galaxy',
    'Purple Gas',
    'Purple Haze',
    'Purple Ice',
    'Purple Kush',
    'Purple Moon Dog',
    'Purple Runtz',
    'Purple Star Diesel',
    'Purple Train Wreck',
    'Rainbow Chips',
    'Rainbow Sherbet #11',
    'Rainbow Zangria',
    'Red Velvet Runts',
    'Reign Man',
    'Royal Octane',
    'Royal Skywalker OG',
    'RS-11',
    'Sex Panther',
    'Shamrock Shake',
    'Sherb Cake',
    'Sherbadough Cookies',
    'Sherbanger',
    'Sherbert',
    'Slurple',
    'Slurricane',
    'Smuckers Jelly Pie',
    'Snow Man',
    'Sour Garlic Cookies',
    'Sour Melon',
    'Sour Sex Wax',
    'Sour Tsunami',
    'Sourdough Cookies',
    'Star OG',
    'Strawberry Kush',
    'Strawberry Melon Diesel',
    'Super Boof',
    'Super Buff Cherry',
    'Super Cheese Diesel',
    'Super Lemon Cherry Gelato',
    'Super Mochi',
    'Tacky Glue',
    'Tangerine Dream',
    'Thin Mintz',
    'Tiny OG',
    'Triple Cake',
    'Truffleupagus',
    'Wappa',
    'Wedding Cake',
    'White Burgundy',
    'White Runtz',
    'White Tahoe Cookies',
    'White Truffle',
    'Zhits Fire',
    'Zkittles',
    'Zkittlez Cake',]
  const terpenes = []
  const updatedAt = new Date().toISOString()
  for (const strain of strains) {
    const result = await getArticle(strain, 500)
    await saveArticles([result])
    terpenes.push(result)
  }

  // console.log(`Wrote ${terpenes.length} terpenes to Firebase`);
}

async function makeTerpenesFile() {
  const result = await getTerpenes()
  fs.writeFileSync('../app/src/assets/data/terpenes.json', JSON.stringify(result))
  // console.log(`Wrote ${result.length} terpenes to terpenes.json`);
}

async function run(batchId, vendor) {

  let startTime = performance.now()

  await scrapers.run(batchId, vendor)

  let endTime = performance.now()

  console.log(`Scraping took ${((endTime - startTime) / 1000).toFixed(2)} seconds`)

  startTime = performance.now()

  //await cleanProductsCollections()

  endTime = performance.now()

  console.log(`Deleting old duplicates took ${((endTime - startTime) / 1000).toFixed(2)} seconds`)

  startTime = performance.now()
  // await makeProductsFile()
  endTime = performance.now()

  console.log(`Making JSON file took ${((endTime - startTime) / 1000).toFixed(2)} seconds`)
}

// run(batchId, 'ppm')


async function utils() {

  // await thinkAboutCannabinoids()

  await scrapers.testOCR()

  // const cans = await getUniqueCannabinoids();

  //console.log(JSON.stringify(cans, null, 2));

  // await cleanProductsCollections()
  // await makeProductsFile()
  //await makeArticles();
  console.log('done')
}

utils()


