const fs = require('fs')

function normalizeProductTitle(title) {
  let replaceString = title
  const find = ['Pheno 1', 'Pheno 2', 'Hemp Flower', '(Indoor)', '(Greenhouse)', 'High THCa', 'THCa', 'Hydro', 'Indoor', 'Living Soil', 'Hemp', 'THCa Flower', 'Flower', '  ']
  for (let i = 0; i < find.length; i++) {
    replaceString = replaceString.replace(find[i], '')
    replaceString = replaceString.replace(/\s+/g, ' ')
    replaceString = replaceString.trim()
  }
  return replaceString
}

function isValidURI(string) {
  const uriRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
  return uriRegex.test(string);
}

const variantNameMap = {
  '1-g': '1 g',
  '1-oz': '28 g',
  '1/2 Ounce': '14 g',
  '1/2 oz smalls Bag': '14 g smalls',
  '1/2 oz smalls': '14 g smalls',
  '1/2 oz': '14 g',
  '14 grams': '14 g',
  '14-g': '14 g',
  '14g (small/minis)': '14 g smalls',
  '1g': '1 g',
  '1oz': '28 g',
  '28 grams': '28 g',
  '28g (small/minis)': '28 g smalls',
  '28g': '28 g',
  '3.5 g Pheno 1': '3.5 g',
  '3.5 g Pheno 2': '3.5 g',
  '3.5 grams': '3.5 g',
  '3.5-g': '3.5 g',
  '3.5g': '3.5 g',
  '7 g Pheno 2': '7 g',
  '7 g': '7 g',
  '7 grams': '7 g',
  '7-g': '7 g',
  '7g': '7 g',
  'Dry Sift 1g': '1 g',
  'Half oz': '14 g',
  'Mixed Dirty Kief 28 grams': '28 g',
  'Mixed T1 Sugar leaf/ trim - 28 grams': '28 g',
  'Mixed+Dirty+Kief+28+grams': '28 g',
  'smalls 14 grams': '14 g smalls',
  'smalls 28 grams': '28 g smalls',
  'Sugar leaf trim - 28 grams': '28 g',
};

function normalizeVariantName(nameStr) {
  let name = nameStr.trim() + '';
  name = name?.replace(/(\d)([a-zA-Z])/g, '$1 $2');
  name = name?.replace(/(\s+)/g, ' ');
  name = name?.replace(/SMALLS/g, 'smalls');
  name = name?.replace(/MINIS/g, 'minis');
  name = name?.replace(/Smalls/g, 'smalls');
  name = name?.replace(/Minis/g, 'minis');
  name = name?.replace(/\(small\/minis\)/g, 'smalls');
  name = name?.replace(/ \(1\/8 oz\)/g, '');
  name = name?.replace(/ \(1\/4 oz\)/g, '');
  name = name?.replace(/ \(1\/2 oz\)/g, '');
  name = name?.replace(/ \(1 oz\)/g, '');
  name = name?.replace(/ Pheno 1/g, '');
  name = name?.replace(/ Pheno 2/g, '');
  name = name?.replace(/ 1g /g, '1 g');
  name = name?.replace(/ 3.5g /g, '3.5 g');
  name = name?.replace(/ 7g /g, '7 g');
  return variantNameMap[name] || name;
}

function cleanString(str) {
  return sanitize(str);
}

function variantNameContainsWeightUnitString(variantName) {
  const regexMatchingPossibleWeightString = /(\d+)(\s+)?(g|oz|gram|ounce)/i
  return regexMatchingPossibleWeightString.test(variantName)
}

function makeFirebaseSafe(str) {
  id = str.replace(/\s/g, '-')
  id = id.replace(/%20/g, '-')
  id = id.replace(/[\/\'.#[\]*$]/g, '');
  return id
}

function makeFirebaseSafeId(suffix, product, collectionRef) {

  let id = `${product.vendor}-${suffix}-${product.title}`
  id = makeFirebaseSafe(id)
  return id

}

const cheerio = require('cheerio');

function findLargestImage(htmlString) {
  const $ = cheerio.load(htmlString);
  let largestImageUrl = '';
  let maxImageWidth = 0;

  $('img').each((i, img) => {
    const srcset = $(img).attr('srcset');
    if (srcset) {
      const sources = srcset.split(',').map(s => s.trim());
      sources.forEach(source => {
        const [url, width] = source.split(' ');
        const imageWidth = parseInt(width.replace('w', ''));
        if (imageWidth > maxImageWidth) {
          maxImageWidth = imageWidth;
          largestImageUrl = url;
        }
      });
    }
  });

  return largestImageUrl;
}

module.exports = {
  normalizeProductTitle,
  normalizeVariantName,
  variantNameContainsWeightUnitString,
  makeFirebaseSafe,
  makeFirebaseSafeId,
  findLargestImage,
  cleanString,
  isValidURI,
}
