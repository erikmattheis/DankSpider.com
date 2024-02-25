/* todo number of terpenes nan, only  */
const axios = require('../services/rateLimitedAxios')
const fs = require('fs')
const { getAssays, saveAssays } = require('../services/firebase.js')

const cheerio = require('cheerio')
const logger = require('../services/logger.js');
const { normalizeVariantName, normalizeProductTitle } = require('../services/strings')
const { readPDFs } = require('../services/pdf')
const { cannabinoidNameList, terpeneNameList } = require('../services/memory')

let numberSavedProducts = 0;
let numProductsToSave = 2;
const html = require('./data/ppm-pdfs.js');

const feedUrl = 'https://perfectplantmarket.com/collections/thca-flower'
const coas = 'https://perfectplantmarket.com/pages/lab-reports'
let allAssays
let batchId;

async function getListOfTHCAPDFs() {

  await axios.get(coas);

  fs.writeFileSync('./temp/vendors/ppm-assays.html', htmlContent.data)

  const $ = cheerio.load(html);

  const results = [];

  $('[data-pf-type="Accordion.Content.Wrapper"]').each(function () {
    // This assumes every product block starts with a 'span' within a 'button' for its name
    const productName = $(this).find('button span').text().trim();
    // The PDF link is expected to be the second 'a', but let's check for safety
    const links = $(this).find('div[data-pf-expandable="true"] a');
    if (links.length >= 2) { // Ensure there are at least two links
      const pdfUrl = links.eq(1).attr('href'); // Get the second link
      if (pdfUrl) {
        results.push({ name: productName, url: pdfUrl });
      }
    } else if (links.length === 1) { // If there's only one link, decide what to do
      const pdfUrl = links.eq(0).attr('href'); // Get the first link
      if (pdfUrl) {
        results.push({ name: productName, url: pdfUrl });
      }
    }
  });

  return results;
}

async function recordAssays() {

  try {

    const pdfs = await getListOfTHCAPDFs();

    const result = await readPDFs(pdfs, 'PPM');

    const assays = result.map(r => {
      return {
        ...r,
        vendor: 'PPM'
      }
    })

    // await saveAssays('PPM', assays);

  }
  catch (error) {
    return [];
    logger.error(error)
    logErrorToFile(error)
  }
}


async function getProducts() {
  const products = [];
  try {

    allAssays = await getAssays();

    const result = await axios.get(feedUrl)

    const $ = cheerio.load(result.data)

    fs.writeFileSync('./temp/vendors/ppm.html', result.data)

    let els = $('.pf-product-form').parent().parent().get()
    els = Array.from(els);


    for (let element of els) {
      let $element = $(element);

      if (numberSavedProducts >= numProductsToSave) {
        break;
      }


      let title = $element.find('[data-pf-type="ProductTitle"]:first').text().trim();

      title = normalizeProductTitle(title);
      const imageSrc = $element.find('.pf-slide-main-media img').attr('src');

      const image = `https://${imageSrc}`;
      const url = `https://perfectplantmarket.com${$element.find('[data-pf-type="MediaMain"]').data('href')}`;
      const vendor = 'PPM';
      let vendorDate = $element.find('[data-pf-type="ProductMeta"]:first').text().trim();

      const str = $element.find('script').text();
      const regex = /options_with_values:\s*(\[\{[^}]+\}\])/;
      /* */
      const matches0 = str.match(regex);

      const regex1 = /"values":\s*(\[\s*"[^"\]]*"\s*(?:,\s*"[^"\]]*"\s*)*\])/;

      const matches = str.match(regex1);

      let variants = []
      if (matches && matches[1]) {
        variants = JSON.parse(matches[1]);
        variants = variants.filter(v => !v?.includes('PreRolls'));
        variants = variants.map(v => normalizeVariantName(v));
        variants = variants.map(v => v.replace(title, '').trim());
      }

      const assay = allAssays.find(p => {
        const condition = p.name === title && p.vendor === 'PPM';
        return condition;
      });

      if (!assay?.assay) {
        const partialProduct = { title, image, url, vendor, variants, vendorDate }
        fs.appendFileSync('./temp/no-assay.txt', `no assays found for ${title.toLowerCase()}, \n`)
        products.push(partialProduct)
        continue
      }
      const canns = assay.assay.filter(a => cannabinoidNameList.includes(a.name))
      const terps = assay.assay.filter(a => terpeneNameList.includes(a.name))

      numberSavedProducts++;

      const product = { title, image, url, vendor, cannabinoids: canns, terpenes: terps, variants, vendorDate }

      products.push(product)
    }

  } catch (error) {
    console.error(error)
  }

  return products

}

async function getAvailableLeafProducts(id, vendor) {
  console.log('getting ${vendor} products')
  batchId = id;

  await recordAssays();

  const products = await getProducts()
  return products
}

if (require.main === module) {
  logger.log({
    level: 'info',
    message: `This script is being executed directly by Node.js`
  });
  getAvailableLeafProducts(batchId, vendor)
}

module.exports = {
  getAvailableLeafProducts,
  recordAssays
}
