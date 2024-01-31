const axios = require('../services/rateLimitedAxios');
const cheerio = require('cheerio');
const strings = require('../services/strings');
const { recognize } = require('../services/ocr');
const fs = require('fs');
const { transcribeAssay } = require('../services/cortex.js');
const logger = require('../services/logger');

let currentPage = 1;
const startUrl = 'https://eighthorseshemp.com/collections/hemp-flower.atom';
const logger = require('../services/logger.js');

const uniqueVariants = [];

function addUniqueVariant(variant) {
  if (!uniqueVariants.includes(variant)) {
    uniqueVariants.push(variant);
  }
}

async function getProduct(url) {

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

  const image = $('figure.productView-image img').attr('src');

  const imageNodes = $('a.productView-thumbnail-link');

  const imageUrls = imageNodes.map((index, el) => $(el).attr('href')).get();

  const images = imageUrls.filter(image => image.toLowerCase().includes('terpenes') || image.toLowerCase().includes('potency') || image.toLowerCase().includes('indoor'));
  const theRest = imageUrls.filter(image => !image.toLowerCase().includes('terpenes') && !image.toLowerCase().includes('potency') && image.toLowerCase().includes('indoor'));



  let terpenes = [];
  let cannabinoids = [];

  for (const image of images) {


    const raw = await recognize(image);
    const result = await transcribeAssay(raw, image);



    if (result?.terpenes?.length) {

      terpenes = JSON.parse(JSON.stringify(result.terpenes))
    }
    if (result?.cannabinoids?.length) {
      cannabinoids = JSON.parse(JSON.stringify(result.cannabinoids))
    }

    if (terpenes?.length && cannabinoids?.length) {
      logger.log({
  level: 'info',
  message: `both terpenes and cannabinoids found`})
      break;
    }

  }

await saveProducts([{ title, url, image, terpenes, cannabinoids }], batchId, true);

logger.log({
  level: 'info',
  message: `Saved ${title}`});

  return {
    title,
    url,
    image,
    images,
    variants,
    terpenes,
    cannabinoids,
    vendor: 'EHH',
  };
}

/*

  <entry>
    <id>https://eighthorseshemp.com/products/8004179624153</id>
    <published>2023-06-02T13:59:26-04:00</published>
    <updated>2023-06-02T13:59:26-04:00</updated>
    <link rel="alternate" type="text/html" href="https://eighthorseshemp.com/products/purple-kush-21-thca-3-cbga-greenhouse"/>
    <title>Purple Kush - Greenhouse</title>
    <s:type>Hemp Flower</s:type>
    <s:vendor>Eight Horses</s:vendor>
    <summary type="html">
      <![CDATA[<table border="0">
  <tr>
    <td width="200"><img width="200" src="https://cdn.shopify.com/s/files/1/0276/5019/5596/products/image_8e631588-dd45-4e3c-8c48-e96aeeba8cb7.jpg?v=1669054142"></td>
    <td valign="bottom">
      <p>

        <strong>Vendor: </strong>Eight Horses<br>
        <strong>Type: </strong>Hemp Flower<br>
        <strong>Price: </strong>
            10.00 - 60.00
            <a href="https://eighthorseshemp.com/products/purple-kush-21-thca-3-cbga-greenhouse">(8 variants)</a>
      </p>
    </td>
  </tr>
  <tr>
    <td colspan="2"><p class="p1"><span class="s1">This greenhouse flower is exclusive to us, grown by another farm. Post harvest COA reports shown. Perfect for mixing with our regular CBD and the ideal budget option.</span></p>
<p class="p1"><span class="s1"><br><strong>Bud size:</strong><span> </span>Small to medium.</span></p>
<p class="p1"><span class="s1"><strong>Bag Appeal Grade:</strong><span> </span>B</span></p>
<p class="p1"><span class="s1"><strong>Grow Conditions:</strong><span> </span>Greenhouse</span></p>
<p class="p1"><span class="s1"><strong>Trim:</strong><span> </span>Hand Trimmed</span></p>
<p class="p1"><span class="s2">NOT shipping internationally or to SD, ID, MS, AR, MN, OR, RI</span></p>
<p class="p1"><span class="s1">For quality control purposes, as well as minimal stem, flower is broken into smaller pieces. Size varies based on batch.</span></p>
<p class="p1"><span class="s1">Shipped in sealed mylar bag, within a sealed foodsaver bag. Only shipped in boxes. Includes letter to law enforcement and lab reports.</span></p></td>
  </tr>
</table>
]]>
    </summary>
    <s:variant>
      <id>https://eighthorseshemp.com/products/8004179624153</id>
      <title>3.5g</title>
      <s:price currency="USD">18.00</s:price>
      <s:sku></s:sku>
      <s:grams>25</s:grams>
    </s:variant>
    <s:variant>
      <id>https://eighthorseshemp.com/products/8004179624153</id>
      <title>3.5g</title>
      <s:price currency="USD">17.00</s:price>
      <s:sku></s:sku>
      <s:grams>27</s:grams>
    </s:variant>

  </entry>

  */



async function scrapePage(url, currentPage, productLinks) {

  //try {
  const response = await axios.get(url);
  fs.writeFileSync('./temp/vendors/ehh.html', response.data);


  const $ = cheerio.load(response.data, { xmlMode: true })

  const cards = $('entry');

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
  /*
} catch (error) {
  throw new Error(`Error scraping page: ${error.message}`);
}
*/
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

async function getEHHProductsInfo(productLinks) {

  const products = [];
  for (const productLink of productLinks) {
    const product = await getProduct(productLink);
    if (!product) {
      continue;
    }
    product.vendor = 'EIGHT HORSES';

    if (product.variants.length > 0) {

      product.variants = product.variants.map((variant) => strings.normalizeVariantName(variant));

      products.push(product);

    }

  }
  return products;
}

async function getAvailableLeafProducts() {

  const productLinks = await scrapePage(startUrl, currentPage, []);

  const products = await getEHHProductsInfo(productLinks);

  return products;

}

if (require.main === module) {
  logger.log({
  level: 'info',
  message: `This script is being executed directly by Node.js`});
  getAvailableLeafProducts();
}

module.exports = {
  getAvailableLeafProducts,
  getProduct
}

const skippableImages = ["https://cdn11.bigcommerce.com/s-mpabgyqav0/images/stencil/1280x1280/products/268/1807/1683224189.1280.1280__66714.1683226369.jpg?c=1",
  "https://cdn11.bigcommerce.com/s-mpabgyqav0/images/stencil/1280x1280/products/268/1813/1683223605.1280.1280__73189.1683225192.jpg?c=1",
  "https://cdn11.bigcommerce.com/s-mpabgyqav0/images/stencil/1280x1280/products/268/1811/1683223605.1280.1280__28436.1683225192.jpg?c=1",
  "https://cdn11.bigcommerce.com/s-mpabgyqav0/images/stencil/1280x1280/products/268/1814/1683223605.1280.1280__52678.1683225192.jpg?c=1",
  "https://cdn11.bigcommerce.com/s-mpabgyqav0/images/stencil/1280x1280/products/268/1808/1683223605.1280.1280__47191.1683225192.jpg?c=1",
  "https://cdn11.bigcommerce.com/s-mpabgyqav0/images/stencil/1280x1280/products/268/1809/1683223605.1280.1280__02816.1683225192.jpg?c=1",
  "https://cdn11.bigcommerce.com/s-mpabgyqav0/images/stencil/1280x1280/products/268/1815/1683223605.1280.1280__19110.1683225192.jpg?c=1",
  "BagsGroupShot",
  "Diamond-Sticker",
];
