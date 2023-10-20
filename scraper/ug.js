const { getApps, initializeApp, applicationDefault, cert } = require('firebase-admin/app');

const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore');

if (process.env.NODE_ENV !== 'production') {
  const dotenv = require('dotenv');
  dotenv.config();
}

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
    appName: 'DankSpider'
  });
}

const db = getFirestore();

async function debugMe() {

  const areThere = await getProductsByTerpene('α-Bisabolol');
  console.log('areThere any α-Bisabolol?', areThere.length);

  async function normalizeTerpenes() {
    const productsRef = db.collection('products');
    const snapshot = await productsRef.get();

    snapshot.forEach(doc => {
      const product = doc.data();
      if (product.terpenes) {
        product.terpenes.forEach(terpene => {
          const name = normalizeTerpene(terpene.name);
          if (name) {
            terpene.name = name;
          }
        });
        product.terpenes.forEach(terpene => {
          console.log('terpene is', terpene.name)
        });
        //console.log('value is', product.terpenes)
        doc.ref.update({ variants: product.terpenes });
      }
    });

  }

  async function updateProductTitle() {
    const productsRef = db.collection('products');
    const snapshot = await productsRef.where('title', '==', '41 Cherry').get();
    snapshot.forEach(doc => {
      const productRef = productsRef.doc(doc.id);
      productRef.update({ title: '42 Cherry' });
    });
  }

  await normalizeTerpenes();

  async function getProductsByTerpene(terpene) {
    const results = [];
    const productsRef = db.collection('products');
    const snapshot = await productsRef.where('terpenes', 'array-contains', { name: terpene }).get();
    snapshot.forEach(doc => {
      const product = doc.data();
      results.push(product);
    });
    console.log('there are', results.length, 'products with', terpene, 'terpene')
    return results;
  }

  await getProductsByTerpene('α-Bisabolol');

  async function getUniqueTerpenes() {
    const productsRef = db.collection('products');
    const snapshot = await productsRef.get();

    const terpenes = new Set();

    snapshot.forEach(doc => {
      const product = doc.data();
      product.terpenes?.forEach(terpene => terpenes.add(terpene.name));
    });

    const t = Array.from(terpenes);
    t.sort();
    return { terpenes: t }
  }


  const c = await getUniqueTerpenes();

  console.log("I expect this to print false:");
  console.log(JSON.stringify(c).includes('α-Bisabolol'));
}

function normalizeTerpene(terpene) {
  if (terpene === 'α-Bisabolol') {
    console.log('Trying to change it.');
  }
  if (!terpene) {
    return "Unknown";
  }

  const spellings = {
    '1,8-Cineole': 'Eucalyptol',
    '1,8-Cineole': 'Eucalyptol',
    '1.8-Cinecle': 'Eucalyptol',
    'α-Bisabolol': 'Bisabolol',
    'a-Bisabolol': 'Bisabolol',
    'a-Bsabolol': 'Bisabolol',
    'a-Humulene': 'Humulene',
    'α-Humulene': 'Humulene',
    'α-Pinene': 'Pinene',
    'a-Pinene': 'Pinene',
    'a-Terpinene': 'Terpinene',
    'α-Terpinene': 'Terpinene',
    'α-Terpinene': 'Terpinene',
    'β-Caryophyllene': 'Caryophyllene',
    'B-Caryophyliene': 'Caryophyllene',
    'B-Caryophyllene': 'Caryophyllene',
    'B-Myrcene': 'Myrcene',
    'β-Myrcene': 'Myrcene',
    'Bisabolol': 'Bisabolol',
    'Bormwol': 'Borneol',
    'Borreol': 'Borneol',
    'Camphene': 'Camphene',
    'Carene': 'Carene',
    'Caryophyllene': 'Caryophyllene',
    'Citral': 'Citral',
    'CaryophylleneOxide': 'Caryophyllene Oxide',
    'Ferxhone': 'Fenchone',
    'Mentho!': 'Menthol',
    'y-Terpinene': 'γ-Terpinene',
  }

  if (terpene === 'α-Bisabolol') {
    console.log('Going to return', spellings[terpene]);
  }
  if (spellings[terpene]) {
    return spellings[terpene];
  }
  return terpene;
}

debugMe();