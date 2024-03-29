const admin = require('firebase-admin');

const { getApps, initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { makeFirebaseSafe, makeFirebaseSafeId, normalizeVariantName, variantNameContainsWeightUnitString } = require('./strings.js');
const { lineToChemicalObject, stringContainsNonFlowerProduct } = require('./cortex.js');

const cheerio = require('cheerio');

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

db.settings({ ignoreUndefinedProperties: true });

async function getProductsWithTerpenes() {
  const productsRef = db.collection('products');
  const snapshot = await productsRef.get();

  const products = [];

  snapshot.forEach(doc => {
    const product = doc.data();
    if (product.terpenes && product.terpenes.some(p => p.pct > 0)) {
      console.log(`{product.title}: ${JSON.stringify(product.terpenes)}`);
      products.push(product);
    }
    // const t = Array.from(terpenes);
    // t.sort();
    //console.log(t);
    return products; variantNameContainsWeightUnitString
  });
  return products;
}

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
  const productsRef = db.collection('products');
  const snapshot = await productsRef.get();
  const docs = snapshot.docs.map(doc => doc.data());

  const filteredDocs = docs.filter(doc => doc.variants && doc.variants.includes(variant));

  return filteredDocs;
}

// Update all prodproducucts by having all product.variant[n].name match the normalized variant title. use normalizeVariantName() It's firebase

async function normalizeVariants() {
  const productsRef = db.collection('products');
  const snapshot = await productsRef.get();

  const updatePromises = [];

  snapshot.forEach(doc => {
    const product = doc.data();
    if (product.variants) {
      product.variants = product.variants.map(variant => normalizeVariantName(variant));
      product.variants = product.variants.filter(variant => !stringContainsNonFlowerProduct(variant));

      // Push the update operation into the array
      updatePromises.push(doc.ref.update({ variants: product.variants }));
    }
  });

  // Wait for all update operations to complete
  await Promise.all(updatePromises);
}

function findLargestImage(htmlString) {
  const $ = cheerio.load(htmlString);
  let largestImageUrl = '';
  let maxImageWidth = 0;

  $('img').each((i, img) => {
    const srcset = $(img).attr('srcset');
    if (srcset) {
      const sources = srcset.split(',').map(s => s.trim());
      sources.forEach(source => {
        const [url, width] = source.split(' ');
        const imageWidth = parseInt(width.replace('w', ''));
        if (imageWidth > maxImageWidth) {
          maxImageWidth = imageWidth;
          largestImageUrl = url;
        }
      });
    }
  });

  return largestImageUrl;
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
  const idSuffix = batchId || timestamp.toDate().toISOString();

  for await (const product of products) {
    const id = makeFirebaseSafeId(idSuffix, product, productsRef);
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

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function saveProducts(products, batchId = '000') {

  console.log('products', batchId)
  if (!products || !products.length) {
    return;
  }

  const batch = db.batch();
  const productsRef = db.collection('products');

  const timestamp = admin.firestore.Timestamp.now();
  const idSuffix = batchId || timestamp.toDate().toISOString();

  for (const product of products) {
    if (product?.title) {
      const id = makeFirebaseSafeId(idSuffix, product);
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
  console.log('after commit')
}

const { performance } = require('perf_hooks');

async function getAllProducts(collection = 'products') {

  const productsRef = db.collection(collection).orderBy('timestamp', 'desc');
  const snapshot = await productsRef.get();

  const products = [];
  const uniqueUrls = new Set();

  snapshot.forEach(doc => {
    const product = doc.data();
    if (product.url && uniqueUrls.has(product.url)) {
      return;
    }
    uniqueUrls.add(product.url);
    products.push(product);
  });

  // count all terpenes and cannabinoids
  const chemicals = new Set();

  products.forEach(product => {

    product.cannabinoids?.forEach(cannabinoid => chemicals.add(cannabinoid.name));
    product.terpenes?.forEach(terpene => chemicals.add(terpene.name));

  });

  console.log('unique chemicals', Array.from(chemicals).length);

  return products;
}

async function getIncompleteProducts() {

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
    if (!product.variants?.length || (!product.cannabinoids?.some(c => c.pct > 0.08) && !product.terpenes?.some(c => c.pct > 0.08))) {
      return;
    }
    uniqueUrls.add(product.url);
    products.push(product);
  });

  const endTime = performance.now();

  return products;
}

async function recalculateChemicalValues() {
  const contentRef = db.collection('products');

  try {
    const snapshot = await contentRef.get();

    // Handle potentially large collections
    let batch = db.batch();
    let operationCount = 0;

    snapshot.forEach((doc) => {
      const chem = doc.data();

      const cannabinoids = chem.cannabinoids?.map(c => {
        const obj = lineToChemicalObject(c.line, chem.vendor);
        obj.name = obj.name.replace(/Δ|∆|△/g, '∆');
        return { ...obj, pct: parseFloat(obj.pct) };
      });

      const terpenes = chem.terpenes?.map(t => {
        const obj = lineToChemicalObject(t.line, chem.vendor)
        return { ...obj, pct: parseFloat(obj.pct) };
      });

      batch.update(doc.ref, { terpenes, cannabinoids });

      operationCount++;

      if (operationCount === 500) {
        batch.commit();
        batch = db.batch();
        operationCount = 0;
      }

    });
    if (operationCount > 0) {
      // await batch.commit();
    }
  } catch (error) {
    console.error('Error in fixValues:', error);
  }
}

async function cleanProductsCollection() {
  const productsRef = db.collection('products');
  const archiveRef = db.collection('productArchive');

  const snapshot = await productsRef.orderBy('timestamp', 'desc').get();

  const products = [];
  const uniqueTitles = new Set();
  const dels = [];

  snapshot.forEach(doc => {
    const product = doc.data();

    if (product.a) {
      delete product.a;
    }

    const archiveDoc = archiveRef.doc(doc.id);

    if (uniqueTitles.has(product.title + product.vendor)) {
      products.push(archiveDoc.set(product));
      dels.push(doc.ref.delete());
    }
    uniqueTitles.add(product.title + product.vendor);
  });

  await Promise.all(dels);
}

async function getProductsByVendor(vendor, limit, useDev) {

  let productsRef;

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
    const product = doc.data();
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

async function saveStats(stats, config = {}) {
  const statsRef = db.collection('stats').doc();
  const timestamp = admin.firestore.Timestamp.now();
  const statsData = {
    stats,
    config,
    timestamp,
  };

  await statsRef.set(statsData);
}

async function getTestResults() {
  const testsRef = db.collection('tests');
  const snapshot = await testsRef.get();

  const tests = [];

  snapshot.forEach(doc => {
    const test = doc.data();
    tests.push(test);
  });

  return tests;
}


async function saveArticles(articles, collection) {
  const batch = db.batch();
  const chemicalsRef = db.collection(collection);

  const timestamp = admin.firestore.Timestamp.now();

  for await (const article of articles) {

    const id = await makeFirebaseSafe(article.name);
    const docRef = chemicalsRef.doc(id);


    batch.set(docRef, {
      ...article,
      timestamp,
    });
  }

  await batch.commit();

  console.log(`Data has been written to Firebase for ${articles.length} articles`);

};

async function deleteProductsByVendors(vendorNames, keepBatchIds = []) {
  for (const vendorName of vendorNames) {

    const productsRef = db.collection('products');

    const snapshot = await productsRef.get();

    const batch = db.batch();

    snapshot.forEach(doc => {
      const product = doc.data();

      if (keepBatchIds.includes(product.batchId)) {
        return
      }

      if (!vendorNames.includes(product.vendor)) {
        return;
      }

      batch.delete(doc.ref);

    }

    );
    console.log(`Deleted ${snapshot.size} products by vendor ${vendorName} `)
    await batch.commit();
  }
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

async function getProductsByVariant(variant) {
  const productsRef = db.collection('products');
  const snapshot = await productsRef.get();
  const docs = snapshot.docs.map(doc => doc.data());

  const filteredDocs = docs.filter(doc => doc.variants && doc.variants.includes(variant));

  return filteredDocs;
}

if (require.main === module) {
  logger.log({
    level: 'info',
    message: `This script is being executed directly by Node.js`
  });

  (async () => {
    await cleanProductsCollection();
    await cleanproductsCollection();
  })();

}


async function getProductsByBatchId(batchId) {
  const productsRef = db.collection('products');
  const snapshot = await productsRef.where('batchId', '==', batchId).get();

  const products = [];

  snapshot.forEach(doc => {
    const product = doc.data()
    products.push(product);
  });

  return products;
}

async function copyAndDeleteProducts(keepBatchIds) {
  const productsRef = db.collection('products');
  const secondCollectionRef = db.collection('products2');

  const snapshot = await productsRef.get();

  const batch = db.batch();

  snapshot.forEach(doc => {
    const product = doc.data();
    if (!doc.id) {
      return;
    }
    let id = doc.id.replace(/\%/g, '-');
    id = decodeURIComponent(id);
    //id = id.replace(/-/g, ' ');

    if (doc && !keepBatchIds.some(s => id.includes(s))) {
      const newDocRef = secondCollectionRef.doc(doc.id);
      batch.set(newDocRef, product);
      batch.delete(doc.ref);
    }

  });

  await batch.commit();
}

async function copyProducts(keepBatchIds = []) {
  const productsRef = db.collection('products');
  const secondCollectionRef = db.collection('products2');

  const snapshot = await productsRef.get();

  const batch = db.batch();

  snapshot.forEach(doc => {
    const product = doc.data();
    if (!doc.id) {
      return;
    }
    let id = doc.id.replace(/\%/g, '-');
    id = decodeURIComponent(id);
    //id = id.replace(/-/g, ' ');

    if (doc && !keepBatchIds.some(s => id.includes(s))) {
      const newDocRef = secondCollectionRef.doc(doc.id);
      batch.set(newDocRef, product);
    }

  });

  await batch.commit();
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

async function saveAssays(vendor, assays) {
  if (!assays || !assays.length) {
    return;
  }
  const batch = db.batch();
  const timestamp = admin.firestore.Timestamp.now();
  const assayssRef = db.collection('assays');
  for (const assay of assays) {
    const id = makeFirebaseSafe(`${vendor} -${assay.title} `);
    const docRef = assayssRef.doc(id);
    batch.set(docRef, {
      assay,
      vendor,
      timestamp
    });
  }

  try {
    await batch.commit();
    console.log('Batch commit successful');
  } catch (error) {
    console.error('Error committing batch', error);
  }
}



async function deleteNonFlowerProducts() {


  const productsRef = db.collection('products');

  const snapshot = await productsRef.get();

  const batch = db.batch();

  snapshot.forEach(doc => {
    const product = doc.data();

    if (stringContainsNonFlowerProduct(product.title)) {
      batch.delete(doc.ref);
    }
  });

  await batch.commit();

  console.log(`Maybe deleted non - flower products`)

}

async function deleteAssaysByVendors(vendorNames) {
  for (const vendorName of vendorNames) {

    const productsRef = db.collection('assays');

    const snapshot = await productsRef.get();

    const batch = db.batch();

    snapshot.forEach(doc => {
      const assay = doc.data();

      if (assay.vendor === vendorName) {
        batch.delete(doc.ref);
      }
    }

    );
    console.log(`Deleted ${snapshot.size} assays by vendor ${vendorName} `)
    await batch.commit();
  }
}

async function getAssays() {
  const assaysRef = db.collection('assays');
  const snapshot = await assaysRef.get();

  const assays = [];

  snapshot.forEach(doc => {
    const assay = doc.data();
    assays.push(assay);
  });

  return assays;
}

async function saveTest(result, image, config, batchId = 1000) {
  const testRef = db.collection('tests').doc();
  const timestamp = admin.firestore.Timestamp.now();
  const testData = {
    result,
    image,
    config,
    batchId,
    timestamp,
  };

  await testRef.set(testData);
}

module.exports = {
  cleanProductsCollection,
  copyAndDeleteProducts,
  deleteAllDocumentsInCollection,
  deleteProductsByVendors,
  recalculateChemicalValues,
  getAllProducts,
  getCompleteProducts,
  getNextBatchNumber,
  getProductsByBatchId,
  getProductsByVariant,
  getProductsByVendor,
  getUniqueCannabinoids,
  getUniqueChemicals,
  getUniqueTerpenes,
  normalizeVariants,
  saveArticles,
  saveStats,
  saveBatchRecord,
  saveProducts,
  saveAssays,
  getAssays,
  saveTest,
  copyProducts,
  deleteAssaysByVendors,
  deleteNonFlowerProducts,
  getProductsWithTerpenes,
  getTestResults
};
