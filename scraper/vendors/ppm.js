const axios = require('../services/rateLimitedAxios')
const fs = require('fs')
const { getAssays, saveAssays } = require('../services/firebase.js')

const cheerio = require('cheerio')
const logger = require('../services/logger.js');
const { normalizeVariantName, normalizeProductTitle } = require('../services/strings')
const { readPDFs } = require('../services/pdf')
const { cannabinoidSpellings, terpeneSpellings } = require('../services/cortex')
const html = require('./data/ppm-pdfs.js');

const feedUrl = 'https://perfectplantmarket.com/collections/thca-flower'
const url = 'https://perfectplantmarket.com/pages/lab-reports'
let allAssays


async function getListOfTHCAPDFs() {

 // await axios.get(url);

  //fs.writeFileSync('./temp/vendors/ppm.html', htmlContent.data)

  const $ = cheerio.load(html);

  const results = [];

  $('[data-pf-type="Accordion.Content.Wrapper"]').each(function() {
    // This assumes every product block starts with a 'span' within a 'button' for its name
    const productName = $(this).find('button span').text().trim();

    // The PDF link is expected to be the second 'a', but let's check for safety
    const links = $(this).find('div[data-pf-expandable="true"] a');
    if(links.length >= 2) { // Ensure there are at least two links
      const pdfUrl = links.eq(1).attr('href'); // Get the second link
      if(pdfUrl) {
        results.push({ name: productName, url: pdfUrl });
      }
    } else if(links.length === 1) { // If there's only one link, decide what to do
      const pdfUrl = links.eq(0).attr('href'); // Get the first link
      if(pdfUrl) {
        results.push({ name: productName, url: pdfUrl });
      }
    }
  });

  return results;
}

async function recordAssays() {

  try {

    const pdfs = await getListOfTHCAPDFs();

    const result = await readPDFs(pdfs);

    const assays = result.map(r => {
      return {
        ...r,
          vendor: 'PPM'
    }})

    await saveAssays('PPM', assays);

  }
  catch (error) {
    logger.error(error)
    logErrorToFile(error)
  }
}

const products = [];

async function getProducts() {
  try{

    allAssays = await getAssays();

    const result = await axios.get(feedUrl)
    fs.writeFileSync('./temp/vendors/ppm.html', result.data)
    const $ = cheerio.load(result.data, { xmlMode: true })
    $('.pf-product-form').parent().parent().each(function(_,el) {

      const $element = $(el);

      let title = $element.find('[data-pf-type="ProductTitle"]:first').text().trim();
      title = normalizeProductTitle(title);
      console.log(title)
      const imageSrc = $element.find('.pf-slide-main-media img').attr('src');

      const image = `${imageSrc}`;
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
        variants = variants.filter(v => !v.includes('PreRolls'));
        variants = variants.map(v => normalizeVariantName(v));
      }

      const assay = allAssays.find(p => {
        const condition = p.name === title && p.vendor === 'PPM';
        return condition;
      });

      if (!assay?.assay) {
        fs.appendFileSync('./temp/no-assay.txt', `no assays found for ${title.toLowerCase()}, \n`)
        return { title, url, variants, cannabinoids: [], terpenes: [], vendor: 'PPM' }
      }

      const canns = assay.assay.filter(a => cannabinoidSpellings.includes(a.name))
      const terps = assay.assay.filter(a => terpeneSpellings.includes(a.name))

      products.push({ title, image, url, vendor, cannabinoids:canns, terpenes:terps, variants, vendorDate })
    });

  } catch (error) {
    console.error(error)
  }

  // Using regex to extract the JSON part from the scriptContent

  return products
}

async function getAvailableLeafProducts() {
  const products = await getProducts()
  return products
}

if (require.main === module) {
   logger.log({
  level: 'info',
  message: `This script is being executed directly by Node.js`});
  getAvailableLeafProducts()
}

module.exports = {
  getAvailableLeafProducts,
  recordAssays
}
