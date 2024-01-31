const fs = require('fs')

function normalizeProductTitle(title) {
  let replaceString = title
  const find = ['Hemp Flower', '(Indoor)', '(Greenhouse)', 'High THCa', 'THCa', 'Hydro', 'Indoor', 'Living Soil', 'Hemp', '  ']
  for (let i = 0; i < find.length; i++) {
    replaceString = replaceString.replace(find[i], ' ')
    replaceString = replaceString.replace(/\s+/g, ' ')
    replaceString = replaceString.trim()
  }
  return replaceString
}

function normalizeVariantName(name) {
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
  if (name === 'Mixed Dirty Kief 28 grams') {
    return '28 g'
  }
  if (name ==='Mixed+Dirty+Kief+28+grams') {
    return '28 g'
  }

  if (name === '3.5 g Pheno 1') {
    return '3.5 g'
  }
  if (name === '3.5 g Pheno 2') {
    return '3.5 g'
  }
  if (name === '3.5 g Pheno 1') {
    return '3.5 g'
  }
  if (name === '7 g Pheno 2') {
    return '7 g'
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
  name = name?.replace('(small/minis)', 'smalls')
  name = name?.trim().replace(/\s+/g, ' ')

  return name
}

const regexMatchingPossibleWeightString = /\d\s(oz|g)/i

function variantNameContainsWeightUnitString(variantName) {
  return regexMatchingPossibleWeightString.test(variantName)
}



async function collectionIdExists(id, collectionRef) {
  const snapshot = await collectionRef.where('id', '==', id).get()
  return !snapshot.empty
}

async function makeFirebaseSafe(str) {
  return str.replace(/[^\w-]+/g, '_')
}

async function makeFirebaseSafeId(prefix, product, collectionRef) {
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

function getMgg(parts, line) {
  let mgg;
  if (parts.length === 4) {
    mgg = parts[parts.length - 1]
  }
  else if (parts.length === 5) {
    mgg = parts[parts.length - 2]
  }
  else {
    console.log("ABNORMAL", parts, 'line: ' + line)
  }

  mgg = mgg === 'ND' || mgg === '<LOQ' || mgg === '<L0Q' || mgg === '>0.003' || mgg === '<0.003' ? 0 : parseFloat(mgg)

  return mgg;
}

module.exports = {

  normalizeProductTitle,
  normalizeVariantName,
  variantNameContainsWeightUnitString,
  makeFirebaseSafe,
  makeFirebaseSafeId,
}
