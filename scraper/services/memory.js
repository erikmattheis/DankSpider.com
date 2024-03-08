const gm = require("gm");
const axios = require("../services/rateLimitedAxios");
const fs = require("fs");
const logger = require('../services/logger.js');
const path = require('path');

function jpgNameFromUrl(url) {
  const name = url.split('/').pop().split('#')[0].split('?')[0];
  return name.endsWith('.jpg') ? name : `${name}.jpg`;
}

async function fileCachedDate(name) {
  const dir = path.join(__dirname, '../temp/scan');
  const filePath = path.join(dir, name);

  if (fs.existsSync(filePath)) {
    return fs.statSync(filePath).mtime;
  } else {
    return null;
  }
}

async function getBufferFromFile(url) {
  let lastModified;
  let value;
  try {

    if (!url.startsWith('http')) {
      const filePath = path.join(__dirname, '../temp/scan', url);
      console.log('filePath', filePath);
      lastModified = fs.statSync(filePath)?.mtime;
      buffer = fs.readFileSync(filePath);
      return {
        value: buffer,
        lastModified
      }
    }

    const name = makeImageName(url);
    console.log('name', name);
    const dir = path.join(__dirname, '../temp/scan');
    const filePath = path.join(dir, name);
    console.log('filePath', filePath);

    if (fs.existsSync(filePath)) {
      lastModified = fs.statSync(filePath)?.mtime;
      value = fs.readFileSync(filePath);
    } else {
      value = null;
    }

    return {
      value,
      lastModified
    }
  }
  catch (error) {
    logger.error(`Error getting buffer from file: ${error.message}`, { url });
    return {
      value,
      lastModified
    }
  }
}

function makeImageName(url) {
  const name = jpgNameFromUrl(url)

  const domain = url.split('/')[2] ? url.split('/')[2] : 'unknown'

  return `${domain}_${name}`
}

let cannabinoidSpellingMap = {
  'Δ9-THCVA': 'THCVA',
  'Δ9-THCVA': 'THCVA',
  'Δ9-THCV': 'THCV',
  'Δ9-THCA': 'Δ-9-THCA',
  'Δ9-THCA': 'Δ-9-THCA',
  'Δ9-THCA': 'Δ-9-THCA',
  'Δ9-THC': 'Δ-9-THC',
  'Δ9-THC': 'Δ-9-THC',
  'Δ9 THCVA': 'THCVA',
  'Δ9 THCV': 'THCV',
  'Δ9 THCA': 'Δ-9-THCA',
  'Δ9 THCA': 'Δ-9-THCA',
  'Δ9 THCA': 'Δ-9-THCA',
  'Δ9 THC': 'Δ-9-THC',
  'Δ9 THC': 'Δ-9-THC',
  'Δ9 THC': 'Δ-9-THC',
  'Δ8-THC': 'Δ-8-THC',
  'Δ8 THC': 'Δ-8-THC',
  'Δ-9-THCVA': 'THCVA',
  'Δ-9-THCV': 'THCV',
  'Δ-9-THCA': 'Δ-9-THCA',
  'Δ-9-THC': 'Δ-9-THC',
  'Δ-9-Tetratydrocannabiphorol': 'THCP',
  'Δ-9-Tetratydrocannabiphorol': 'THCP',
  'Δ-9-Tetratrydrocannabivarinic': 'THCVA',
  'Δ-9-Tetrahydrocannatinolic': 'Δ-9-THCO',
  'Δ-9-Tetrahydrocannatinolic': 'Δ-9-THCO',
  'Δ-9-Tetrahydrocannabivarinic': 'THCVA',
  'Δ-9-Tetrahydrocannabivarin': 'THCV',
  'Δ-9-Tetrahydrocannabiphorol': 'THCP',
  'Δ-9-Tetrahydrocannabiphorel': 'THCP',
  'Δ-9-Tetrahydrocannabinolic': 'Δ-9-THCA',
  'Δ-9-Tetrahydrocannabinol': 'Δ-9-THC',
  'Δ-9-Tetrahydrocannabinol': 'Δ-9-THC',
  'Δ-9-Tetrahydrocannabinol': 'Δ-9-THC',
  'Δ-9-Tetrahydrocannabinol Acetate': 'Δ-9-THCO',
  'Δ-9-Tetrahydrocannabino!': 'Δ-9-THC',
  'Δ-9-Tetrabydrocannabivarinic': 'THCVA',
  'Δ-9-Tetrabydrocannabiphorol': 'THCP',
  'Δ-9-Tetrabydrocannabinol': 'Δ-9-THC',
  'Δ-9-Tetrabydrocannabighorol': 'Δ-9-THCO',
  'Δ-9-Tetrabrydrocannabivarinic': 'THCP',
  'Δ-9-Tetrabrydrocannabivarini': 'THCP',
  'Δ-9-Tetrabrydrocannabiphorol': 'THCP',
  'Δ-9-Tetrabdrocannabiphorol': 'THCP',
  'Δ-9 THCA': 'Δ-9-THCA',
  'Δ-9 THC': 'Δ-9-THC',
  'Δ-8-THC': 'Δ-8-THC',
  'Δ-8-THC': 'Δ-8-THC',
  'Δ-8-THC': 'Δ-8-THC',
  'Δ-8-Tetrahydrocannabinol': 'Δ-8-THC',
  'Δ-8-Tetrahydrocannabinol': 'Δ-8-THC',
  'Δ-8-Tetrahydrocannabinol': 'Δ-8-THC',
  'Δ-8-Tetrahydrocannabinol': 'Δ-8-THC',
  'Δ 9-THCVA': 'THCVA',
  'Δ 9-THCA': 'Δ-9-THCA',
  'Δ 9-THC': 'Δ-9-THC',
  'THCVA': 'THCVA',
  'THCVa': 'THCVA',
  'THCV': 'THCV',
  'THCV': 'THCV',
  'THCP': 'THCP',
  'THCO': 'Δ-9-THCO',
  'THCA*®': 'Δ-9-THCA',
  'THCA*': 'Δ-9-THCA',
  'THCA': 'Δ-9-THCA',
  'THC': 'Δ-9-THC',
  'Tetratydrocannabiphorol': 'THCP',
  'Tetratydrocannabiphorol': 'THCP',
  'Tetratwarocamanng': 'Δ-9-THC',
  'Tetratrydrocannabivarinic': 'THCVA',
  'Tetralwdrocannabinol': 'Δ-9-THC',
  'Tetrahydrocannatinolic': 'THCO',
  'Tetrahydrocannatinolic': 'THCO',
  'Tetrahydrocannabivarinic': 'THCVA',
  'Tetrahydrocannabivarinic': 'THCVA',
  'Tetrahydrocannabivarinic Acid': 'THCVA',
  'Tetrahydrocannabivarinic Acid': 'THCVA',
  'Tetrahydrocannabivarin': 'THCV',
  'Tetrahydrocannabivarin': 'THCV',
  'Tetrahydrocannabivarin': 'THCV',
  'Tetrahydrocannabiphorol': 'THCP',
  'Tetrahydrocannabiphorol': 'THCP',
  'Tetrahydrocannabiphorel': 'THCP',
  'Tetrahydrocannabinolic': 'Δ-9-THCA',
  'Tetrahydrocannabinol': 'Δ-9-THC',
  'Tetrahydrocannabinol': 'Δ-9-THC',
  'Tetrahydrocannabinol Acetate': 'THCO',
  'Tetrahydrocannabino!': 'Δ-9-THC',
  'Tetrabydrocannabivarinic': 'THCVA',
  'Tetrabydrocannabiphorol': 'THCP',
  'Tetrabydrocannabinol': 'Δ-9-THC',
  'Tetrabydrocannabighorol': 'THCO',
  'Tetrabrydrocannabivarinic': 'THCP',
  'Tetrabrydrocannabivarini': 'THCP',
  'Tetrabrydrocannabiphorol': 'THCP',
  'Tetrabdrocannabiphorol': 'THCP',
  'S-Delta 10-THC': 'S-Δ-10-THC',
  'S-A-10-Tetrahydrocannabinol': 'S-Δ-10-THC',
  '5-A-10-Tetrahydrocannabinol': 'S-Δ-10-THC',
  '-A-10-Tetrahydrocannabinol': 'S-Δ-10-THC',


  'A-9 Tetrahydrocannabinol': 'Δ-9-THC',
  'R-A-10 Tetrahydrocannabinol': 'R-Δ-10-THC',
  'S-A-10 Tetrahydrocannabinol': 'S-Δ-10-THC',
  'A-8 Tetrahydrocannabinol': 'Δ-8-THC',

  '2-8 Tetrahydrocannabinol 8': 'Δ-8-THC',
  '8-9-Tetrahydrocannabinol 8': 'Δ-8-THC',
  '8-9-Tetrahydrocannabinolic': 'Δ-9-THCA',
  '8-9-Tetrahydrocannabiphorol': '2-9-THCP',
  '89-Tetrahydrocannabivarin': 'Δ-9-THCV',
  '2-9-Tetrahydrocannabivarinic': 'Δ-9-THCVA',
  'R--10-Tetrahydrocannabinl': 'R-A-10-THC',
  '-A-10-Tetrahydrocannabinal': 'S-Δ-10-THC',
  '95 Hexahydrocannabinol': '9S-HHC',
  'Cannabidivarn CBOVA': 'CBDVA',
  'Cannabidivainic Acid': 'CBDVA',
  'Cannabidilic Acid': 'CBDA',


  '-8-Tetrahydrocannabinol': 'Δ-8-THC',
  '-9-Tetrahydrocannabivarin': 'THCV',
  '5-A-10-Tetrahydrocannabinol': 'S-Δ-10-THC',
  'R-Delta 10-THC': 'R-Δ-10-THC',
  'R-A-10-Tetrahydrocannabinol': 'R-Δ-10-THC',
  'R-A-10-Tetrahydrocannabinol (R-A-10-THC)': 'R-Δ-10-THC',
  'O-9-Tetrabwdrocannabivarinic': 'THCVA',
  'Delta-9-THC': 'Δ-9-THC',
  'Delta 9-THCVA': 'THCVA',
  'Delta 9-Tetrahydrocannabinolic': 'Δ-9-THCA',
  'Delta 9-Tetrahydrocannabinol': 'Δ-9-THC',
  'Delta 8-Tetrahydrocannabinol': 'Δ-8-THC',
  'd9-THC*': 'Δ-9-THC',
  'd8-THC': 'Δ-8-THC',
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
  'Cannabinolic Acid': 'CBNA',
  'Cannabinol': 'CBN',
  'Cannabinol': 'CBN',
  'Cannabigerolic': 'CBGA',
  'Cannabigerolic Acid': 'CBGA',
  'Cannabigerol': 'CBG',
  'cannabigerol': 'CBG',
  'Cannabigerdl': 'CBG',
  'Cannabigeral': 'CBG',
  'Cannabidivarinic': 'CBDVA',
  'Cannabidivarin': 'CBDV',
  'Cannabidivarieic': 'CBDVA',
  'Cannabidivaria': 'CBDV',
  'Cannabidiolic Acid': 'CBDA',
  'Cannabidiol': 'CBD',
  'Cannabicyclol': 'CBL',
  'Cannabichromenic': 'CBCA',
  'Cannabichromene': 'CBC',
  'Cannabichonvene': 'CBC',
  'Cannabichearinic': 'CBCA',
  'Camnabichromenic': 'CBCA',
  'B-9-Tetrabwdrocannabighorol': 'Δ-9-THCO',
  'B THCA*': 'Δ-9-THCA',
  'B cBGA': 'CBGA',
  'A9-THCVA': 'THCVA',
  'A9-THCV': 'THCV',
  'A9-THCA': 'Δ-9-THCA',
  'A9-THCA-A': 'Δ-9-THCA',
  'A9-THC': 'Δ-9-THC',
  'A9-Tetrabydrecamasinalic': 'THCA-R',
  'A8-THC': 'Δ-8-THC',
  'A?-THCV': 'THCV',
  'A-9-THCVA': 'THCVA',
  'A-9-THCV': 'THCV',
  'A-9-THCP': 'THCP',
  'A-9-THCA': 'Δ-9-THCA',
  'A-9-THCA-A': 'Δ-9-THCA',
  'A-9-THC': 'Δ-9-THC',
  'A-9-Tetratydrocannabiphorol': 'THCP',
  'A-9-Tetratydrocannabiphorol': 'THCP',
  'A-9-Tetratrydrocannabivarinic': 'THCVA',
  'A-9-Tetrahydrocannatinolic': 'Δ-9-THCO',
  'A-9-Tetrahydrocannatinolic': 'Δ-9-THCO',
  'A-9-Tetrahydrocannabivarinic': 'THCVA',
  'A-9-Tetrahydrocannabivarinic Acid': 'THCVA',
  'A-9-Tetrahydrocannabivarin': 'THCV',
  'A-9-Tetrahydrocannabivarin': 'THCV',
  'A-9-Tetrahydrocannabiphorol': 'THCP',
  'A-9-Tetrahydrocannabiphorol': 'THCP',
  'A-9-Tetrahydrocannabiphorel': 'THCP',
  'A-9-Tetrahydrocannabinolic': 'Δ-9-THCA',
  'A-9-Tetrahydrocannabinolic Acid': 'Δ-9-THCA',
  'A-9-Tetrahydrocannabinolic Acid': 'Δ-9-THCA',
  'A-9-Tetrahydrocannabinol': 'Δ-9-THC',
  'A-9-Tetrahydrocannabinol': 'Δ-9-THC',
  'A-9-Tetrahydrocannabinol': 'Δ-9-THC',
  'A-9-Tetrahydrocannabinol Acetate': 'Δ-9-THCO',
  'A-9-Tetrahydrocannabino!': 'Δ-9-THC',
  'A-9-Tetrabydrocannabivarinic': 'THCVA',
  'A-9-Tetrabydrocannabiphorol': 'THCP',
  'A-9-Tetrabydrocannabinol': 'Δ-9-THC',
  'A-9-Tetrabydrocannabighorol': 'Δ-9-THCO',
  'A-9-Tetrabrydrocannabivarinic': 'THCP',
  'A-9-Tetrabrydrocannabivarini': 'THCP',
  'A-9-Tetrabrydrocannabiphorol': 'THCP',
  'A-9-Tetrabdrocannabiphorol': 'THCP',
  'A-8-THC': 'Δ-8-THC',
  'A-8-Tetrahydrocannabinol': 'Δ-8-THC',
  'A-8-Tetrahydrocannabinol': 'Δ-8-THC',
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
  '9 Teuahyrocanmatioolic': 'Δ-9-THCA',
  '9 Tetrahyrocanatiool': 'Δ-9-THCAs',
  '75%-Henatydrocarrabingl': '9S-HHC',
  '75-Hexatydrocarrabiscl': '9S-HHC',
  '4-9-Totratydrocannabivarin': 'THCV',
  '4-9-Tetrahydrocannabinolic': 'Δ-9-THCA',
  '4-9-Tetrahydrocannabinol': 'Δ-9-THC',
  '4-8-Tetrahydrocannabinol': 'Δ-8-THC',
  '$-A-10-Tetrahydrocannabinol': 'S-Δ-10-THC',
  '?R-HHC': '9R-HHC',
}
cannabinoidSpellingMap = Object.entries(cannabinoidSpellingMap).sort(longestFirst);

const cannabinoidNameList = Array.from(Object.values(cannabinoidSpellingMap))
  .map(item => item[1])
  .filter((item, index, self) => self.indexOf(item) === index);


let terpeneSpellingMap = {
  'γ-Terpinene': 'Terpinolene',
  'β-Myrcene': 'Myrcene',
  'β-Caryophyllene': 'Caryophyllene',
  'α-Terpinene': 'Terpinene',
  'α-Pinene': 'Pinene',
  'α-Humulene': 'Humulene',
  'α-Bisabolol': 'Bisabolol',
  'aBisabolol': 'Bisabolol',
  'y-Terpinene': 'Terpinolene',
  'Y-Terpinene': 'Terpinolene',
  'Terpinolene': 'Terpinolene',
  'Pulegone': 'Pulegone',
  'Pinene': 'Pinene',
  'Ocimene': 'Ocimene',
  'o-Humulene': 'Humulene',
  'Nerolidol': 'Nerolidol',
  'Neroldol': 'Nerolidol',
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
  'Citeal': 'Citral',
  'Cineole': 'Eucalyptol',
  'Cinecle': 'Eucalyptol',
  'CaryophylleneOxide': 'Caryophyllene Oxide',
  'Caryophyllene Oxide': 'Caryophyllene Oxide',
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
  '1,8-Cinecle': 'Eucalyptol',
  'Caryophyllens Oxide': 'Caryophyllene Oxide',
  'Ferchone': 'Fenchone',
  'Neraolidol': 'Nerolidol',
  'B-Myrcene': 'Myrcene',
  'B-Caryophyllene': 'Caryophyllene',
  'B-Caryaphyllene': 'Caryophyllene',
  'B-Caryophyliene': 'Caryophyllene',
  'a-Terpinene': 'Terpinene',
  'a-Terpirene': 'Terpinene',
  'a-Pinens': 'Pinene',
  'a-Pinene': 'Pinene',
  'a-Pinene': 'Pinene',
  'a-Humulene': 'Humulene',
  'a-Finene': 'Pinene',
  'a-Bsabolol': 'Bisabolol',
  'a-Bisabolol': 'Bisabolol',
  '1.8-Cinecle': 'Eucalyptol',
  '1,8-Cineole': 'Eucalyptol',
  '1,8 Cineole': 'Eucalyptol',
  '18-Cineole': 'Eucalyptol',
  '«-Pinene': 'Pinene',
  '«-Bisabolol': 'Bisabolol',
  '-Bisabolol': 'Bisabolol',
};

terpeneSpellingMap = Object.entries(terpeneSpellingMap).sort(longestFirst);

//const terpeneNameList = Array.from(Object.values(terpeneSpellingMap)[1]).filter((item, index, self) => self.indexOf(item) === index);
const terpeneNameList = Array.from(Object.values(terpeneSpellingMap))
  .map(item => item[1]) // get the first element of each item
  .filter((item, index, self) => self.indexOf(item) === index); // remove duplicatesconsole.log(terpeneNameList)

function longestFirst(a, b) {
  if (b[0].length !== a[0].length) {
    return b[0].length - a[0].length;
  } else {
    return a[0].localeCompare(b[0]);
  }
}

module.exports = {
  getBufferFromFile,
  cannabinoidNameList,
  terpeneNameList,
  cannabinoidSpellingMap,
  terpeneSpellingMap,
  fileCachedDate,
}