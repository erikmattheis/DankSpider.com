const rateLimit = require('axios-rate-limit');
const axios = require('axios');
const axiosRateLimited = rateLimit(axios.create(), { maxRPS: 2 });
const xml2js = require('xml2js');
const cheerio = require('cheerio');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const stringsService = require('../services/strings');

const products = [];

let currentPage = 1;
const startUrl = 'https://wnc-cbd.com/categories/high-thca.html';

const uniqueVariants = [];

function addUniqueVariant(variant) {
  if (!uniqueVariants.includes(variant)) {
    uniqueVariants.push(variant);
  }
}

async function getWNCProductInfo(productInfoUrl) {
  try {
    console.log('get WNC product info');
    const response = await axiosRateLimited.get(productInfoUrl);
    const $ = cheerio.load(response.data);
    const variants = [];

    $('span.form-option-variant').each((index, element) => {
      variants.push($(element).text());
    });

    //console.log('variants', variants);

    const title = $('meta[property="og:title"]').attr('content').replace('THCa ', '');;
    const url = $('meta[property="og:url"]').attr('content');
    console.log('url', url);
    console.log('productInfoUrl', productInfoUrl);

    const image = $('meta[property="og:image"]').attr('content');
    /*
    const scriptText = $('script:contains("var BCData =")').html();

    //console.log('Found BCData', scriptText);

    if (scriptText) {
      const jsonMatch = /{[^]*};?/.exec(scriptText);
      let jsonData = jsonMatch[0];

      if (jsonData.endsWith(';')) {
        jsonData = jsonData.slice(0, -1);
      }

      const productData = JSON.parse(jsonData);

      const inStock = productData?.product_attributes?.available_variant_values;

      if (inStock.length) {
        console.log('inStock', inStock.length);


    const variants = inStock.map((variant) => {
      console.log('variant', variant)
      const normalizedTitle = stringsService.normalizeTitle(variant);
      console.log('normalizedTitle', normalizedTitle);

      addUniqueVariant(normalizedTitle);

      return normalizedTitle;
    });
*/
    return {
      title,
      url,
      image,
      variants,
    }
  }
  catch (error) {
    throw new Error(`Error getting WNC product info: ${error.message}`);
  }
}


async function scrapePage(url, currentPage) {
  const productLinks = [];
  try {
    const response = await axiosRateLimited.get(url);
    const $ = cheerio.load(response.data);

    const cards = $('.card');

    for (const card of cards) {
      const anchorElement = $(card).find('a.card-figure__link');
      const productTitle = $(card).find('h3.card-title a').text().trim();
      console.log('Finding if available: ', productTitle);

      const chooseOptionsButton = $(card).find('a.card-figcaption-button');
      if (isDesiredProduct(productTitle) && chooseOptionsButton && chooseOptionsButton.text().includes('Choose Options')) {
        console.log('Finding if desired: ', productTitle);
        console.log('Product title:', productTitle);
        const href = anchorElement.attr('href');

        console.log('href', href);

        productLinks.push(href);
      }
    }

    //const productTitle = $(element).find('h3.card-title a[aria-label="Artisan Mix Pre-Rolls (CBD+THCa), Price range from $6.00 to $30.00"]').text();



    const nextPageLink = $('.pagination-item--next a').attr('href');
    if (nextPageLink) {
      currentPage++;
      console.log(`Scraping page ${currentPage}`);
      await scrapePage(nextPageLink, currentPage);
    } else {
      console.log('No more WNC pages to scrape.');
      await getWNCProductsInfo(productLinks);
    }
  } catch (error) {
    console.log(`Error scraping page: ${error.message}`);
  }
}

/*
        $('.product').each((_, element) => {
          console.log('element', $(element).html());
          process.exit();
          const anchorElement = $(element).find('a[data-event-type="product-click"]');

          // console.log('anchorElement.length', element);

          if (anchorElement.text() == 'Choose Options') {
            const productTitle = $(anchorElement).find('h3.card-title a').text();
            const productTitle = $(anchorElement).find('h3.card-title a').text();
            console.log('Finding if desired: ', productTitle);
            if (isDesiredProduct(productTitle)) {
              console.log('isDesired');

              const href = $('a[data-event-type="product-click"]').attr('href');

              console.log('href', href);
              if (productTitle) {
                productLinks.push(href);
              }
            }
          }
        });
    */

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
  console.log('Getting product info from WNC')
  for (const productLink of productLinks) {
    console.log('productLink', productLink);
    const product = await getWNCProductInfo(productLink);
    if (!product) {
      console.log('skipping null product');
      continue;
    }
    console.log('product.title', product.title);
    product.vendor = 'WNC';

    if (product.variants.length > 0) {
      product.variants = product.variants.map((variant) => stringsService.normalizeTitle(variant));
      products.push(product);
    }
  }
  console.log('Done');
}

async function getAvailableLeafProducts() {

  //await fetchFlowGardensData();
  await scrapePage(startUrl, currentPage);

  return products;

}


module.exports = {
  getAvailableLeafProducts
}
