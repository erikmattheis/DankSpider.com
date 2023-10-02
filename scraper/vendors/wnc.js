const axios = require('../services/rateLimitedAxios');
const cheerio = require('cheerio');
const strings = require('../services/strings');

let currentPage = 1;
const startUrl = 'https://wnc-cbd.com/categories/high-thca.html';

const uniqueVariants = [];

function addUniqueVariant(variant) {
  if (!uniqueVariants.includes(variant)) {
    uniqueVariants.push(variant);
  }
}

async function getProduct(url) {
  try {

    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const variants = [];

    // Extract available variant values from BCData object
    const bcDataScript = $('script:contains("var BCData")').html();
    const bcData = JSON.parse(bcDataScript.match(/var BCData = ({.*});/)[1]);
    const availableVariantValues = bcData.product_attributes.available_variant_values;

    // Filter variants by available variant values
    $('div.form-field[data-product-attribute="set-rectangle"] label.form-option').each((index, element) => {
      const variantValue = $(element).attr('for').split('_').pop();
      if (availableVariantValues.includes(parseInt(variantValue))) {
        variants.push($(element).text().trim());
      }
    });

    const title = strings.normalizeProductTitle($('h1.productView-title').text().trim());
    console.log('WNC: ', title);

    const image = $('figure.productView-image img').attr('src');
    return {
      title,
      url,
      image,
      variants,
      vendor: 'WNC',
    }

  }
  catch (error) {
    throw new Error(`Error getting product info: ${error.message}`);
  }
}

async function scrapePage(url, currentPage, productLinks) {

  console.log('Getting page ${currentPage} WNC products');

  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const cards = $('.card');

    for (const card of cards) {
      const anchorElement = $(card).find('a.card-figure__link');
      const productTitle = $(card).find('h3.card-title a').text().trim();

      const chooseOptionsButton = $(card).find('a.card-figcaption-button');
      if (isDesiredProduct(productTitle) && chooseOptionsButton && chooseOptionsButton.text().includes('Choose Options')) {

        const href = anchorElement.attr('href');

        productLinks.push(href);
      }
    }

    const nextPageLink = $('.pagination-item--next a').attr('href');
    if (nextPageLink) {
      currentPage++;
      await scrapePage(nextPageLink, currentPage, productLinks);
    }
  } catch (error) {
    throw new Error(`Error scraping page: ${error.message}`);
  }

  return productLinks;
}

function isDesiredProduct(productTitle) {
  if (!productTitle) {
    return false;
  }
  const lowerTitle = productTitle.toLowerCase();

  if (lowerTitle.includes('artisan mix')) {
    return false;
  }

  return ['living soil', 'indoor', 'greenhouse'].some((keyword) =>
    lowerTitle.includes(keyword)
  );
}

async function getWNCProductsInfo(productLinks) {

  const products = [];
  for (const productLink of productLinks) {
    const product = await getProduct(productLink);
    if (!product) {
      continue;
    }
    product.vendor = 'WNC';

    if (product.variants.length > 0) {

      product.variants = product.variants.map((variant) => strings.normalizeVariantTitle(variant));

      products.push(product);

    }

  }
  return products;
}

async function getAvailableLeafProducts() {

  const productLinks = await scrapePage(startUrl, currentPage, []);

  const products = await getWNCProductsInfo(productLinks);
  return products;

}

if (require.main === module) {
  console.log('This script is being executed directly by Node.js');
  getAvailableLeafProducts();
}

module.exports = {
  getAvailableLeafProducts
}
