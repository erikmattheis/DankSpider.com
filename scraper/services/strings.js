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

function getTerpeneObj(line) {
  const cleanedLine = line.replace(/\s+/g, ' ');

  const parts = cleanedLine.split(' ');
  const name = normalizeTerpene(parts[0]) || 0;
  const pct = parts[parts.length - 2] || 0;
  let mgg = parts[parts.length - 1] || 0;;
  mgg = mgg === 'ND' || mgg === '<LOQ' || mgg === '<L0Q' || mgg === '>3.000' ? 0 : 0 || mgg;
  const originalText = cleanedLine || 0;
  console.log('cleanedLINE', cleanedLine)
  console.log(name, pct, mgg, originalText)
  return { name, pct, mgg, originalText };
}

function getCannabinoidObj(line) {
  const cleanedLine = line.replace(/\s+/g, ' ');
  const parts = cleanedLine.split(' ');
  let mgg = parts[parts.length - 1] || 0;
  mgg = mgg === 'ND' || mgg === '<LOQ' || mgg === '<L0Q' || mgg === '>3.000' ? 0 : mgg;
  const name = normalizeCannabinoid(parts[0]) || 0;
  let pct = parts[parts.length - 2] || 0;
  const originalText = cleanedLine || 0;
  console.log(name, pct, mgg, originalText)
  return { name, pct, mgg, originalText };
}



const cannabinoidSpellings = {
  "4-8-Tetrahydrocannabinol": "Δ-8-Tetrahydrocannabinol (Δ-8 THC)",
  "4-9-Tetrahydrocannabinol": "Δ-9-Tetrahydrocannabinol (Δ-9 THC)",
  "4-9-Tetrahydrocannabinolic": "Δ-9-Tetrahydrocannabinic Acid (Δ-9 THCA)",
  "A-9-Tetrahydrocannabiphorol": "Δ-9-Tetrahydrocannabiphorol (THCP)",
  "A-9-Tetrahydrocannabivarin": "Δ-9-Tetrahydrocannabivarin (THCV)",
  "A-9-Tetrahydrocannabivarinic": "Δ-9-Tetrahydrocannabivarinic Acid (Δ-9 THCVA)",
  "R-A-10-Tetrahydrocannabinol": "R-Δ-10-Tetrahydrocannabinol (R-Δ-10 THC)",
  "-A-10-Tetrahydrocannabinol": "S-Δ-10-Tetrahydrocannabinol (S-Δ-10 THC)",
  "9R-Hexahydrocannabinol": "9R Hexahydrocannabinol (9R-HHC)",
  "95-Hexahydrocannabinol": "9S Hexahydrocannabinol (9R-HHC)",
  "Tetrahydrocannabinol": "Tetrahydrocannabinol Acetate (THC0)",
  "Cannabidivarin": "Cannabidivarin (CBDV)",
  "Cannabidivarinic": "Cannabidivarintic Acid (CBDVA)",
  "Cannabidiol": "Cannabidiol (CBD)",
  "Cannabidiolic": "Cannabidiolic Acid (CBDA)",
  "Cannabigerol": "Cannabigerol (CBG)",
  "Cannabigerolic": "Cannabigerolic Acid (CBGA)",
  "Cannabinol": "Cannabinol (CBN)",
  "Cannabinolic": "Cannabinolic Acid (CBNA)",
  "Cannabichromene": "Cannabichrome (CBC)",
  "Cannabichromenic": "Cannabichromenic Acid (CBCA)",
  "Total": "Total Cannabinoids",
  "TOTAL": "Total Cannabinoids",
}

const userPatterns = `
  Δ-8-Tetrahydrocannabinol (Δ-8 THC)
  Δ-9-Tetrahydrocannabinol (Δ-9 THC)
  Δ-9-Tetrahydrocannabinic Acid (Δ-9 THC-A)
  Δ-9-Tetrahydrocannabiphorol (Δ-9 THCP)
  Δ-9-Tetrahydrocannabivarin (Δ-9 THCV)
  Δ-9-Tetrahydrocannabivarinic Acid (Δ-9 THCVA)
  R-Δ-10-Tetrahydrocannabinol (R-Δ-10 THC)
  S-Δ-10-Tetrahydrocannabinol (S-Δ-10 THC)
  9S Hexahydrocannabinol (9R-HHC)
  9S Hexahydrocannabinol (9S-HHC)
  Tetrahydrocannabinol Acetate (THCO)
  Cannabidivarin (CBDV)
  Cannabidivarintic Acid (CBDVA)
  Cannabidiol (CBD)
  Cannabidiolic Acid (CBDA)
  Cannabigerol (CBG)
  Cannabigerolic Acid (CBGA)
  Cannabinol (CBN)
  Cannabinolic Acid (CBNA)
  Cannabichrome (CBC)
  Cannabichromenic Acid (CBCA)
  Bisabolol
  Humulene
  Pinene
  α-Terpinene
  Cineole
  β-Caryophyllene
  Myrcene
  Borneol
  Camphene
  Carene
  Caryophyllene
  Citral
  Dihydrocarveol
  Fenchone
  γ-Terpinene
  Limonene
  Linalool
  Menthol
  Neroldol
  Ocimene
  Pulegone
  Terpinolene
`;

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
  getCannabinoidObj,
  getTerpeneObj
}
