const axios = require('../services/rateLimitedAxios');
const cheerio = require('cheerio');
const strings = require('../services/strings');

async function getAvailableLeafProducts() {
  console.log('Getting Enlighten products');
  const url = 'https://cdn5.editmysite.com/app/store/api/v28/editor/users/132525192/sites/370639016370754120/products?page=1&per_page=60&sort_by=shop_all_order&sort_order=asc&include=images,media_files,discounts&preferred_item_order_ids=19,29,28,30,26,25,24,23,22,21,20,15,13,12,11,10,9,6,5,4,3,2&in_stock=1&excluded_fulfillment=dine_in';
  const response = await axios.get(url);
  const products = [];
  for (const product of response.data.data) {
    let image = "";
    let i = 0;
    while (!(image.includes(".jpg") || image.includes(".jpeg")) && i < response.data.data[i].images.data.length) {
      image = response.data.data[i].images.data[0].urls["640"];
      i = i + 1;
    }
    const title = strings.normalizeProductTitle(product.name.split(' - ')[1])
    console.log('Enlighten: ', title);
    products.push({
      theirId: product.id,
      title: title,
      url: `https://www.enlightenhempco.com/${product.site_link}`,
      image: image,
      variants: [],
      vendor: 'Enlighten'
    });
    //image: product.images.data[1].absolute_url,
  }
  const unchangingVariants = await addVariants(products);
  return unchangingVariants
}

async function addVariants(products) {
  const result = products.map(async (product) => {
    try {
      const url = `https://cdn5.editmysite.com/app/store/api/v28/editor/users/132525192/sites/370639016370754120/store-locations/11eaa54990da063a860a0cc47a2ae3c4/products/${product.theirId}/skus`;
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);

      for (const variant of response.data.data) {
        const name = strings.normalizeVariantTitle(variant.name);
        product.variants.push(name);
      }

      return product;
    } catch (error) {
      throw new Error(error);
    }
  });
  return Promise.all(result);
}

if (require.main === module) {
  console.log('This script is being executed directly by Node.js');
  getAvailableLeafProducts();
}

module.exports = { getAvailableLeafProducts };

