const admin = require('firebase-admin');

const preston = require('./vendors/preston.js');
const flow = require('./vendors/flow.js');
const wnc = require('./vendors/wnc.js');
const enlighten = require('./vendors/enlighten.js');
const topcola = require('./vendors/topcola.js');
const arete = require('./vendors/arete.js');
const ser = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

const serviceAccount = JSON.parse(ser);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

console.log(process.env.FIREBASE_DATABASE_URL);
console.log('https://dankspider-75eb9-default-rtdb.firebaseio.com');
const db = admin.firestore();

async function emailError(error) {
  try {
    const message = {
      to: 'shockingelk@gmail.com',
      subject: 'Test email',
      text: 'This is a test email from Firebase Admin',
    };
    await admin
      .firestore()
      .collection('mail')
      .add(message);
    console.log('Email sent successfully');
  } catch (err) {
    console.error('Error sending email:', err);
  }
}

emailError('hello world');

/*
const productsRef = db.collection('products');
const snapshot = await productsRef.get();

snapshot.forEach(doc => {
  console.log(doc.id, '=>', doc.data());
});
*/


// console.log('hello world', process.env.EMAIL);

async function saveProducts(products, vendor) {
  const batch = db.batch();
  const productsRef = db.collection('products');

  const timestamp = admin.firestore.Timestamp.now();

  products.forEach(product => {
    const docRef = productsRef.doc();
    batch.set(docRef, {
      ...product,
      vendor,
      timestamp,
    });
  });

  await batch.commit();

  console.log(`Data has been written to Firebase for ${products.length} ${vendor} products`);
}

async function run() {

  const areteProducts = await arete.getAvailableLeafProducts();
  console.log('artete products', areteProducts.length);
  await saveProducts(areteProducts, 'arete');

  const prestonProducts = await preston.getAvailableLeafProducts();
  console.log('preston products', prestonProducts.length);
  await saveProducts(prestonProducts, 'preston');

  const flowProducts = await flow.getAvailableLeafProducts();
  console.log('flow products', flowProducts.length);
  await saveProducts(flowProducts, 'flow');

  const wncProducts = await wnc.getAvailableLeafProducts();
  console.log('wnc products', wncProducts.length);
  await saveProducts(wncProducts, 'wnc');

  const enlightenProducts = await enlighten.getAvailableLeafProducts();
  console.log('enlighten products', enlightenProducts);
  await saveProducts(enlightenProducts, 'enlighten');

  const topcolaProducts = await topcola.getAvailableLeafProducts();
  console.log('top cola products', topcolaProducts);
  await saveProducts(topcolaProducts, 'topcola');

  console.log(`Data has been written to Firebase for all vendors`);
}

run();