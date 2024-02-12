const fs = require('fs')
const { cannabinoidSpellings, terpeneSpellings } = require('./memory.js')

function transcribeAssay(str, url) {

  if (!str?.split) {
    console.log('can\'t split', url, 'type:', typeof str, str)
    fs.appendFileSync('./temp/errors.txt', `can't split ${url}\n`, url, 'type:', typeof str, str)
    return null
  }

  const lines = str.split('\n')

  const filteredLines = lines.filter(line => line.includes(' '))

  const chems = filteredLines.map(line => getAnyChemical(line, url))

  const chemicals = chems.filter(chem => chem.name !== 'Unknown' && chem.pct > 0)

  return chemicals

}

function getCannabinoid(line, url) {
  return getCannabinoidObj(line, url)
}

function getTerpene(line, url) {
  return getTerpeneObj(line, url)
}

function getAnyChemical(line, url) {
    return getAnyChemicalObj(line, url)
}

function filterLine(line, normalizationFunction) {
  if (!line.replace) {
    return ['Unknown', 0]
  }
  const cleanedLine = line.replace(/\s+/g, ' ');

  // while last character is a space or a space followed by a singe character and a space or a since character, remove it

  while (cleanedLine.slice(-1) === ' ' || cleanedLine.slice(-2) === ' ' || cleanedLine.slice(-3) === ' ') {
    cleanedLine = cleanedLine.slice(0, cleanedLine.length - 1)
  }

  let parts = cleanedLine.split(' ');

  const name = normalizationFunction(parts.shift()) || 'Unknown';

  parts = parts.map(part => {
    if (/^ND$|^0.0485$|^0.0728$|^>3.000$|^0.030|^0.0500$|^3.000$|^0.750$|^[<>][LlIi1|][Oo0]Q$/.test(part)) {
      return "0";
    }
    return part;
  }).filter(part => !isNaN(parseFloat(part)));

  parts.unshift(name);

  return parts;
}

function getMgg(parts, line) {
  let mgg = parts[parts.length - 1]

  if (!mgg.includes('.') && !isNaN(parseFloat(mgg))) {
    mgg = mgg.slice(0, mgg.length - 3) + '.' + mgg.slice(mgg.length - 3)
  }

  return mgg;
}

function getTerpeneObj(line) {

  const parts = filterLine(line, normalizeTerpene)

  const name = parts[0]

  if (name === 'Unknown' || parts.length < 3) {
    return { name, pct: 0, mgg: 0, originalText: line }
  }

  const mgg = getMgg(parts, line)

  const pct = (parseFloat(mgg) * 10).toFixed(3)

  const originalText = line || 'Unknown'

  return { name, pct, mgg, originalText }
}

function getCannabinoidObj(line) {

  const parts = filterLine(line, normalizeCannabinoid)

  const name = parts[0];

  if (name === 'Unknown' || parts.length < 3) {
    return { name, pct: 0, mgg: 0, originalText: line }
  }

  const mgg = getMgg(parts, line)
  const pct = (parseFloat(mgg) / 10).toFixed(3)

  const originalText = line || 'Unknown'

  return { name, pct, mgg, originalText }
}

function getAnyChemicalObj(line) {

  const parts = filterLine(line, normalizeAnyChemical)

  const name = parts[0];

  if (name === 'Unknown' || parts.length < 3) {
    return { name, pct: 0, mgg: 0, originalText: line }
  }

  const mgg = getMgg(parts, line)
  const pct = (parseFloat(mgg) / 10).toFixed(3)

  const originalText = line || 'Unknown'

  return { name, pct, mgg, originalText }
}


const canns = Object.keys(cannabinoidSpellings).map(key => cannabinoidSpellings[key].name);
const cannabinoidList = canns.filter((item, index, self) => self.indexOf(item) === index);
cannabinoidList.sort();

const terps = Object.keys(terpeneSpellings);
const terpeneList = terps.filter((item, index, self) => self.indexOf(item) === index);
terpeneList.sort();

function linePasses(line) {
  const hasFiveLetters = /[a-z]{5,}/.test(line);
  const hasTwoDigits = /\d{2,}/.test(line);
  const hasFourDigits = /\d{4,}/.test(line);

  return hasFiveLetters && hasTwoDigits && hasFourDigits
}

function normalizeCannabinoid(name, url) {
  if (cannabinoidSpellings[name]) {
    return cannabinoidSpellings[name].name
  }

  if (linePasses(line)) {
    fs.appendFileSync('./temp/unknowncannabinoid.txt', `${name}\n`)
  }

  return "Unknown"
}

function normalizeTerpene(terpene) {
  if (terpeneSpellings[terpene]) {
    return terpeneSpellings[terpene]
  }

  fs.appendFileSync('./temp/unknownterpenes.txt', `${terpene}\n`)
  return terpene
}

function normalizeAnyChemical(str, url) {
  if (cannabinoidSpellings[str] && cannabinoidSpellings[str].confidence > 0.7) {
    return cannabinoidSpellings[str].name
  }

  if (terpeneSpellings[str]) {
    return terpeneSpellings[str]
  }

  fs.appendFileSync('./temp/unknownchemicals.txt', `${str}\n`)
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
  normalizeTerpene,
  normalizeCannabinoid,
  getTerpene,
  getCannabinoid,
  cannabinoidList,
  terpeneList,
  stringContainsNonFlowerProduct
}