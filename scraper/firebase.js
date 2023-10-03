const admin = require('firebase-admin');

const { getApps, initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore');

const serviceAccount = require('../serviceAccountKey.json');

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
    appName: 'DankSpider'
  });
}

const db = getFirestore();

async function saveVendor(vendor) {
  const vendorRef = db.collection('vendors').doc(vendor.name);
  await vendorRef.set(vendor);

  const batch = db.batch();

  const timestamp = admin.firestore.Timestamp.now();

  await batch.commit();

}

async function saveProducts(products, batchId) {
  const batch = db.batch();
  const productsRef = db.collection('products');

  const timestamp = admin.firestore.Timestamp.now();

  products.forEach(product => {
    const docRef = productsRef.doc();

    batch.set(docRef, {
      ...product,
      batchId,
      timestamp,
    });
  });

  await batch.commit();

  console.log(`Data has been written to Firebase for ${products.length} ${products[0]?.vendor} products`);
}

async function updateVendor(vendor) {
  const vendorRef = db.collection('vendors').doc(vendor.name);
  await vendorRef.update(vendor);

  const batch = db.batch();

  const timestamp = admin.firestore.Timestamp.now();

  const snapshot = await vendorRef.collection('products').get();

  snapshot.forEach(doc => {
    batch.update(doc.ref, {
      vendor: {
        name: vendor.name,
        url: vendor.url,
      },
      timestamp,
    });
  });

  await batch.commit();

}

async function getVendor(name) {
  const vendorRef = db.collection('vendors').doc(name);
  const snapshot = await vendorRef.get();

  if (!snapshot.exists) {
    return null;
  }

  const vendor = snapshot.data();
  vendor.products = await getVendorProducts(name);

  return vendor;
}

async function getVendors() {
  const vendorsRef = db.collection('vendors');
  const snapshot = await vendorsRef.get();

  const vendors = [];

  snapshot.forEach(doc => {
    const vendor = doc.data();
    vendor.products = [];
    vendors.push(vendor);
  });

  return vendors;
}

async function getVendorProducts(vendorName) {
  const productsRef = db.collection('vendors').doc(vendorName).collection('products');
  const snapshot = await productsRef.get();

  const products = [];

  snapshot.forEach(doc => {
    const product = doc.data();
    product.vendor = {
      name: vendorName,
      url: doc.ref.parent.parent.id,
    };
    products.push(product);
  });

  return products;
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
  console.log(`getAllProducts() took ${((endTime - startTime) / 1000).toFixed(1)} seconds`);

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

async function getProductsWithoutAssay(vendor) {
  const productsRef = db.collection('products');
  const snapshot = await productsRef.where('vendor', '==', vendor).orderBy('assay').get();
  console.log(`Got ${snapshot.size} ${vendor} products without assays`)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function getProductsWithAssay(vendor) {
  const productsRef = db.collection('products');
  let snapshot;
  if (vendor) {
    snapshot = await productsRef.where('vendor', '==', vendor).where('assay', '!=', null).get();
  }
  else {
    snapshot = await productsRef.where('assay', '!=', null).get();
  }
  console.log(`Got ${snapshot.size} ${vendor} products with assays`)
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

async function getProductsByVendor(vendor) {
  const productsRef = db.collection('products');

  const snapshot = await productsRef.where('vendor', '==', vendor).get();

  console.log(`Goat ${snapshot.size} ${vendor}`)
  const products = [];

  snapshot.forEach(doc => {
    const product = doc.data()
    products.push(product);
  });

  return products;

}

module.exports = {
  saveVendor,
  updateVendor,
  getVendor,
  getVendors,
  getVendorProducts,
  saveProducts,
  getAllProducts,
  getProductsByTitle,
  getProductsWithAssay,
  getProductsWithoutAssay,
  getProductsByVendor
};