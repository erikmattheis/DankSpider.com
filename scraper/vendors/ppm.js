const axios = require('../services/rateLimitedAxios')
const fs = require('fs')
const { saveProducts, getAssays, saveAssays } = require('../services/firebase.js')

const cheerio = require('cheerio')
const logger = require('../services/logger.js');
const strings = require('../services/strings')
const { readPDFs } = require('../services/pdf')
const { cannabinoids, terpenes } = require('../services/cortex')

const html = require('./data/ppm-pdfs.js');
const { all } = require('axios');

const feedUrl = 'https://perfectplantmarket.com/collections/thca-flower'
const url = 'https://perfectplantmarket.com/pages/lab-reports'
let allAssays


async function getListOfTHCAPDFs() {
  console.log('url', url)

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

    const cannabinoids = result.filter(c => c.name.toLowerCase())

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

async function getProducts(feedUrl) {
  try{

    allAssays = await getAssays();

    const result = await axios.get(feedUrl)
    fs.writeFileSync('./temp/vendors/ppm.html', result.data)
    const $ = cheerio.load(result.data, { xmlMode: true })
    $('.pf-product-form').parent().parent().each(function(_,el) {

      const $element = $(el);

      let title = $element.find('[data-pf-type="ProductTitle"]').text().trim();
      title = strings.normalizeProductTitle(title);
      const imageSrc = $element.find('.pf-slide-main-media img').attr('src');

      const image = `${imageSrc}`;
      const url = `https://perfectplantmarket.com${$element.find('[data-pf-type="MediaMain"]').data('href')}`;
      const vendor = 'PPM';
      let vendorDate = $element.find('[data-pf-type="ProductMeta"]').text().trim();

      const str = $element.find('script').text();
      const regex = /options_with_values:\s*(\[\{[^}]+\}\])/;
      /* */
      const matches0 = str.match(regex);

      if (!matches0 || !matches0[1]) {
        console.log('No variants found');
      }

      const regex1 = /"values":\s*(\[\s*"[^"\]]*"\s*(?:,\s*"[^"\]]*"\s*)*\])/;

      const matches = str.match(regex1);
      let variants = []
      if (matches && matches[1]) {
        variants = JSON.parse(matches[1]);
      } else {
          console.log("No match found");
      }

      const assay = allAssays.find(p => {
        const condition = p.name === title && p.vendor === 'PPM';
        return condition;
      });

      if (!assay?.assay) {
        console.log('no assays found for2', title)
        fs.appendFileSync('./temp/no-assay.txt', `no assays found for${p.name.toLowerCase()},  ${title.toLowerCase()}, `)
        return { title, url, variants, cannabinoids: [], terpenes: [], vendor: 'PPM' }
      }

      const canns = assay.assay.filter(a => cannabinoids.includes(a.name))
      const terps = assay.assay.filter(a => terpenes.includes(a.name))

      products.push({ title, image, url, vendor, vendorDate })
    });

  } catch (error) {
    console.error(error)
  }


    // Using regex to extract the JSON part from the scriptContent


  return products
}

async function getAvailableLeafProducts() {
  const products = await getProducts(feedUrl)
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
