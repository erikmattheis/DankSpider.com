const { getApps, initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore');

const serviceAccount = require('../../../serviceAccountKey.json');

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
    appName: 'DankSpider'
  });
}

const db = getFirestore()

async function addEmail(email) {
  const collectionRef = db.collection('emails');
  const docRef = collectionRef.doc();
  const timestamp = Timestamp.now();
  const data = {
    email: email,
    createdAt: timestamp,
    updatedAt: timestamp
  };
  await docRef.set(data);
}

exports.handler = async function (event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  try {
    const email = JSON.parse(event.body).email;

    console.log('email', email)
    await addEmail(email);
    return {
      statusCode: 200,
      body: JSON.stringify({ response: 'Email added' })
    };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: 'An error occurred' };
  }
}