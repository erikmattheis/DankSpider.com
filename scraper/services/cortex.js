const fs = require('fs')
const { cannabinoidNameList, terpeneNameList } = require('./memory.js')
const { isValidURI } = require('./strings.js')

function transcribeAssay(str, url, vendor) {

  if (!str?.split) {
    console.log('can\'t split', url, 'type:', typeof str, str)
    fs.appendFileSync('./temp/errors.url.txt', `${vendor} can't split ${url}\n`)
    return []
  }
  if (!isValidURI(url)) {
    console.log('invalid url', url)
    fs.appendFileSync('./temp/errors.url.txt', `${vendor} invalid url ${url}\n`)
    return []
  }

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

function filterLine(line, normalizationFunction, vendor) {
  if (line && !line.replace) {
    fs.writeFileSync('./temp/unknownlinecs.txt', `${vendor} ${line}\n`)
    return ['Unknown', 0]
  }

  const name = normalizationFunction(line, line) || 'Unknown';

  let cleanedLine = line.replace(/\s+/g, ' ');
  cleanedLine = removeCharactersAfterLastDigit(cleanedLine)

  /*
  let parts = cleanedLine.split(' ');

  if (parts.length) {
    parts[0] = parts[0].replace(/0\.030/g, '').trim();
  }
*/


  let parts = cleanedLine.split(' ');

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
  const parts = filterLine(ln, extractAnyChemical, vendor)

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

const lines = new Set();

function linePasses(line) {
  if (lines.has(line)) {
    return false
  }
  const hasLetter = /[a-zA-Z]/.test(line);
  const hasNumber = /\d/.test(line);
  const hasMultipleSpaces = line.split(' ').length > 1;
  if (hasLetter && hasNumber && hasMultipleSpaces && line.length > 11) {
    lines.add(line)
    return true
  }
  return false
}

function writeUnknownLines(batchId) {
  fs.writeFileSync(`./temp/unknownlines-${batchId}.txt`, Array.from(lines).join('\n'))
}

function recordUnknown(str, ln, vendor) {
  if (linePasses(ln)) {
    fs.appendFileSync('./temp/unknownlines.txt', `${vendor} | ${str} | ${ln}\n`)
  }
}

function extractAnyChemical(str, ln, vendor) {
  if (cannabinoidNameList.some(s => str.includes(s))) {

    // chemical name 0 0 3 3
    return cannabinoidNameList[str].name
  }

  if (terpeneNameList.some(s => str.includes(s))) {
    return terpeneNameList[str].name
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

function strIsFound(str) {

  if (cannabinoidNameList.some(s => str.includes(s)) || terpeneNameList.some(s => str.includes(s))) {

    return true;
  }
  return false;
}

module.exports = {
  transcribeAssay,
  cannabinoidNameList,
  terpeneNameList,
  getAnyChemical,
  stringContainsNonFlowerProduct,
  writeUnknownLines,
  strIsFound,
}