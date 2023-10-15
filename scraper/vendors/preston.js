const axios = require('../services/rateLimitedAxios');
const cheerio = require('cheerio');
const strings = require('../services/strings');
const { recognize } = require('../services/ocr');

const products = [];

let currentPage = 1;
const startUrl = 'https://www.prestonhempco.com/categories/high-thca';

function getImageSrc(html) {
  const $ = cheerio.load(html);

  const imageSrcset = $('img.main-product-image').attr('srcset');
  const regex = /([^,\s]+) 500w/;
  const match = imageSrcset.match(regex);
  const image = match ? match[1] : null;
  return image;
}

async function getPrestonProductInfo(product) {
  // try {

  const response = await axios.get(product.url);

  if (response.status < 400) {
    const $ = cheerio.load(response.data);
    const select = $('.sizes-dropdown .size-dropdown-link');
    product.variants = select.map((i, el) => $(el).text()).get();

    product.images = [];

    $('script.w-json').each((i, el) => {
      const json = $(el).html();
      const data = JSON.parse(json);
      if (data.group === 'Product Shots') {
        data.items.forEach(item => {
          if (item.type === 'image') {
            product.images.push(item.url);
          }
        });
      }
    });

    for (const image of product.images) {

      product.terpenes = [];
      product.cannabinoids = [];

      const result = await recognize(image);

      if (!result) {
        console.log('Nothing interesting, continuing ...', image);
        console.log('');
        continue;
      }

      if (result instanceof String) {
        console.log('image rejected', image);
        console.log('');
        console.error(result);
        continue;
      }

      if (result.terpenes?.length) {
        console.log('Terpenes: ', result.terpenes.length)
        product.terpenes = JSON.parse(JSON.stringify(result.terpenes))
      }

      if (result.cannabinoids?.length) {
        console.log('Cannabinoids: ', result.cannabinoids.length)
        product.cannabinoids = JSON.parse(JSON.stringify(result.cannabinoids))
      }

      if (product.terpenes?.length && product.cannabinoids?.length) {
        console.log('both terpenes and cannabinoids found')
        break;
      }
    }
    // await saveProducts([{ title, url, image, terpenes, cannabinoids }], batchId, true);

    // console.log('Saved ${title}');

    console.log(`${product.title} has ${product.terpenes?.length} terpenes and ${product.cannabinoids?.length} cannabinoids`);

    return {
      ...product,
      vendor: 'Preston',
    }
  }
  else {
    console.error(`Error getting product info: ${response.status}`);
    return null;
  }
  /*
    }
    catch (error) {
      console.error(`Error getting product info2: ${error.message}`);
      return null;
    }
  */
}

async function scrapePage(url, currentPage) {

  const productLinks = [];

  try {

    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const cards = $('.w-dyn-item');

    for (const card of cards) {

      const title = $(card).find('div.product-name').text().trim();

      if (isDesiredProduct(title)) {

        const image = getImageSrc(card);

        const url = 'https://www.prestonhempco.com' + $(card).find('a.product-card').attr('href');

        productLinks.push({ title: strings.normalizeProductTitle(title), url: url });
      }
    }

    return productLinks;

  } catch (error) {
    throw new Error(`Error scraping page: ${error.message}`);
  }
}

function isDesiredProduct(productTitle) {
  if (!productTitle) {
    return false;
  }
  const lowerTitle = productTitle.toLowerCase();

  if (lowerTitle.slice(-4) === 'hemp') {
    return true;
  }

  return false
}

function extractNumberFromString(inputString) {
  const regex = /^(\d+(\.\d+)?)/;

  const match = inputString.match(regex);

  if (match) {
    return parseFloat(match[0]);
  } else {
    return false;
  }
}

async function getPrestonProductsInfo(products) {

  const finalProducts = [];

  for (const product of products) {

    if (!product?.url) {
      continue;
    }

    const info = await getPrestonProductInfo(product);

    if (!info || !info.variants || info.variants.length === 0) {
      console.log('no variants or error, skipping', product.url);
      continue;
    }

    product.vendor = 'Preston';

    product.variants = info.variants.map((variant) => parseFloat(variant.trim()) + ' g');

    product.images = [...info.images];

    const size = parseFloat(product.variants[0].trim());

    if (size) {
      finalProducts.push(product);
    }
  }

  return finalProducts;
}

async function getAvailableLeafProducts() {

  // console.log('Getting Preston products');

  const products = await scrapePage(startUrl, currentPage);

  const finalProducts = await getPrestonProductsInfo(products);

  return finalProducts;

}

if (require.main === module) {
  // console.log('This script is being executed directly by Node.js');
  getAvailableLeafProducts();
}

module.exports = {
  getAvailableLeafProducts
}
