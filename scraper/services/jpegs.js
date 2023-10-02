

const axios = require('axios');
const Tesseract = require('tesseract.js');
const OpenAI = require('openai');

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

async function run() {
  const imageUrl = 'https://cdn11.bigcommerce.com/s-mpabgyqav0/images/stencil/1280x1280/products/119/489/Indoor-CarmelAppleGelato2__02349.1682483466.jpg?c=1';
  const lines = await extractTextFromImage(imageUrl);
  console.log('lines:', lines.join('\n'))
  const result = await toCleanArray(lines.join('\n'));
  console.log('result:', result);
}

run();

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
    console.log(response.choices[0].message);
    console.log(Object.keys(response));
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
