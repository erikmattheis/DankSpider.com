const admin = require('firebase-admin');

const { getApps, initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { makeFirebaseSafe, makeFirebaseSafeId, normalizeVariantName } = require('./strings.js');


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

  snapshot.forEach(doc => {
    const product = doc.data();
    if (product.variants) {
      product.variants.forEach(variant => normalizeVariantName(variant));

      doc.ref.update({ variants: product.variants });
    }
  });

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

async function saveProducts(products, batchId, useDev) {

  if (!products || !products.length) {
    return;
  }

  const batch = db.batch();
  const  productsRef = db.collection('products');

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

async function fixValues() {
  console.log('Starting fixValues...');
  const contentRef = db.collection('products');

  try {
    const snapshot = await contentRef.get();
    console.log('Got snapshot');

    // Handle potentially large collections
    let batch = db.batch();
    let operationCount = 0;

    snapshot.forEach((doc) => {
      console.log(`Processing document ${doc.id}...`);
      const chem = doc.data();
      chem.cannabinoids?.forEach(cannabinoid => {
        cannabinoid.pct = parseFloat(cannabinoid.pct);
      });
      chem.terpenes?.forEach(terpene => {
        terpene.pct = parseFloat(terpene.pct);
      });

      const terpenes = chem.terpenes?.map(terpene => {
        return { ...terpene, pct: parseFloat(terpene.pct) };
      });

      const cannabinoids = chem.cannabinoids?.map(cannabinoid => {
        return { ...cannabinoid, pct: parseFloat(cannabinoid.pct) };
      }
      );

      batch.update(doc.ref, { terpenes, cannabinoids });

      operationCount++;

      if (operationCount === 500) {
        console.log('Committing batch...');
        batch.commit();
        console.log('Batch committed, starting new batch');
        batch = db.batch();
        operationCount = 0;
      }
    });

    if (operationCount > 0) {
      console.log('Committing final batch...');
      await batch.commit();
      console.log('Final batch committed');
    }

  } catch (error) {
    console.error('Error in extractBodyChildren:', error);
  }
}


async function cleanProductsCollection() {
  const productsRef = db.collection('products');
  const archiveRef = db.collection('produtArchive');

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

async function saveStats(stats) {
  const statsRef = db.collection('stats').doc();
  const timestamp = admin.firestore.Timestamp.now();
  const statsData = {
    ...stats,
    timestamp,
  };

  await statsRef.set(statsData);
}

async function saveArticles(articles, collection) {
  const batch = db.batch();
  const chemicalsRef = db.collection(collection);

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
    console.log('No assays to save');
    return;
  }
  const batch = db.batch();
  const timestamp = admin.firestore.Timestamp.now();
  const assayssRef = db.collection('assays');
  for (const assay of assays) {
    const id = makeFirebaseSafe(`${vendor}-${assay.name}`);
    const docRef = assayssRef.doc(id);
    batch.set(docRef, {
      ...assay,
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

module.exports = {
  cleanProductsCollection,
  deleteAllDocumentsInCollection,
  deleteProductsWithObjectsInVariants,
  fixValues,
  getAllProducts,
  getCompleteProducts,
  getIncompleteProducts,
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
  getAssays
};