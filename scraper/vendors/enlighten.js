const axios = require('../services/rateLimitedAxios');
const cheerio = require('cheerio');
const strings = require('../services/strings');

async function getAvailableLeafProducts() {
  const url = 'https://cdn5.editmysite.com/app/store/api/v28/editor/users/132525192/sites/370639016370754120/products?page=1&per_page=60&sort_by=shop_all_order&sort_order=asc&include=images,media_files,discounts&preferred_item_order_ids=19,29,28,30,26,25,24,23,22,21,20,15,13,12,11,10,9,6,5,4,3,2&in_stock=1&excluded_fulfillment=dine_in';
  const response = await axios.get(url);
  const products = [];
  for (const product of response.data.data) {
    products.push({
      theirId: product.id,
      title: product.name.split(' - ')[1],
      url: `https://www.enlightenhempco.com/${product.site_link}`,
      image: product.images.data[0].absolute_url,
      variants: [],
      vendor: 'Enlighten'
    });
    //image: product.images.data[1].absolute_url,
  }
  const unchangingVariants = await addVariants(products);
  console.log('unchangingVariant', unchangingVariants)
  return unchangingVariants
}

async function addVariants(products) {
  const result = products.map(async (product) => {
    try {
      const url = `https://cdn5.editmysite.com/app/store/api/v28/editor/users/132525192/sites/370639016370754120/store-locations/11eaa54990da063a860a0cc47a2ae3c4/products/${product.theirId}/skus`;
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);
      //console.log('product', product);

      //console.log('response', response.data.data);

      for (const variant of response.data.data) {
        product.variants.push(variant.name);
      }

      return product;
    } catch (error) {
      throw new Error(error);
    }
  });
  return Promise.all(result);
}

module.exports = { getAvailableLeafProducts };

