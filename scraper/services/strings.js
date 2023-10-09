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
    'aPinene': 'Pinene',
    '18Cineole': 'Cineole',
    'BCaryophyllene': 'Caryophyllene',
    'aHumulene': 'Humulene',
    'aBisabolol': 'Bisabolol',
    'BMyrcene': 'Myrcene',
    'aTerpinene': 'Terpinene',
    'CaryophylleneOxide': 'Caryophyllene Oxide',
    'BCaryophyliene': 'Caryophyllene',
    'Bormwol': 'Borneol',
  }
  if (spellings[terpene]) {
    return spellings[terpene];
  }
  return terpene;
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
  makeFirebaseSafeId
}
