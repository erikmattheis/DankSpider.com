const axios = require('../services/rateLimitedAxios.js');
const cheerio = require('cheerio');
const { normalizeVariantName, normalizeProductTitle } = require('../services/strings.js')
const { recognize } = require('../services/ocr.js');
const fs = require('fs');
const { transcribeAssay } = require('../services/cortex.js');
const { terpeneNameList, cannabinoidNameList } = require('../services/cortex.js');
const logger = require('../services/logger.js');
const { saveAssays } = require('../services/firebase.js');
const { readPDFs } = require('../services/pdf.js');


const coaURL = 'https://harborcityhemp.com/about/product-coa/'
async function getListOfTHCAPDFs() {

  let html = await axios.get(coaURL);
  html = html.data;

  const $ = cheerio.load(html);

  html = $('body#text-796809227 > h3 > span').html();

  const products = [];

  $("#row-1678248903 a button span").each((index, element) => {
    const url = $(element).attr('href');
    const name = $(element).text().trim();

    if (url.endsWith('.pdf')) {
      products.push({ name, url });
    }
  });

  return products;
}

async function recordAssays() {

  try {

    const pdfs = await getListOfTHCAPDFs();
    console.log('pdfs', pdfs)
    const result = await readPDFs(pdfs);

    const assays = result.map(r => {
      return {
        ...r,
        vendor: 'HCH'
      }
    })

    await saveAssays('HCH', assays);

  }
  catch (error) {

    logger.error(error)

    return [];
  }
}


let currentPage = 1;
const startUrl = 'https://harborcityhemp.com/product-category/cannabinoids/thca-products/feed/';

const uniqueVariants = [];
let batchId;

const numProductsToSave = 2;
let numSavedProducts = 0;

async function getProduct(url) {

  if (numSavedProducts >= numProductsToSave) {
    return;
  }
  console.log('getting product', url)
  const response = await axios.get(url);

  fs.writeFileSync(`./temp/vendors/hch-product.html`, response.data);
  const $ = cheerio.load(response.data);

  const title = normalizeProductTitle($('.product-title').text());

  let image = $('.starting-slide .product-image-main img').attr('data-photoswipe-src');

  image = image?.startsWith('https:') ? image : `https:${image}`;

  let imageUrls = $('.wp-post-image').map((i, el) => $(el).attr('src')).get();

  imageUrls = imageUrls.map((url) => url.startsWith('https:') ? url : `https:${url}`);

  if (!imageUrls || !imageUrls.length) {
    fs.writeFileSync(`./temp/vendors/hch-product-no-image.html`, response.data);
  }

  let terpenes = [];
  let cannabinoids = [];

  /*

  <form class="variations_form cart" action="https://harborcityhemp.com/product/specimen-x-thca-flower-indoor/" method="post" enctype="multipart/form-data" data-product_id="183270" data-product_variations="[{&quot;attributes&quot;:{&quot;attribute_pa_quantity&quot;:&quot;3-5g&quot;},&quot;availability_html&quot;:&quot;&lt;p class=\&quot;stock in-stock\&quot;&gt;In stock&lt;\/p&gt;\n&quot;,&quot;backorders_allowed&quot;:false,&quot;dimensions&quot;:{&quot;length&quot;:&quot;&quot;,&quot;width&quot;:&quot;&quot;,&quot;height&quot;:&quot;&quot;},&quot;dimensions_html&quot;:&quot;N\/A&quot;,&quot;display_price&quot;:34.99,&quot;display_regular_price&quot;:34.99,&quot;image&quot;:{&quot;title&quot;:&quot;Specimen X HF Product Photo&quot;,&quot;caption&quot;:&quot;Specimen X HF Product Photo&quot;,&quot;url&quot;:&quot;https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo.png&quot;,&quot;alt&quot;:&quot;Specimen X HF Product Photo&quot;,&quot;src&quot;:&quot;https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-600x600.png&quot;,&quot;srcset&quot;:&quot;https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-600x600.png 600w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-500x500.png 500w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-1024x1024.png 1024w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-400x400.png 400w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-768x768.png 768w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-1536x1536.png 1536w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-2048x2048.png 2048w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-60x60.png 60w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-110x110.png 110w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-300x300.png 300w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-100x100.png 100w&quot;,&quot;sizes&quot;:&quot;(max-width: 600px) 100vw, 600px&quot;,&quot;full_src&quot;:&quot;https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo.png&quot;,&quot;full_src_w&quot;:2560,&quot;full_src_h&quot;:2560,&quot;gallery_thumbnail_src&quot;:&quot;https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-100x100.png&quot;,&quot;gallery_thumbnail_src_w&quot;:100,&quot;gallery_thumbnail_src_h&quot;:100,&quot;thumb_src&quot;:&quot;https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-300x300.png&quot;,&quot;thumb_src_w&quot;:300,&quot;thumb_src_h&quot;:300,&quot;src_w&quot;:600,&quot;src_h&quot;:600},&quot;image_id&quot;:183299,&quot;is_downloadable&quot;:false,&quot;is_in_stock&quot;:true,&quot;is_purchasable&quot;:true,&quot;is_sold_individually&quot;:&quot;no&quot;,&quot;is_virtual&quot;:false,&quot;max_qty&quot;:82,&quot;min_qty&quot;:1,&quot;price_html&quot;:&quot;&lt;span class=\&quot;price\&quot;&gt;&lt;span class=\&quot;woocommerce-Price-amount amount\&quot;&gt;&lt;bdi&gt;&lt;span class=\&quot;woocommerce-Price-currencySymbol\&quot;&gt;&amp;#36;&lt;\/span&gt;34.99&lt;\/bdi&gt;&lt;\/span&gt;&lt;\/span&gt;&quot;,&quot;sku&quot;:&quot;HF-Specimen-X&quot;,&quot;variation_description&quot;:&quot;&quot;,&quot;variation_id&quot;:183271,&quot;variation_is_active&quot;:true,&quot;variation_is_visible&quot;:true,&quot;weight&quot;:&quot;&quot;,&quot;weight_html&quot;:&quot;N\/A&quot;,&quot;woobt_image&quot;:&quot;&lt;img width=\&quot;300\&quot; height=\&quot;300\&quot; src=\&quot;https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-300x300.png\&quot; class=\&quot;attachment-woocommerce_thumbnail size-woocommerce_thumbnail\&quot; alt=\&quot;Specimen X HF Product Photo\&quot; decoding=\&quot;async\&quot; srcset=\&quot;https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-300x300.png 300w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-500x500.png 500w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-1024x1024.png 1024w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-400x400.png 400w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-768x768.png 768w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-1536x1536.png 1536w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-2048x2048.png 2048w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-60x60.png 60w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-110x110.png 110w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-600x600.png 600w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-100x100.png 100w\&quot; sizes=\&quot;(max-width: 300px) 100vw, 300px\&quot; \/&gt;&quot;,&quot;woosg_image&quot;:&quot;&lt;img width=\&quot;300\&quot; height=\&quot;300\&quot; src=\&quot;https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-300x300.png\&quot; class=\&quot;attachment-woocommerce_thumbnail size-woocommerce_thumbnail\&quot; alt=\&quot;Specimen X HF Product Photo\&quot; decoding=\&quot;async\&quot; srcset=\&quot;https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-300x300.png 300w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-500x500.png 500w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-1024x1024.png 1024w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-400x400.png 400w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-768x768.png 768w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-1536x1536.png 1536w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-2048x2048.png 2048w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-60x60.png 60w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-110x110.png 110w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-600x600.png 600w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-100x100.png 100w\&quot; sizes=\&quot;(max-width: 300px) 100vw, 300px\&quot; \/&gt;&quot;,&quot;woosb_image&quot;:&quot;&lt;img width=\&quot;300\&quot; height=\&quot;300\&quot; src=\&quot;https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-300x300.png\&quot; class=\&quot;attachment-woocommerce_thumbnail size-woocommerce_thumbnail\&quot; alt=\&quot;Specimen X HF Product Photo\&quot; decoding=\&quot;async\&quot; srcset=\&quot;https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-300x300.png 300w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-500x500.png 500w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-1024x1024.png 1024w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-400x400.png 400w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-768x768.png 768w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-1536x1536.png 1536w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-2048x2048.png 2048w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-60x60.png 60w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-110x110.png 110w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-600x600.png 600w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-100x100.png 100w\&quot; sizes=\&quot;(max-width: 300px) 100vw, 300px\&quot; \/&gt;&quot;,&quot;stock_status&quot;:&quot;instock&quot;,&quot;stock_quantity&quot;:82},{&quot;attributes&quot;:{&quot;attribute_pa_quantity&quot;:&quot;7g&quot;},&quot;availability_html&quot;:&quot;&lt;p class=\&quot;stock in-stock\&quot;&gt;In stock&lt;\/p&gt;\n&quot;,&quot;backorders_allowed&quot;:false,&quot;dimensions&quot;:{&quot;length&quot;:&quot;&quot;,&quot;width&quot;:&quot;&quot;,&quot;height&quot;:&quot;&quot;},&quot;dimensions_html&quot;:&quot;N\/A&quot;,&quot;display_price&quot;:64.99,&quot;display_regular_price&quot;:64.99,&quot;image&quot;:{&quot;title&quot;:&quot;Specimen X HF Product Photo&quot;,&quot;caption&quot;:&quot;Specimen X HF Product Photo&quot;,&quot;url&quot;:&quot;https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo.png&quot;,&quot;alt&quot;:&quot;Specimen X HF Product Photo&quot;,&quot;src&quot;:&quot;https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-600x600.png&quot;,&quot;srcset&quot;:&quot;https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-600x600.png 600w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-500x500.png 500w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-1024x1024.png 1024w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-400x400.png 400w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-768x768.png 768w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-1536x1536.png 1536w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-2048x2048.png 2048w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-60x60.png 60w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-110x110.png 110w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-300x300.png 300w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-100x100.png 100w&quot;,&quot;sizes&quot;:&quot;(max-width: 600px) 100vw, 600px&quot;,&quot;full_src&quot;:&quot;https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo.png&quot;,&quot;full_src_w&quot;:2560,&quot;full_src_h&quot;:2560,&quot;gallery_thumbnail_src&quot;:&quot;https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-100x100.png&quot;,&quot;gallery_thumbnail_src_w&quot;:100,&quot;gallery_thumbnail_src_h&quot;:100,&quot;thumb_src&quot;:&quot;https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-300x300.png&quot;,&quot;thumb_src_w&quot;:300,&quot;thumb_src_h&quot;:300,&quot;src_w&quot;:600,&quot;src_h&quot;:600},&quot;image_id&quot;:183299,&quot;is_downloadable&quot;:false,&quot;is_in_stock&quot;:true,&quot;is_purchasable&quot;:true,&quot;is_sold_individually&quot;:&quot;no&quot;,&quot;is_virtual&quot;:false,&quot;max_qty&quot;:4,&quot;min_qty&quot;:1,&quot;price_html&quot;:&quot;&lt;span class=\&quot;price\&quot;&gt;&lt;span class=\&quot;woocommerce-Price-amount amount\&quot;&gt;&lt;bdi&gt;&lt;span class=\&quot;woocommerce-Price-currencySymbol\&quot;&gt;&amp;#36;&lt;\/span&gt;64.99&lt;\/bdi&gt;&lt;\/span&gt;&lt;\/span&gt;&quot;,&quot;sku&quot;:&quot;HF-Specimen-X&quot;,&quot;variation_description&quot;:&quot;&quot;,&quot;variation_id&quot;:183272,&quot;variation_is_active&quot;:true,&quot;variation_is_visible&quot;:true,&quot;weight&quot;:&quot;&quot;,&quot;weight_html&quot;:&quot;N\/A&quot;,&quot;woobt_image&quot;:&quot;&lt;img width=\&quot;300\&quot; height=\&quot;300\&quot; src=\&quot;https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-300x300.png\&quot; class=\&quot;attachment-woocommerce_thumbnail size-woocommerce_thumbnail\&quot; alt=\&quot;Specimen X HF Product Photo\&quot; decoding=\&quot;async\&quot; srcset=\&quot;https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-300x300.png 300w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-500x500.png 500w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-1024x1024.png 1024w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-400x400.png 400w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-768x768.png 768w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-1536x1536.png 1536w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-2048x2048.png 2048w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-60x60.png 60w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-110x110.png 110w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-600x600.png 600w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-100x100.png 100w\&quot; sizes=\&quot;(max-width: 300px) 100vw, 300px\&quot; \/&gt;&quot;,&quot;woosg_image&quot;:&quot;&lt;img width=\&quot;300\&quot; height=\&quot;300\&quot; src=\&quot;https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-300x300.png\&quot; class=\&quot;attachment-woocommerce_thumbnail size-woocommerce_thumbnail\&quot; alt=\&quot;Specimen X HF Product Photo\&quot; decoding=\&quot;async\&quot; srcset=\&quot;https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-300x300.png 300w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-500x500.png 500w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-1024x1024.png 1024w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-400x400.png 400w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-768x768.png 768w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-1536x1536.png 1536w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-2048x2048.png 2048w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-60x60.png 60w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-110x110.png 110w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-600x600.png 600w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-100x100.png 100w\&quot; sizes=\&quot;(max-width: 300px) 100vw, 300px\&quot; \/&gt;&quot;,&quot;woosb_image&quot;:&quot;&lt;img width=\&quot;300\&quot; height=\&quot;300\&quot; src=\&quot;https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-300x300.png\&quot; class=\&quot;attachment-woocommerce_thumbnail size-woocommerce_thumbnail\&quot; alt=\&quot;Specimen X HF Product Photo\&quot; decoding=\&quot;async\&quot; srcset=\&quot;https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-300x300.png 300w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-500x500.png 500w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-1024x1024.png 1024w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-400x400.png 400w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-768x768.png 768w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-1536x1536.png 1536w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-2048x2048.png 2048w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-60x60.png 60w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-110x110.png 110w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-600x600.png 600w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-100x100.png 100w\&quot; sizes=\&quot;(max-width: 300px) 100vw, 300px\&quot; \/&gt;&quot;,&quot;stock_status&quot;:&quot;instock&quot;,&quot;stock_quantity&quot;:4},{&quot;attributes&quot;:{&quot;attribute_pa_quantity&quot;:&quot;14g&quot;},&quot;availability_html&quot;:&quot;&lt;p class=\&quot;stock in-stock\&quot;&gt;In stock&lt;\/p&gt;\n&quot;,&quot;backorders_allowed&quot;:false,&quot;dimensions&quot;:{&quot;length&quot;:&quot;&quot;,&quot;width&quot;:&quot;&quot;,&quot;height&quot;:&quot;&quot;},&quot;dimensions_html&quot;:&quot;N\/A&quot;,&quot;display_price&quot;:124.99,&quot;display_regular_price&quot;:124.99,&quot;image&quot;:{&quot;title&quot;:&quot;Specimen X HF Product Photo&quot;,&quot;caption&quot;:&quot;Specimen X HF Product Photo&quot;,&quot;url&quot;:&quot;https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo.png&quot;,&quot;alt&quot;:&quot;Specimen X HF Product Photo&quot;,&quot;src&quot;:&quot;https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-600x600.png&quot;,&quot;srcset&quot;:&quot;https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-600x600.png 600w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-500x500.png 500w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-1024x1024.png 1024w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-400x400.png 400w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-768x768.png 768w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-1536x1536.png 1536w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-2048x2048.png 2048w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-60x60.png 60w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-110x110.png 110w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-300x300.png 300w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-100x100.png 100w&quot;,&quot;sizes&quot;:&quot;(max-width: 600px) 100vw, 600px&quot;,&quot;full_src&quot;:&quot;https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo.png&quot;,&quot;full_src_w&quot;:2560,&quot;full_src_h&quot;:2560,&quot;gallery_thumbnail_src&quot;:&quot;https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-100x100.png&quot;,&quot;gallery_thumbnail_src_w&quot;:100,&quot;gallery_thumbnail_src_h&quot;:100,&quot;thumb_src&quot;:&quot;https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-300x300.png&quot;,&quot;thumb_src_w&quot;:300,&quot;thumb_src_h&quot;:300,&quot;src_w&quot;:600,&quot;src_h&quot;:600},&quot;image_id&quot;:183299,&quot;is_downloadable&quot;:false,&quot;is_in_stock&quot;:true,&quot;is_purchasable&quot;:true,&quot;is_sold_individually&quot;:&quot;no&quot;,&quot;is_virtual&quot;:false,&quot;max_qty&quot;:10,&quot;min_qty&quot;:1,&quot;price_html&quot;:&quot;&lt;span class=\&quot;price\&quot;&gt;&lt;span class=\&quot;woocommerce-Price-amount amount\&quot;&gt;&lt;bdi&gt;&lt;span class=\&quot;woocommerce-Price-currencySymbol\&quot;&gt;&amp;#36;&lt;\/span&gt;124.99&lt;\/bdi&gt;&lt;\/span&gt;&lt;\/span&gt;&quot;,&quot;sku&quot;:&quot;HF-Specimen-X&quot;,&quot;variation_description&quot;:&quot;&quot;,&quot;variation_id&quot;:183273,&quot;variation_is_active&quot;:true,&quot;variation_is_visible&quot;:true,&quot;weight&quot;:&quot;&quot;,&quot;weight_html&quot;:&quot;N\/A&quot;,&quot;woobt_image&quot;:&quot;&lt;img width=\&quot;300\&quot; height=\&quot;300\&quot; src=\&quot;https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-300x300.png\&quot; class=\&quot;attachment-woocommerce_thumbnail size-woocommerce_thumbnail\&quot; alt=\&quot;Specimen X HF Product Photo\&quot; decoding=\&quot;async\&quot; srcset=\&quot;https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-300x300.png 300w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-500x500.png 500w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-1024x1024.png 1024w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-400x400.png 400w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-768x768.png 768w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-1536x1536.png 1536w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-2048x2048.png 2048w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-60x60.png 60w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-110x110.png 110w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-600x600.png 600w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-100x100.png 100w\&quot; sizes=\&quot;(max-width: 300px) 100vw, 300px\&quot; \/&gt;&quot;,&quot;woosg_image&quot;:&quot;&lt;img width=\&quot;300\&quot; height=\&quot;300\&quot; src=\&quot;https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-300x300.png\&quot; class=\&quot;attachment-woocommerce_thumbnail size-woocommerce_thumbnail\&quot; alt=\&quot;Specimen X HF Product Photo\&quot; decoding=\&quot;async\&quot; srcset=\&quot;https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-300x300.png 300w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-500x500.png 500w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-1024x1024.png 1024w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-400x400.png 400w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-768x768.png 768w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-1536x1536.png 1536w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-2048x2048.png 2048w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-60x60.png 60w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-110x110.png 110w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-600x600.png 600w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-100x100.png 100w\&quot; sizes=\&quot;(max-width: 300px) 100vw, 300px\&quot; \/&gt;&quot;,&quot;woosb_image&quot;:&quot;&lt;img width=\&quot;300\&quot; height=\&quot;300\&quot; src=\&quot;https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-300x300.png\&quot; class=\&quot;attachment-woocommerce_thumbnail size-woocommerce_thumbnail\&quot; alt=\&quot;Specimen X HF Product Photo\&quot; decoding=\&quot;async\&quot; srcset=\&quot;https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-300x300.png 300w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-500x500.png 500w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-1024x1024.png 1024w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-400x400.png 400w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-768x768.png 768w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-1536x1536.png 1536w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-2048x2048.png 2048w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-60x60.png 60w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-110x110.png 110w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-600x600.png 600w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-100x100.png 100w\&quot; sizes=\&quot;(max-width: 300px) 100vw, 300px\&quot; \/&gt;&quot;,&quot;stock_status&quot;:&quot;instock&quot;,&quot;stock_quantity&quot;:10},{&quot;attributes&quot;:{&quot;attribute_pa_quantity&quot;:&quot;28g&quot;},&quot;availability_html&quot;:&quot;&lt;p class=\&quot;stock in-stock\&quot;&gt;In stock&lt;\/p&gt;\n&quot;,&quot;backorders_allowed&quot;:false,&quot;dimensions&quot;:{&quot;length&quot;:&quot;&quot;,&quot;width&quot;:&quot;&quot;,&quot;height&quot;:&quot;&quot;},&quot;dimensions_html&quot;:&quot;N\/A&quot;,&quot;display_price&quot;:199.99,&quot;display_regular_price&quot;:199.99,&quot;image&quot;:{&quot;title&quot;:&quot;Specimen X HF Product Photo&quot;,&quot;caption&quot;:&quot;Specimen X HF Product Photo&quot;,&quot;url&quot;:&quot;https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo.png&quot;,&quot;alt&quot;:&quot;Specimen X HF Product Photo&quot;,&quot;src&quot;:&quot;https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-600x600.png&quot;,&quot;srcset&quot;:&quot;https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-600x600.png 600w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-500x500.png 500w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-1024x1024.png 1024w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-400x400.png 400w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-768x768.png 768w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-1536x1536.png 1536w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-2048x2048.png 2048w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-60x60.png 60w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-110x110.png 110w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-300x300.png 300w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-100x100.png 100w&quot;,&quot;sizes&quot;:&quot;(max-width: 600px) 100vw, 600px&quot;,&quot;full_src&quot;:&quot;https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo.png&quot;,&quot;full_src_w&quot;:2560,&quot;full_src_h&quot;:2560,&quot;gallery_thumbnail_src&quot;:&quot;https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-100x100.png&quot;,&quot;gallery_thumbnail_src_w&quot;:100,&quot;gallery_thumbnail_src_h&quot;:100,&quot;thumb_src&quot;:&quot;https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-300x300.png&quot;,&quot;thumb_src_w&quot;:300,&quot;thumb_src_h&quot;:300,&quot;src_w&quot;:600,&quot;src_h&quot;:600},&quot;image_id&quot;:183299,&quot;is_downloadable&quot;:false,&quot;is_in_stock&quot;:true,&quot;is_purchasable&quot;:true,&quot;is_sold_individually&quot;:&quot;no&quot;,&quot;is_virtual&quot;:false,&quot;max_qty&quot;:5,&quot;min_qty&quot;:1,&quot;price_html&quot;:&quot;&lt;span class=\&quot;price\&quot;&gt;&lt;span class=\&quot;woocommerce-Price-amount amount\&quot;&gt;&lt;bdi&gt;&lt;span class=\&quot;woocommerce-Price-currencySymbol\&quot;&gt;&amp;#36;&lt;\/span&gt;199.99&lt;\/bdi&gt;&lt;\/span&gt;&lt;\/span&gt;&quot;,&quot;sku&quot;:&quot;HF-Specimen-X&quot;,&quot;variation_description&quot;:&quot;&quot;,&quot;variation_id&quot;:183274,&quot;variation_is_active&quot;:true,&quot;variation_is_visible&quot;:true,&quot;weight&quot;:&quot;&quot;,&quot;weight_html&quot;:&quot;N\/A&quot;,&quot;woobt_image&quot;:&quot;&lt;img width=\&quot;300\&quot; height=\&quot;300\&quot; src=\&quot;https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-300x300.png\&quot; class=\&quot;attachment-woocommerce_thumbnail size-woocommerce_thumbnail\&quot; alt=\&quot;Specimen X HF Product Photo\&quot; decoding=\&quot;async\&quot; srcset=\&quot;https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-300x300.png 300w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-500x500.png 500w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-1024x1024.png 1024w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-400x400.png 400w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-768x768.png 768w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-1536x1536.png 1536w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-2048x2048.png 2048w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-60x60.png 60w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-110x110.png 110w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-600x600.png 600w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-100x100.png 100w\&quot; sizes=\&quot;(max-width: 300px) 100vw, 300px\&quot; \/&gt;&quot;,&quot;woosg_image&quot;:&quot;&lt;img width=\&quot;300\&quot; height=\&quot;300\&quot; src=\&quot;https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-300x300.png\&quot; class=\&quot;attachment-woocommerce_thumbnail size-woocommerce_thumbnail\&quot; alt=\&quot;Specimen X HF Product Photo\&quot; decoding=\&quot;async\&quot; srcset=\&quot;https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-300x300.png 300w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-500x500.png 500w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-1024x1024.png 1024w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-400x400.png 400w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-768x768.png 768w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-1536x1536.png 1536w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-2048x2048.png 2048w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-60x60.png 60w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-110x110.png 110w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-600x600.png 600w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-100x100.png 100w\&quot; sizes=\&quot;(max-width: 300px) 100vw, 300px\&quot; \/&gt;&quot;,&quot;woosb_image&quot;:&quot;&lt;img width=\&quot;300\&quot; height=\&quot;300\&quot; src=\&quot;https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-300x300.png\&quot; class=\&quot;attachment-woocommerce_thumbnail size-woocommerce_thumbnail\&quot; alt=\&quot;Specimen X HF Product Photo\&quot; decoding=\&quot;async\&quot; srcset=\&quot;https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-300x300.png 300w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-500x500.png 500w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-1024x1024.png 1024w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-400x400.png 400w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-768x768.png 768w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-1536x1536.png 1536w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-2048x2048.png 2048w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-60x60.png 60w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-110x110.png 110w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-600x600.png 600w, https:\/\/harborcityhemp.com\/wp-content\/uploads\/2024\/02\/Specimen-X-HF-Product-Photo-100x100.png 100w\&quot; sizes=\&quot;(max-width: 300px) 100vw, 300px\&quot; \/&gt;&quot;,&quot;stock_status&quot;:&quot;instock&quot;,&quot;stock_quantity&quot;:5}]">
<div class="woovr-variations woovr-variations-ddslick" data-click="0" data-description="yes"><div class="woovr-variation woovr-variation-dropdown"><div class="woovr-variation-selector"><select class="woovr-variation-select" id="woovr_183270_65d44d267dcec"><option value="0" data-id="0" data-pid="183270" data-sku data-purchasable="no" data-attrs data-price="0" data-regular-price="0" data-pricehtml data-imagesrc="https://harborcityhemp.com/wp-content/uploads/2024/02/Specimen-X-HF-Product-Photo-400x400.png" data-description data-availability>Choose an option</option><option value="183271" data-id="183271" data-pid="183270" data-sku="HF-Specimen-X" data-purchasable="yes" data-attrs="{&quot;attribute_pa_quantity&quot;:&quot;3-5g&quot;}" data-price="34.99" data-regular-price="34.99" data-pricehtml="&lt;span class=&quot;woocommerce-Price-amount amount&quot;&gt;&lt;bdi&gt;&lt;span class=&quot;woocommerce-Price-currencySymbol&quot;&gt;&#036;&lt;/span&gt;34.99&lt;/bdi&gt;&lt;/span&gt;" data-imagesrc="https://harborcityhemp.com/wp-content/uploads/2024/02/Specimen-X-HF-Product-Photo-400x400.png" data-description="&lt;span class=&quot;woovr-variation-price&quot;&gt;&lt;span class=&quot;woocommerce-Price-amount amount&quot;&gt;&lt;bdi&gt;&lt;span class=&quot;woocommerce-Price-currencySymbol&quot;&gt;&#036;&lt;/span&gt;34.99&lt;/bdi&gt;&lt;/span&gt;&lt;/span&gt;&lt;span class=&quot;woovr-variation-availability&quot;&gt;&lt;p class=&quot;stock in-stock&quot;&gt;In stock&lt;/p&gt;
&lt;/span&gt;&lt;span class=&quot;woovr-variation-description&quot;&gt;&lt;/span&gt;" data-availability="&lt;p class=&quot;stock in-stock&quot;&gt;In stock&lt;/p&gt;
" data-woobt_image="&lt;img width=&quot;300&quot; height=&quot;300&quot; src=&quot;https://harborcityhemp.com/wp-content/uploads/2024/02/Specimen-X-HF-Product-Photo-300x300.png&quot; class=&quot;attachment-woocommerce_thumbnail size-woocommerce_thumbnail&quot; alt=&quot;Specimen X HF Product Photo&quot; decoding=&quot;async&quot; srcset=&quot;https://harborcityhemp.com/wp-content/uploads/2024/02/Specimen-X-HF-Product-Photo-300x300.png 300w, https://harborcityhemp.com/wp-content/uploads/2024/02/Specimen-X-HF-Product-Photo-500x500.png 500w, https://harborcityhemp.com/wp-content/uploads/2024/02/Specimen-X-HF-Product-Photo-1024x1024.png 1024w, https://harborcityhemp.com/wp-content/uploads/2024/02/Specimen-X-HF-Product-Photo-400x400.png 400w, https://harborcityhemp.com/wp-content/uploads/2024/02/Specimen-X-HF-Product-Photo-768x768.png 768w, https://harborcityhemp.com/wp-content/uploads/2024/02/Specimen-X-HF-Product-Photo-1536x1536.png 1536w, https://harborcityhemp.com/wp-content/uploads/2024/02/Specimen-X-HF-Product-Photo-2048x2048.png 2048w, https://harborcityhemp.com/wp-content/uploads/2024/02/Specimen-X-HF-Product-Photo-60x60.png 60w, https://harborcityhemp.com/wp-content/uploads/2024/02/Specimen-X-HF-Product-Photo-110x110.png 110w, https://harborcityhemp.com/wp-content/uploads/2024/02/Specimen-X-HF-Product-Photo-600x600.png 600w, https://harborcityhemp.com/wp-content/uploads/2024/02/Specimen-X-HF-Product-Photo-100x100.png 100w&quot; sizes=&quot;(max-width: 300px) 100vw, 300px&quot; /&gt;">Specimen X THCa Flower (Indoor) – 3.5g</option><option value="183272" data-id="183272" data-pid="183270" data-sku="HF-Specimen-X" data-purchasable="yes" data-attrs="{&quot;attribute_pa_quantity&quot;:&quot;7g&quot;}" data-price="64.99" data-regular-price="64.99" data-pricehtml="&lt;span class=&quot;woocommerce-Price-amount amount&quot;&gt;&lt;bdi&gt;&lt;span class=&quot;woocommerce-Price-currencySymbol&quot;&gt;&#036;&lt;/span&gt;64.99&lt;/bdi&gt;&lt;/span&gt;" data-imagesrc="https://harborcityhemp.com/wp-content/uploads/2024/02/Specimen-X-HF-Product-Photo-400x400.png" data-description="&lt;span class=&quot;woovr-variation-price&quot;&gt;&lt;span class=&quot;woocommerce-Price-amount amount&quot;&gt;&lt;bdi&gt;&lt;span class=&quot;woocommerce-Price-currencySymbol&quot;&gt;&#036;&lt;/span&gt;64.99&lt;/bdi&gt;&lt;/span&gt;&lt;/span&gt;&lt;span class=&quot;woovr-variation-availability&quot;&gt;&lt;p class=&quot;stock in-stock&quot;&gt;In stock&lt;/p&gt;
&lt;/span&gt;&lt;span class=&quot;woovr-variation-description&quot;&gt;&lt;/span&gt;" data-availability="&lt;p class=&quot;stock in-stock&quot;&gt;In stock&lt;/p&gt;
" data-woobt_image="&lt;img width=&quot;300&quot; height=&quot;300&quot; src=&quot;https://harborcityhemp.com/wp-content/uploads/2024/02/Specimen-X-HF-Product-Photo-300x300.png&quot; class=&quot;attachment-woocommerce_thumbnail size-woocommerce_thumbnail&quot; alt=&quot;Specimen X HF Product Photo&quot; decoding=&quot;async&quot; srcset=&quot;https://harborcityhemp.com/wp-content/uploads/2024/02/Specimen-X-HF-Product-Photo-300x300.png 300w, https://harborcityhemp.com/wp-content/uploads/2024/02/Specimen-X-HF-Product-Photo-500x500.png 500w, https://harborcityhemp.com/wp-content/uploads/2024/02/Specimen-X-HF-Product-Photo-1024x1024.png 1024w, https://harborcityhemp.com/wp-content/uploads/2024/02/Specimen-X-HF-Product-Photo-400x400.png 400w, https://harborcityhemp.com/wp-content/uploads/2024/02/Specimen-X-HF-Product-Photo-768x768.png 768w, https://harborcityhemp.com/wp-content/uploads/2024/02/Specimen-X-HF-Product-Photo-1536x1536.png 1536w, https://harborcityhemp.com/wp-content/uploads/2024/02/Specimen-X-HF-Product-Photo-2048x2048.png 2048w, https://harborcityhemp.com/wp-content/uploads/2024/02/Specimen-X-HF-Product-Photo-60x60.png 60w, https://harborcityhemp.com/wp-content/uploads/2024/02/Specimen-X-HF-Product-Photo-110x110.png 110w, https://harborcityhemp.com/wp-content/uploads/2024/02/Specimen-X-HF-Product-Photo-600x600.png 600w, https://harborcityhemp.com/wp-content/uploads/2024/02/Specimen-X-HF-Product-Photo-100x100.png 100w&quot; sizes=&quot;(max-width: 300px) 100vw, 300px&quot; /&gt;">Specimen X THCa Flower (Indoor) – 7g</option><option value="183273" data-id="183273" data-pid="183270" data-sku="HF-Specimen-X" data-purchasable="yes" data-attrs="{&quot;attribute_pa_quantity&quot;:&quot;14g&quot;}" data-price="124.99" data-regular-price="124.99" data-pricehtml="&lt;span class=&quot;woocommerce-Price-amount amount&quot;&gt;&lt;bdi&gt;&lt;span class=&quot;woocommerce-Price-currencySymbol&quot;&gt;&#036;&lt;/span&gt;124.99&lt;/bdi&gt;&lt;/span&gt;" data-imagesrc="https://harborcityhemp.com/wp-content/uploads/2024/02/Specimen-X-HF-Product-Photo-400x400.png" data-description="&lt;span class=&quot;woovr-variation-price&quot;&gt;&lt;span class=&quot;woocommerce-Price-amount amount&quot;&gt;&lt;bdi&gt;&lt;span class=&quot;woocommerce-Price-currencySymbol&quot;&gt;&#036;&lt;/span&gt;124.99&lt;/bdi&gt;&lt;/span&gt;&lt;/span&gt;&lt;span class=&quot;woovr-variation-availability&quot;&gt;&lt;p class=&quot;stock in-stock&quot;&gt;In stock&lt;/p&gt;
&lt;/span&gt;&lt;span class=&quot;woovr-variation-description&quot;&gt;&lt;/span&gt;" data-availability="&lt;p class=&quot;stock in-stock&quot;&gt;In stock&lt;/p&gt;
" data-woobt_image="&lt;img width=&quot;300&quot; height=&quot;300&quot; src=&quot;https://harborcityhemp.com/wp-content/uploads/2024/02/Specimen-X-HF-Product-Photo-300x300.png&quot; class=&quot;attachment-woocommerce_thumbnail size-woocommerce_thumbnail&quot; alt=&quot;Specimen X HF Product Photo&quot; decoding=&quot;async&quot; srcset=&quot;https://harborcityhemp.com/wp-content/uploads/2024/02/Specimen-X-HF-Product-Photo-300x300.png 300w, https://harborcityhemp.com/wp-content/uploads/2024/02/Specimen-X-HF-Product-Photo-500x500.png 500w, https://harborcityhemp.com/wp-content/uploads/2024/02/Specimen-X-HF-Product-Photo-1024x1024.png 1024w, https://harborcityhemp.com/wp-content/uploads/2024/02/Specimen-X-HF-Product-Photo-400x400.png 400w, https://harborcityhemp.com/wp-content/uploads/2024/02/Specimen-X-HF-Product-Photo-768x768.png 768w, https://harborcityhemp.com/wp-content/uploads/2024/02/Specimen-X-HF-Product-Photo-1536x1536.png 1536w, https://harborcityhemp.com/wp-content/uploads/2024/02/Specimen-X-HF-Product-Photo-2048x2048.png 2048w, https://harborcityhemp.com/wp-content/uploads/2024/02/Specimen-X-HF-Product-Photo-60x60.png 60w, https://harborcityhemp.com/wp-content/uploads/2024/02/Specimen-X-HF-Product-Photo-110x110.png 110w, https://harborcityhemp.com/wp-content/uploads/2024/02/Specimen-X-HF-Product-Photo-600x600.png 600w, https://harborcityhemp.com/wp-content/uploads/2024/02/Specimen-X-HF-Product-Photo-100x100.png 100w&quot; sizes=&quot;(max-width: 300px) 100vw, 300px&quot; /&gt;">Specimen X THCa Flower (Indoor) – 14g</option><option value="183274" data-id="183274" data-pid="183270" data-sku="HF-Specimen-X" data-purchasable="yes" data-attrs="{&quot;attribute_pa_quantity&quot;:&quot;28g&quot;}" data-price="199.99" data-regular-price="199.99" data-pricehtml="&lt;span class=&quot;woocommerce-Price-amount amount&quot;&gt;&lt;bdi&gt;&lt;span class=&quot;woocommerce-Price-currencySymbol&quot;&gt;&#036;&lt;/span&gt;199.99&lt;/bdi&gt;&lt;/span&gt;" data-imagesrc="https://harborcityhemp.com/wp-content/uploads/2024/02/Specimen-X-HF-Product-Photo-400x400.png" data-description="&lt;span class=&quot;woovr-variation-price&quot;&gt;&lt;span class=&quot;woocommerce-Price-amount amount&quot;&gt;&lt;bdi&gt;&lt;span class=&quot;woocommerce-Price-currencySymbol&quot;&gt;&#036;&lt;/span&gt;199.99&lt;/bdi&gt;&lt;/span&gt;&lt;/span&gt;&lt;span class=&quot;woovr-variation-availability&quot;&gt;&lt;p class=&quot;stock in-stock&quot;&gt;In stock&lt;/p&gt;
&lt;/span&gt;&lt;span class=&quot;woovr-variation-description&quot;&gt;&lt;/span&gt;" data-availability="&lt;p class=&quot;stock in-stock&quot;&gt;In stock&lt;/p&gt;
" data-woobt_image="&lt;img width=&quot;300&quot; height=&quot;300&quot; src=&quot;https://harborcityhemp.com/wp-content/uploads/2024/02/Specimen-X-HF-Product-Photo-300x300.png&quot; class=&quot;attachment-woocommerce_thumbnail size-woocommerce_thumbnail&quot; alt=&quot;Specimen X HF Product Photo&quot; decoding=&quot;async&quot; srcset=&quot;https://harborcityhemp.com/wp-content/uploads/2024/02/Specimen-X-HF-Product-Photo-300x300.png 300w, https://harborcityhemp.com/wp-content/uploads/2024/02/Specimen-X-HF-Product-Photo-500x500.png 500w, https://harborcityhemp.com/wp-content/uploads/2024/02/Specimen-X-HF-Product-Photo-1024x1024.png 1024w, https://harborcityhemp.com/wp-content/uploads/2024/02/Specimen-X-HF-Product-Photo-400x400.png 400w, https://harborcityhemp.com/wp-content/uploads/2024/02/Specimen-X-HF-Product-Photo-768x768.png 768w, https://harborcityhemp.com/wp-content/uploads/2024/02/Specimen-X-HF-Product-Photo-1536x1536.png 1536w, https://harborcityhemp.com/wp-content/uploads/2024/02/Specimen-X-HF-Product-Photo-2048x2048.png 2048w, https://harborcityhemp.com/wp-content/uploads/2024/02/Specimen-X-HF-Product-Photo-60x60.png 60w, https://harborcityhemp.com/wp-content/uploads/2024/02/Specimen-X-HF-Product-Photo-110x110.png 110w, https://harborcityhemp.com/wp-content/uploads/2024/02/Specimen-X-HF-Product-Photo-600x600.png 600w, https://harborcityhemp.com/wp-content/uploads/2024/02/Specimen-X-HF-Product-Photo-100x100.png 100w&quot; sizes=&quot;(max-width: 300px) 100vw, 300px&quot; /&gt;">Specimen X THCa Flower (Indoor) – 28g</option></select></div></div></div>

*/

  const variants = [];


  $('select.woovr-variation-select option').each(function () {
    let variantName = $(this).text().trim();
    // Only add variant names that are not 'Choose an option'
    if (variantName && variantName !== 'Choose an option') {
      variantName = variantName.split(' – ')
      const variant = variantName[1];
      variants.push(variant);
    }
  });

  console.log('variants', variants)

  for (const image of imageUrls) {
    const raw = await recognize(image);

    const result = transcribeAssay(raw, image, 'EHH');

    if (result.length) {
      if (cannabinoidNameList.includes(result[0].name)) {
        cannabinoids = result.filter(a => cannabinoidNameList.includes(a.name))
      }
      if (terpeneNameList.includes(result[0].name)) {
        terpenes = result.filter(a => terpeneNameList.includes(a.name))
      }
    }

    if (terpenes.length && cannabinoids.length) {
      break;
    }
  }

  const product = {
    title,
    url,
    image,
    imageUrls,
    variants,
    terpenes,
    cannabinoids,
    vendor: 'HCH',
  };


  numSavedProducts++;

  return product;
}

async function scrapePage(url, currentPage, productLinks) {

  await recordAssays();

  try {
    const response = await axios.get(url);

    fs.writeFileSync(`./temp/vendors/hch-page-${currentPage}.html`, response.data);

    const $ = cheerio.load(response.data, { xmlMode: true })

    const items = $('item');

    for (const item of items) {

      const title = $(item).find('title').text().trim();

      const url = $(item).find('link').text().trim();

      // console.log('url', title)

      const vendorDate = $(item).find('pubDate').text().trim();

      if (isDesiredProduct(title)) {

        productLinks.push({ title, url, vendorDate });

      }
    }

    const nextPageLink = $('.pagination-item--next a').attr('href');

    if (nextPageLink) {
      currentPage++;
      await scrapePage(nextPageLink, currentPage, productLinks);
    }
  } catch (e) {
    logger.error('scraper:', e.message);
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

async function getEHHProductsInfo(productLinks) {

  const products = [];

  for (const productLink of productLinks) {

    let product = await getProduct(productLink.url);

    if (!product) {
      continue;
    }


    product = { ...product, ...productLink, vendor: 'HCH' }

    if (product.variants.length > 0) {

      product.variants = product.variants.map((variant) => normalizeVariantName(variant));



      products.push(product);

    }

  }

  return products;

}

async function getAvailableLeafProducts(id, vendor) {
  batchId = id;
  console.log('batchId', batchId)
  await recordAssays();

  const productLinks = await scrapePage(startUrl, currentPage, []);

  const products = await getEHHProductsInfo(productLinks);

  return products;

}

if (require.main === module) {
  logger.log({
    level: 'info',
    message: `This script is being executed directly by Node.js`
  });
  getAvailableLeafProducts(batchId, vendor);
}

module.exports = {
  getAvailableLeafProducts,
  getProduct,
  recordAssays
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

const html = `<div class="accordion">
<div id="accordion-3212556302" class="accordion-item">
<a id="accordion-3212556302-label" class="accordion-title plain" href="#accordion-item-tropical-punch" aria-expanded="false" aria-controls="accordion-3212556302-content">
<button class="toggle" aria-label="Toggle"><i class="icon-angle-down"></i></button>
<span>TROPICAL PUNCH</span>
</a>
<div id="accordion-3212556302-content" class="accordion-inner" aria-labelledby="accordion-3212556302-label">
<div id="text-3482928966" class="text">
<p><span style="font-size: 100%; font-family: lm-pro-ultra-light; color: #000000;"><a style="color: #000000;" href="https://harborcityhemp.com/wp-content/uploads/2023/10/09-19-2023-38769W3292.pdf">HF-TP-01</a></span></p>
<style>
#text-3482928966 {
  color: rgb(0,0,0);
}
#text-3482928966 > * {
  color: rgb(0,0,0);
}
</style>
</div>
</div>
</div>
<div id="accordion-2790078356" class="accordion-item">
<a id="accordion-2790078356-label" class="accordion-title plain" href="#accordion-item-royal-octane" aria-expanded="false" aria-controls="accordion-2790078356-content">
<button class="toggle" aria-label="Toggle"><i class="icon-angle-down"></i></button>
<span>ROYAL OCTANE</span>
</a>
<div id="accordion-2790078356-content" class="accordion-inner" aria-labelledby="accordion-2790078356-label">
<div id="text-2271540002" class="text">
<p><span style="font-size: 100%; font-family: lm-pro-ultra-light; color: #000000;"><a style="color: #000000;" href="https://harborcityhemp.com/wp-content/uploads/2023/10/08-02-2023-36527W3288.pdf">HF-RO-01</a></span></p>
<style>
#text-2271540002 {
  color: rgb(0,0,0);
}
#text-2271540002 > * {
  color: rgb(0,0,0);
}
</style>
</div>
</div>
</div>
<div id="accordion-4239019709" class="accordion-item">
<a id="accordion-4239019709-label" class="accordion-title plain" href="#accordion-item-garlic-martini" aria-expanded="false" aria-controls="accordion-4239019709-content">
<button class="toggle" aria-label="Toggle"><i class="icon-angle-down"></i></button>
<span>GARLIC MARTINI</span>
</a>
<div id="accordion-4239019709-content" class="accordion-inner" aria-labelledby="accordion-4239019709-label">
<div id="text-2003799643" class="text">
<p><span style="font-size: 100%; font-family: lm-pro-ultra-light; color: #000000;"><a style="color: #000000;" href="https://harborcityhemp.com/wp-content/uploads/2023/10/09-14-2023-38526W3291.pdf">HF-GM-01</a></span></p>
<style>
#text-2003799643 {
  color: rgb(0,0,0);
}
#text-2003799643 > * {
  color: rgb(0,0,0);
}
</style>
</div>
</div>
</div>
<div id="accordion-2452218710" class="accordion-item">
<a id="accordion-2452218710-label" class="accordion-title plain" href="#accordion-item-purple-runtz" aria-expanded="false" aria-controls="accordion-2452218710-content">
<button class="toggle" aria-label="Toggle"><i class="icon-angle-down"></i></button>
<span>PURPLE RUNTZ</span>
</a>
<div id="accordion-2452218710-content" class="accordion-inner" aria-labelledby="accordion-2452218710-label">
<div id="text-1830713746" class="text">
<p><span style="font-size: 100%; font-family: lm-pro-ultra-light; color: #000000;"><a style="color: #000000;" href="https://harborcityhemp.com/wp-content/uploads/2023/10/09-14-2023-38513W3289.pdf">HF-PR-01</a></span></p>
<style>
#text-1830713746 {
  color: rgb(0,0,0);
}
#text-1830713746 > * {
  color: rgb(0,0,0);
}
</style>
</div>
</div>
</div>
<div id="accordion-4124805009" class="accordion-item">
<a id="accordion-4124805009-label" class="accordion-title plain" href="#accordion-item-snowcap" aria-expanded="false" aria-controls="accordion-4124805009-content">
<button class="toggle" aria-label="Toggle"><i class="icon-angle-down"></i></button>
<span>SNOWCAP</span>
</a>
<div id="accordion-4124805009-content" class="accordion-inner" aria-labelledby="accordion-4124805009-label">
<div id="text-1447696327" class="text">
<p><span style="font-size: 100%; font-family: lm-pro-ultra-light; color: #000000;"><a style="color: #000000;" href="https://harborcityhemp.com/wp-content/uploads/2023/10/09-14-2023-38528W3290.pdf">HF-SC-01</a></span></p>
<style>
#text-1447696327 {
  color: rgb(0,0,0);
}
#text-1447696327 > * {
  color: rgb(0,0,0);
}
</style>
</div>
</div>
</div>
<div id="accordion-1739868662" class="accordion-item">
<a id="accordion-1739868662-label" class="accordion-title plain" href="#accordion-item-blue-rhino" aria-expanded="false" aria-controls="accordion-1739868662-content">
<button class="toggle" aria-label="Toggle"><i class="icon-angle-down"></i></button>
<span>BLUE RHINO</span>
</a>
<div id="accordion-1739868662-content" class="accordion-inner" aria-labelledby="accordion-1739868662-label">
<div id="text-219157328" class="text">
<p><span style="font-size: 100%; font-family: lm-pro-ultra-light; color: #000000;"><a style="color: #000000;" href="https://harborcityhemp.com/wp-content/uploads/2023/09/08-02-2023-36550W3026.pdf">HF-BR-01</a></span></p>
<style>
#text-219157328 {
  color: rgb(0,0,0);
}
#text-219157328 > * {
  color: rgb(0,0,0);
}
</style>
</div>
</div>
</div>
<div id="accordion-1802010926" class="accordion-item">
<a id="accordion-1802010926-label" class="accordion-title plain" href="#accordion-item-alpha-runtz" aria-expanded="false" aria-controls="accordion-1802010926-content">
<button class="toggle" aria-label="Toggle"><i class="icon-angle-down"></i></button>
<span>ALPHA RUNTZ</span>
</a>
<div id="accordion-1802010926-content" class="accordion-inner" aria-labelledby="accordion-1802010926-label">
<div id="text-1229529675" class="text">
<p><span style="font-size: 100%; font-family: lm-pro-ultra-light; color: #000000;"><a style="color: #000000;" href="https://harborcityhemp.com/wp-content/uploads/2023/09/08-24-2023-37522W3024-1.pdf">HF-AR-01</a></span></p>
<style>
#text-1229529675 {
  color: rgb(0,0,0);
}
#text-1229529675 > * {
  color: rgb(0,0,0);
}
</style>
</div>
</div>
</div>
<div id="accordion-3260921686" class="accordion-item">
<a id="accordion-3260921686-label" class="accordion-title plain" href="#accordion-item-strawberry-cough" aria-expanded="false" aria-controls="accordion-3260921686-content">
<button class="toggle" aria-label="Toggle"><i class="icon-angle-down"></i></button>
<span>STRAWBERRY COUGH</span>
</a>
<div id="accordion-3260921686-content" class="accordion-inner" aria-labelledby="accordion-3260921686-label">
<div id="text-4155858506" class="text">
<p><span style="font-size: 100%; font-family: lm-pro-ultra-light; color: #000000;"><a style="color: #000000;" href="https://harborcityhemp.com/wp-content/uploads/2023/08/06-27-2023-35256-strawberry-cough.pdf">HF-SBC-001</a></span></p>
<style>
#text-4155858506 {
  color: rgb(0,0,0);
}
#text-4155858506 > * {
  color: rgb(0,0,0);
}
</style>
</div>
</div>
</div>
<div id="accordion-506966928" class="accordion-item">
<a id="accordion-506966928-label" class="accordion-title plain" href="#accordion-item-wedding-cake" aria-expanded="false" aria-controls="accordion-506966928-content">
<button class="toggle" aria-label="Toggle"><i class="icon-angle-down"></i></button>
<span>WEDDING CAKE</span>
</a>
<div id="accordion-506966928-content" class="accordion-inner" aria-labelledby="accordion-506966928-label">
<div id="text-2788118075" class="text">
<p><span style="font-size: 100%; font-family: lm-pro-ultra-light; color: #000000;"><a style="color: #000000;" href="https://harborcityhemp.com/wp-content/uploads/2023/08/05-25-2023-33929-wedding-cake.pdf">HF-WC-01</a></span></p>
<style>
#text-2788118075 {
  color: rgb(0,0,0);
}
#text-2788118075 > * {
  color: rgb(0,0,0);
}
</style>
</div>
</div>
</div>
<div id="accordion-1146472478" class="accordion-item">
<a id="accordion-1146472478-label" class="accordion-title plain" href="#accordion-item-green-crack" aria-expanded="false" aria-controls="accordion-1146472478-content">
<button class="toggle" aria-label="Toggle"><i class="icon-angle-down"></i></button>
<span>GREEN CRACK</span>
</a>
<div id="accordion-1146472478-content" class="accordion-inner" aria-labelledby="accordion-1146472478-label">
<div id="text-3517252053" class="text">
<p><span style="font-size: 100%; font-family: lm-pro-ultra-light; color: #000000;"><a style="color: #000000;" href="https://harborcityhemp.com/wp-content/uploads/2023/08/05-26-2023-34000-green-crack.pdf">HF-GC-01</a></span></p>
<style>
#text-3517252053 {
  color: rgb(0,0,0);
}
#text-3517252053 > * {
  color: rgb(0,0,0);
}
</style>
</div>
</div>
</div>
<div id="accordion-2209731682" class="accordion-item">
<a id="accordion-2209731682-label" class="accordion-title plain" href="#accordion-item-blueberry-muffin" aria-expanded="false" aria-controls="accordion-2209731682-content">
<button class="toggle" aria-label="Toggle"><i class="icon-angle-down"></i></button>
<span>BLUEBERRY MUFFIN</span>
</a>
<div id="accordion-2209731682-content" class="accordion-inner" aria-labelledby="accordion-2209731682-label">
<div id="text-3252712288" class="text">
<p><a href="https://harborcityhemp.com/wp-content/uploads/2023/08/05-26-2023-33995W2821-blueberry-muffin.pdf"><span style="font-family: lm-pro-ultra-light; color: #000000;">HF-BBM-01</span></a></p>
<style>
#text-3252712288 {
  color: rgb(0,0,0);
}
#text-3252712288 > * {
  color: rgb(0,0,0);
}
</style>
</div>
</div>
</div>
<div id="accordion-3555090810" class="accordion-item">
<a id="accordion-3555090810-label" class="accordion-title plain" href="#accordion-item-maui-wowie" aria-expanded="false" aria-controls="accordion-3555090810-content">
<button class="toggle" aria-label="Toggle"><i class="icon-angle-down"></i></button>
<span>MAUI WOWIE</span>
</a>
<div id="accordion-3555090810-content" class="accordion-inner" aria-labelledby="accordion-3555090810-label">
<div id="text-713946805" class="text">
<p><span style="color: #000000;"><a style="color: #000000;" href="https://harborcityhemp.com/wp-content/uploads/2023/08/maui-wowie.pdf"><span style="font-family: lm-pro-ultra-light;">HF-MW-01</span></a></span></p>
<style>
#text-713946805 {
  color: rgb(0,0,0);
}
#text-713946805 > * {
  color: rgb(0,0,0);
}
</style>
</div>
</div>
</div>
<div id="accordion-1018579609" class="accordion-item">
<a id="accordion-1018579609-label" class="accordion-title plain" href="#accordion-item-white-bubblegum-gelato" aria-expanded="false" aria-controls="accordion-1018579609-content">
<button class="toggle" aria-label="Toggle"><i class="icon-angle-down"></i></button>
<span>WHITE BUBBLEGUM GELATO</span>
</a>
<div id="accordion-1018579609-content" class="accordion-inner" aria-labelledby="accordion-1018579609-label">
<div id="text-4107855761" class="text">
<p><span style="font-size: 100%; font-family: lm-pro-ultra-light; color: #000000;"><a style="color: #000000;" href="https://harborcityhemp.com/wp-content/uploads/2023/08/white-bubblegum-gelato.pdf" data-type="URL" data-id="https://harborcityhemp.com/wp-content/uploads/2021/06/2509-d8-rbt-0521-1.pdf">HF-WBG-01</a></span></p>
<style>
#text-4107855761 {
  color: rgb(0,0,0);
}
#text-4107855761 > * {
  color: rgb(0,0,0);
}
</style>
</div>
</div>
</div>
<div id="accordion-2610876039" class="accordion-item">
<a id="accordion-2610876039-label" class="accordion-title plain" href="#accordion-item-unicorn-shoes" aria-expanded="false" aria-controls="accordion-2610876039-content">
<button class="toggle" aria-label="Toggle"><i class="icon-angle-down"></i></button>
<span>UNICORN SHOES</span>
</a>
<div id="accordion-2610876039-content" class="accordion-inner" aria-labelledby="accordion-2610876039-label">
<div id="text-973942491" class="text">
<p><span style="font-size: 100%; font-family: lm-pro-ultra-light; color: #000000;"><a style="color: #000000;" href="https://harborcityhemp.com/wp-content/uploads/2023/10/harbor-city-uni-shoes.pdf" data-type="URL" data-id="https://harborcityhemp.com/wp-content/uploads/2021/06/2509-d8-rbt-0521-1.pdf">HF-UCS-01</a></span></p>
<style>
#text-973942491 {
  color: rgb(0,0,0);
}
#text-973942491 > * {
  color: rgb(0,0,0);
}
</style>
</div>
</div>
</div>
<div id="accordion-3147970751" class="accordion-item">
<a id="accordion-3147970751-label" class="accordion-title plain" href="#accordion-item-b.o.b." aria-expanded="false" aria-controls="accordion-3147970751-content">
<button class="toggle" aria-label="Toggle"><i class="icon-angle-down"></i></button>
<span>B.O.B.</span>
</a>
<div id="accordion-3147970751-content" class="accordion-inner" aria-labelledby="accordion-3147970751-label">
<div id="text-1188339521" class="text">
<p><span style="font-size: 100%; font-family: lm-pro-ultra-light; color: #000000;"><a style="color: #000000;" href="https://harborcityhemp.com/wp-content/uploads/2023/10/Harbor-city-Bob.pdf" data-type="URL" data-id="https://harborcityhemp.com/wp-content/uploads/2021/06/2509-d8-rbt-0521-1.pdf">HF-BOB-01</a></span></p>
<style>
#text-1188339521 {
  color: rgb(0,0,0);
}
#text-1188339521 > * {
  color: rgb(0,0,0);
}
</style>
</div>
</div>
</div>
<div id="accordion-1817715782" class="accordion-item">
<a id="accordion-1817715782-label" class="accordion-title plain" href="#accordion-item-butterberry" aria-expanded="false" aria-controls="accordion-1817715782-content">
<button class="toggle" aria-label="Toggle"><i class="icon-angle-down"></i></button>
<span>BUTTERBERRY</span>
</a>
<div id="accordion-1817715782-content" class="accordion-inner" aria-labelledby="accordion-1817715782-label">
<div id="text-1121340339" class="text">
<p><span style="font-size: 100%; font-family: lm-pro-ultra-light; color: #000000;"><a style="color: #000000;" href="https://harborcityhemp.com/wp-content/uploads/2023/10/harbor-city-point-break.pdf" data-type="URL" data-id="https://harborcityhemp.com/wp-content/uploads/2021/06/2509-d8-rbt-0521-1.pdf">HF-BB-01</a></span></p>
<style>
#text-1121340339 {
  color: rgb(0,0,0);
}
#text-1121340339 > * {
  color: rgb(0,0,0);
}
</style>
</div>
</div>
</div>
<div id="accordion-2162247310" class="accordion-item">
<a id="accordion-2162247310-label" class="accordion-title plain" href="#accordion-item-punch-breath" aria-expanded="false" aria-controls="accordion-2162247310-content">
<button class="toggle" aria-label="Toggle"><i class="icon-angle-down"></i></button>
<span>PUNCH BREATH</span>
</a>
<div id="accordion-2162247310-content" class="accordion-inner" aria-labelledby="accordion-2162247310-label">
<div id="text-3285726611" class="text">
<p><span style="font-size: 100%; font-family: lm-pro-ultra-light; color: #000000;"><a style="color: #000000;" href="https://harborcityhemp.com/wp-content/uploads/2023/10/harbor-city-punch-breath.pdf" data-type="URL" data-id="https://harborcityhemp.com/wp-content/uploads/2021/06/2509-d8-rbt-0521-1.pdf">HF-PB-01</a></span></p>
<style>
#text-3285726611 {
  color: rgb(0,0,0);
}
#text-3285726611 > * {
  color: rgb(0,0,0);
}
</style>
</div>
</div>
</div>
<div id="accordion-3394830767" class="accordion-item">
<a id="accordion-3394830767-label" class="accordion-title plain" href="#accordion-item-mochi" aria-expanded="false" aria-controls="accordion-3394830767-content">
<button class="toggle" aria-label="Toggle"><i class="icon-angle-down"></i></button>
<span>MOCHI</span>
</a>
<div id="accordion-3394830767-content" class="accordion-inner" aria-labelledby="accordion-3394830767-label">
<div id="text-2919477401" class="text">
<p><span style="font-size: 100%; font-family: lm-pro-ultra-light; color: #000000;"><a style="color: #000000;" href="https://harborcityhemp.com/wp-content/uploads/2023/10/harbor-city-mochi.pdf" data-type="URL" data-id="https://harborcityhemp.com/wp-content/uploads/2021/06/2509-d8-rbt-0521-1.pdf">HF-MO-01</a></span></p>
<style>
#text-2919477401 {
  color: rgb(0,0,0);
}
#text-2919477401 > * {
  color: rgb(0,0,0);
}
</style>
</div>
</div>
</div>
<div id="accordion-3822845294" class="accordion-item">
<a id="accordion-3822845294-label" class="accordion-title plain" href="#accordion-item-white-fire" aria-expanded="false" aria-controls="accordion-3822845294-content">
<button class="toggle" aria-label="Toggle"><i class="icon-angle-down"></i></button>
<span>WHITE FIRE</span>
</a>
<div id="accordion-3822845294-content" class="accordion-inner" aria-labelledby="accordion-3822845294-label">
<div id="text-2591583580" class="text">
<p><span style="font-size: 100%; font-family: lm-pro-ultra-light; color: #000000;"><a style="color: #000000;" href="https://harborcityhemp.com/wp-content/uploads/2023/10/harbor-city-white-fire.pdf" data-type="URL" data-id="https://harborcityhemp.com/wp-content/uploads/2021/06/2509-d8-rbt-0521-1.pdf">HF-WF-01</a></span></p>
<style>
#text-2591583580 {
  color: rgb(0,0,0);
}
#text-2591583580 > * {
  color: rgb(0,0,0);
}
</style>
</div>
</div>
</div>
<div id="accordion-2060831703" class="accordion-item">
<a id="accordion-2060831703-label" class="accordion-title plain" href="#accordion-item-black-ice" aria-expanded="false" aria-controls="accordion-2060831703-content">
<button class="toggle" aria-label="Toggle"><i class="icon-angle-down"></i></button>
<span>BLACK ICE</span>
</a>
<div id="accordion-2060831703-content" class="accordion-inner" aria-labelledby="accordion-2060831703-label">
<div id="text-25294268" class="text">
<p><span style="font-size: 100%; font-family: lm-pro-ultra-light; color: #000000;"><a style="color: #000000;" href="https://harborcityhemp.com/wp-content/uploads/2023/10/harbor-city-black-ice.pdf" data-type="URL" data-id="https://harborcityhemp.com/wp-content/uploads/2021/06/2509-d8-rbt-0521-1.pdf">HF-BI-01</a></span></p>
<style>
#text-25294268 {
  color: rgb(0,0,0);
}
#text-25294268 > * {
  color: rgb(0,0,0);
}
</style>
</div>
</div>
</div>
<div id="accordion-2154966192" class="accordion-item">
<a id="accordion-2154966192-label" class="accordion-title plain" href="#accordion-item-gelonade" aria-expanded="false" aria-controls="accordion-2154966192-content">
<button class="toggle" aria-label="Toggle"><i class="icon-angle-down"></i></button>
<span>GELONADE</span>
</a>
<div id="accordion-2154966192-content" class="accordion-inner" aria-labelledby="accordion-2154966192-label">
<div id="text-3785445971" class="text">
<p><span style="font-size: 100%; font-family: lm-pro-ultra-light; color: #000000;"><a style="color: #000000;" href="https://harborcityhemp.com/wp-content/uploads/2023/10/harbor-city-gelonade.pdf" data-type="URL" data-id="https://harborcityhemp.com/wp-content/uploads/2021/06/2509-d8-rbt-0521-1.pdf">HF-GEL-01</a></span></p>
<style>
#text-3785445971 {
  color: rgb(0,0,0);
}
#text-3785445971 > * {
  color: rgb(0,0,0);
}
</style>
</div>
</div>
</div>
<div id="accordion-1703244722" class="accordion-item">
<a id="accordion-1703244722-label" class="accordion-title plain" href="#accordion-item-papaya-x-gelato" aria-expanded="false" aria-controls="accordion-1703244722-content">
<button class="toggle" aria-label="Toggle"><i class="icon-angle-down"></i></button>
<span>PAPAYA x GELATO</span>
</a>
<div id="accordion-1703244722-content" class="accordion-inner" aria-labelledby="accordion-1703244722-label">
<div id="text-3125343625" class="text">
<p><span style="font-size: 100%; font-family: lm-pro-ultra-light; color: #000000;"><a style="color: #000000;" href="https://harborcityhemp.com/wp-content/uploads/2023/10/harbor-city-papaya-x-gelato.pdf" data-type="URL" data-id="https://harborcityhemp.com/wp-content/uploads/2021/06/2509-d8-rbt-0521-1.pdf">HF-PG-01</a></span></p>
<style>
#text-3125343625 {
  color: rgb(0,0,0);
}
#text-3125343625 > * {
  color: rgb(0,0,0);
}
</style>
</div>
</div>
</div>
<div id="accordion-3455488241" class="accordion-item">
<a id="accordion-3455488241-label" class="accordion-title plain" href="#accordion-item-blue-dream" aria-expanded="false" aria-controls="accordion-3455488241-content">
<button class="toggle" aria-label="Toggle"><i class="icon-angle-down"></i></button>
<span>BLUE DREAM</span>
</a>
<div id="accordion-3455488241-content" class="accordion-inner" aria-labelledby="accordion-3455488241-label">
<div id="text-3213031403" class="text">
<p><span style="font-size: 100%; font-family: lm-pro-ultra-light; color: #000000;"><a style="color: #000000;" href="https://harborcityhemp.com/wp-content/uploads/2023/12/harbor-city-hemp-blue-dream.pdf" data-type="URL" data-id="https://harborcityhemp.com/wp-content/uploads/2023/12/harbor-city-hemp-blue-dream.pdff">HF-BD-01</a></span></p>
<style>
#text-3213031403 {
  color: rgb(0,0,0);
}
#text-3213031403 > * {
  color: rgb(0,0,0);
}
</style>
</div>
</div>
</div>
<div id="accordion-3769231391" class="accordion-item">
<a id="accordion-3769231391-label" class="accordion-title plain" href="#accordion-item-rs-11" aria-expanded="false" aria-controls="accordion-3769231391-content">
<button class="toggle" aria-label="Toggle"><i class="icon-angle-down"></i></button>
<span>RS 11</span>
</a>
<div id="accordion-3769231391-content" class="accordion-inner" aria-labelledby="accordion-3769231391-label">
<div id="text-2483464976" class="text">
<p><span style="font-size: 100%; font-family: lm-pro-ultra-light; color: #000000;"><a style="color: #000000;" href="https://harborcityhemp.com/wp-content/uploads/2023/12/harbor-city-hemp-RS-11.pdf" data-type="URL" data-id="https://harborcityhemp.com/wp-content/uploads/2023/12/harbor-city-hemp-RS-11.pdf">HF-RS11-01</a></span></p>
<style>
#text-2483464976 {
  color: rgb(0,0,0);
}
#text-2483464976 > * {
  color: rgb(0,0,0);
}
</style>
</div>
</div>
</div>
<div id="accordion-1231246261" class="accordion-item">
<a id="accordion-1231246261-label" class="accordion-title plain" href="#accordion-item-blueberry-apple-fritter" aria-expanded="false" aria-controls="accordion-1231246261-content">
<button class="toggle" aria-label="Toggle"><i class="icon-angle-down"></i></button>
<span>BLUEBERRY APPLE FRITTER</span>
</a>
<div id="accordion-1231246261-content" class="accordion-inner" aria-labelledby="accordion-1231246261-label">
<div id="text-267640365" class="text">
<p><span style="font-size: 100%; font-family: lm-pro-ultra-light; color: #000000;"><a style="color: #000000;" href="https://harborcityhemp.com/wp-content/uploads/2023/12/harbor-city-hemp-blueberry-apple-fritter.pdf" data-type="URL" data-id="https://harborcityhemp.com/wp-content/uploads/2023/12/harbor-city-hemp-blueberry-apple-fritter.pdf">HF-BAF-01</a></span></p>
<style>
#text-267640365 {
  color: rgb(0,0,0);
}
#text-267640365 > * {
  color: rgb(0,0,0);
}
</style>
</div>
</div>
</div>
<div id="accordion-2727906906" class="accordion-item">
<a id="accordion-2727906906-label" class="accordion-title plain" href="#accordion-item-death-star" aria-expanded="false" aria-controls="accordion-2727906906-content">
<button class="toggle" aria-label="Toggle"><i class="icon-angle-down"></i></button>
<span>DEATH STAR</span>
</a>
<div id="accordion-2727906906-content" class="accordion-inner" aria-labelledby="accordion-2727906906-label">
<div id="text-312816410" class="text">
<p><span style="font-size: 100%; font-family: lm-pro-ultra-light; color: #000000;"><a style="color: #000000;" href="https://harborcityhemp.com/wp-content/uploads/2023/12/harbor-city-hemp-death-star.pdf" data-type="URL" data-id="https://harborcityhemp.com/wp-content/uploads/2023/12/harbor-city-hemp-death-star.pdf">HF-DS-01</a></span></p>
<style>
#text-312816410 {
  color: rgb(0,0,0);
}
#text-312816410 > * {
  color: rgb(0,0,0);
}
</style>
</div>
</div>
</div>
<div id="accordion-869403805" class="accordion-item">
<a id="accordion-869403805-label" class="accordion-title plain" href="#accordion-item-spec-x" aria-expanded="false" aria-controls="accordion-869403805-content">
<button class="toggle" aria-label="Toggle"><i class="icon-angle-down"></i></button>
<span>SPEC X</span>
</a>
<div id="accordion-869403805-content" class="accordion-inner" aria-labelledby="accordion-869403805-label">
<div id="text-3755371301" class="text">
<p><span style="font-size: 100%; font-family: lm-pro-ultra-light; color: #000000;"><a style="color: #000000;" href="https://harborcityhemp.com/wp-content/uploads/2024/02/Harbor-City-Hemp-Spec-X.pdf" data-type="URL" data-id="https://harborcityhemp.com/wp-content/uploads/2024/02/Harbor-City-Hemp-Spec-X.pdf">HF-SX-01</a></span></p>
<style>
#text-3755371301 {
  color: rgb(0,0,0);
}
#text-3755371301 > * {
  color: rgb(0,0,0);
}
</style>
</div>
</div>
</div>
<div id="accordion-3714210472" class="accordion-item">
<a id="accordion-3714210472-label" class="accordion-title plain" href="#accordion-item-durban-poison" aria-expanded="false" aria-controls="accordion-3714210472-content">
<button class="toggle" aria-label="Toggle"><i class="icon-angle-down"></i></button>
<span>DURBAN POISON</span>
</a>
<div id="accordion-3714210472-content" class="accordion-inner" aria-labelledby="accordion-3714210472-label">
<div id="text-2309802595" class="text">
<p><span style="font-size: 100%; font-family: lm-pro-ultra-light; color: #000000;"><a style="color: #000000;" href="https://harborcityhemp.com/wp-content/uploads/2024/02/harbor-city-Hemp-durban.pdf" data-type="URL" data-id="https://harborcityhemp.com/wp-content/uploads/2024/02/harbor-city-Hemp-durban.pdf">HF-DP-01</a></span></p>
<style>
#text-2309802595 {
  color: rgb(0,0,0);
}
#text-2309802595 > * {
  color: rgb(0,0,0);
}
</style>
</div>
</div>
</div>
</div>`