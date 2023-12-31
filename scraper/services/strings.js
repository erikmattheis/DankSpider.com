const fs = require('fs')

function normalizeProductTitle (title) {
  let replaceString = title
  const find = ['Hemp Flower', '(Indoor)', '(Greenhouse)', 'High THCa', 'THCa', 'Hydro', 'Indoor', 'Living Soil', 'Hemp', '  ']
  for (let i = 0; i < find.length; i++) {
    replaceString = replaceString.replace(find[i], ' ')
    replaceString = replaceString.replace(/\s+/g, ' ')
    replaceString = replaceString.trim()
  }
  return replaceString
}

function normalizeVariantName (name) {
  if (!name) {
    return name
  }
  if (name === '28 grams') {
    return '28 g'
  }
  if (name === '1-oz') {
    return '28 g'
  }
  if (name === '1oz') {
    return '28 g'
  }
  if (name === 'Sugar leaf trim - 28 grams') {
    return '28 g'
  }
  if (name === 'Mixed T1 Sugar leaf/ trim - 28 grams') {
    return '28 g'
  }
  if (name === 'Half oz') {
    return '14 g'
  }
  if (name === '14 grams') {
    return '14 g'
  }
  if (name === '14-g') {
    return '14 g'
  }
  if (name === '14g') {
    return '14 g'
  }
  if (name === '7 grams') {
    return '7 g'
  }
  if (name === '7-g') {
    return '7 g'
  }
  if (name === '7g') {
    return '7 g'
  }
  if (name === '3.5-g') {
    return '3.5 g'
  }
  if (name === '3.5g') {
    return '3.5 g'
  }
  if (name === '3.5 grams') {
    return '3.5 g'
  }
  if (name === '1-g') {
    return '1 g'
  }
  if (name === '1g') {
    return '1 g'
  }
  if (name === 'Dry Sift 1g') {
    return '1 g'
  }

  name = name + ''
  name = name?.replace(/(\d)([a-zA-Z])/g, '$1 $2')
  name = name?.replace(/(\s+)/g, ' ')
  name = name?.replace('SMALLS', 'smalls')
  name = name?.replace('MINIS', 'minis')
  name = name?.replace('Smalls', 'smalls')
  name = name?.replace('Minis', 'minis')
  name = name?.replace(' (1/8 oz)', '')
  name = name?.replace(' (1/4 oz)', '')
  name = name?.replace(' (1/2 oz)', '')
  name = name?.replace(' (1 oz)', '')
  name = name?.replace('(small/minis)', 'smalls/minis')
  name = name?.trim().replace(/\s+/g, ' ')

  return name
}

const regexMatchingPossibleWeightString = /\d\s(oz|g)/i

function variantNameContainsWeightUnitString (variantName) {
  return regexMatchingPossibleWeightString.test(variantName)
}

function normalizeTerpene (terpene) {

  const spellings = {
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
    'y-Terpinene': 'Terpinene',
    'α-Bisabolol': 'Bisabolol',
    'α-Humulene': 'Humulene',
    'α-Pinene': 'Pinene',
    'α-Terpinene': 'Terpinene',
    'β-Caryophyllene': 'Caryophyllene',
    'β-Myrcene': 'Myrcene',
    Bisabolol: 'Bisabolol',
    Bormwol: 'Borneol',
    Borreol: 'Borneol',
    Camphene: 'Camphene',
    Carene: 'Carene',
    Caryophyllene: 'Caryophyllene',
    CaryophylleneOxide: 'Caryophyllene Oxide',
    Citral: 'Citral',
    Ferxhone: 'Fenchone',
    Limonenes: 'Limonene'
  }

  if (spellings[terpene]) {
    return spellings[terpene]
  }

  fs.appendFileSync('unknownTerpinoidSpellings.txt', `${terpene}\n`)
  return "Unknown"
}

function getTerpeneObj (line, url) {
  console.log('cleaning line', line)

  const cleanedLine = line.replace(/\s+/g, ' ')
  const parts = cleanedLine.split(' ')

  const name = normalizeTerpene(parts[0], url) || 'Unknown'

  let pct = parts[parts.length - 1] || 'Unknown'
  pct = pct === 'ND' || pct === '<LOQ' || pct === '<L0Q' || pct === '>3.000' ? 0 : pct
  pct = pct + ''
  pct = pct.replace('.', '')
  pct = parseInt(pct)
  pct = (pct / 10000).toFixed(3)

  let mgg = parts[parts.length - 2] || 'Unknown'
  mgg = mgg === 'ND' || mgg === '<LOQ' || mgg === '<L0Q' || mgg === '>3.000' ? 0 : mgg
  const originalText = cleanedLine || 'Unknown'

  return { name, pct, mgg, originalText }
}

function getCannabinoidObj (line, url) {
  const cleanedLine = line.replace(/\s+/g, ' ')
  const parts = cleanedLine.split(' ')

  const name = normalizeCannabinoid(parts[0], url) || 'Unknown'

  let pct = parts[parts.length - 2] || 'Unknown'
  pct = pct === 'ND' || pct === '<LOQ' || pct === '<L0Q' || pct === '>3.000' ? 0 : pct
  pct = pct + ''
  pct = pct.replace('.', '')
  pct = parseInt(pct)
  pct = (pct / 1000).toFixed(3)

  let mgg = parts[parts.length - 1] || 0
  mgg = mgg === 'ND' || mgg === '<LOQ' || mgg === '<L0Q' || mgg === '>3.000' ? 0 : mgg

  const originalText = cleanedLine || 'Unknown'

  return { name, pct, mgg, originalText }
}

function getCannabinoidObj2 (line, url) {
  const cleanedLine = line.replace(/\s+/g, ' ')
  const parts = cleanedLine.split(' ')

  const name = normalizeCannabinoid(`${parts[0]} ${parts[1]}`, url) || 'Unknown'

  let pct = parts[parts.length - 2] || 0
  pct = pct === 'ND' || pct === '<LOQ' || pct === '<L0Q' || pct === '>3.000' ? 0 : pct
  pct = pct + ''
  pct = pct.replace('.', '')
  pct = parseInt(pct)
  pct = (pct / 1000).toFixed(3)

  let mgg = parts[parts.length - 1] || 0
  mgg = mgg === 'ND' || mgg === '<LOQ' || mgg === '<L0Q' || mgg === '>3.000' ? 0 : mgg

  const originalText = cleanedLine || 'Unknown'

  return { name, pct, mgg, originalText }
}

function getCannabinoidObjCannalyze (line, url) {
  const cleanedLine = line.replace(/\s+/g, ' ')
  const parts = cleanedLine.split(' ')

  if (parts.length < 3) {
    return { name: 'Unknown', pct: 0, mgg: 0, originalText: cleanedLine }
  }

  const name = normalizeCannabinoid(parts[0], url) || 'Unknown'

  let pct = parts[parts.length - 2] || 'Unknown'

  pct = pct === 'ND' || pct === '<LOQ' || pct === '<L0Q' || pct === '>3.000' ? 0 : pct
  pct = pct + ''
  pct = pct.replace('.', '')
  pct = parseInt(pct)
  pct = (pct / 1000).toFixed(3)

  const mgg = parts[parts.length - 1] || 0

  const originalText = cleanedLine

  return { name, pct, mgg, originalText }
}

const cannabinoidSpellings = {
  '-A-10-Tetrahydrocannabinol': { name: 'S-∆-10-THC', confidence: 1 },
  '?5-Hexatydrocarrabiacl': { name: '9S-HHC', confidence: 0.9 },
  '∆-9 THC': { name: '∆-9-THC', confidence: 0.99 },
  '∆-9 THCA': { name: '∆-9-THCA', confidence: 0.99 },
  '$-A-10-Tetrahydrocannabinol': { name: 'S-∆-10-THC', confidence: 1 },
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
  'A-8-Tetrahydrocannabinol (A-8 THC)': { name: '∆-8-THC', confidence: 0.99 },
  'A-8-Tetrahydrocannabinol': { name: '∆-8-THC', confidence: 0.99 },
  'A-9-Tetrahydrocannabinol (A-9 THC)': { name: '∆-9-THC', confidence: 0.99 },
  'A-9-Tetrahydrocannabinol Acetate (A-9-THCO)': { name: '∆-9-THC0', confidence: 0.99 },
  'A-9-Tetrahydrocannabinol': { name: '∆-9-THC', confidence: 0.99 },
  'A-9-Tetrahydrocannabinolic Acid (THCA-A)': { name: '∆-9-THCA', confidence: 0.99 },
  'A-9-Tetrahydrocannabinolic': { name: '∆-9-THCA', confidence: 0.99 },
  'A-9-Tetrahydrocannabiphorol (A-9-THCP)': { name: '∆-9-THCP', confidence: 0.99 },
  'A-9-Tetrahydrocannabiphorol': { name: 'THCP', confidence: 1 },
  'A-9-Tetrahydrocannabivarin (A-9-THCV)': { name: '∆-9-THCV', confidence: 0.99 },
  'A-9-Tetrahydrocannabivarin': { name: 'THCV', confidence: 1 },
  'A-9-Tetrahydrocannabivarinic Acid (A-9-THCVA)': { name: '∆-9-THCVA', confidence: 0.99 },
  'A-9-Tetrahydrocannabivarinic': { name: '∆-9-THCVA', confidence: 1 },
  'A8-THC': { name: '∆-8-THC', confidence: 0.99 },
  'A9-THC': { name: '∆-9-THC', confidence: 0.99 },
  'A9-THCA-A': { name: '∆-9-THCA', confidence: 0.99 },
  'A9-THCA': { name: '∆-9-THCA', confidence: 0.99 },
  'A9-THCVA': { name: '∆-9-THCVA', confidence: 0.99 },
  'Cannabichromene (CBC)': { name: 'CBC', confidence: 0.99 },
  'Cannabichromenic Acid': { name: 'CBC', confidence: 0.9 },
  'Cannabicyclol (CBL)': { name: 'CBL', confidence: 0.99 },
  'Cannabidiol (CBD)': { name: 'CBD', confidence: 0.99 },
  'Cannabidiolic Acid (CBDA)': { name: 'CBDA', confidence: 0.99 },
  'Cannabidiolic Acid': { name: 'CBD', confidence: 0.9 },
  'Cannabidivarin (CBDV)': { name: 'CBDV', confidence: 0.99 },
  'Cannabidivarinic Acid (CBDVA)': { name: 'CBDVA', confidence: 0.99 },
  'Cannabidivarinic Acid': { name: 'THCV', confidence: 0.8 },
  'Cannabigerol (CBG)': { name: 'CBG', confidence: 0.99 },
  'Cannabigerolic Acid (CBGA)': { name: 'CBGA', confidence: 0.99 },
  'Cannabigerolic Acid': { name: 'CBGA', confidence: 0.99 },
  'Cannabinol (CBN)': { name: 'CBN', confidence: 0.99 },
  'Cannabinolic Acid (CBNA)': { name: 'CBNA', confidence: 0.99 },

  'Carvubzdizl(CHDY': { name: 'CBD', confidence: 0.9 },
  'Delta 8-Tetrahydrocannabinol': { name: '∆-8-THC', confidence: 0.99 },
  'Delta 9-Tetrahydrocannabinol': { name: '∆-9-THC', confidence: 0.99 },
  'Delta 9-Tetrahydrocannabinolic': { name: '∆-9-THCA', confidence: 0.99 },
  'Delta 9-THCVA': { name: '∆-9-THCVA', confidence: 0.99 },
  'FR-He': { name: '9R-HHC', confidence: 0.9 },
  'FR-Hewbrpdr': { name: '9R-HHC', confidence: 0.9 },
  'FR-Hewtredr': { name: '9R-HHC', confidence: 0.9 },
  'FR-Hexatrd': { name: '9R-HHC', confidence: 0.9 },
  'FR-Hexdrd': { name: '9R-HHC', confidence: 0.9 },
  'IC=THCa*': { name: 'THCA', confidence: 0.9 },
  'R-A-10-Tetrahydrocannabinol (R-A-10-THC)': { name: 'R-∆-10-THC', confidence: 0.99 },
  'R-A-10-Tetrahydrocannabinol': { name: 'R-∆-10-THC', confidence: 1 },
  'R-Delta 10-THC': { name: 'R-∆-10-THC', confidence: 0.99 },
  'S-A-10-Tetrahydrocannabinol (S-A-10-THC)': { name: 'S-∆-10-THC', confidence: 0.99 },
  'S-A-10-Tetrahydrocannabinol': { name: 'S-∆-10-THC', confidence: 0.99 },
  'S-Delta 10-THC': { name: 'S-∆-10-THC', confidence: 0.99 },
  'cannabigerol': { name: 'CBG', confidence: 0.99 },
  'Tetrahwdrocannabinol:': { name: '∆-9-THC', confidence: 1 },
  'Tetrahydrocannabivarin (THCV)': { name: 'THCV', confidence: 0.99 },
  'Tetrahydrocannabivarinic Acid': { name: '∆-9-THCVA', confidence: 0.99 },
  'Total Cannabinoids': { name: 'Total', confidence: 0.99 },
  Camnabichromenic: { name: 'CBC', confidence: 0.9 },
  Camnabigeralic: { name: 'CBG', confidence: 0.9 },
  Cannabichabe: { name: 'CBC', confidence: 0.6 },
  Cannabichearinic: { name: 'CBCA', confidence: 0.9 },
  Cannabichonvene: { name: 'CBC', confidence: 0.8 },
  Cannabichromene: { name: 'CBC', confidence: 1 },
  Cannabichromenic: { name: 'CBCA', confidence: 1 },
  Cannabidiol: { name: 'CBD', confidence: 1 },
  Cannabidiolic: { name: 'CBDA', confidence: 1 },
  Cannabidivarin: { name: 'CBDV', confidence: 1 },
  Cannabidivarinic: { name: 'CBDVA', confidence: 1 },
  Cannabigeral: { name: 'CBG', confidence: 0.7 },
  Cannabigerdl: { name: 'CBG', confidence: 0.7 },
  Cannabigerol: { name: 'CBG', confidence: 1 },
  Cannabigerolic: { name: 'CBGA', confidence: 1 },
  Cannabinol: { name: 'CBN', confidence: 1 },
  Cannabinolic: { name: 'CBNA', confidence: 1 },
  Cannatinol: { name: 'CBN', confidence: 0.8 },
  Canrudschromenic: { name: 'CBC', confidence: 0.9 },
  Canrudsdial: { name: 'CBD', confidence: 0.9 },
  Carrubichromenic: { name: 'CBC', confidence: 0.9 },
  Carrubirolic: { name: 'CBG', confidence: 0.7 },
  Carrubsrolic: { name: 'CBG', confidence: 0.7 },
  Carrubyrolic: { name: 'CBG', confidence: 0.7 },
  Carvubschasn: { name: 'CBC', confidence: 0.9 },
  Carvubschrorrenic: { name: 'CBC', confidence: 0.9 },
  Carvubsgerolic: { name: 'CBG', confidence: 0.7 },
  Carvudschromenk: { name: 'CBC', confidence: 0.9 },
  CBC: { name: 'CBC', confidence: 0.99 },
  CBCA: { name: 'CBCA', confidence: 0.99 },
  CBCV: { name: 'CBCV', confidence: 0.99 },
  CBD: { name: 'CBD', confidence: 0.99 },
  CBDA: { name: 'CBDA', confidence: 0.99 },
  CBDV: { name: 'CBDV', confidence: 0.99 },
  CBDVA: { name: 'CBDVA', confidence: 0.99 },
  CBG: { name: 'CBG', confidence: 0.99 },
  CBGA: { name: 'CBGA', confidence: 0.99 },
  CBL: { name: 'CBL', confidence: 0.99 },
  CBN: { name: 'CBN', confidence: 0.99 },
  CBNA: { name: 'CBNA', confidence: 0.99 },
  CBT: { name: 'CBT', confidence: 0.99 },
  Conmaby: { name: 'CBL', confidence: 0.8 },
  Tetrahydrocannabinol: { name: '∆-9-THC', confidence: 1 },
  Tetratwarocamanng: { name: '∆-9-THC', confidence: 1 },
  THC: { name: '∆-9-THC', confidence: 0.99 },
  THCA: { name: '∆-9-THCA', confidence: 0.99 },
  THCP: { name: 'THCP', confidence: 0.99 },
  THCV: { name: 'THCV', confidence: 0.99 },
  Total: { name: 'Total', confidence: 1 },
  TOTAL: { name: 'Total', confidence: 1 },
  "∆-9 THCA": { name: '∆-9-THCA', confidence: 0.99 },
  "∆-9 THC": { name: '∆-9-THC', confidence: 0.99 },
  "∆ 9-THCA": { name: '∆-9-THCA', confidence: 0.99 },
  "∆ 9-THC": { name: '∆-9-THC', confidence: 0.99 },
  "∆ 9-THCVA": { name: '∆-9-THCVA', confidence: 0.99 },

}

function normalizeCannabinoid (name, url) {
  if (cannabinoidSpellings[name] && cannabinoidSpellings[name].confidence > 0.7) {
    return cannabinoidSpellings[name].name
  }

  if (!cannabinoidSpellings[name]) {
    fs.appendFileSync('unknownCannabinoidSpellings.txt', `\n${name}\n${url}\n`)
  }
  return "Unknown"
}

async function collectionIdExists (id, collectionRef) {
  const snapshot = await collectionRef.where('id', '==', id).get()
  return !snapshot.empty
}

async function makeFirebaseSafe (str) {
  return str.replace(/[^\w-]+/g, '_')
}

async function makeFirebaseSafeId (prefix, product, collectionRef) {
  let n = 0
  let id = ''
  let idExists = true
  while (idExists) {
    id = `${prefix}-${product.title}-${product.vendor}-${n}`
    idExists = await collectionIdExists(id, collectionRef)
    n = n + 1
  }
  const result = makeFirebaseSafe(id)
  return result
}

module.exports = {
  normalizeTerpene,
  normalizeProductTitle,
  normalizeVariantName,
  variantNameContainsWeightUnitString,
  makeFirebaseSafe,
  makeFirebaseSafeId,
  normalizeCannabinoid,
  getCannabinoidObj,
  getCannabinoidObj2,
  getCannabinoidObjCannalyze,
  getTerpeneObj
}
