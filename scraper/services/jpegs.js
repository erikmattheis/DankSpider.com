

const axios = require('axios');
const Tesseract = require('tesseract.js');
const OpenAI = require('openai');
const cheerio = require('cheerio');

const { getProductsByVendor, getProductsWithAssay, getProductsWithoutAssay, saveProducts } = require('../firebase.js');

async function run() {
  const count = await getProductsByVendor('WNC');
  const products = await getProductsWithoutAssay('WNC');
  console.log('products', products);
  throw new Error('stop');

  const wncProducts = products.filter(product => product.vendor === 'WNC');

  const withImages = wncProducts.map(async product => {
    console.log('product.url', product.url)

    const images = await getProductImages(product.url);
    console.log('with images.length', images.length)
    return { ...product, images };
  });

  const bestImages = withImages.map(async product => {
    if (!product.images) return product;
    const images = product.images.filter((image) => { image.toLowercase().includes('terpenes') || product.toLowercase().includes('potency') });
    console.log('best images.length', images.length)
    return { ...product, images };
  });

  const withODRedImages = await bestImages.map(async product => {
    if (!product.images) return product;
    const images = product.images.map(async image => {
      const lines = await extractTextFromImage(image);
      console.log('ocred images.length', images.length)
      return { image, lines };
    });
    return { ...product, lines };
  })


  const withActualArray = await withODRedImages.map(async product => {
    if (!product.images) return product;
    const images = product.images.map(async image => {
      const assay = await JSON.parse(toCleanArray(image.lines.join('\n')));
      console.log('lines of chemicals:', assay.length);
      return { image, result };
    });
    return { ...product, assay };
  })
  await saveProducts(withActualArray);
  /*
  const lines = await extractTextFromImage(imageUrl);
  console.log('lines:', lines.join('\n'))
  const result = await toCleanArray(lines.join('\n'));
  console.log('result:', result);
  */
}

run();

async function getProductImages(url) {
  const response = await axios.get(url);
  const $ = cheerio.load(response.data);
  const images = $('a.productView-thumbnail-link');
  const imageUrls = images.map((index, el) => $(el).attr('src')).get();
  return imageUrls;
}

function nameContains(imageNames, str) {
  return name.toLowerCase().includes(str.toLowerCase());
}

async function getImageData(imageUrl) {
  const result = await axios.get(imageUrl, { responseType: 'arraybuffer' });
  const imageData = Buffer.from(result.data, 'binary');
  return imageData;
}

async function extractTextFromImage(imageUrl) {

  const imageBuffer = await getImageData(imageUrl);

  const { data: { text } } = await Tesseract.recognize(imageBuffer);

  const lines = text.split('\n').filter(line => line.trim() !== '');

  return lines;
}



const terpenes = [
  'Bisabolol',
  'Humulene',
  'Pinene',
  'α-Terpinene',
  'Cineole',
  'β-Caryophyllene',
  'Myrcene',
  'Borneol',
  'Camphene',
  'Carene',
  'Caryophyllene',
  'Citral',
  'Dihydrocarveol',
  'Fenchone',
  'γ-Terpinene',
  'Limonene',
  'Linalool',
  'Menthol',
  'Neroldol',
  'Ocimene',
  'Pulegone',
  'Terpinolene'
];


const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"]
});

async function toCleanArray(input) {

  const model = "gpt-3.5-turbo";
  const temp = 0.5;
  const tokens = 400;

  try {
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: "system", content: "Take ocr of list of weights of Bisabolol, Humulene, Pinene, α-Terpinene, Cineole, β-Caryophyllene, Myrcene, Borneol, Camphene, Carene, Caryophyllene, Citral, Dihydrocarveol, Fenchone, γ-Terpinene, Limonene, Linalool, Menthol, Neroldol, Ocimene, Pulegone, Terpinolene. Output array should use correct names and percent by weight: [{name:'terpene',pct:0.1}] " },
        { role: "user", content: input },
      ],
      temperature: temp,
      max_tokens: tokens,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      n: 1,
      stop: "",
    });
    const response = completion;
    // Show the response
    console.log("==++==++==++==++==++====++==++==++==++==++==");
    //console.log(response.choices[0].message);
    console.log('keys', Object.keys(response));
    console.log("==++==++==++==++==++====++==++==++==++==++==");

    return response.data;

  }
  catch (err) {
    console.log('err:', err);
    return {
      status: err.response?.status,
      message: 'The AI service returned an error code of ' + err.response?.status + ' and the message ' + err,
    }
  }
}


module.exports = {
  run,
}
