const gm = require("gm");
const axios = require("../services/rateLimitedAxios");
const fs = require("fs");
const logger = require('../services/logger.js');

function jpgNameFromUrl(url) {
  const name = url.split('/').pop().split('#')[0].split('?')[0];
  return name.endsWith('.jpg') ? name : `${name}.jpg`;
}

const path = require('path');

async function getBuffer(url) {
  const name = makeImageName(url);
  if (!url) {
    return null;
  }

  const dir = path.join(__dirname, '../temp/scan');
  const filePath = path.join(dir, name);
  /*
    if (fs.existsSync(filePath)) {
      buffer = fs.readFileSync(filePath);
    } else {
      buffer = await getImageBuffer(url);
      fs.writeFileSync(filePath, buffer);
    }
  */
  return buffer;
}

function makeImageName(url) {
  const name = jpgNameFromUrl(url)

  const domain = url.split('/')[2] ? url.split('/')[2] : 'unknown'

  return `${domain}_${name}`
}

let cannabinoidSpellingMap = {
  'THCVa': 'THCVA',
  'THCVA': 'THCVA',
  'THCV': 'THCV',
  'THCV': 'THCV',
  'THCP': 'THCP',
  'THCO': '∆-9-THCO',
  'THCA*®': '∆-9-THCA',
  'THCA*': '∆-9-THCA',
  'THCA': '∆-9-THCA',
  'THC': '∆-9-THC',
  'Tetratwarocamanng': '∆-9-THC',
  'Tetralwdrocannabinol': '∆-9-THC',
  'Tetrahydrocannabivarinic': 'THCVA',
  'Tetrahydrocannabivarinic Acid': 'THCVA',
  'Tetrahydrocannabivarin': 'THCV',
  'S-Delta 10-THC': 'S-∆-10-THC',
  'S-A-10-Tetrahydrocannabinol': 'S-∆-10-THC',
  'S-A-10-Tetrahydrocannabinol (S-A-10-THC)': 'S-∆-10-THC',
  'R-Delta 10-THC': 'R-∆-10-THC',
  'R-A-10-Tetrahydrocannabinol': 'R-∆-10-THC',
  'R-A-10-Tetrahydrocannabinol (R-A-10-THC)': 'R-∆-10-THC',
  'O-9-Tetrabwdrocannabivarinic': 'THCVA',
  'Delta-9-THC': '∆-9-THC',
  'Delta 9-THCVA': 'THCVA',
  'Delta 9-Tetrahydrocannabinolic': '∆-9-THCA',
  'Delta 9-Tetrahydrocannabinol': '∆-9-THC',
  'Delta 8-Tetrahydrocannabinol': '∆-8-THC',
  'd9-THC*': '∆-9-THC',
  'd8-THC': '∆-8-THC',
  'CBT': 'CBT',
  'CBNA': 'CBNA',
  'CBN': 'CBN',
  'CBLA': 'CBLA',
  'CBL': 'CBL',
  'CBGA': 'CBGA',
  'CBG': 'CBG',
  'CBDVA': 'CBDVA',
  'CBDV': 'CBDV',
  'CBDA*®': 'CBDA',
  'CBDA*': 'CBDA',
  'CBDA': 'CBDA',
  'CBD*': 'CBD',
  'CBD': 'CBD',
  'CBCV': 'CBCV',
  'CBCA': 'CBCA',
  'CBC': 'CBC',
  'Carrubyrolic': 'CBG',
  'Carrubsrolic': 'CBG',
  'Carrubirolic': 'CBG',
  'Carrubichromenic': 'CBC',
  'Carnabigerol': 'CBG',
  'Canrudsdial': 'CBD',
  'Canrudschromenic': 'CBC',
  'Canrubidivarieic': 'CBDVA',
  'Canrabinolic': 'CBN',
  'Canrabidivarin': 'CBDVA',
  'Canrabidiolic': 'CBDA',
  'Cannubidivarinne': 'CBDVA',
  'Cannubidivarinic': 'CBDVA',
  'Cannubidiol': 'CBD',
  'Cannubichromene': 'CBC',
  'Cannatinol': 'CBN',
  'Cannatigerol': 'CBG',
  'Cannatidiolic': 'CBD',
  'Cannatichromene': 'CBC',
  'Cannablgerolic': 'CBG',
  'Cannabldiolic': 'CBDA',
  'Cannabinolic': 'CBNA',
  'Cannabinolic Acid (CBNA)': 'CBNA',
  'Cannabinol': 'CBN',
  'Cannabinol (CBN)': 'CBN',
  'Cannabigerolic': 'CBGA',
  'Cannabigerolic Acid': 'CBGA',
  'cannabigerol': 'CBG',
  'Cannabigerol (CBG)': 'CBG',
  'Cannabigerdl': 'CBG',
  'Cannabigeral': 'CBG',
  'Cannabidivarinic Acid': 'THCV',
  'Cannabidivarinic Acid (CBDVA)': 'CBDVA',
  'Cannabidivarin (CBDV)': 'CBDV',
  'Cannabidivarieic': 'CBDVA',
  'Cannabidivaria': 'CBDV',
  'Cannabidiolic Acid': 'CBDA',
  'Cannabidiol (CBD)': 'CBD',
  'Cannabicyclol (CBL)': 'CBL',
  'Cannabichromenic': 'CBCA',
  'Cannabichromene': 'CBC',
  'Cannabichonvene': 'CBC',
  'Cannabichearinic': 'CBCA',
  'Camnabichromenic': 'CBCA',
  'B-9-Tetrabwdrocannabighorol': '∆-9-THCO',
  'B THCA*': '∆-9-THCA',
  'B cBGA': 'CBGA',
  'A9-THCVA': 'THCVA',
  'A9-THCVA': 'THCVA',
  'A9-THCV': 'THCV',
  'A9-THCA': '∆-9-THCA',
  'A9-THCA-A': '∆-9-THCA',
  'A9-THC': '∆-9-THC',
  'A9-Tetrabydrecamasinalic Ackd (THCA-R)': 'THCA-R',
  'A8-THC': '∆-8-THC',
  'A?-THCV': 'THCV',
  'A-9-THCVA': 'THCVA',
  'A-9-THCV': 'THCV',
  'A-9-THCP': 'THCP',
  'A-9-THCA': '∆-9-THCA',
  'A-9-THCA-A': '∆-9-THCA',
  'A-9-THC': '∆-9-THC',
  'A-9-Tetratydrocannabiphorol': 'THCP',
  'A-9-Tetratydrocannabiphorol': 'THCP',
  'A-9-Tetratrydrocannabivarinic': 'THCVA',
  'A-9-Tetrahydrocannatinolic': '∆-9-THCO',
  'A-9-Tetrahydrocannatinolic': '∆-9-THCO',
  'A-9-Tetrahydrocannabivarinic': 'THCVA',
  'A-9-Tetrahydrocannabivarinic Acid (A-9-THCVA)': 'THCVA',
  'A-9-Tetrahydrocannabivarin': 'THCV',
  'A-9-Tetrahydrocannabivarin (A-9-THCV)': 'THCV',
  'A-9-Tetrahydrocannabiphorol': 'THCP',
  'A-9-Tetrahydrocannabiphorol (A-9-THCP)': 'THCP',
  'A-9-Tetrahydrocannabiphorel': 'THCP',
  'A-9-Tetrahydrocannabinolic': '∆-9-THCA',
  'A-9-Tetrahydrocannabinolic Acid': '∆-9-THCA',
  'A-9-Tetrahydrocannabinolic Acid (THCA-A)': '∆-9-THCA',
  'A-9-Tetrahydrocannabinol': '∆-9-THC',
  'A-9-Tetrahydrocannabinol': '∆-9-THC',
  'A-9-Tetrahydrocannabinol Acetate (A-9-THCO)': '∆-9-THCO',
  'A-9-Tetrahydrocannabinol (A-9 THC)': '∆-9-THC',
  'A-9-Tetrahydrocannabino!': '∆-9-THC',
  'A-9-Tetrabydrocannabivarinic': 'THCVA',
  'A-9-Tetrabydrocannabiphorol': 'THCP',
  'A-9-Tetrabydrocannabinol': '∆-9-THC',
  'A-9-Tetrabydrocannabighorol': '∆-9-THCO',
  'A-9-Tetrabrydrocannabivarinic': 'THCP',
  'A-9-Tetrabrydrocannabivarini': 'THCP',
  'A-9-Tetrabrydrocannabiphorol': 'THCP',
  'A-9-Tetrabdrocannabiphorol': 'THCP',
  'A-8-THC': '∆-8-THC',
  'A-8-Tetrahydrocannabinol': '∆-8-THC',
  'A-8-Tetrahydrocannabinol (A-8 THC)': '∆-8-THC',
  '9S-HHC': '9S-HHC',
  '9S-Hexahydrocannabinol': '9S-HHC',
  '9R-HHC': '9R-HHC',
  '9R-Hexahydrocannabinol': '9R-HHC',
  '9R-Henahydrocannabinol': '9R-HHC',
  '9R-Henahydrocannabinol': '9R-HHC',
  '95-Hexatydrocarrabisol': '9S-HHC',
  '95-Hexahydrocannabinol': '9S-HHC',
  '95-Hexahydracannabinal': '9S-HHC',
  '95-Hexabydrocannabinol': '9S-HHC',
  '95-Hexabydrocannabinol': '9S-HHC',
  '95-Hexabydrocannabinol': '9S-HHC',
  '9-S-HHC': '9S-HHC',
  '75%-Henatydrocarrabingl': '9S-HHC',
  '75-Hexatydrocarrabiscl': '9S-HHC',
  '4-9-Totratydrocannabivarin': 'THCV',
  '4-9-Tetrahydrocannabinolic': '∆-9-THCA',
  '4-9-Tetrahydrocannabinol': '∆-9-THC',
  '4-8-Tetrahydrocannabinol': '∆-8-THC',
  '$-A-10-Tetrahydrocannabinol': 'S-∆-10-THC',
  '∆9-THCVA': 'THCVA',
  '∆9-THCVA': 'THCVA',
  '∆9-THCV': 'THCV',
  '∆9-THCA': '∆-9-THCA',
  '∆9-THCA': '∆-9-THCA',
  '∆9-THCA': '∆-9-THCA',
  '∆9-THC': '∆-9-THC',
  '∆9-THC': '∆-9-THC',
  '∆9-THC': '∆-9-THC',
  '∆9 THCVA': 'THCVA',
  '∆9 THCV': 'THCV',
  '∆9 THCA': '∆-9-THCA',
  '∆9 THCA': '∆-9-THCA',
  '∆9 THCA': '∆-9-THCA',
  '∆9 THC': '∆-9-THC',
  '∆9 THC': '∆-9-THC',
  '∆9 THC': '∆-9-THC',
  '∆8-THC': '∆-8-THC',
  '∆8 THC': '∆-8-THC',
  '∆-9-THCVA': 'THCVA',
  '∆-9-THCV': 'THCV',
  '∆-9-THCA': '∆-9-THCA',
  '∆-9-THC': '∆-9-THC',
  '∆-9 THCA': '∆-9-THCA',
  '∆-9 THC': '∆-9-THC',
  '∆-8-THC': '∆-8-THC',
  '∆ 9-THCVA': 'THCVA',
  '∆ 9-THCA': '∆-9-THCA',
  '∆ 9-THC': '∆-9-THC',
  '?R-HHC': '9R-HHC',
}
cannabinoidSpellingMap = Object.entries(cannabinoidSpellingMap).sort(longestFirst);

const cannabinoidNameList = Array.from(Object.values(cannabinoidSpellingMap))
  .map(item => item[0]) // get the first element of each item
  .filter((item, index, self) => self.indexOf(item) === index); // remove duplicatesconsole.log(cannabinoidNameList)
// console.log(cannabinoidNameList)

let terpeneSpellingMap = {
  'γ-Terpinene': 'Terpinolene',
  'β-Myrcene': 'Myrcene',
  'β-Caryophyllene': 'Caryophyllene',
  'α-Terpinene': 'Terpinene',
  'α-Pinene': 'Pinene',
  'α-Humulene': 'Humulene',
  'α-Bisabolol': 'Bisabolol',
  'y-Terpinene': 'Terpinolene',
  'Terpinolene': 'Terpinolene',
  'Pulegone': 'Pulegone',
  'Pinene': 'Pinene',
  'Ocimene': 'Ocimene',
  'o-Humulene': 'Humulene',
  'Nerolidol': 'Nerolidol',
  'Myrcene': 'Myrcene',
  'Menthol': 'Menthol',
  'Linalool': 'Linalool',
  'Limonenes': 'Limonene',
  'Limonene': 'Limonene',
  'Humulene': 'Humulene',
  'Finene': 'Pinene',
  'Ferxhone': 'Fenchone',
  'Fenchone': 'Fenchone',
  'Dihydrocarveol': 'Dihydrocarveol',
  'Citral': 'Citral',
  'Cineole': 'Eucalyptol',
  'Cinecle': 'Eucalyptol',
  'CaryophylleneOxide': 'Caryophyllene Oxide',
  'Caryophyliene': 'Caryophyllene',
  'Carene': 'Carene',
  'Camphene': 'Camphene',
  'Bsabolol': 'Bisabolol',
  'Borrmeol': 'Borneol',
  'Borreol': 'Borneol',
  'Borneol': 'Borneol',
  'Bornel': 'Borneol',
  'Bormwol': 'Borneol',
  'Bisabolol': 'Bisabolol',
  'B-Myrcene': 'Myrcene',
  'B-Caryophyllene': 'Caryophyllene',
  'B-Caryophyliene': 'Caryophyllene',
  'a-Terpinene': 'Terpinene',
  'a-Pinens': 'Pinene',
  'a-Pinene': 'Pinene',
  'a-Pinene': 'Pinene',
  'a-Humulene': 'Humulene',
  'a-Finene': 'Pinene',
  'a-Bsabolol': 'Bisabolol',
  'a-Bisabolol': 'Bisabolol',
  '1.8-Cinecle': 'Eucalyptol',
  '1,8-Cineole': 'Eucalyptol',
  '«-Pinene': 'Pinene',
  '«-Bisabolol': 'Bisabolol',
  '-Bisabolol': 'Bisabolol',
};

terpeneSpellingMap = Object.entries(terpeneSpellingMap).sort(longestFirst);


//const terpeneNameList = Array.from(Object.values(terpeneSpellingMap)[1]).filter((item, index, self) => self.indexOf(item) === index);
const terpeneNameList = Array.from(Object.values(terpeneSpellingMap))
  .map(item => item[0]) // get the first element of each item
  .filter((item, index, self) => self.indexOf(item) === index); // remove duplicatesconsole.log(terpeneNameList)

function longestFirst(a, b) {
  if (b[0].length !== a[0].length) {
    return b[0].length - a[0].length;
  } else {
    return a[0].localeCompare(b[0]);
  }
}
module.exports = {
  getBuffer,
  cannabinoidNameList,
  terpeneNameList,
  cannabinoidSpellingMap,
  terpeneSpellingMap
}