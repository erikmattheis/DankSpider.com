const admin = require('firebase-admin');

const { getApps, initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore');
const { makeFirebaseSafe, makeFirebaseSafeId, normalizeCannabinoid, normalizeTerpene } = require('./services/strings.js');

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

async function getUniqueTerpenes() {
  const productsRef = db.collection('productsWithAssay');
  const snapshot = await productsRef.get();

  const terpenes = new Set();

  snapshot.forEach(doc => {
    const product = doc.data();
    const terpenesNormalized = product.terpenes?.map(terpene => {
      console.log('terpene', terpene, normalizeTerpene(terpene.name))
      return { ...terpene, name: normalizeTerpene(terpene.name) };
    });
    console.log('terpenesNormalized', terpenesNormalized)
    doc.ref.update({ terpenes: terpenesNormalized });
    terpenesNormalized?.forEach(terpene => terpenes.add(terpene.name));
  });

  return Array.from(terpenes);
}

async function getUniqueCannabinoids() {
  const productsRef = db.collection('productsWithAssay');
  const snapshot = await productsRef.get();

  const cannabinoids = new Set();

  snapshot.forEach(doc => {
    const product = doc.data();
    product.cannabinoids?.forEach(cannabinoid => cannabinoid.name = normalizeCannabinoid(cannabinoid.name));
    product.cannabinoids?.forEach(cannabinoid => cannabinoids.add(cannabinoid.name));
    doc.set(product);
  });

  return Array.from(cannabinoids);
}

async function saveChemicals(products, batchId, useDev) {
  const batch = db.batch();
  let productsRef;
  if (useDev) {
    productsRef = db.collection('productsWithAssay');
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

async function saveProducts(products, batchId, useDev) {
  const batch = db.batch();
  let productsRef;
  if (useDev) {
    productsRef = db.collection('productsWithAssay');
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

async function getIncompleteProducts() {
  const startTime = performance.now();

  const productsRef = db.collection('productsWithAssay').orderBy('timestamp', 'desc');
  const snapshot = await productsRef.get();

  const products = [];
  const uniqueUrls = new Set();

  snapshot.forEach(doc => {
    const product = doc.data();
    if (uniqueUrls.has(product.url)) {
      return;
    }
    console.log('product.terpenes?.length', product.terpenes?.length);
    if (product.cannabinoids?.length && product.terpenes?.length) {
      return;
    }
    uniqueUrls.add(product.url);
    products.push(product);
  });

  const endTime = performance.now();

  // console.log(`getAllProducts() took ${((endTime - startTime) / 1000).toFixed(1)} seconds`);

  return products;
}

async function getCompleteProducts() {
  const startTime = performance.now();

  const productsRef = db.collection('productsWithAssay').orderBy('timestamp', 'desc');
  const snapshot = await productsRef.get();

  const products = [];
  const uniqueUrls = new Set();

  snapshot.forEach(doc => {
    const product = doc.data();
    if (uniqueUrls.has(product.url)) {
      return;
    }
    console.log('product.terpenes?.length', product.terpenes?.length);
    if (!product.cannabinoids?.length || !product.terpenes?.length) {
      console.log('hit');
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

async function cleanProductsCollections() {
  const productsRef = db.collection('productsWithAssay');
  const archiveRef = db.collection('productArchive');

  const snapshot = await productsRef.orderBy('timestamp', 'desc').get();

  const products = [];
  const uniqueUrls = new Set();

  snapshot.forEach(doc => {
    const product = doc.data();
    if (uniqueUrls.has(product.url)) {
      const archiveDoc = archiveRef.doc(doc.id);
      products.push(archiveDoc.set(product));
      products.push(doc.ref.delete());
    }
    uniqueUrls.add(product.url);
  });

  await Promise.all(products);
}

async function cleanProductsWithAssayCollection() {

  const productsRef = db.collection('productsWithAssay');
  const archiveRef = db.collection('productArchive');

  const snapshot = await productsRef.orderBy('timestamp', 'desc').get();

  const products = [];
  const uniqueUrls = new Set();

  snapshot.forEach(doc => {
    const product = doc.data();
    if (uniqueUrls.has(product.title)) {
      console.log('duplicate found')
      const archiveDoc = archiveRef.doc(doc.id);
      products.push(archiveDoc.set(product));
      products.push(doc.ref.delete());
    }
    uniqueUrls.add(product.title);
  });

  await Promise.all(products);
}

async function getProductsByVendor(vendor, limit, useDev) {

  // console.log('getProductsByVendor', vendor, limit, 'use dev:', useDev);

  let productRef;

  if (useDev) {
    productsRef = db.collection('productsWithAssay');
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

  // console.log(`Got ${snapshot.size} products from ${vendor}`);
  const products = [];

  snapshot.forEach(doc => {
    const product = doc.data()
    products.push(product);
  });

  return products;

}

async function getNextBatchNumber() {
  const batchesRef = db.collection('batches');
  const batchesSnapshot = await batchesRef.orderBy('batchNumber', 'desc').limit(1).get();
  let nextBatchNumber = 1;
  if (!batchesSnapshot.empty) {
    const lastBatch = batchesSnapshot.docs[0].data();
    nextBatchNumber = lastBatch.batchNumber + 1;
  }

  return nextBatchNumber;
}

async function newBatch() {

  const batchRef = batchesRef.doc();
  const batchNumber = getNextBatchNumber();

  const startTime = new Date();
  const endTime = new Date();
  const duration = endTime - startTime;
  const numDocuments = products.length;
  saveBatchRecord(batchNumber, startTime, endTime, duration, numDocuments);
}

async function saveBatchRecord(batchNumber, startTime, endTime, duration, numDocuments) {
  const batchRef = db.collection('batches').doc();
  const batchData = {
    batchNumber,
    startTime,
    endTime,
    duration,
    numDocuments,
  };

  await batchRef.set(batchData);
}

async function deleteAllDocumentsInCollection(collectionPath) {
  const snapshot = await admin.firestore().collection(collectionPath).get();
  const batch = admin.firestore().batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();
}

async function saveArticles(articles) {
  const batch = db.batch();
  const chemicalsRef = db.collection('terpenes');

  const timestamp = admin.firestore.Timestamp.now();

  for (article of articles) {
    // console.log('article.name', article.name);
    const id = await makeFirebaseSafe(article.name);
    const docRef = chemicalsRef.doc(id);
    // console.log('product', JSON.stringify(article));
    // console.log('id', id);
    // console.log('TIMESTAMP', timestamp);

    batch.set(docRef, {
      ...article,
      timestamp,
    });
  }

  await batch.commit();

  // console.log(`Data has been written to Firebase for ${articles.length} articles`);

};

async function getTerpenes() {
  const chemicalsRef = db.collection('terpenes');
  const snapshot = await chemicalsRef.get();

  const chemicals = [];

  snapshot.forEach(doc => {
    const chemical = doc.data()
    chemicals.push(chemical);
  });

  return chemicals;
}

async function getUniqueChemicals() {

  const productsRef = db.collection('productsWithAssay');
  const snapshot = await productsRef.get();

  const cannabinoids = new Set();
  const terpenes = new Set();

  snapshot.forEach(doc => {
    const product = doc.data();
    product.cannabinoids?.forEach(cannabinoid => cannabinoids.add(cannabinoid.name));
    product.terpenes?.forEach(terpene => terpenes.add(terpene.name));
  });

  const c = Array.from(cannabinoids);
  const t = Array.from(terpenes);
  c.sort();
  t.sort();
  return { cannabinoids: c, terpenes: t }

}

if (require.main === module) {
  // console.log('This script is being executed directly by Node.js');
  (async () => {
    await cleanProductsCollections();
    await cleanProductsWithAssayCollection();
    console.log('deleted any duplicate');
  })();
}
/*
(async () => {
  const result = await getUniqueChemicals();
  // console.log(JSON.stringify(result, null, 2));
}
)();
*/


module.exports = {
  getTerpenes,
  saveArticles,
  saveProducts,
  getAllProducts,
  getIncompleteProducts,
  getCompleteProducts,
  getProductsByTitle,
  getProductsByVendor,
  cleanProductsCollections,
  cleanProductsWithAssayCollection,
  getNextBatchNumber,
  saveBatchRecord,
  getUniqueChemicals,
  getUniqueCannabinoids,
  getUniqueTerpenes,
  deleteAllDocumentsInCollection
};