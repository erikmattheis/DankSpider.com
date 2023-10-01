

const { initializeApp } = require('firebase/app');
const { getDatabase, ref, push, onValue } = require('firebase/database');
const axios = require('../../src/services/rateLimitedAxios');

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "dankspider-75eb9.firebaseapp.com",
  databaseURL: "https://dankspider-75eb9-default-rtdb.firebaseio.com",
  projectId: "dankspider-75eb9",
  storageBucket: "dankspider-75eb9.appspot.com",
  messagingSenderId: "698229481619",
  appId: "1:698229481619:web:565da194556510cc696d66",
  measurementId: "G-1R8ZDWL3XJ"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const { Firestore } = require('@google-cloud/firestore');

exports.handler = async function (event, context) {

  const firestore = new Firestore();

  async function createCollection() {
    const collectionRef = firestore.collection('emails');
    await collectionRef.doc('email').set({ email: 'gozz@gozz.com' });
  }

  async function testCollectionExists() {
    const collections = await firestore.listCollections();
    const collectionExists = collections.some((collection) => collection.id === 'emails');
    if (collectionExists) {
      console.log('Collection already exists');
    } else {
      console.log('Collection does not exist');
      await createCollection();
    }
  }

  await testCollectionExists();


  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  try {

    const emailRef = ref(db, 'emails');
    const email = JSON.parse(event.body).email;
    await push(emailRef, email);

    return {
      statusCode: 200,
      body: JSON.stringify({ response: 'Email added' })
    };

  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: 'An error occurred' };

  }

}






