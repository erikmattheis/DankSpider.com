const fs = require('fs')
const { cannabinoidSpellings, terpeneSpellings } = require('./memory.js')

function transcribeAssay(str, url, vendor) {

  if (!str?.split) {
    console.log('can\'t split', url, 'type:', typeof str, str)
    fs.appendFileSync('./temp/errors.txt', `can't split ${url}\n`)
    return null
  }
  console.log('transcribeAssay', str, url, vendor)
  const lines = str.split('\n')

  const filteredLines = lines.filter(line => line.includes(' '))

  const chems = filteredLines.map(line => getAnyChemical(line, url, vendor))

  const chemicals = chems.filter(chem => chem.name !== 'Unknown' && chem.pct > 0)

  return chemicals

}

function removeCharactersAfterLastDigit(str) {
  return str.replace(/(\d)\D*$/, '$1');
}

function fixMissedPeriod(str) {
  const was = str;
  let string = str.replace('.', '')
  if (string.length > 3) {
    string = string.slice(0, string.length - 3) + '.' + string.slice(string.length - 3)
  }
}

function filterLine(line, normalizationFunction) {
  console.log('filterLine')
  if (line && !line.replace) {
    return ['Unknown', 0]
  }

  let cleanedLine = line.replace(/\s+/g, ' ');
  cleanedLine = removeCharactersAfterLastDigit(cleanedLine)

  let parts = cleanedLine.split(' ');

  if (parts.length) {
    parts[0] = parts[0].replace(/0\.030/g, '').trim();
  }

  const name = normalizationFunction(parts.shift(), line) || 'Unknown';

  // parts = parts.map((part, i) => { if (!isNaN(part)) { return fixMissedPeriod(part) } return part })

  parts = parts.map(part => {
    if (/ND$|\.0485$|\.0728$|^>3\.000$|^0\.030|^0\.0500$|3\.000$|^0\.750$|[<>][LlIi1|][Oo0]Q$/.test(part)) {
      return "0";
    }
    return part;
  })

  parts.unshift(name);

  return parts;
}

function getMgg(parts, line) {
  let mgg = parts[parts.length - 2]

  if (!mgg.includes('.')) {
    mgg = mgg.slice(0, mgg.length - 3) + '.' + mgg.slice(mgg.length - 3)
  }

  return mgg;
}


function getAnyChemical(ln, vendor) {
  console.log('getAnyChemical', ln, vendor)
  const parts = filterLine(ln, normalizeAnyChemical, vendor)

  const name = parts[0];

  if (name === 'Unknown' || parts.length < 3) {
    recordUnknown(name, ln, vendor)
    return { name, pct: 0, mgg: 0, originalText: ln }
  }

  const mgg = getMgg(parts, ln)
  const pct = (parseFloat(mgg) / 10).toFixed(3)

  const originalText = ln || 'Unknown'

  return { name, pct, mgg, originalText }
}

const canns = Object.keys(cannabinoidSpellings).map(key => cannabinoidSpellings[key].name);
const cannabinoidNameList = canns.filter((item, index, self) => self.indexOf(item) === index);
cannabinoidNameList.sort();

const terps = Object.keys(terpeneSpellings).map(key => terpeneSpellings[key].name);
const terpeneNameList = terps.filter((item, index, self) => self.indexOf(item) === index);
terpeneNameList.sort();

const lines = new Set();

function linePasses(line) {
  const hasLetter = /[a-zA-Z]/.test(line);
  const hasNumber = /\d/.test(line);
  const hasSpaces = line.split(' ').length > 1;

  if (hasLetter && hasNumber && hasSpaces && line.length > 11) {
    return true
  }

  lines.add(line)
  return false
}

function writeUnknownLines(batchId) {
  fs.writeFileSync(`./temp/unknownlines-${batchId}.txt`, Array.from(lines).join('\n'))
}

function recordUnknown(str, ln, vendor) {
  if (linePasses(ln)) {
    fs.appendFileSync('./temp/unknownchemicals.txt', `${str}\n`)
  }
}

function normalizeAnyChemical(str, ln, vendor) {
  console.log('normalizeAnyChemical', str, ln, vendor)
  if (cannabinoidSpellings[str] && cannabinoidSpellings[str].confidence > 0.7) {
    return cannabinoidSpellings[str].name
  }

  if (terpeneSpellings[str]) {
    return terpeneSpellings[str].name
  }

  recordUnknown(str, ln, vendor)

  return "Unknown"
}

function stringContainsNonFlowerProduct(str) {
  if (['Rosin', 'Resin', 'Full Melt', 'Bubble Hash', 'Sift Hash', 'Macaroons', 'Cannacookies', 'Pre-Rolls', 'Pre Rolls', 'Mixed Smalls', 'Mixed Shake', 'Diamonds', 'Cereal Bars', 'Bundles', 'Vape '].some(s => str.includes(s))) {
    return true
  }
  return false
}


module.exports = {
  transcribeAssay,
  cannabinoidNameList,
  terpeneNameList,
  getAnyChemical,
  stringContainsNonFlowerProduct,
  writeUnknownLines
}