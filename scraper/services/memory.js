const gm = require("gm");
const axios = require("../services/rateLimitedAxios");
const fs = require("fs");
const logger = require('../services/logger.js');
const { getAllProducts } = require('./firebase.js');


function jpgNameFromUrl(url) {
  const name = url.split('/').pop().split('#')[0].split('?')[0];
  return name.endsWith('.jpg') ? name : `${name}.jpg`;
}

const path = require('path');

async function getBuffer(url) {
  const name = makeImageName(url);

  const dir = path.join(__dirname, '../temp/scan');
  const filePath = path.join(dir, name);

  if (fs.existsSync(filePath)) {
    buffer = fs.readFileSync(filePath);
  } else {
    buffer = await getImageBuffer(url);
    fs.writeFileSync(filePath, buffer);
  }

  return buffer;
}

function makeImageName(url) {
  const name = jpgNameFromUrl(url)

  const domain = url.split('/')[2] ? url.split('/')[2] : 'unknown'

  return `${domain}_${name}`
}

async function getImageBuffer(url) {

  try {
    console.log('buffer img url', utl)
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data, 'binary');

    if (!buffer || buffer.length === 0) {
      logger.error(`Error getting image buffer: ${url}`);
      return null
    } else {
      return buffer

    }

  } catch (error) {

    logger.error(`Error around getImageBuffer: ${error}`);

    fs.appendFileSync('./temp/errors.txt', `\nUrl: ${url}\n${JSON.stringify(error, null, 2)}\n\n`)

  }

}

async function makeProductsFile(vendor, limit, useDevCollection) {

  let products = await getAllProducts()

  products = products.map(product => {
    product.cannabinoids = filterAssay(product.cannabinoids)
    product.terpenes = filterAssay(product.terpenes)
    return product
  })

  const updatedAt = new Date().toISOString()

  fs.writeFileSync('../app/src/assets/data/products.json', JSON.stringify({ products, updatedAt }))

  logger.log({ level: 'info', message: `Wrote ${products.length} products to products.json` });
}


const cannabinoidSpellings = {
  'CBDA*': { name: 'CBDA', confidence: 0.9 },
  'CBD*': { name: 'CBD', confidence: 0.99 },
  'THCA*': { name: '∆-9-THCA', confidence: 0.99 },
  'THCVa': { name: '∆-9-THCVA', confidence: 0.99 },
  'THCA*®': { name: '∆-9-THCA', confidence: 0.99 },
  'A-9-Tetrahydrocannabiphorel': { name: '∆-9-THCP', confidence: 0.99 },
  '-A-10-Tetrahydrocannabinol': { name: 'S-∆-10-THC', confidence: 1 },
  '?5-Hexatydrocarrabiacl': { name: '9S-HHC', confidence: 0.9 },
  '∆-9 THC': { name: '∆-9-THC', confidence: 0.99 },
  '∆-9 THCA': { name: '∆-9-THCA', confidence: 0.99 },
  '$-A-10-Tetrahydrocannabinol': { name: 'S-∆-10-THC', confidence: 1 },
  '4-8-Tetrahydrocannabinol': { name: '∆-8-THC', confidence: 1 },
  '4-9-Tetrahydrocannabinol': { name: '∆-9-THC', confidence: 1 },
  '4-9-Tetrahydrocannabinolic': { name: '∆-9-THCA', confidence: 1 },
  '75-Hexatydrocarrabiscl': { name: '9S-HHC', confidence: 0.9 },
  '75%-Henatydrocarrabingl': { name: '9S-HHC', confidence: 0.9 },
  '9-S-HHC': { name: '9S-HHC', confidence: 0.99 },
  '95-Hexahydracannabinal': { name: '9S-HHC', confidence: 0.9 },
  '95-Hexahydrocannabinol': { name: '9S-HHC', confidence: 1 },
  '95-Hexatydrocarrabisol': { name: '9S-HHC', confidence: 0.9 },
  '9R-Hexahydrocannabinol': { name: '9R-HHC', confidence: 1 },
  '9R-HHC': { name: '9R-HHC', confidence: 0.99 },
  '9S-Hexahydrocannabinol': { name: '9S-HHC', confidence: 0.9 },
  'A-8-Tetrahydrocannabinol (A-8 THC)': { name: '∆-8-THC', confidence: 0.99 },
  'A-8-Tetrahydrocannabinol': { name: '∆-8-THC', confidence: 0.99 },
  'A-9-Tetrahydrocannabinol (A-9 THC)': { name: '∆-9-THC', confidence: 0.99 },
  'A-9-Tetrahydrocannabinol Acetate (A-9-THCO)': { name: '∆-9-THCO', confidence: 0.99 },
  'THCO': { name: '∆-9-THCO', confidence: 0.99 },
  'A-9-Tetrahydrocannabinol': { name: '∆-9-THC', confidence: 0.99 },
  'A-9-Tetrahydrocannabinolic Acid (THCA-A)': { name: '∆-9-THCA', confidence: 0.99 },
  'A-9-Tetrahydrocannabinolic': { name: '∆-9-THCA', confidence: 0.99 },
  'A-9-Tetrahydrocannabiphorol (A-9-THCP)': { name: '∆-9-THCP', confidence: 0.99 },
  'A-9-Tetrahydrocannabiphorol': { name: 'THCP', confidence: 1 },
  'A-9-Tetrahydrocannabivarin (A-9-THCV)': { name: '∆-9-THCV', confidence: 0.99 },
  'A-9-Tetrahydrocannabivarin': { name: 'THCV', confidence: 1 },
  'A-9-Tetrahydrocannabivarinic Acid (A-9-THCVA)': { name: '∆-9-THCVA', confidence: 0.99 },
  'A-9-Tetrahydrocannabivarinic': { name: '∆-9-THCVA', confidence: 1 },
  'A8-THC': { name: '∆-8-THC', confidence: 0.99 },
  'A9-THC': { name: '∆-9-THC', confidence: 0.99 },
  'A9-THCA-A': { name: '∆-9-THCA', confidence: 0.99 },
  'A9-THCA': { name: '∆-9-THCA', confidence: 0.99 },
  'A9-THCVA': { name: '∆-9-THCVA', confidence: 0.99 },
  'Cannabichromene (CBC)': { name: 'CBC', confidence: 0.99 },
  'Cannabichromenic Acid': { name: 'CBC', confidence: 0.9 },
  'Cannabicyclol (CBL)': { name: 'CBL', confidence: 0.99 },
  'Cannabidiol (CBD)': { name: 'CBD', confidence: 0.99 },
  'Cannabidiolic Acid (CBDA)': { name: 'CBDA', confidence: 0.99 },
  'Cannabidiolic Acid': { name: 'CBD', confidence: 0.9 },
  'Cannabidivarin (CBDV)': { name: 'CBDV', confidence: 0.99 },
  'Cannabidivarinic Acid (CBDVA)': { name: 'CBDVA', confidence: 0.99 },
  'Cannabidivarinic Acid': { name: '∆-9-THCV', confidence: 0.8 },
  'Cannabigerol (CBG)': { name: 'CBG', confidence: 0.99 },
  'cannabigerol': { name: 'CBG', confidence: 0.99 },
  'Cannabigerolic Acid (CBGA)': { name: 'CBGA', confidence: 0.99 },
  'Cannabigerolic Acid': { name: 'CBGA', confidence: 0.99 },
  'Cannabinol (CBN)': { name: 'CBN', confidence: 0.99 },
  'Cannabinolic Acid (CBNA)': { name: 'CBNA', confidence: 0.99 },
  'Carvubzdizl(CHDY': { name: 'CBD', confidence: 0.9 },
  'Delta 8-Tetrahydrocannabinol': { name: '∆-8-THC', confidence: 0.99 },
  'Delta 9-Tetrahydrocannabinol': { name: '∆-9-THC', confidence: 0.99 },
  'Delta 9-Tetrahydrocannabinolic': { name: '∆-9-THCA', confidence: 0.99 },
  'Delta 9-THCVA': { name: '∆-9-THCVA', confidence: 0.99 },
  'FR-He': { name: '9R-HHC', confidence: 0.9 },
  'FR-Hewbrpdr': { name: '9R-HHC', confidence: 0.9 },
  'FR-Hewtredr': { name: '9R-HHC', confidence: 0.9 },
  'FR-Hexatrd': { name: '9R-HHC', confidence: 0.9 },
  'FR-Hexdrd': { name: '9R-HHC', confidence: 0.9 },
  'IC=THCa*': { name: '∆-9 THCA', confidence: 0.9 },
  'R-A-10-Tetrahydrocannabinol (R-A-10-THC)': { name: 'R-∆-10-THC', confidence: 0.99 },
  'R-A-10-Tetrahydrocannabinol': { name: 'R-∆-10-THC', confidence: 1 },
  'R-Delta 10-THC': { name: 'R-∆-10-THC', confidence: 0.99 },
  'S-A-10-Tetrahydrocannabinol (S-A-10-THC)': { name: 'S-∆-10-THC', confidence: 0.99 },
  'S-A-10-Tetrahydrocannabinol': { name: 'S-∆-10-THC', confidence: 0.99 },
  'S-Delta 10-THC': { name: 'S-∆-10-THC', confidence: 0.99 },
  'Tetrahwdrocannabinol:': { name: '∆-9-THC', confidence: 1 },
  'Tetrahydrocannabivarin (THCV)': { name: 'THCV', confidence: 0.99 },
  'Tetrahydrocannabivarinic Acid': { name: '∆-9-THCVA', confidence: 0.99 },
  "∆ 9-THC": { name: '∆-9-THC', confidence: 0.99 },
  "∆ 9-THCA": { name: '∆-9-THCA', confidence: 0.99 },
  "∆ 9-THCVA": { name: '∆-9-THCVA', confidence: 0.99 },
  "∆-9 THC": { name: '∆-9-THC', confidence: 0.99 },
  "∆-9 THCA": { name: '∆-9-THCA', confidence: 0.99 },
  Camnabichromenic: { name: 'CBC', confidence: 0.9 },
  Camnabigeralic: { name: 'CBG', confidence: 0.9 },
  Cannabichabe: { name: 'CBC', confidence: 0.6 },
  Cannabichearinic: { name: 'CBCA', confidence: 0.9 },
  Cannabichonvene: { name: 'CBC', confidence: 0.8 },
  Cannabichromene: { name: 'CBC', confidence: 1 },
  Cannabichromenic: { name: 'CBCA', confidence: 1 },
  Cannabidiol: { name: 'CBD', confidence: 1 },
  Cannabidiolic: { name: 'CBDA', confidence: 1 },
  Cannabidivarin: { name: 'CBDV', confidence: 1 },
  Cannabidivarinic: { name: 'CBDVA', confidence: 1 },
  Cannabigeral: { name: 'CBG', confidence: 0.7 },
  Cannabigerdl: { name: 'CBG', confidence: 0.7 },
  Cannabigerol: { name: 'CBG', confidence: 1 },
  Cannabigerolic: { name: 'CBGA', confidence: 1 },
  Cannabinol: { name: 'CBN', confidence: 1 },
  Cannabinolic: { name: 'CBNA', confidence: 1 },
  Cannatinol: { name: 'CBN', confidence: 0.8 },
  Canrudschromenic: { name: 'CBC', confidence: 0.9 },
  Canrudsdial: { name: 'CBD', confidence: 0.9 },
  Carrubichromenic: { name: 'CBC', confidence: 0.9 },
  Carrubirolic: { name: 'CBG', confidence: 0.7 },
  Carrubsrolic: { name: 'CBG', confidence: 0.7 },
  Carrubyrolic: { name: 'CBG', confidence: 0.7 },
  Carvubschasn: { name: 'CBC', confidence: 0.9 },
  Carvubschrorrenic: { name: 'CBC', confidence: 0.9 },
  Carvubsgerolic: { name: 'CBG', confidence: 0.7 },
  Carvudschromenk: { name: 'CBC', confidence: 0.9 },
  CBC: { name: 'CBC', confidence: 0.99 },
  CBCA: { name: 'CBCA', confidence: 0.99 },
  CBCV: { name: 'CBCV', confidence: 0.99 },
  CBD: { name: 'CBD', confidence: 0.99 },
  CBDA: { name: 'CBDA', confidence: 0.99 },
  CBDV: { name: 'CBDV', confidence: 0.99 },
  CBDVA: { name: 'CBDVA', confidence: 0.99 },
  CBG: { name: 'CBG', confidence: 0.99 },
  CBGA: { name: 'CBGA', confidence: 0.99 },
  CBL: { name: 'CBL', confidence: 0.99 },
  CBN: { name: 'CBN', confidence: 0.99 },
  CBNA: { name: 'CBNA', confidence: 0.99 },
  CBT: { name: 'CBT', confidence: 0.99 },
  Conmaby: { name: 'CBL', confidence: 0.8 },
  Tetrahydrocannabinol: { name: '∆-9-THC', confidence: 1 },
  Tetratwarocamanng: { name: '∆-9-THC', confidence: 1 },
  THC: { name: '∆-9-THC', confidence: 0.99 },
  THCA: { name: '∆-9-THCA', confidence: 0.99 },
  THCP: { name: '∆-9-THCP', confidence: 0.99 },
  THCV: { name: '∆-9-THCV', confidence: 0.99 },
  Total: { name: 'Total', confidence: 1 },
  TOTAL: { name: 'Total', confidence: 1 },
}

function extractNameProperties(spellings) {
  return Object.values(spellings).map(cannabinoid => cannabinoid.name);
}

const cannabinoidNameList = extractNameProperties(cannabinoidSpellings).map(name => `'${name}'`).join(', ');

const terpeneSpellings = {
  '«-Bisabolol': { name: 'Bisabolol', confidence: 0.99 },
  '«-Pinene': { name: 'Pinene', confidence: 0.99 },
  '1,8-Cineole': { name: 'Eucalyptol', confidence: 0.99 },
  '1.8-Cinecle': { name: 'Eucalyptol', confidence: 0.99 },
  'a-Bisabolol': { name: 'Bisabolol', confidence: 0.99 },
  'a-Bsabolol': { name: 'Bisabolol', confidence: 0.99 },
  'a-Finene': { name: 'Pinene', confidence: 0.99 },
  'a-Humulene': { name: 'Humulene', confidence: 0.99 },
  'a-Pinene': { name: 'Pinene', confidence: 0.99 },
  'a-Terpinene': { name: 'Terpinene', confidence: 0.99 },
  'B-Caryophyliene': { name: 'Caryophyllene', confidence: 0.99 },
  'B-Caryophyllene': { name: 'Caryophyllene', confidence: 0.99 },
  'B-Myrcene': { name: 'Myrcene', confidence: 0.99 },
  'Mentho!': { name: 'Menthol', confidence: 0.99 },
  'o-Humulene': { name: 'Humulene', confidence: 0.99 },
  'y-Terpinene': { name: 'Terpinolene', confidence: 0.99 },
  'α-Bisabolol': { name: 'Bisabolol', confidence: 0.99 },
  'α-Humulene': { name: 'Humulene', confidence: 0.99 },
  'α-Pinene': { name: 'Pinene', confidence: 0.99 },
  'α-Terpinene': { name: 'Terpinene', confidence: 0.99 },
  'β-Caryophyllene': { name: 'Caryophyllene', confidence: 0.99 },
  'β-Myrcene': { name: 'Myrcene', confidence: 0.99 },
  'γ-Terpinene': { name: 'Terpinolene', confidence: 0.99 },
  'Bisabolol': { name: 'Bisabolol', confidence: 0.99 },
  'Bormwol': { name: 'Borneol', confidence: 0.99 },
  'Bornel': { name: 'Borneol', confidence: 0.99 },
  'Borreol': { name: 'Borneol', confidence: 0.99 },
  'Camphene': { name: 'Camphene', confidence: 0.99 },
  'Carene': { name: 'Carene', confidence: 0.99 },
  'Caryophyllene': { name: 'Caryophyllene', confidence: 0.99 },
  'CaryophylleneOxide': { name: 'Caryophyllene Oxide', confidence: 0.99 },
  'Citral': { name: 'Citral', confidence: 0.99 },
  'Dihydrocarveol': { name: 'Dihydrocarveol', confidence: 0.99 },
  'Fenchone': { name: 'Fenchone', confidence: 0.99 },
  'Ferxhone': { name: 'Fenchone', confidence: 0.99 },
  'Limonene': { name: 'Limonene', confidence: 0.99 },
  'Limonenes': { name: 'Limonene', confidence: 0.99 },
  'Linalool': { name: 'Linalool', confidence: 0.99 },
  'Menthol': { name: 'Menthol', confidence: 0.99 },
  'Nerolidol': { name: 'Nerolidol', confidence: 0.99 },
  'Ocimene': { name: 'Ocimene', confidence: 0.99 },
  'Pulegone': { name: 'Pulegone', confidence: 0.99 },
  'Terpinolene': { name: 'Terpinolene', confidence: 0.99 },
};

const terpeneNameList = extractNameProperties(terpeneSpellings).map(name => `'${name}'`).join(', ');

function filterAssay(assay) {
  return assay?.filter(chem => parseFloat(chem.pct) > 0 && chem.name !== 'Unknown' && !chem.name.toLowerCase().includes('total'));
}

module.exports = {
  getBuffer,
  makeProductsFile,
  cannabinoidSpellings,
  terpeneSpellings,
  cannabinoidNameList,
  terpeneNameList,
}