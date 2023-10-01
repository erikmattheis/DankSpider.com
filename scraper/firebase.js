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

  console.log(`Data has been written to Firebase for ${vendor.name} vendor and their products`);
}

async function saveProducts(products) {
  const batch = db.batch();
  const productsRef = db.collection('products');

  const timestamp = admin.firestore.Timestamp.now();

  products.forEach(product => {
    const docRef = productsRef.doc();
    batch.set(docRef, {
      ...product,
      timestamp,
    });
  });

  await batch.commit();

  console.log(`Data has been written to Firebase for ${products.length} products`);
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

  console.log(`Data has been updated in Firebase for ${vendor.name} vendor and their products`);
}

async function getVendor(name) {
  const vendorRef = db.collection('vendors').doc(name);
  const snapshot = await vendorRef.get();

  if (!snapshot.exists) {
    console.log(`Vendor ${name} does not exist`);
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

async function getAllProducts() {
  const productsRef = db.collection('products');
  const snapshot = await productsRef.get();

  const products = [];

  snapshot.forEach(doc => {
    const product = doc.data();
    product.vendor = {
      name: doc.data().vendor.name,
      url: doc.data().vendor.url,
    };
    products.push(product);
  });

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

module.exports = {
  saveVendor,
  updateVendor,
  getVendor,
  getVendors,
  getVendorProducts,
  saveProducts,
  getAllProducts,
  getProductsByTitle
};