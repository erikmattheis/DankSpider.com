function normalizeProductTitle(title) {
  let replaceString = title;
  const find = ["Hemp Flower", "(Indoor)", "(Greenhouse)", "High THCa", "THCa", "Hydro", "Indoor", "Living Soil", "Hemp", "  "];
  for (var i = 0; i < find.length; i++) {
    replaceString = replaceString.replace(find[i], " ");
    replaceString = replaceString.replace(/\s+/g, " ");
    replaceString = replaceString.trim();
  }
  return replaceString;
}

function normalizeVariantTitle(title) {
  if (!title) {
    return title;
  }
  if (title === '28 grams') {
    return '28 g';
  }
  if (title === '1oz') {
    return '28 g';
  }
  if (title === 'Half oz') {
    return '14 g';
  }
  if (title === 'Sugar leaf trim - 28 grams') {
    return '28 g';
  }
  if (title === 'Mixed T1 Sugar leaf/ trim - 28 grams') {
    return '28 g';
  }
  if (title === 'Dry Sift 1g') {
    return '1 g';
  }
  if (title === '14 grams') {
    return '14 g';
  }
  if (title === '7 grams') {
    return '7 g';
  }
  if (title === '3.5 grams') {
    return '3.5 g';
  }
  if (title === '14g') {
    return '14 g';
  }
  if (title === '7g') {
    return '7 g';
  }
  if (title === '3.5g') {
    return '3.5 g';
  }
  if (title === '1g') {
    return '1 g';
  }
  title = title?.replace(/(\d)([a-zA-Z])/g, '$1 $2');
  title = title?.replace(/(\s+)/g, ' ');
  title = title?.replace('SMALLS', 'smalls');
  title = title?.replace('MINIS', 'minis');
  title = title?.replace('Smalls', 'smalls');
  title = title?.replace('Minis', 'minis');
  title = title?.replace(' (1/8 oz)', '');
  title = title?.replace(' (1/4 oz)', '');
  title = title?.replace(' (1/2 oz)', '');
  title = title?.replace(' (1 oz)', '');
  title = title?.replace('(small/minis)', 'smalls/minis');
  title = title?.trim().replace(/\s+/g, ' ');

  return title;
}

const regexMatchingPossibleWeightString = /\d\s(oz|g)/i;

function variantNameContainsWeightUnitString(variantName) {

  return regexMatchingPossibleWeightString.test(variantName);

}

function normalizeTerpene(terpene) {
  const spellings = {
    '1,8-Cineole': 'Eucalyptol',
    '1,8-Cineole': 'Eucalyptol',
    '1.8-Cinecle': 'Eucalyptol',
    'Bisabolol': 'Bisabolol',
    'a-Bisabolol': 'α-Bisabolol',
    'a-Bsabolol': 'α-Bisabolol',
    'a-Humulene': 'α-Humulene',
    'a-Pinene': 'α-Pinene',
    'a-Terpinene': 'α-Terpinene',
    'B-Caryophyliene': 'β-Caryophyllene',
    'B-Caryophyllene': 'β-Caryophyllene',
    'B-Myrcene': 'β-Myrcene',
    'Bisabolol': 'Bisabolol',
    'Bormwol': 'Borneol',
    'Borreol': 'Borneol',
    'Camphene': 'Camphene',
    'Carene': 'Carene',
    'Caryophyllene': 'Caryophyllene',
    'Citral': 'Citral',
    'CaryophylleneOxide': 'Caryophyllene Oxide',
    'Dihydrocarveol': 'Dihydrocarveol',
    'Ferxhone': 'Fenchone',
    'Humulene': 'Humulene',
    'Limonene': 'Limonene',
    'Linalool': 'Linalool',
    'Mentho!': 'Menthol',
    'Myrcene': 'Myrcene',
    'Nerolidol': 'Nerolidol',
    'Ocimene': 'Ocimene',
    'Pinene': 'Pinene',
    'Pulegone': 'Pulegone',
    'Terpinene': 'Terpinene',
    'Terpinolene': 'Terpinolene',
    'y-Terpinene': 'γ-Terpinene',
  }
  if (spellings[terpene]) {
    return spellings[terpene];
  }
  return terpene;
}

function getTerpeneObj(line) {

  const cleanedLine = line.replace(/\s+/g, ' ');
  const parts = cleanedLine.split(' ');

  const name = normalizeTerpene(parts[0]) || 0;

  let pct = parts[parts.length - 1] || 0;
  pct = pct === 'ND' || pct === '<LOQ' || pct === '<L0Q' || pct === '>3.000' ? 0 : pct;
  pct = pct + '';
  pct = pct.replace('.', '')
  pct = parseInt(pct)
  pct = (pct / 10000).toFixed(2);

  let mgg = parts[parts.length - 2] || 0;
  mgg = mgg === 'ND' || mgg === '<LOQ' || mgg === '<L0Q' || mgg === '>3.000' ? 0 : mgg;
  const originalText = cleanedLine || 0;

  return { name, pct, mgg, originalText };
}

function getCannabinoidObj(line) {
  const cleanedLine = line.replace(/\s+/g, ' ');
  const parts = cleanedLine.split(' ');

  const name = normalizeCannabinoid(parts[0]) || 0;

  let pct = parts[parts.length - 2] || 0;
  pct = pct === 'ND' || pct === '<LOQ' || pct === '<L0Q' || pct === '>3.000' ? 0 : pct;
  pct = pct + '';
  pct = pct.replace('.', '')
  pct = parseInt(pct)
  pct = (pct / 1000).toFixed(2);

  let mgg = parts[parts.length - 1] || 0;
  mgg = mgg === 'ND' || mgg === '<LOQ' || mgg === '<L0Q' || mgg === '>3.000' ? 0 : mgg;

  const originalText = cleanedLine || 0;

  return { name, pct, mgg, originalText };
}

const cannabinoidSpellings = {
  "4-8-Tetrahydrocannabinol": "Δ-8 THC",
  "4-9-Tetrahydrocannabinol": "Δ-9 THC",
  "4-9-Tetrahydrocannabinolic": "Δ-9 THCA",
  "A-9-Tetrahydrocannabiphorol": "THCP",
  "A-9-Tetrahydrocannabivarin": "THCV",
  "A-9-Tetrahydrocannabivarinic": "Δ-9 THCVA",
  "R-A-10-Tetrahydrocannabinol": "R-Δ-10 THC",
  "-A-10-Tetrahydrocannabinol": "S-Δ-10 THC",
  "$-A-10-Tetrahydrocannabinol": "S-Δ-10 THC",
  "9R-Hexahydrocannabinol": "9R-HHC",
  "95-Hexahydrocannabinol": "9R-HHC",
  "Tetrahydrocannabinol": "THC0",
  "Tetrahwdrocannabinol:": "THC0",
  "Tetratwarocamanng": "THC0",
  "Cannabidivarin": "CBDV",
  "Cannabidivarinic": "CBDVA",
  "Cannabidiol": "CBD",
  "Cannabidiolic": "CBDA",
  "Cannabigerol": "CBG",
  "Cannabigerolic": "CBGA",
  "Cannabinol": "CBN",
  "Cannabinolic": "CBNA",
  "Cannabichromene": "CBC",
  "Cannabichromenic": "CBCA",
  "Total": "Total Cannabinoids",
  "TOTAL": "Total Cannabinoids",
}

function normalizeCannabinoid(name) {

  if (cannabinoidSpellings[name]) {
    return cannabinoidSpellings[name];
  }

  return name;
}

function printPathToKey(obj, keyString, path = []) {
  for (const [key, value] of Object.entries(obj)) {
    const currentPath = [...path, key];
    if (key === keyString) {
      //console.info(currentPath.join('.'));
    } else if (typeof value === 'object') {
      printPathToKey(value, keyString, currentPath);
    }
  }
}

async function collectionIdExists(id, collectionRef) {
  const snapshot = await collectionRef.where('id', '==', id).get();
  return !snapshot.empty;
}

async function makeFirebaseSafe(str) {
  return str.replace(/[^\w-]+/g, '_');
}

async function makeFirebaseSafeId(prefix, product, collectionRef) {

  let n = 0;
  let id = '';
  let idExists = true;
  while (idExists) {
    id = `${prefix}-${product.title}-${product.vendor}-${n}`;
    idExists = await collectionIdExists(id, collectionRef);
    n = n + 1;
  }
  const result = makeFirebaseSafe(id);
  return result;
}

module.exports = {
  normalizeTerpene,
  normalizeProductTitle,
  normalizeVariantTitle,
  variantNameContainsWeightUnitString,
  printPathToKey,
  makeFirebaseSafe,
  makeFirebaseSafeId,
  normalizeCannabinoid,
  getCannabinoidObj,
  getTerpeneObj
}
