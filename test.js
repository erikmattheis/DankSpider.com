const { initializeApp } = require('firebase/app');
const { getDatabase, ref, set } = require('firebase/database');

// Initialize the Firebase app
const firebaseConfig = {
  apiKey: "AIzaSyDP3FyaOxZL8VSyKaJYI_WddOsShv2jd5I",
  authDomain: "dankspider-75eb9.firebaseapp.com",
  databaseURL: "https://dankspider-75eb9-default-rtdb.firebaseio.com",
  projectId: "dankspider-75eb9",
  storageBucket: "dankspider-75eb9.appspot.com",
  messagingSenderId: "698229481619",
  appId: "1:698229481619:web:565da194556510cc696d66",
  measurementId: "G-1R8ZDWL3XJ"
};
const app = initializeApp(firebaseConfig);
console.log('app', app);
// Get a reference to the Firebase Realtime Database
const db = getDatabase(app);

// Save a string to the database
const messageRef = ref(db, 'emails');

set(messageRef, 'Hello, Firebase!')
  .then(() => {
    console.log('Message saved to the database');
  })
  .catch((error) => {
    console.error('Error saving message to the database:', error);
  });