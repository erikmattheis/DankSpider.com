const fs = require('fs')
const { cannabinoidNameList, terpeneNameList, cannabinoidSpellingMap, terpeneSpellingMap } = require('./memory.js')
const { isValidURI } = require('./strings.js')
const { parse } = require('path')

function transcribeAssay(str, url, vendor) {

  if (!str?.split) {
    console.log('can\'t split', url, 'type:', typeof str, str)
    fs.appendFileSync('./temp/errors.url.txt', `${vendor} can't split ${url}\n`)
    return []
  }

  if (!isValidURI(url)) {
    console.log('invalid url', url, vendor)
    fs.appendFileSync('./temp/errors.url.txt', `${vendor} invalid url ${url} ${vendor}\n`)
    return []
  }

  const lines = str.split('\n')
  //console.log('lines', lines.length)
  const filteredLines = lines.filter(line => line.includes(' '))

  const chems = filteredLines.map(line => lineToChemicalObject(line, url, vendor))

  if (chems.length === 0) {
    fs.appendFileSync('./temp/unknown-problem.txt', `${vendor} unknown problem ${url}, \n`)
  }

  //const chemicals = chems.filter(chem => chem.name !== 'Unknown' && chem.pct > 0)

  return chems

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
    return ['Unknown1', 0]
  }

  let cleanedLine = line.replace(/\s+/g, ' ').trim();

  cleanedLine = removeCharactersAfterLastDigit(cleanedLine);

  const recognizedString = extractAnyChemical(line, vendor);

  if (!recognizedString) {
    return { name: '2', pct: 0, line }
  }

  if (cleanedLine.startsWith(recognizedString)) {
    cleanedLine = cleanedLine.slice(recognizedString.length).trim();
    console.log('cleanedLine:', recognizedString, '..', cleanedLine)
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

  let mgg = importantParts[importantParts.length - 1]

  mgg = parseFloat(mgg);
  if (isNaN(mgg)) {
    console.log('No:', mgg, 'line:', line);
    mgg = 0;
  }
  console.log('mgg:', mgg, 'line:', line);

  let [whole, fraction = ''] = mgg.toString().split('.');
  if (fraction.length < 3) {
    fraction = fraction.padEnd(3, '0');
    mgg = `${whole}.${fraction}`;
    console.log('changed to:', mgg, 'line:', line);
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

// recognizeString('THCA 4 4 v4 4')

function recognizeString(line) {

  for (const [key, value] of Object.entries(cannabinoidSpellingMap)) {
    if (line.startsWith(key)) {
      return value;
    }
  }

  for (const [key, value] of Object.entries(terpeneSpellingMap)) {
    if (line.startsWith(key)) {
      return value;
    }
  }

  return 'Unknown'
}

function extractAnyChemical(line, vendor) {

  let cleanedLine = line.replace(/\s+/g, ' ').trim();

  const recognizedString = recognizeString(cleanedLine) || '3';

  if (recognizedString === 'Unknown') {
    recordUnknown(line, vendor)
    return recognizedString
  }

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
  lineToChemicalObject,
  stringContainsNonFlowerProduct,
  writeUnknownLines,
}