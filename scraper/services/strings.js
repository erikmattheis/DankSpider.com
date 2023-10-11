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
    'a-Pinene': 'Pinene',
    '18Cineole': 'Cineole',
    'B-Caryophyllene': 'Caryophyllene',
    'a-Humulene': 'Humulene',
    'a-Bisabolol': 'Bisabolol',
    'B-Myrcene': 'Myrcene',
    'a-Terpinene': 'Terpinene',
    'CaryophylleneOxide': 'Caryophyllene Oxide',
    'B-Caryophyliene': 'Caryophyllene',
    'Bormwol': 'Borneol',
  }
  if (spellings[terpene]) {
    return spellings[terpene];
  }
  return terpene;
}


function lineToOutput(line) {

  /* output for each line {name, pct, originalText }

  originalText should be the line from exampleInput,

  pct should be the number after the last space, or 0 if "ND". If it is is not a number, then "Unknown"

  name should be from this list, if it is not here say "Unknown"

  Δ-8-Tetrahydrocannabinol(Δ-8 THC)
  Δ-9-Tetrahydrocannabinol(Δ-9 THC)
  Δ-9-Tetrahydrocannabinic Acid(Δ-9 THC-A)
  Δ-9-Tetrahydrocannabiphorol(Δ-9 THCP)
  Δ-9-Tetrahydrocannabivarin(Δ-9 THCV)
  Δ-9-Tetrahydrocannabivarinic Acid(Δ-9 THCVA)
  R-Δ-10-Tetrahydrocannabinol(R-Δ-10 THC)
  S-Δ-10-Tetrahydrocannabinol(S-Δ-10 THC)
  9S Hexahydrocannabinol(9R-HHC)
  9S Hexahydrocannabinol(9S-HHC)
  Tetrahydrocannabinol Acetate(THCO)
  Cannabidivarin(CBDV)
  Cannabidivarintic Acid(CBDVA)
  Cannabidiol(CBD)
  Cannabidiolic Acid(CBDA)
  Cannabigerol(CBG)
  Cannabigerolic Acid(CBGA)
  Cannabinol(CBN)
  Cannabinolic Acid(CBNA)
  Cannabichrome(CBC)
  Cannabichromenic Acid(CBCA)


  */

  const parts = line.split(' ');
  const lastPart = parts[parts.length - 1];
  const pct = lastPart === 'ND' ? 0 : parseFloat(lastPart);
  const name = normalizeCannabinoid(parts[0]);
  const originalText = line;

  return { name, pct, originalText };
}

const cannabinoidSpellings = {
  "4-8-Tetrahydrocannabinol": "Δ-8-Tetrahydrocannabinol",
  "4-9-Tetrahydrocannabinol": "Δ-9-Tetrahydrocannabinol",
  "4-9-Tetrahydrocannabinolic Acid": "Δ-9-Tetrahydrocannabinic Acid",
  "A-9-Tetrahydrocannabiphorol": "Δ-9-Tetrahydrocannabiphorol",
  "A-9-Tetrahydrocannabivarin": "Δ-9-Tetrahydrocannabivarin",
  "A-9-Tetrahydrocannabivarinic Acid": "Δ-9-Tetrahydrocannabivarinic Acid",
  "R-A-10-Tetrahydrocannabinol": "R-Δ-10-Tetrahydrocannabinol",
  "-A-10-Tetrahydrocannabinol": "S-Δ-10-Tetrahydrocannabinol",
  "9R-Hexahydrocannabinol": "9S Hexahydrocannabinol",
  "95-Hexahydrocannabinol": "9S Hexahydrocannabinol",
  "Tetrahydrocannabinol": "Tetrahydrocannabinol Acetate",
  "Cannabidivarin": "Cannabidivarin",
  "Cannabidivarinic Acid": "Cannabidivarintic Acid",
  "Cannabidiol": "Cannabidiol",
  "Cannabidiolic Acid": "Cannabidiolic Acid",
  "Cannabigerol": "Cannabigerol",
  "Cannabigerolic Acid": "Cannabigerolic Acid",
  "Cannabinol": "Cannabinol",
  "Cannabinolic Acid": "Cannabinolic Acid",
  "Cannabichromene": "Cannabichrome",
  "Cannabichromenic Acid": "Cannabichromenic Acid",
}

function normalizeCannabinoid(name) {

  if (cannabinoidSpellings[name]) {
    return cannabinoidSpellings[name];
  }

  return "Unknown";
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

async function makeFirebaseSafeId(prefix, product, collectionRef) {

  let n = 0;
  let id = '';
  let idExists = true;
  while (idExists) {
    id = `${prefix}-${product.title}-${product.vendor}-${n}`;
    idExists = await collectionIdExists(id, collectionRef);
    n = n + 1;
  }
  return id.replace(/[^\w-]+/g, '_');
}

module.exports = {
  normalizeTerpene,
  normalizeProductTitle,
  normalizeVariantTitle,
  variantNameContainsWeightUnitString,
  printPathToKey,
  makeFirebaseSafeId,
  normalizeCannabinoid,
  lineToOutput
}
