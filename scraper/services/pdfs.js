const cheerio = require('cheerio');
const axios = require('axios');
// const MongoClient = require('mongodb').MongoClient;

async function init() {
  const result = await axios.get('products');
}
axios.getAdapter(

  ('https://cdn11.bigcommerce.com/s-mpabgyqav0/images/stencil/1280x1280/products/217/1434/MilkyHaze1_2__77482.1682825949.jpg?c=1', { encoding: null }, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      const $ = cheerio.load(body);
      const pdfContent = $('body').text();
      /*
          const client = await MongoClient.connect('mongodb://localhost:27017');
          const db = client.db('my-database');
          const collection = db.collection('my-collection');
          await collection.insertOne({ pdfContent });
      */
      console.log('PDF content:', pdfContent);
    }
  });