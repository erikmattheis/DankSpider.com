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

function normalizeVariantName(nameStr) {
  let name = nameStr.trim()

  if (!name) {
    return name
  }
  if (name === '28 grams') {
    return '28 g'
  }
  if (name === '28g') {
    return '28 g'
  }
  if (name === '1-oz') {
    return '28 g'
  }
  if (name === '1oz') {
    return '28 g'
  }
  if (name === '28g (small/minis)') {
    return '28 g smalls'
  }
  if (name === 'Sugar leaf trim - 28 grams') {
    return '28 g'
  }
  if (name === 'Mixed Dirty Kief 28 grams') {
    return '28 g'
  }
  if (name === 'Mixed+Dirty+Kief+28+grams') {
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
  if (name === 'smalls 28 grams') {
    return '28 g smalls'
  }
  if (name === '1/2 oz smalls Bag') {
    return '14 g smalls'
  }
  if (name === '1/2 oz smalls') {
    return '14 g smalls'
  }
  if (name === '1/2 Ounce') {
    return '14 g'
  }
  if (name === '1/2 oz') {
    return '14 g'
  }
  if (name === '1/2 oz') {
    return '14 g'
  }
  if (name === 'Half oz') {
    return '14 g'
  }
  if (name === '14 grams') {
    return '14 g'
  }
  if (name === 'smalls 14 grams') {
    return '14 g'
  }
  if (name === '14 grams') {
    return '14 g smalls'
  }
  if (name === '14g (small/minis)') {
    return '14 g'
  }
  if (name === '14-g') {
    return '14 g'
  }
  if (name === 'smalls 14 grams') {
    return '14 g smalls'
  }
  if (name === '7 grams') {
    return '7 g'
  }
  if (name === '7-g') {
    return '7 g'
  }
  if (name === '7 g') {
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
  name = name?.replace('(small/minis)', 'smalls')
  name = name?.replace(' (1/8 oz)', '')
  name = name?.replace(' (1/4 oz)', '')
  name = name?.replace(' (1/2 oz)', '')
  name = name?.replace(' (1 oz)', '')
  name = name?.replace(' Pheno 1', '')
  name = name?.replace(' Pheno 2', '')

  return name
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
