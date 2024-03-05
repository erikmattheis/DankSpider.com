const fs = require('fs')
const { cannabinoidNameList, terpeneNameList, cannabinoidSpellingMap, terpeneSpellingMap } = require('./memory.js')
const { isValidURI } = require('./strings.js')
const { parse } = require('path')


function transcribeAssay(str, url, vendor) {

  if (!str?.split) {
    console.log('can\'t split', url, 'type:', typeof str, str)
    fs.appendFileSync('./temp/errors.url.txt', `${vendor} can't split ${str}\n`)
    return []
  }

  const lines = str.split('\n')

  console.log('lines', lines.length)

  const filteredLines = lines.filter(line => line.includes(' '))

  const chems = filteredLines.map(line => lineToChemicalObject(line, vendor))

  //const chemicals = chems.filter(chem => chem.name !== 'Unknown' && chem.pct > 0)
  console.log('organizing chems', chems.length)
  const assays = organizeAssays(chems);
  console.log('result', (assays.cannabinoids.length + assays.terpenes.length), 'assays');
  return assays

}

function removeCharactersAfterLastDigit(str) {
  return str.replace(/(\d)\D*$/, '$1');
}

function fixMissedPeriod(str) {
  if (!str || !str.replace || str?.toString().includes('.')) {
    return str;
  }

  let string = str.replace('.', '')
  if (string.length > 3) {
    string = string.slice(0, string.length - 3) + '.' + string.slice(string.length - 3)
  }
  return string;
}

const unknowns = [];

function lineToChemicalObject(line, vendor) {

  if (!line?.replace) {
    fs.appendFileSync('./temp/not-string.txt', `${vendor} ${line}\n`)
    return { name: 'Unknown', pct: 0, line }
  }

  let cleanedLine = line.replace(/\s+/g, ' ').trim();

  const completeLine = cleanedLine;

  cleanedLine = removeCharactersAfterLastDigit(cleanedLine);

  const recognizedString = extractAnyChemical(cleanedLine, vendor);

  // console.log('recognizedString', recognizedString)

  if (!recognizedString || recognizedString === 'Unknown') {
    if (!unknowns.includes(completeLine) && linePasses(completeLine)) {
      unknowns.push(completeLine);
      fs.appendFileSync('./temp/unknownlines.txt', `${vendor} | ${completeLine}\n`)
    }
    return { name: 'Unknown', pct: 0, line: completeLine }
  }
  // console.log(`if ${cleanedLine} starts with ${recognizedString}`)
  if (cleanedLine.startsWith(recognizedString)) {
    cleanedLine = cleanedLine.slice(recognizedString.length).trim();
  }
  else if (linePasses(cleanedLine)) {
    fs.appendFileSync('./temp/unknownlines2.txt', `${vendor} ${recognizedString}..${completeLine}\n`)
  }

  const name = getNormalizedSpelling(recognizedString);

  let parts = cleanedLine.split(' ');

  parts = parts.map((part, i) => { if (!isNaN(part)) { return fixMissedPeriod(part) } return part })

  // parts = parts.filter(part => !isCalibration(part));

  const mgg = getMgg(parts, line);

  const pct = parseFloat(mgg).toFixed(2);

  return { name, pct, line }
}

function isCalibration(part) {
  return /ND$|\.0485$|\.0728$|^>3\.000$|^0\.030|^0\.0500$|3\.000$|^0\.750$|[<>][LlIi1|][Oo0]Q$/.test(part)
}

function getMgg(parts, line) {

  const importantParts = parts.filter(part => !isCalibration(part));

  if (importantParts.length < 3) {
    return 0
  }

  const last = fixMissedPeriod(parseFloat(importantParts[importantParts.length - 1]))

  const secondToLast = fixMissedPeriod(parseFloat(importantParts[importantParts.length - 2]))

  let mgg = parseFloat(last) > parseFloat(secondToLast) ? parseFloat(secondToLast) : parseFloat(last);

  if (isNaN(mgg)) {
    fs.appendFileSync('./temp/not-number.txt', `No: ${mgg} | ${line}\n`)
    mgg = 0;
  }

  return mgg;
}

const lines = new Set();

function linePasses(line) {
  if (lines.has(line)) {
    return false
  }
  const hasLetter = /[a-zA-Z]{5,}/.test(line);
  const hasNumber = /\d{3,}/.test(line);
  const hasSpace = line?.split(' ').length > 1;
  if (hasLetter && hasNumber && hasSpace && line.length > 8) {
    lines.add(line)
    return true
  }
  return false
}

function writeUnknownLines(batchId) {
  fs.appendFileSync(`./ temp / unknownlines88.txt`, Array.from(lines).join('\n'))
}

function recordUnknown(str, ln, vendor) {
  if (linePasses(ln)) {
    fs.appendFileSync('./temp/unknownlines3.txt', `${vendor} | ${str} | ${ln}\n`)
  }
}

function recognizeString(line) {
  for (const [key, value] of cannabinoidSpellingMap) {
    if (line.startsWith(key)) {
      return value;
    }
  }

  for (const [key, value] of terpeneSpellingMap) {
    if (line.startsWith(key)) {
      return value;
    }
  }

  return 'Unknown'
}

function getNormalizedSpelling(line) {

  for (const [key, value] of cannabinoidSpellingMap) {

    if (line.startsWith(key)) {
      return value;
    }
  }

  for (const [key, value] of terpeneSpellingMap) {
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

function organizeAssays(assays) {
  const organizedAssays = {
    cannabinoids: [],
    terpenes: [],
  }



  for (const assay of assays) {
    //console.log('Item keys', Object.keys(assay), assay.name, assay.pct, assay.line)

    if (cannabinoidNameList.includes(assay.name)) {
      console.log('assembling cannabinoid', assay.name, assay.pct)
      organizedAssays.cannabinoids.push(assay)
    } else if (terpeneNameList.includes(assay.name)) {
      console.log('assembling terpene', assay.name, assay.pct)
      organizedAssays.terpenes.push(assay)
    }
  }

  console.log(`Returning ${organizedAssays.cannabinoids.length} cannabinoids and ${organizedAssays.terpenes.length} terpenes`)

  return organizedAssays
}

function stringContainsNonFlowerProduct(str) {
  if (['2 g', '2 oz', 'Diamond Shards', 'NaN g', ' Roll', ' Rosin', 'Rosin ', 'Resin', 'Full Melt', 'Bubble Hash', 'Sift Hash', 'Macaroons', 'Cannacookies', 'Pre - Rolls', ' Pre Rolls', 'Pre Rolls', 'Mixed Smalls', 'Mixed Shake', ' Diamonds', 'Cereal Bars', 'Bundles', 'Vape ', 'CannaCookies'].some(s => str.includes(s))) {
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