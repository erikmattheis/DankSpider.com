const fs = require('fs')
const { cannabinoidNameList, terpeneNameList, cannabinoidSpellingMap, terpeneSpellingMap } = require('./memory.js')
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

  const chems = filteredLines.map(line => lineToChemicalObject(line, url, vendor))

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
  return string;
}

function lineToChemicalObject(line, vendor) {
  if (line && !line.replace) {
    fs.writeFileSync('./temp/unknownlines.txt', `${vendor} ${line}\n`)
    return ['Unknown', 0]
  }

  let cleanedLine = line.replace(/\s+/g, ' ').trim();

  cleanedLine = removeCharactersAfterLastDigit(cleanedLine);

  const recognizedString = extractAnyChemical(line, vendor);

  if (!recognizedString) {
    return { name: 'Unknown', pct: 0, line }
  }

  if (cleanedLine.startsWith(recognizedString)) {
    cleanedLine = cleanedLine.slice(recognizedString.length).trim();
  }

  const name = recognizedString;

  let parts = cleanedLine.split(' ');

  parts = parts.map((part, i) => { if (!isNaN(part)) { return fixMissedPeriod(part) } return part })

  parts = parts.filter(part => !isCalibration(part));

  const mgg = getMgg(parts, line);

  const pct = parseFloat(mgg).toFixed(2);

  return { name, pct, line }
}

function isCalibration(part) {
  return /ND$|\.0485$|\.0728$|^>3\.000$|^0\.030|^0\.0500$|3\.000$|^0\.750$|[<>][LlIi1|][Oo0]Q$/.test(part)
}

function getMgg(parts, line) {
  if (parts.length < 3) {
    return 0
  }

  const importantParts = parts.filter(part => !isCalibration(part));

  if (importantParts.length < 3) {
    return 0
  }
  console.log('importantParts', importantParts)
  let mgg = importantParts[importantParts.length - 2]

  if (mgg.includes('<')) {
    mgg = 0
  }

  if (!mgg.includes('.')) {
    mgg = mgg.slice(0, mgg.length - 3) + '.' + mgg.slice(mgg.length - 3)
  }

  return mgg;
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

function recognizeString(line) {

  for (const name of cannabinoidNameList) {
    if (line.startsWith(name)) {
      return name
    }
  }

  for (const name of terpeneNameList) {
    if (line.startsWith(name)) {
      return name
    }
  }
}

function extractAnyChemical(line, vendor) {

  let cleanedLine = line.replace(/\s+/g, ' ').trim();

  const recognizedString = recognizeString(cleanedLine) || 'Unknown';

  if (recognizedString !== 'Unknown') {
    return recognizedString
  }

  recordUnknown(line, vendor)

  return recognizedString
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
  lineToChemicalObject,
  stringContainsNonFlowerProduct,
  writeUnknownLines,
}