const { saveProducts } = require('./firebase.js');
const admin = require('firebase-admin');

const preston = require('./vendors/preston.js');
const flow = require('./vendors/flow.js');
const wnc = require('./vendors/wnc.js');
const enlighten = require('./vendors/enlighten.js');
const topcola = require('./vendors/topcola.js');
const arete = require('./vendors/arete.js');

const fs = require('fs');
let wasError = false;

function logErrorToFile(str) {
  wasError = true;
  if (process.env.NODE_ENV === 'development') {
    fs.appendFileSync('errors.txt', str + '\n\n\n');
  }
}

async function sendErrorEmail(error) {
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
    // console.log('Email sent successfully');
  } catch (err) {
    console.error('Error sending email:', err);
  }
}

async function run(uuid) {

  try {
    const areteProducts = await arete.getAvailableLeafProducts();
    // console.log('artete products', areteProducts.length);
    await saveProducts(areteProducts, uuid);
  } catch (error) {
    console.error(error);
    await sendErrorEmail(error);
    logErrorToFile(error);
  }

  try {
    const prestonProducts = await preston.getAvailableLeafProducts();
    // console.log('preston products', prestonProducts.length);
    await saveProducts(prestonProducts, uuid);
  } catch (error) {
    console.error(error);
    await sendErrorEmail(error);
    logErrorToFile(error);
  }

  try {
    const flowProducts = await flow.getAvailableLeafProducts();
    // console.log('flow products', flowProducts.length);
    await saveProducts(flowProducts, uuid);
  } catch (error) {
    console.error(error);
    await sendErrorEmail(error);
    logErrorToFile(error);
  }

  try {
    const wncProducts = await wnc.getAvailableLeafProducts();
    // console.log('wnc products', wncProducts.length);
    await saveProducts(wncProducts, uuid);
  } catch (error) {
    console.error(error);
    await sendErrorEmail(error);
    logErrorToFile(error);
  }

  try {
    const enlightenProducts = await enlighten.getAvailableLeafProducts();
    // console.log('enlighten products', enlightenProducts.length);
    await saveProducts(enlightenProducts, uuid);
  } catch (error) {
    console.error(error);
    await sendErrorEmail(error);
    logErrorToFile(error);
  }

  try {
    const topcolaProducts = await topcola.getAvailableLeafProducts();
    // console.log('top cola products', topcolaProducts.length);
    await saveProducts(topcolaProducts, uuid);
  } catch (error) {
    console.error(error);
    await sendErrorEmail(error);
    logErrorToFile(error);

  }
  // console.log(`Data has been written to Firebase for all vendors.`);
}

module.exports = {
  run
};