const admin = require('firebase-admin');

const { getApps, initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore');
const { makeFirebaseSafe, makeFirebaseSafeId, normalizeCannabinoid, normalizeTerpene, normalizeVariantName } = require('./services/strings.js');


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

// find products with variant

async function getProductsByVariant(variant) {
  const results = [];
  const productsRef = db.collection('products');
  const snapshot = await productsRef.where('variants', 'array-contains', variant).get();
  snapshot.forEach(doc => {
    const product = doc.data();
    results.push(product);
  }
  );
  return results;
}

async function getProductsByPPM() {
  const results = [];
  const productsRef = db.collection('products');
  const snapshot = await productsRef.where('terpenes', '==', 'PPM').get();
  snapshot.forEach(doc => {
    const product = doc.data();
    results.push(product);
  });

  return results;
}

async function getProductsByTerpene(terpene) {
  const results = [];
  const productsRef = db.collection('products');
  const snapshot = await productsRef.where('terpenes', 'array-contains', { name: terpene }).get();
  snapshot.forEach(doc => {
    const product = doc.data();
    results.push(product);
  });
  return results;
}

// Update all prodproducucts by having all product.variant[n].name match the normalized variant title. use normalizeVariantName() It's firebase

async function normalizeVariants() {
  const productsRef = db.collection('products');
  const snapshot = await productsRef.get();

  snapshot.forEach(doc => {
    const product = doc.data();
    if (product.variants) {
      product.variants.forEach(variant => normalizeVariantName(variant));

      doc.ref.update({ variants: product.variants });
    }
  });

}

async function thinkAboutTerpenes() {
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
      doc.ref.update({ terpenes: product.terpenes });
    }
  });

}

async function thinkAboutCannabinoids() {
  const productsRef = db.collection('products');
  const snapshot = await productsRef.get();
  snapshot.forEach(doc => {
    const product = doc.data();
    if (product.cannabinoids) {
      product.cannabinoids.forEach(cannabinoid => {
        const name = normalizeCannabinoid(cannabinoid.name, product.url);
        if (name) {
          cannabinoid.name = name;
        }
      });
      doc.ref.update({ cannabinoids: product.cannabinoids });
    }
  });
}

async function getUniqueCannabinoids() {
  const productsRef = db.collection('products');

  const unique = new Set();
  const examples = [];

  const snapshot = await productsRef.get();

  snapshot.forEach(doc => {
    const product = doc.data();

    product.cannabinoids?.forEach(cannabinoid => {
      if (!unique.has(cannabinoid.name)) {
        unique.add(cannabinoid.name);
        examples.push({ name: cannabinoid.name, url: product.url });
      }
    });
  });

  return examples;
}

async function saveChemicals(products, batchId, useDev) {
  const batch = db.batch();
  let productsRef;
  if (useDev) {
    productsRef = db.collection('products');
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

}

async function getProductById(id) {
  const docRef = db.collection('products').doc(id);
  const doc = await docRef.get();
  return doc.data();
}


// find firebase doc x8-undefined-undefined-0, it is an array, send that array to saveProducts
async function fixProducts() {
  const data = await getProductsByVendor('WNC');

  const fixedProducts = [];
  for (const product of data) {
    if (product.terpenes) {
      const terpenes = product.terpenes.map(terpene => normalizeTerpene(terpene.product.url));
      const cannabinoids = product.cannabinoids.map(cannabinoid => normalizeCannabinoid(cannabinoid, product.url));
      const fixed = { ...product, terpenes, cannabinoids, variants };

      fixedProducts.push(fixed);
    }
  }
  await saveProducts(fixedProducts, 'z0');
}

async function saveProducts(products, batchId, useDev) {
  const batch = db.batch();
  let productsRef;
  if (useDev) {
    productsRef = db.collection('products');
  }
  else {
    productsRef = db.collection('products');
  }

  const timestamp = admin.firestore.Timestamp.now();
  const idPrefix = batchId || timestamp.toDate().toISOString();

  for (const product of products) {
    if (product?.title) {
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
    }
  };

  await batch.commit();

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

  return products;
}

async function getIncompleteProducts() {
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
    if (product.cannabinoids?.length && product.terpenes?.length) {
      return;
    }
    uniqueUrls.add(product.url);
    products.push(product);
  });

  const endTime = performance.now();

  return products;
}

async function getCompleteProducts() {
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
    if (!product.cannabinoids?.length || !product.terpenes?.length) {
      return;
    }
    uniqueUrls.add(product.url);
    products.push(product);
  });

  const endTime = performance.now();

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
  const productsRef = db.collection('products');
  const archiveRef = db.collection('product');

  const snapshot = await productsRef.orderBy('timestamp', 'desc').get();

  const products = [];
  const uniqueTitles = new Set();
  const dels = [];

  snapshot.forEach(doc => {
    const product = doc.data();
    if (uniqueTitles.has(product.title + product.vendor)) {
      const archiveDoc = archiveRef.doc(doc.id);
      products.push(archiveDoc.set(product));
      dels.push(doc.ref.delete());
    }
    uniqueTitles.add(product.title + product.vendor);
  });

  await Promise.all(dels);
}

async function cleanProductsCollection() {

  const productsRef = db.collection('products');
  const archiveRef = db.collection('productArchive');

  const snapshot = await productsRef.orderBy('timestamp', 'desc').get();

  const actions = [];
  const uniqueUrls = new Set();

  snapshot.forEach(doc => {
    const product = doc.data();
    if (true || uniqueUrls.has(product.url)) {
      const archiveDoc = archiveRef.doc(doc.id);
      actions.push(archiveDoc.set(product));
      actions.push(doc.ref.delete());
    }
    uniqueUrls.add(product.url);
  });

  await Promise.all(actions);
}

async function getProductsByVendor(vendor, limit, useDev) {

  let productRef;

  if (useDev) {
    productsRef = db.collection('products');
  }
  else {
    productsRef = db.collection('products');
  }

  let snapshot;
  if (limit && vendor) {
    snapshot = await productsRef.where('vendor', '==', vendor).limit(limit).get();
  }
  else if (vendor) {
    snapshot = await productsRef.where('vendor', '==', vendor).get();
  }
  else {
    snapshot = await productsRef.get();
  }

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

  for (const article of articles) {

    const id = await makeFirebaseSafe(article.name);
    const docRef = chemicalsRef.doc(id);


    batch.set(docRef, {
      ...article,
      timestamp,
    });
  }

  await batch.commit();

  //  log(`Data has been written to Firebase for ${articles.length} articles`);

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

  const productsRef = db.collection('products');
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


async function deleteProductsByVendor(vendor) {
  const productsRef = db.collection('products');
  const snapshot = await productsRef.where('vendor', '==', vendor).get();

  const products = [];
  const dels = [];

  snapshot.forEach(doc => {
    const product = doc.data();
    products.push(product);
    dels.push(doc.ref.delete());
  });

  await Promise.all(dels);
  return products;
}
// select products where variants is an array of objects, the should be String. The objects have a name property.

async function deleteProductsWithObjectsInVariants() {
  const productsRef = db.collection('products');
  const snapshot = await productsRef.get();

  const products = [];
  const dels = [];

  snapshot.forEach(doc => {
    const product = doc.data();
    if (product.variants && product.variants.some(variant => typeof variant !== 'string')) {
      products.push(product);
      dels.push(doc.ref.delete());
    }
  });
  await Promise.all(dels);
  return products;
}

if (require.main === module) {
  logger.log({
  level: 'info',
  message: `This script is being executed directly by Node.js`});

  (async () => {
    await cleanProductsCollections();
    await cleanproductsCollection();
  })();

}


async function getProductsByBatchId(batchId) {
  const productsRef = db.collection('productsArchive');
  const snapshot = await productsRef.where('batchId', '==', batchId).get();

  const products = [];

  snapshot.forEach(doc => {
    const product = doc.data()
    products.push(product);
  });

  return products;
}

async function getExampleRecordWithUniqueChemicalAsCannabinoid(name) {
  const productsRef = db.collection('products');
  const snapshot = await productsRef.get();
  const products = [];
  const product = snapshot.forEach(doc => {
    const data = doc.data();
    if (data.cannabinoids && data.cannabinoids.some(cannabinoid => cannabinoid.name === name)) {
      products.push(data);
    }
  });

  return product
}

module.exports = {
  getTerpenes,
  thinkAboutTerpenes,
  saveArticles,
  saveProducts,
  getAllProducts,
  getIncompleteProducts,
  getCompleteProducts,
  getProductsByTitle,
  getProductsByVendor,
  cleanProductsCollections,
  cleanProductsCollection,
  getNextBatchNumber,
  saveBatchRecord,
  getUniqueChemicals,
  getUniqueCannabinoids,
  getUniqueTerpenes,
  deleteAllDocumentsInCollection,
  deleteProductsByVendor,
  normalizeVariants,
  getProductsByVariant,
  getProductsByTerpene,
  getProductsByPPM,
  thinkAboutCannabinoids,
  deleteProductsWithObjectsInVariants,
  fixProducts,
  getProductsByBatchId,
  getExampleRecordWithUniqueChemicalAsCannabinoid
};