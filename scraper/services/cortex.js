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

  console.log('transcribing', str.length)

  const lines = str.split('\n')

  console.log('lines', lines.length)

  const filteredLines = lines.filter(line => line.includes(' '))

  const chems = filteredLines.map(line => lineToChemicalObject(line, url, vendor))

  if (chems.length === 0) {
    console.log('no chems???????', url)
    fs.appendFileSync('./temp/unknown-problem.txt', `${vendor} unknown problem ${url}, \n`)
  }

  //const chemicals = chems.filter(chem => chem.name !== 'Unknown' && chem.pct > 0)
  console.log('organizing chems', chems.length)
  console.log(JSON.stringify(chems, null, 2));
  const assays = organizeAssays(chems);
  console.log(JSON.stringify(assays, null, 2));
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
    fs.writeFileSync('./temp/not-string.txt', `${vendor} ${line}\n`)
    return { name: 'Unknown', pct: 0, line }
  }

  let cleanedLine = line.replace(/\s+/g, ' ').trim();

  const completeLine = cleanedLine;

  cleanedLine = removeCharactersAfterLastDigit(cleanedLine);

  const recognizedString = extractAnyChemical(cleanedLine, vendor);

  console.log('recognizedString', recognizedString)

  if (!recognizedString || recognizedString === 'Unknown') {
    if (!unknowns.includes(completeLine) && linePasses(completeLine)) {
      unknowns.push(completeLine);
      fs.appendFileSync('./temp/unknownlines1.txt', `${vendor} | ${completeLine}\n`)
    }
    return { name: 'Unknown', pct: 0, line: completeLine }
  }
  console.log(`if ${cleanedLine} starts with ${recognizedString}`)
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
  fs.writeFileSync(`./ temp / unknownlines88.txt`, Array.from(lines).join('\n'))
}

function recordUnknown(str, ln, vendor) {
  if (linePasses(ln)) {
    fs.appendFileSync('./temp/unknownlines3.txt', `${vendor} | ${str} | ${ln}\n`)
  }
}

function recognizeString(line) {

  for (const [key, value] of Object.entries(cannabinoidSpellingMap)) {

    if (line.startsWith(value[0])) {
      return value[0];
    }
  }

  for (const [key, value] of Object.entries(terpeneSpellingMap)) {
    if (line.startsWith(value[0])) {

      return value[0];
    }
  }

  return 'Unknown'
}

function getNormalizedSpelling(line) {

  for (const [_, value] of Object.entries(cannabinoidSpellingMap)) {

    if (line.startsWith(value[0])) {
      return value[1];
    }
  }

  for (const [_, value] of Object.entries(terpeneSpellingMap)) {
    if (line.startsWith(value[0])) {

      return value[1];
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
  console.log('------------------')
  console.log(':::organizing', assays.length)
  console.log('keys', Object.keys(assays[0]))
  for (const assay of assays) {
    console.log('Item keys', Object.keys(assay), assay.name, assay.pct, assay.line)
    console.log(cannabinoidNameList)
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