const axios = require('./rateLimitedAxios.js');
const Tesseract = require('tesseract.js');
const OpenAI = require('openai');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const admin = require('firebase-admin');

const { getProductsByVendor, getProductsWithAssay, getProductsWithoutAssay, saveProducts } = require('../firebase.js');

async function run() {
  const products = await getProductsByVendor('WNC', 10);

  if (process.env.NODE_ENV !== 'production') {
    //fs.writeFileSync('./products.json', JSON.stringify(products, null, 2));
  }

  const withImages = [];

  for (const product of products) {
    console.log('product.url', product.url);

    const images = await getProductImages(product.url);

    console.log('found images', images.length);

    withImages.push({ ...product, images });
  }

  const bestImages = [];

  for (const product of withImages) {
    if (!product.image.length) {
      continue;
    }
    const images = [...product.images];
    product.images.forEach((image, i) => {
      console.log('image -', image)
      if (image.toLowerCase().includes('terp') || image.toLowerCase().includes('pot')) {
        const member = images.splice(i, 1)[0];
        console.log('member', member)
        images.unshift(member);
      }
    });

    console.log('best images.length', images.length);

    bestImages.push({ ...product, images });
  }

  const withODRedImages = [];

  for (const product of bestImages) {
    if (!product.images.length) {
      continue;
    }

    const images = [];

    for (const image of product.images) {
      console.log('image is', image)
      const lines = await extractTextFromImage(image);
      if (lines.length > 10) {
        console.log('YESSSS!!!!', lines.length);
        images.push({ image, lines });
        if (images.length > 1) {
          break;
        }
      }
      else {
        console.log('No', images.length);
      }
    }

    withODRedImages.push({ ...product, images });
  }

  const withActualArray = [];

  for (const product of withODRedImages) {
    if (!product.images.length) {
      continue;
    }

    const images = [];

    for (const image of product.images) {
      console.log(JSON.stringify(image, null, 2))
      const linesString = image.lines?.join('\n');
      if (!linesString) {
        continue;
      }
      console.log('linesString', linesString)
      const assay = await toCleanArray(linesString);
      console.log('lines of chemicals:', assay);

      if (assay) {
        images.push({ image, assay });
      }
    }

    withActualArray.push({ ...product, images });
  }

  console.log('withActualArray', withActualArray[0]);

  await saveProducts(withActualArray);
}

run();

async function getProductImages(url) {
  const response = await axios.get(url);
  const $ = cheerio.load(response.data);
  const images = $('a.productView-thumbnail-link');
  const imageUrls = images.map((index, el) => $(el).attr('href')).get();
  return imageUrls;
}

function nameContains(imageNames, str) {
  return name.toLowerCase().includes(str.toLowerCase());
}

async function getImageData(imageUrl) {
  if (!imageUrl) {
    return null;
  }
  const result = await axios.get(imageUrl, { responseType: 'arraybuffer' });
  const imageData = Buffer.from(result.data, 'binary');
  return imageData;
}

async function extractTextFromImage(imageUrl) {
  console.log('extractTextFromImage', imageUrl)
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

if (process.env.NODE_ENV !== 'production') {
  const dotenv = require('dotenv');
  dotenv.config();
}

console.log(process.env.OPENAI_API_KEY);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function toCleanArray(input) {
  const model = "gpt-3.5-turbo";
  const temp = 0.5;
  const tokens = 400;

  try {
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: "system", content: "A valid JSON object from poor OCR text. May only contain numbers and the words Bisabolol, Humulene, Pinene, α-Terpinene, Cineole, β-Caryophyllene, Myrcene, Borneol, Camphene, Carene, Caryophyllene, Citral, Dihydrocarveol, Fenchone, γ-Terpinene, Limonene, Linalool, Menthol, Neroldol, Ocimene, Pulegone, Terpinolene. Output should use correct names and percent by weight." },
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
    console.log('completion', completion)
    const response = JSON.stringify(completion.choices[0].message.content).replace(/\\n/g, '\n').replace(/\/g/, '\n');
    console.log('response', response)
    console.log("==++==++==++==++==++====++==++==++==++==++==");
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