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

    fs.appendFileSync('./temp/errors.buffer.txt', `\nUrl: ${url}\n${JSON.stringify(error, null, 2)}\n\n`)

  }

}

/*

4-9-Totratydrocannabivarin
4-9-Totratydrocannabivarin
95-Hexabydrocannabinol
95-Hexabydrocannabinol
9R-Henahydrocannabinol
9R-HHC
9S-HHC
A-9-Tetrabdrocannabiphorol
A-9-Tetrabrydrocannabiphorol
A-9-Tetrabrydrocannabivarini
A-9-Tetrabrydrocannabivarinic
A-9-Tetrabydrocannabighorol
A-9-Tetrabydrocannabinol
A-9-Tetrabydrocannabiphorol
A-9-Tetrabydrocannabivarinic
A-9-Tetrahydrocannabino!
A-9-Tetrahydrocannatinolic
A-9-Tetratrydrocannabivarinic
A-9-Tetratydrocannabiphorol
B-9-Tetrabwdrocannabighorol
B-9-Tetrabwdrocannabighorol
Cannabidivaria
Cannabidivarieic
Cannabldiolic
Cannablgerolic
Cannatichromene
Cannatidiolic
Cannatigerol
Cannubichromene
Cannubidiol
Cannubidivarinic
Cannubidivarinne
Canrabidiolic
Canrabidivarin
Canrabinolic
Canrubidivarieic
Canrubidivarieic
CBDA
CBDVA
CBGA
IR-Hexahydrocannabinol
O-9-Tetrabwdrocannabivarinic

Tetrabwdrocannabinel
Tetrahydrocannabivarin
Tetrahydrocannabivarinic
Tetralwdrocannabinol
THCV
THCVA
Totrahydrocarnabingl

*/



const cannabinoidSpellingMap = {
  'A-9-Tetrahydrocannabinol': '∆-9-THC',
  '95-Hexabydrocannabinol': '9S-HHC',
  '9R-Henahydrocannabinol': '9R-HHC',
  '9S-HHC': '9S-HHC',
  'A-9-Tetrabdrocannabiphorol': '∆-9-THCP',
  'A-9-Tetrabrydrocannabiphorol': '∆-9-THCP',
  'A-9-Tetrabrydrocannabivarini': '∆-9-THCP',
  'A-9-Tetrabrydrocannabivarinic': '∆-9-THCP',
  'A-9-Tetrabydrocannabighorol': '∆-9-THCO',
  'A-9-Tetrabydrocannabinol': '∆-9-THC',
  'A-9-Tetrabydrocannabiphorol': '∆-9-THCP',
  'A-9-Tetrabydrocannabivarinic': '∆-9-THCVA',
  'A-9-Tetrahydrocannabino!': '∆-9-THC',
  'A-9-Tetrahydrocannatinolic': '∆-9-THCO',
  'A-9-Tetratrydrocannabivarinic': '∆-9-THCVA',
  'A-9-Tetratydrocannabiphorol': '∆-9-THCP',
  'B-9-Tetrabwdrocannabighorol': '∆-9-THCO',
  'B-9-Tetrabwdrocannabighorol': '∆-9-THCO',
  'Cannabidivaria': 'CBDVA',
  'Cannabidivarieic': 'CBDVA',
  'Cannabldiolic': 'CBDA',
  'Cannablgerolic': 'CBG',
  'Cannatichromene': 'CBC',
  'Cannatidiolic': 'CBD',
  'Cannatigerol': 'CBG',
  'Cannubichromene': 'CBC',
  'Cannubidiol': 'CBD',
  'Cannubidivarinic': 'CBDVA',
  'Cannubidivarinne': 'CBDVA',
  'Canrabidiolic': 'CBDA',
  'Canrabidivarin': 'CBDVA',
  'Canrabinolic': 'CBN',
  'Canrubidivarieic': 'CBDVA',
  'Canrubidivarieic': 'CBDVA',
  'CBDA': 'CBDA',
  'CBDVA': 'CBDVA',
  'CBGA': 'CBGA',
  'IR-Hexahydrocannabinol': '9R-HHC',
  'O-9-Tetrabwdrocannabivarinic': '∆-9-THCVA',
  'Tetrabwdrocannabinel': '∆-9-THC',
  'Tetrahydrocannabivarin': '∆-9-THCV',
  'Tetrahydrocannabivarinic': '∆-9-THCVA',
  'Tetralwdrocannabinol': '∆-9-THC',
  'THCV': '∆-9-THCV',
  'THCVA': '∆-9-THCVA',
  'Totrahydrocarnabingl': '9S-HHC',
  '4-9-Totratydrocannabivarin': '∆-9-THCV',
  '4-9-Totratydrocannabivarin': '∆-9-THCV',
  '95-Hexabydrocannabinol': '9S-HHC',
  '95-Hexabydrocannabinol': '9S-HHC',
  '9R-Henahydrocannabinol': '9R-HHC',
  '9R-HHC': '9R-HHC',
  '9S-HHC': '9S-HHC',
  'CBDA*®': 'CBDA',
  'CBD*': 'CBD',
  '-A-10-Tetrahydrocannabinol': 'S-∆-10-THC',
  '?5-Hexatydrocarrabiacl': '9S-HHC',
  '?R-HHC': '9R-HHC',
  '∆ 9-THC': '∆-9-THC',
  '∆ 9-THCA': '∆-9-THCA',
  '∆ 9-THCVA': '∆-9-THCVA',
  '∆-8-THC': '∆-8-THC',
  '∆-9 THC': '∆-9-THC',
  '∆-9 THCA': '∆-9-THCA',
  '∆-9-THC': '∆-9-THC',
  '∆-9-THCA': '∆-9-THCA',
  '∆-9-THCV': '∆-9-THCV',
  '∆-9-THCVA': '∆-9-THCVA',
  '$-A-10-Tetrahydrocannabinol': 'S-∆-10-THC',
  '1,8-Cinecle': 'Eucalyptol',
  '1.B-Cinecle': 'Eucalyptol',
  '4-8-Tetrahydrocannabinol': '∆-8-THC',
  '4-9-Tetrahydrocannabinol': '∆-9-THC',
  '4-9-Tetrahydrocannabinolic': '∆-9-THCA',
  '75-Hexatydrocarrabiscl': '9S-HHC',
  '75%-Henatydrocarrabingl': '9S-HHC',
  '9-S-HHC': '9S-HHC',
  '95-Hexahydracannabinal': '9S-HHC',
  '95-Hexahydrocannabinol': '9S-HHC',
  '95-Hexatydrocarrabisol': '9S-HHC',
  '9R-Hexahydrocannabinol': '9R-HHC',
  '9R-HHC': '9R-HHC',
  '9S-Hexahydrocannabinol': '9S-HHC',
  '9S-HHC': '9S-HHC',
  'A-8-Tetrahydrocannabinol (A-8 THC)': '∆-8-THC',
  'A-8-Tetrahydrocannabinol': '∆-8-THC',
  'A-8-THC': '∆-8-THC',
  'A-9-Tetrahydrocannabinol (A-9 THC)': '∆-9-THC',
  'A-9-Tetrahydrocannabinol Acetate (A-9-THCO)': '∆-9-THCO',
  'A-9-Tetrahydrocannabinol': '∆-9-THC',
  'A-9-Tetrahydrocannabinolic Acid (THCA-A)': '∆-9-THCA',
  'A-9-Tetrahydrocannabinolic Acid': '∆-9-THCA',
  'A-9-Tetrahydrocannabinolic': '∆-9-THCA',
  'A-9-Tetrahydrocannabiphorel': '∆-9-THCP',
  'A-9-Tetrahydrocannabiphorol (A-9-THCP)': '∆-9-THCP',
  'A-9-Tetrahydrocannabiphorol': '∆-9-THCP',
  'A-9-Tetrahydrocannabivarin (A-9-THCV)': '∆-9-THCV',
  'A-9-Tetrahydrocannabivarin': '∆-9-THCV',
  'A-9-Tetrahydrocannabivarinic Acid (A-9-THCVA)': '∆-9-THCVA',
  'A-9-Tetrahydrocannabivarinic': '∆-9-THCVA',
  'A-9-Tetrahydrocannatinolic': '∆-9-THCO',
  'A-9-Tetratydrocannabiphorol': '∆-9-THCP',
  'A-9-THC': '∆-9-THC',
  'A-9-THCA-A': '∆-9-THCA',
  'A-9-THCA': '∆-9-THCA',
  'A-9-THCP': '∆-9-THCP',
  'A-9-THCV': '∆-9-THCV',
  'A-9-THCVA': '∆-9-THCVA',
  'A?-THCV': '∆-9-THCV',
  'A8-THC': '∆-8-THC',
  'A9-THC': '∆-9-THC',
  'A9-THCA-A': '∆-9-THCA',
  'A9-THCA': '∆-9-THCA',
  'A9-THCVA': '∆-9-THCVA',
  'B cBGA': 'CBGA',
  'B THCA*': '∆-9-THCA',
  'Camnabichromenic': 'CBC',
  'Camnabigeralic': 'CBG',
  'Cannabichabe': 'CBC',
  'Cannabichearinic': 'CBCA',
  'Cannabichonvene': 'CBC',
  'Cannabichromene (CBC)': 'CBC',
  'Cannabichromene': 'CBC',
  'Cannabichromenic Acid': 'CBC',
  'Cannabichromenic': 'CBCA',
  'Cannabicyclol (CBL)': 'CBL',
  'Cannabidiol (CBD)': 'CBD',
  'Cannabidiol': 'CBD',
  'Cannabidiolic Acid (CBDA)': 'CBDA',
  'Cannabidiolic Acid': 'CBD',
  'Cannabidiolic': 'CBDA',
  'Cannabidivarin (CBDV)': 'CBDV',
  'Cannabidivarin': 'CBDV',
  'Cannabidivarinic Acid (CBDVA)': 'CBDVA',
  'Cannabidivarinic Acid': '∆-9-THCV',
  'Cannabidivarinic': 'CBDVA',
  'Cannabigeral': 'CBG',
  'Cannabigerdl': 'CBG',
  'Cannabigerol (CBG)': 'CBG',
  'cannabigerol': 'CBG',
  'Cannabigerol': 'CBG',
  'Cannabigerolic Acid (CBGA)': 'CBGA',
  'Cannabigerolic Acid': 'CBGA',
  'Cannabigerolic': 'CBGA',
  'Cannabinol (CBN)': 'CBN',
  'Cannabinol': 'CBN',
  'Cannabinolic Acid (CBNA)': 'CBNA',
  'Cannabinolic': 'CBNA',
  'Cannatinol': 'CBN',
  'Canrudschromenic': 'CBC',
  'Canrudsdial': 'CBD',
  'Carnabigerol': 'CBG',
  'Carrubichromenic': 'CBC',
  'Carrubirolic': 'CBG',
  'Carrubsrolic': 'CBG',
  'Carrubyrolic': 'CBG',
  'Carvubschasn': 'CBC',
  'Carvubschrorrenic': 'CBC',
  'Carvubsgerolic': 'CBG',
  'Carvubzdizl(CHDY': 'CBD',
  'Carvudschromenk': 'CBC',
  'CBC': 'CBC',
  'CBCA': 'CBCA',
  'CBCV': 'CBCV',
  'CBD': 'CBD',
  'CBD*': 'CBD',
  'CBDA': 'CBDA',
  'CBDA*': 'CBDA',
  'CBDV': 'CBDV',
  'CBDVA': 'CBDVA',
  'CBG': 'CBG',
  'CBGA': 'CBGA',
  'CBL': 'CBL',
  'CBLA': 'CBL',
  'CBN': 'CBN',
  'CBNA': 'CBNA',
  'CBT': 'CBT',
  'Conmaby': 'CBL',
  'd8-THC': '∆-8-THC',
  'd9-THC*': '∆-9-THC',
  'Delta 8-Tetrahydrocannabinol': '∆-8-THC',
  'Delta 9-Tetrahydrocannabinol': '∆-9-THC',
  'Delta 9-Tetrahydrocannabinolic': '∆-9-THCA',
  'Delta 9-THCVA': '∆-9-THCVA',
  'Delta-9-THC': '∆-9-THC',
  'FR-He': '9R-HHC',
  'FR-Hewbrpdr': '9R-HHC',
  'FR-Hewtredr': '9R-HHC',
  'FR-Hexatrd': '9R-HHC',
  'FR-Hexdrd': '9R-HHC',
  'IC=THCa*': '∆-9 THCA',
  'Limcrene': 'Limonene',
  'Limonens': 'Limonene',
  'Linaloo!': 'Linalool',
  'Linalood': 'Linalool',
  'o-Bisabolol': 'Bisabolol',
  'o-Pinene': 'Pinene',
  'o-Terpinene': 'Terpinene',
  'R-A-10-Tetrahydrocannabinol (R-A-10-THC)': 'R-∆-10-THC',
  'R-A-10-Tetrahydrocannabinol': 'R-∆-10-THC',
  'R-Delta 10-THC': 'R-∆-10-THC',
  'S-A-10-Tetrahydrocannabinol (S-A-10-THC)': 'S-∆-10-THC',
  'S-A-10-Tetrahydrocannabinol': 'S-∆-10-THC',
  'S-Delta 10-THC': 'S-∆-10-THC',
  'Tetrahwdrocannabinol:': '∆-9-THC',
  'Tetrahydrocannabinol': '∆-9-THC',
  'Tetrahydrocannabivarin (THCV)': 'THCV',
  'Tetrahydrocannabivarinic Acid': '∆-9-THCVA',
  'Tetratwarocamanng': '∆-9-THC',
  'THC': '∆-9-THC',
  'THCA': '∆-9-THCA',
  'THCA*': '∆-9-THCA',
  'THCA*®': '∆-9-THCA',
  'THCO': '∆-9-THCO',
  'THCP': '∆-9-THCP',
  'THCV': '∆-9-THCV',
  'THCVa': '∆-9-THCVA',
  'A9-Tetrabydrecamasinalic Ackd (THCA-R)': 'THCA-R',
  'A9-THCV': 'THCV',
  'A9-THCVA': 'THCVA',

}

const cannabinoidNameList = Array.from(Object.values(cannabinoidSpellingMap)).filter((item, index, self) => self.indexOf(item) === index);

const terpeneSpellingMap = {
  'a-Pinens': 'Pinene',
  '-Bisabolol': 'Bisabolol',
  '«-Bisabolol': 'Bisabolol',
  '«-Pinene': 'Pinene',
  '1,8-Cineole': 'Eucalyptol',
  '1.8-Cinecle': 'Eucalyptol',
  'a-Bisabolol': 'Bisabolol',
  'a-Bsabolol': 'Bisabolol',
  'a-Finene': 'Pinene',
  'a-Humulene': 'Humulene',
  'a-Pinene': 'Pinene',
  'a-Terpinene': 'Terpinene',
  'B-Caryophyliene': 'Caryophyllene',
  'B-Caryophyllene': 'Caryophyllene',
  'B-Myrcene': 'Myrcene',
  'Mentho!': 'Menthol',
  'o-Humulene': 'Humulene',
  'y-Terpinene': 'Terpinolene',
  'α-Bisabolol': 'Bisabolol',
  'α-Humulene': 'Humulene',
  'α-Pinene': 'Pinene',
  'α-Terpinene': 'Terpinene',
  'β-Caryophyllene': 'Caryophyllene',
  'β-Myrcene': 'Myrcene',
  'γ-Terpinene': 'Terpinolene',
  'Bisabolol': 'Bisabolol',
  'Bormwol': 'Borneol',
  'Bornel': 'Borneol',
  'Borreol': 'Borneol',
  'Borneol': 'Borneol',
  'Borrmeol': 'Borneol',
  'Camphene': 'Camphene',
  'Carene': 'Carene',
  'Caryophyllene': 'Caryophyllene',
  'CaryophylleneOxide': 'Caryophyllene Oxide',
  'Citral': 'Citral',
  'Dihydrocarveol': 'Dihydrocarveol',
  'Fenchone': 'Fenchone',
  'Ferxhone': 'Fenchone',
  'Limonene': 'Limonene',
  'Limonenes': 'Limonene',
  'Linalool': 'Linalool',
  'Menthol': 'Menthol',
  'Nerolidol': 'Nerolidol',
  'Ocimene': 'Ocimene',
  'Pulegone': 'Pulegone',
  'Terpinolene': 'Terpinolene'
};

const terpeneNameList = Array.from(Object.values(terpeneSpellingMap)).filter((item, index, self) => self.indexOf(item) === index);


function filterAssay(assay) {
  return assay?.filter(chem => parseFloat(chem.pct) > 0 && chem.name !== 'Unknown' && !chem.name.toLowerCase().includes('total'));
}

module.exports = {
  getBuffer,
  cannabinoidNameList,
  terpeneNameList,
  cannabinoidNameList,
  terpeneNameList,
  filterAssay
}