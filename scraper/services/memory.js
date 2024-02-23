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



const cannabinoidSpellingsObj = {
  'A-9-Tetrahydrocannabinol': { name: '∆-9-THC', confidence: 0.99 },
  '95-Hexabydrocannabinol': { name: '9S-HHC', confidence: 0.9 },
  '9R-Henahydrocannabinol': { name: '9R-HHC', confidence: 0.99 },
  '9S-HHC': { name: '9S-HHC', confidence: 0.99 },
  'A-9-Tetrabdrocannabiphorol': { name: '∆-9-THCP', confidence: 0.99 },
  'A-9-Tetrabrydrocannabiphorol': { name: '∆-9-THCP', confidence: 0.99 },
  'A-9-Tetrabrydrocannabivarini': { name: '∆-9-THCP', confidence: 0.99 },
  'A-9-Tetrabrydrocannabivarinic': { name: '∆-9-THCP', confidence: 0.99 },
  'A-9-Tetrabydrocannabighorol': { name: '∆-9-THCO', confidence: 0.99 },
  'A-9-Tetrabydrocannabinol': { name: '∆-9-THC', confidence: 0.99 },
  'A-9-Tetrabydrocannabiphorol': { name: '∆-9-THCP', confidence: 0.99 },
  'A-9-Tetrabydrocannabivarinic': { name: '∆-9-THCVA', confidence: 0.99 },
  'A-9-Tetrahydrocannabino!': { name: '∆-9-THC', confidence: 0.99 },
  'A-9-Tetrahydrocannatinolic': { name: '∆-9-THCO', confidence: 0.99 },
  'A-9-Tetratrydrocannabivarinic': { name: '∆-9-THCVA', confidence: 0.99 },
  'A-9-Tetratydrocannabiphorol': { name: '∆-9-THCP', confidence: 0.99 },
  'B-9-Tetrabwdrocannabighorol': { name: '∆-9-THCO', confidence: 0.99 },
  'B-9-Tetrabwdrocannabighorol': { name: '∆-9-THCO', confidence: 0.99 },
  'Cannabidivaria': { name: 'CBDVA', confidence: 0.99 },
  'Cannabidivarieic': { name: 'CBDVA', confidence: 0.99 },
  'Cannabldiolic': { name: 'CBDA', confidence: 0.99 },
  'Cannablgerolic': { name: 'CBG', confidence: 0.99 },
  'Cannatichromene': { name: 'CBC', confidence: 0.99 },
  'Cannatidiolic': { name: 'CBD', confidence: 0.99 },
  'Cannatigerol': { name: 'CBG', confidence: 0.99 },
  'Cannubichromene': { name: 'CBC', confidence: 0.99 },
  'Cannubidiol': { name: 'CBD', confidence: 0.99 },

  'Cannubidivarinic': { name: 'CBDVA', confidence: 0.99 },
  'Cannubidivarinne': { name: 'CBDVA', confidence: 0.99 },
  'Canrabidiolic': { name: 'CBDA', confidence: 0.99 },
  'Canrabidivarin': { name: 'CBDVA', confidence: 0.99 },
  'Canrabinolic': { name: 'CBN', confidence: 0.99 },
  'Canrubidivarieic': { name: 'CBDVA', confidence: 0.99 },
  'Canrubidivarieic': { name: 'CBDVA', confidence: 0.99 },
  'CBDA': { name: 'CBDA', confidence: 0.99 },
  'CBDVA': { name: 'CBDVA', confidence: 0.99 },
  'CBGA': { name: 'CBGA', confidence: 0.99 },
  'IR-Hexahydrocannabinol': { name: '9R-HHC', confidence: 0.99 },
  'O-9-Tetrabwdrocannabivarinic': { name: '∆-9-THCVA', confidence: 0.99 },

  'Tetrabwdrocannabinel': { name: '∆-9-THC', confidence: 0.99 },
  'Tetrahydrocannabivarin': { name: '∆-9-THCV', confidence: 0.99 },
  'Tetrahydrocannabivarinic': { name: '∆-9-THCVA', confidence: 0.99 },
  'Tetralwdrocannabinol': { name: '∆-9-THC', confidence: 0.99 },
  'THCV': { name: '∆-9-THCV', confidence: 0.99 },
  'THCVA': { name: '∆-9-THCVA', confidence: 0.99 },
  'Totrahydrocarnabingl': { name: '9S-HHC', confidence: 0.99 },
  '4-9-Totratydrocannabivarin': { name: '∆-9-THCV', confidence: 0.99 },
  '4-9-Totratydrocannabivarin': { name: '∆-9-THCV', confidence: 0.99 },
  '95-Hexabydrocannabinol': { name: '9S-HHC', confidence: 0.99 },
  '95-Hexabydrocannabinol': { name: '9S-HHC', confidence: 0.99 },
  '9R-Henahydrocannabinol': { name: '9R-HHC', confidence: 0.99 },
  '9R-HHC': { name: '9R-HHC', confidence: 0.99 },
  '9S-HHC': { name: '9S-HHC', confidence: 0.99 },
  'CBDA*®': { name: 'CBDA', confidence: 0.99 },
  'CBD*': { name: 'CBD', confidence: 0.99 },
  '-A-10-Tetrahydrocannabinol': { name: 'S-∆-10-THC', confidence: 1 },
  '?5-Hexatydrocarrabiacl': { name: '9S-HHC', confidence: 0.9 },
  '?R-HHC': { name: '9R-HHC', confidence: 0.99 },
  '∆ 9-THC': { name: '∆-9-THC', confidence: 0.99 },
  '∆ 9-THCA': { name: '∆-9-THCA', confidence: 0.99 },
  '∆ 9-THCVA': { name: '∆-9-THCVA', confidence: 0.99 },
  '∆-8-THC': { name: '∆-8-THC', confidence: 0.99 },
  '∆-9 THC': { name: '∆-9-THC', confidence: 0.99 },
  '∆-9 THCA': { name: '∆-9-THCA', confidence: 0.99 },
  '∆-9-THC': { name: '∆-9-THC', confidence: 0.99 },
  '∆-9-THCA': { name: '∆-9-THCA', confidence: 0.99 },
  '∆-9-THCV': { name: '∆-9-THCV', confidence: 0.99 },
  '∆-9-THCVA': { name: '∆-9-THCVA', confidence: 0.99 },
  '$-A-10-Tetrahydrocannabinol': { name: 'S-∆-10-THC', confidence: 1 },
  '1,8-Cinecle': { name: 'Eucalyptol', confidence: 0.99 },
  '1.B-Cinecle': { name: 'Eucalyptol', confidence: 0.99 },
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
  '9S-HHC': { name: '9S-HHC', confidence: 0.99 },
  'A-8-Tetrahydrocannabinol (A-8 THC)': { name: '∆-8-THC', confidence: 0.99 },
  'A-8-Tetrahydrocannabinol': { name: '∆-8-THC', confidence: 0.99 },
  'A-8-THC': { name: '∆-8-THC', confidence: 0.99 },
  'A-9-Tetrahydrocannabinol (A-9 THC)': { name: '∆-9-THC', confidence: 0.99 },
  'A-9-Tetrahydrocannabinol Acetate (A-9-THCO)': { name: '∆-9-THCO', confidence: 0.99 },
  'A-9-Tetrahydrocannabinol': { name: '∆-9-THC', confidence: 0.99 },
  'A-9-Tetrahydrocannabinolic Acid (THCA-A)': { name: '∆-9-THCA', confidence: 0.99 },
  'A-9-Tetrahydrocannabinolic Acid': { name: '∆-9-THCA', confidence: 0.99 },
  'A-9-Tetrahydrocannabinolic': { name: '∆-9-THCA', confidence: 0.99 },
  'A-9-Tetrahydrocannabiphorel': { name: '∆-9-THCP', confidence: 0.99 },
  'A-9-Tetrahydrocannabiphorol (A-9-THCP)': { name: '∆-9-THCP', confidence: 0.99 },
  'A-9-Tetrahydrocannabiphorol': { name: '∆-9-THCP', confidence: 0.99 },
  'A-9-Tetrahydrocannabivarin (A-9-THCV)': { name: '∆-9-THCV', confidence: 0.99 },
  'A-9-Tetrahydrocannabivarin': { name: '∆-9-THCV', confidence: 0.99 },
  'A-9-Tetrahydrocannabivarinic Acid (A-9-THCVA)': { name: '∆-9-THCVA', confidence: 0.99 },
  'A-9-Tetrahydrocannabivarinic': { name: '∆-9-THCVA', confidence: 0.99 },
  'A-9-Tetrahydrocannatinolic': { name: '∆-9-THCO', confidence: 0.99 },
  'A-9-Tetratydrocannabiphorol': { name: '∆-9-THCP', confidence: 0.99 },
  'A-9-THC': { name: '∆-9-THC', confidence: 0.99 },
  'A-9-THCA-A': { name: '∆-9-THCA', confidence: 0.99 },
  'A-9-THCA': { name: '∆-9-THCA', confidence: 0.99 },
  'A-9-THCP': { name: '∆-9-THCP', confidence: 0.99 },
  'A-9-THCV': { name: '∆-9-THCV', confidence: 0.99 },
  'A-9-THCVA': { name: '∆-9-THCVA', confidence: 0.99 },
  'A?-THCV': { name: '∆-9-THCV', confidence: 0.99 },
  'A8-THC': { name: '∆-8-THC', confidence: 0.99 },
  'A9-THC': { name: '∆-9-THC', confidence: 0.99 },
  'A9-THCA-A': { name: '∆-9-THCA', confidence: 0.99 },
  'A9-THCA': { name: '∆-9-THCA', confidence: 0.99 },
  'A9-THCVA': { name: '∆-9-THCVA', confidence: 0.99 },
  'B cBGA': { name: 'CBGA', confidence: 0.99 }, // *
  'B THCA*': { name: '∆-9-THCA', confidence: 0.99 }, // *
  'Camnabichromenic': { name: 'CBC', confidence: 0.9 },
  'Camnabigeralic': { name: 'CBG', confidence: 0.9 },
  'Cannabichabe': { name: 'CBC', confidence: 0.6 },
  'Cannabichearinic': { name: 'CBCA', confidence: 0.9 },
  'Cannabichonvene': { name: 'CBC', confidence: 0.8 },
  'Cannabichromene (CBC)': { name: 'CBC', confidence: 0.99 },
  'Cannabichromene': { name: 'CBC', confidence: 1 },
  'Cannabichromenic Acid': { name: 'CBC', confidence: 0.9 },
  'Cannabichromenic': { name: 'CBCA', confidence: 1 },
  'Cannabicyclol (CBL)': { name: 'CBL', confidence: 0.99 },
  'Cannabidiol (CBD)': { name: 'CBD', confidence: 0.99 },
  'Cannabidiol': { name: 'CBD', confidence: 1 },
  'Cannabidiolic Acid (CBDA)': { name: 'CBDA', confidence: 0.99 },
  'Cannabidiolic Acid': { name: 'CBD', confidence: 0.9 },
  'Cannabidiolic': { name: 'CBDA', confidence: 1 },
  'Cannabidivarin (CBDV)': { name: 'CBDV', confidence: 0.99 },
  'Cannabidivarin': { name: 'CBDV', confidence: 1 },
  'Cannabidivarinic Acid (CBDVA)': { name: 'CBDVA', confidence: 0.99 },
  'Cannabidivarinic Acid': { name: '∆-9-THCV', confidence: 0.8 },
  'Cannabidivarinic': { name: 'CBDVA', confidence: 1 },
  'Cannabigeral': { name: 'CBG', confidence: 0.7 },
  'Cannabigerdl': { name: 'CBG', confidence: 0.7 },
  'Cannabigerol (CBG)': { name: 'CBG', confidence: 0.99 },
  'cannabigerol': { name: 'CBG', confidence: 0.99 },
  'Cannabigerol': { name: 'CBG', confidence: 1 },
  'Cannabigerolic Acid (CBGA)': { name: 'CBGA', confidence: 0.99 },
  'Cannabigerolic Acid': { name: 'CBGA', confidence: 0.99 },
  'Cannabigerolic': { name: 'CBGA', confidence: 1 },
  'Cannabinol (CBN)': { name: 'CBN', confidence: 0.99 },
  'Cannabinol': { name: 'CBN', confidence: 1 },
  'Cannabinolic Acid (CBNA)': { name: 'CBNA', confidence: 0.99 },
  'Cannabinolic': { name: 'CBNA', confidence: 1 },
  'Cannatinol': { name: 'CBN', confidence: 0.8 },
  'Canrudschromenic': { name: 'CBC', confidence: 0.9 },
  'Canrudsdial': { name: 'CBD', confidence: 0.9 },
  'Carnabigerol': { name: 'CBG', confidence: 0.99 },
  'Carrubichromenic': { name: 'CBC', confidence: 0.9 },
  'Carrubirolic': { name: 'CBG', confidence: 0.7 },
  'Carrubsrolic': { name: 'CBG', confidence: 0.7 },
  'Carrubyrolic': { name: 'CBG', confidence: 0.7 },
  'Carvubschasn': { name: 'CBC', confidence: 0.9 },
  'Carvubschrorrenic': { name: 'CBC', confidence: 0.9 },
  'Carvubsgerolic': { name: 'CBG', confidence: 0.7 },
  'Carvubzdizl(CHDY': { name: 'CBD', confidence: 0.9 },
  'Carvudschromenk': { name: 'CBC', confidence: 0.9 },
  'CBC': { name: 'CBC', confidence: 0.99 },
  'CBCA': { name: 'CBCA', confidence: 0.99 },
  'CBCV': { name: 'CBCV', confidence: 0.99 },
  'CBD': { name: 'CBD', confidence: 0.99 },
  'CBD*': { name: 'CBD', confidence: 0.99 },
  'CBDA': { name: 'CBDA', confidence: 0.99 },
  'CBDA*': { name: 'CBDA', confidence: 0.9 },
  'CBDV': { name: 'CBDV', confidence: 0.99 },
  'CBDVA': { name: 'CBDVA', confidence: 0.99 },
  'CBG': { name: 'CBG', confidence: 0.99 },
  'CBGA': { name: 'CBGA', confidence: 0.99 },
  'CBL': { name: 'CBL', confidence: 0.99 },
  'CBLA': { name: 'CBL', confidence: 0.99 },
  'CBN': { name: 'CBN', confidence: 0.99 },
  'CBNA': { name: 'CBNA', confidence: 0.99 },
  'CBT': { name: 'CBT', confidence: 0.99 },
  'Conmaby': { name: 'CBL', confidence: 0.8 },
  'd8-THC': { name: '∆-8-THC', confidence: 0.99 },
  'd9-THC*': { name: '∆-9-THC', confidence: 0.99 },
  'Delta 8-Tetrahydrocannabinol': { name: '∆-8-THC', confidence: 0.99 },
  'Delta 9-Tetrahydrocannabinol': { name: '∆-9-THC', confidence: 0.99 },
  'Delta 9-Tetrahydrocannabinolic': { name: '∆-9-THCA', confidence: 0.99 },
  'Delta 9-THCVA': { name: '∆-9-THCVA', confidence: 0.99 },
  'Delta-9-THC': { name: '∆-9-THC', confidence: 0.99 },
  'FR-He': { name: '9R-HHC', confidence: 0.9 },
  'FR-Hewbrpdr': { name: '9R-HHC', confidence: 0.9 },
  'FR-Hewtredr': { name: '9R-HHC', confidence: 0.9 },
  'FR-Hexatrd': { name: '9R-HHC', confidence: 0.9 },
  'FR-Hexdrd': { name: '9R-HHC', confidence: 0.9 },
  'IC=THCa*': { name: '∆-9 THCA', confidence: 0.9 },
  'Limcrene': { name: 'Limonene', confidence: 0.99 },
  'Limonens': { name: 'Limonene', confidence: 0.99 },
  'Linaloo!': { name: 'Linalool', confidence: 0.99 },
  'Linalood': { name: 'Linalool', confidence: 0.99 },
  'o-Bisabolol': { name: 'Bisabolol', confidence: 0.99 },
  'o-Pinene': { name: 'Pinene', confidence: 0.99 },
  'o-Terpinene': { name: 'Terpinene', confidence: 0.99 },
  'R-A-10-Tetrahydrocannabinol (R-A-10-THC)': { name: 'R-∆-10-THC', confidence: 0.99 },
  'R-A-10-Tetrahydrocannabinol': { name: 'R-∆-10-THC', confidence: 1 },
  'R-Delta 10-THC': { name: 'R-∆-10-THC', confidence: 0.99 },
  'S-A-10-Tetrahydrocannabinol (S-A-10-THC)': { name: 'S-∆-10-THC', confidence: 0.99 },
  'S-A-10-Tetrahydrocannabinol': { name: 'S-∆-10-THC', confidence: 0.99 },
  'S-Delta 10-THC': { name: 'S-∆-10-THC', confidence: 0.99 },
  'Tetrahwdrocannabinol:': { name: '∆-9-THC', confidence: 1 },
  'Tetrahydrocannabinol': { name: '∆-9-THC', confidence: 1 },
  'Tetrahydrocannabivarin (THCV)': { name: 'THCV', confidence: 0.99 },
  'Tetrahydrocannabivarinic Acid': { name: '∆-9-THCVA', confidence: 0.99 },
  'Tetratwarocamanng': { name: '∆-9-THC', confidence: 1 },
  'THC': { name: '∆-9-THC', confidence: 0.99 },
  'THCA': { name: '∆-9-THCA', confidence: 0.99 },
  'THCA*': { name: '∆-9-THCA', confidence: 0.99 },
  'THCA*®': { name: '∆-9-THCA', confidence: 0.99 },
  'THCO': { name: '∆-9-THCO', confidence: 0.99 },
  'THCP': { name: '∆-9-THCP', confidence: 0.99 },
  'THCV': { name: '∆-9-THCV', confidence: 0.99 },
  'THCVa': { name: '∆-9-THCVA', confidence: 0.99 },

}

const cannabinoidSpellings = Array.from(cannabinoidSpellingsObj)

function extractNameProperties(spellings) {
  return Object.values(spellings).map(cannabinoid => cannabinoid.name);
}

const cannabinoidNameList = extractNameProperties(cannabinoidSpellings).map(name => `'${name}'`).join(', ');


const terpeneSpellingsObj = {

  'a-Pinens': { name: 'Pinene', confidence: 0.99 },
  '-Bisabolol': { name: 'Bisabolol', confidence: 0.99 },
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
  'Borneol': { name: 'Borneol', confidence: 0.99 },
  'Borrmeol': { name: 'Borneol', confidence: 0.99 },
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
  'A9-Tetrabydrecamasinalic Ackd (THCA-R)': { name: 'THCA-R', confidence: 0.99 },
  'A9-THCV': { name: 'THCV', confidence: 0.99 },
  'A9-THCVA': { name: 'THCVA', confidence: 0.99 },

};

const terpeneSpellings = Array.from(terpeneSpellingsObj);

const terpeneNameList = extractNameProperties(terpeneSpellings).map(name => `'${name}'`).join(', ');

function filterAssay(assay) {
  return assay?.filter(chem => parseFloat(chem.pct) > 0 && chem.name !== 'Unknown' && !chem.name.toLowerCase().includes('total'));
}

module.exports = {
  getBuffer,
  cannabinoidSpellings,
  terpeneSpellings,
  cannabinoidNameList,
  terpeneNameList,
  filterAssay
}