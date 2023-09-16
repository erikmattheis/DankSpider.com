
require('dotenv').config();
const rateLimit = require('axios-rate-limit');
const axios = require('axios');
const axiosRateLimited = rateLimit(axios.create(), { maxRPS: 2 });
const fs = require('fs');
const xml2js = require('xml2js');
const cheerio = require('cheerio');

const atomFeedUrl = 'https://flowgardens.com/collections/thca.atom';

function normalizeTitle(title) {
  // Remove extra spaces, leading/trailing spaces, and convert to lowercase
  title = title?.trim().replace(/\s+/g, ' ');
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
  return title;
}

const products = [];
const productLinks = [];
let currentPage = 1;

function discardProduct(product) {
  const lowerTitle = product.toLowerCase();
  regex = /\s(oz|g)\b/i;

  if (!regex.test(lowerTitle)) {
    console.log('The string does not contain " oz" or " g"');
    return false;
  } else {
    return true;
    console.log('The string does not contain " oz" or " g"');
  }
}

async function fetchFlowGardensData() {
  try {
    const response = await axios.get(atomFeedUrl);
    const xmlData = response.data;

    // Parse the XML data
    const parser = new xml2js.Parser({ explicitArray: false });
    const parsedData = await parser.parseStringPromise(xmlData);



    if (parsedData.feed && parsedData.feed.entry) {
      const entries = parsedData.feed.entry;

      entries.forEach((entry) => {

        const productType = entry['s:type'] ? entry['s:type'].toLowerCase() : '';
        const variants = entry['s:variant'] ? [].concat(entry['s:variant']) : [];
        // Skip products that are not flowers
        if ((productType === 'flower' || productType === 'pre-roll')) {

          if (variants.length === 0 || variants.some((variant) => discardProduct(variant.title))) {

            const resolvedVariants = variants.map((variant) => normalizeTitle(variant.title));

            const productTitle = entry.title ? entry.title : '';

            const productUrl = entry.link || '';

            // Extract the first image URL
            const contentHtml = entry.summary && entry.summary._ ? entry.summary._ : '';
            //console.log('contentHtml', entry.summary.type);

            const $content = cheerio.load(contentHtml);

            const firstImage = $content('img').attr('src');
            const productImage = firstImage || '';

            const product = {
              title: productTitle,
              url: productUrl,
              image: productImage,
              variants: resolvedVariants,
              vendor: 'FLO';
            };

            products.push(product);
          }
          else {
            console.log('Skipping product type', productType);
          }
        }
      });
    }

    console.log('Data has been extracted from flow');
  } catch (error) {
    console.error(`Error fetching Flow Gardens data: ${error.message}`);
  }
}

const startUrl = 'https://wnc-cbd.com/categories/high-thca.html';

const uniqueVariants = [];

async function getWNCProductInfo(productInfoUrl) {
  try {
    const response = await axiosRateLimited.get(productInfoUrl);
    const $ = cheerio.load(response.data);
    const scriptText = $('script:contains("var BCData =")').html();

    if (scriptText) {
      const jsonMatch = /{[^]*};?/.exec(scriptText);
      let jsonData = jsonMatch[0];

      if (jsonData.endsWith(';')) {
        jsonData = jsonData.slice(0, -1);
      }

      const productData = JSON.parse(jsonData);

      const inStock = productData?.product_attributes?.available_variant_values;

      if (inStock.length > 0) {
        const title = $('meta[property="og:title"]').attr('content');
        const url = $('meta[property="og:url"]').attr('content');
        const image = $('meta[property="og:image"]').attr('content');
        const variants = inStock.map((variant) => {
          if (!uniqueVariants.includes(variant)) {
            uniqueVariants.push(variant);
          }
          return normalizeTitle(variant);
        });

        return {
          title,
          url,
          image,
          variants,
        }
      }
    }
  } catch (error) {
    throw new Error(`Error fetching product info: ${error.message}`);
  }
  return null;
}

async function scrapePage(url, currentPage, productLinks) {
  try {
    const response = await axiosRateLimited.get(url);
    const $ = cheerio.load(response.data);

    $('.product').each((_, element) => {

      const outOfStockElement = $(element).find('a[data-event-type="product-click"][href="#"]');

      if (outOfStockElement?.length === 0 && outOfStockElement.text().toLowerCase() === 'out of stock') {



        if (isDesiredProduct(productTitle)) {
          const productLink = $(element).find('h3.card-title a').attr('href');
          if (productLink) {
            productLinks.push(productLink);
          }
        }
      }
    });

    const nextPageLink = $('.pagination-item--next a').attr('href');
    if (nextPageLink) {
      currentPage++;
      console.log(`Scraping page ${currentPage}`);
      await scrapePage(nextPageLink, currentPage, productLinks);
    } else {
      console.log('No more WNC pages to scrape.');
      await getWNCProductsInfo(productLinks);
    }
  } catch (error) {
    console.log(`Error scraping page: ${error.message}`);
  }
}

function isDesiredProduct(productTitle) {
  const lowerTitle = productTitle.toLowerCase();
  return ['living soil', 'indoor', 'greenhouse'].some((keyword) =>
    lowerTitle.includes(keyword)
  );
}

async function getWNCProductsInfo(productLinks) {
  console.log('Getting product info from WNC')
  for (const productLink of productLinks) {
    const product = await getWNCProductInfo(productLink);
    product.vendor = 'WNC';

    if (product.variants.length > 0) {
      product.variants = product.variants.map((variant) => normalizeTitle(variant));
      products.push(product);
    }
  }
  console.log('Done');
}

exports.handler = async function (event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { body } = JSON.parse(event);

  await fetchFlowGardensData();

  await scrapePage(startUrl, currentPage, productLinks);

  const jsonContent = JSON.stringify(products, null, 2);

  fs.writeFileSync('./frontend/src/assets/data/products.json', jsonContent, 'utf8');

  return {
    statusCode: 200,
    body: JSON.stringify({ response: `Processed ${products?.length} products.` })
  };
} catch (error) {
  console.error(error);
  return { statusCode: 500, body: 'An error occurred' };
}
};
