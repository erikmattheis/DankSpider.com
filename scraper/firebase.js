const admin = require('firebase-admin');

const { getApps, initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore');

const serviceAccount = require('../serviceAccountKey.json');

const { makeFirebaseSafeId } = require('./services/strings.js');

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
    appName: 'DankSpider'
  });
}

const db = getFirestore();

async function getUniqueTerpenes() {
  const productsRef = db.collection('productsWithAssay2');
  const snapshot = await productsRef.get();

  const terpenes = new Set();

  snapshot.forEach(doc => {
    const product = doc.data();
    product.images?.forEach(image => {
      image.terpenes.forEach(terpene => terpenes.add(terpene.name));
    });
  });

  return Array.from(terpenes);
}



async function getUniqueChemicals() {

  console.log('getUniqueChemicals');
  const productsRef = db.collection('productsWithAssay2');
  const snapshot = await productsRef.get();

  const cannabinoids = new Set();
  const terpenes = new Set();

  snapshot.forEach(doc => {
    const product = doc.data();
    if (!product.assays) {
      return;
    }
    for (const assay of product?.assays) {

      if (assay.cannabinoids) {
        assay.cannabinoids.forEach(line => cannabinoids?.add(line.name));
      }
      else if (assay.terpenes) {
        assay.terpenes.forEach(line => terpenes?.add(line.name));
      }

    }

  });
  const c = Array.from(cannabinoids);
  const t = Array.from(terpenes);
  console.log('c', c.length);
  console.log('t', t.length);
  return { cannabinoids: c, terpenes: t }
}
/*
(async () => {
  const result = await getUniqueChemicals();
  console.log(JSON.stringify(result, null, 2));
}
)();
*/
async function saveProducts(products, batchId, useDev) {
  const batch = db.batch();
  let productsRef;
  if (useDev) {
    productsRef = db.collection('productsWithAssay2');
  }
  else {
    productsRef = db.collection('products');
  }

  const timestamp = admin.firestore.Timestamp.now();
  const idPrefix = batchId || timestamp.toDate().toISOString();

  for (product of products) {
    const id = await makeFirebaseSafeId(idPrefix, product, productsRef);
    const docRef = productsRef.doc(id);
    if (batchId) {
      batch.set(docRef, {
        ...product,
        batchId,
        timestamp,
      });
    }
    else {
      batch.set(docRef, {
        ...product,
        timestamp,
      });
    }
  };

  await batch.commit();

  // console.log(`Data has been written to Firebase for ${products.length} ${products[0]?.vendor} products`);
}

const { performance } = require('perf_hooks');

async function getAllProducts() {
  const startTime = performance.now();

  const productsRef = db.collection('products').orderBy('timestamp', 'desc');
  const snapshot = await productsRef.get();

  const products = [];
  const uniqueUrls = new Set();

  snapshot.forEach(doc => {
    const product = doc.data();
    if (uniqueUrls.has(product.url)) {
      return;
    }
    uniqueUrls.add(product.url);
    products.push(product);
  });

  const endTime = performance.now();

  // console.log(`getAllProducts() took ${((endTime - startTime) / 1000).toFixed(1)} seconds`);

  return products;
}

async function getProductsByTitle(substring) {
  const productsRef = db.collection('products');
  const snapshot = await productsRef.where('title', '>=', substring).where('title', '<=', substring + '\uf8ff').get();

  const products = [];

  snapshot.forEach(doc => {
    const product = doc.data()
    products.push(product);
  });

  return products;
}

async function deleteAllButMostRecentDocumentsWithMatchingTitlesAndVendors() {
  const productsRef = db.collection('products');
  const snapshot = await productsRef.orderBy('timestamp', 'desc').get();

  const products = [];
  const uniqueTitles = new Set();

  snapshot.forEach(doc => {
    const product = doc.data();
    if (uniqueTitles.has(product.title)) {
      products.push(doc.ref.delete());
    }
    uniqueTitles.add(product.title);
  });

  await Promise.all(products);
}

/*
(async () => {
  await deleteAllButMostRecentDocumentsWithMatchingTitlesAndVendors();
  console.log('deleted any duplicate');
})();
*/

async function getProductsByVendor(vendor, limit, useDev) {
  let productRef;
  if (useDev) {
    productsRef = db.collection('productsWithAssay2');
  }
  else {
    productsRef = db.collection('products');
  }

  let snapshot;
  if (limit) {
    snapshot = await productsRef.where('vendor', '==', vendor).limit(limit).get();
  }
  else {
    snapshot = await productsRef.where('vendor', '==', vendor).get();
  }

  // console.log(`Got ${snapshot.size} products from ${vendor}`)
  const products = [];

  snapshot.forEach(doc => {
    const product = doc.data()
    products.push(product);
  });

  return products;

}

module.exports = {
  saveProducts,
  getAllProducts,
  getProductsByTitle,
  getProductsByVendor,
  deleteAllButMostRecentDocumentsWithMatchingTitlesAndVendors

};