const fs = require('fs')
const { cannabinoidSpellings, terpeneSpellings } = require('./memory.js')

function transcribeAssay(str, url) {

  if (!str?.split) {
    console.log('can not split')
    return null
  }

  const lines = str.split('\n')

  const filteredLines = lines.filter(line => line.includes(' '))

  const chems = filteredLines.map(line => getAnyChemical(line, url))

  const chemicals = chems.filter(chem => chem.name !== 'Unknown' && chem.pct > 0)

  return chemicals

  if (['limonine', 'ocimene', 'pinene', 'camphene'].some(v => str.toLowerCase().includes(v))) {
    console.log('---> is terps', lines.length)

  }

  else if (['cannabinol', 'thc', 'cbd'].some(v => str.toLowerCase().includes(v))) {
    console.log('---> is canns', canns.length)
    const canns = lines.map(line => getCannabinoid(line, url))
    const cannabinoids = canns.filter(cann => cann?.name !== 'Unknown' && cann?.pct > 0)
    return { cannabinoids }
  }
  else {
    console.log('---> unknown assay!!!!!!!')
  }

  return { cannabinoids: {raw:str }}
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

  let parts = cleanedLine.split(' ');

  const name = normalizationFunction(parts.shift()) || 'Unknown';

  parts = parts.map(part => {
    if (/^ND$|^0.0485$|^0.0728$|^0.030|^0.0500$|^3.000$|^0.750$|^3.000$|^[<>][LlIi1|][Oo0]Q$/.test(part)) {
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
  //console.log({ name, pct, mgg, originalText })
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
    fs.appendFileSync('./temp/unknownchemicals.txt', `${line}\n`)
    return { name, pct: 0, mgg: 0, originalText: line }
  }

  const mgg = getMgg(parts, line)
  const pct = (parseFloat(mgg) / 10).toFixed(3)

  const originalText = line || 'Unknown'

  return { name, pct, mgg, originalText }
}


const canns = Object.keys(cannabinoidSpellings).map(key => cannabinoidSpellings[key].name);
const cannabinoids = canns.filter((item, index, self) => self.indexOf(item) === index);
cannabinoids.sort();

const terps = Object.keys(terpeneSpellings).map(key => terpeneSpellings[key].name);
const terpenes = terps.filter((item, index, self) => self.indexOf(item) === index);
terpenes.sort();

function normalizeCannabinoid(name, url) {
  if (cannabinoidSpellings[name] && cannabinoidSpellings[name].confidence > 0.7) {
    return cannabinoidSpellings[name].name
  }


  console.log('unknown cann:', name)
  console.log('------------------------------')
  fs.appendFileSync('./temp/unknownterpenes.txt', `${name}\n`)
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
    //console.log('cannabinoid: spelling', str, cannabinoidSpellings[str].name)
    return cannabinoidSpellings[str].name
  }

  if (terpeneSpellings[str]) {
    //console.log('terpene: spelling', str, terpeneSpellings[str])
    return terpeneSpellings[str].name
  }
  //console.log('unknown chemical:', str)
  //console.log('------------------------------')
  fs.appendFileSync('./temp/unknownchemicals.txt', `${str}\n`)
  return "Unknown"
}




module.exports = {
  transcribeAssay,
  normalizeTerpene,
  normalizeCannabinoid,
  getTerpene,
  getCannabinoid,
  cannabinoids,
  terpenes
}