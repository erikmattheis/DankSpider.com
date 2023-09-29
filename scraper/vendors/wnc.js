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
    console.log('Building WNC product');
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
    console.log('variants', variants)

    const title = strings.normalizeProductTitle($('h1.productView-title').text().trim());
    const image = $('figure.productView-image img').attr('src');
    console.log('image', image)
    return {
      title,
      url,
      image,
      variants,
      vendor: 'WNC',
    }

  }
  catch (error) {
    console.log(`Error getting product info: ${error.message}`);
  }
}
// getProduct('https://wnc-cbd.com/products/thca-black-cherry-gelato-indoor-hydro.html');

async function scrapePage(url, currentPage, productLinks) {

  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const cards = $('.card');

    for (const card of cards) {
      const anchorElement = $(card).find('a.card-figure__link');
      const productTitle = $(card).find('h3.card-title a').text().trim();
      console.log('Finding if available: ', productTitle);

      const chooseOptionsButton = $(card).find('a.card-figcaption-button');
      if (isDesiredProduct(productTitle) && chooseOptionsButton && chooseOptionsButton.text().includes('Choose Options')) {

        console.log('Product title:', productTitle);
        const href = anchorElement.attr('href');

        console.log('href', href);

        productLinks.push(href);
      }
    }

    const nextPageLink = $('.pagination-item--next a').attr('href');
    if (nextPageLink) {
      currentPage++;
      console.log(`Scraping page ${currentPage}`);
      await scrapePage(nextPageLink, currentPage, productLinks);
    } else {
      console.log('No more WNC pages to scrape.', productLinks);


    }
  } catch (error) {
    console.log(`Error scraping page: ${error.message}`);
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
  console.log('Getting this many products from WNC', productLinks.length)
  const products = [];
  for (const productLink of productLinks) {
    const product = await getProduct(productLink);
    if (!product) {
      console.log('skipping null product');
      continue;
    }
    console.log('Found product.title', product.title, ' with ', product.variants.length, ' variants');
    product.vendor = 'WNC';

    if (product.variants.length > 0) {

      console.log('product', product)




      product.variants = product.variants.map((variant) => strings.normalizeVariantTitle(variant));
      console.log('ADDING', product.title, ' variants: ', product.variants.length)
      products.push(product);

    }
    else {
      console.log('product has no variants', product);
    }
  }
  return products;
}

async function getAvailableLeafProducts() {

  const productLinks = await scrapePage(startUrl, currentPage, []);
  console.log('productLinks', productLinks)
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
