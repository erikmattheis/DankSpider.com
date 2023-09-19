function normalizeTitle(title) {
  if (!title) {
    return title;
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

function printPathToKey(obj, keyString, path = []) {
  for (const [key, value] of Object.entries(obj)) {
    const currentPath = [...path, key];
    if (key === keyString) {
      console.log(currentPath.join('.'));
    } else if (typeof value === 'object') {
      printPathToKey(value, keyString, currentPath);
    }
  }
}

module.exports = {
  normalizeTitle,
  variantNameContainsWeightUnitString,
  printPathToKey
}
