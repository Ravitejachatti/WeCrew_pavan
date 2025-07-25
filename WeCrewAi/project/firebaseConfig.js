// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCkjrDcOytxcaIqILHcLvjphOPpbVqtJEM",
  authDomain: "learnelevate-1db86.firebaseapp.com",
  databaseURL: "https://learnelevate-1db86-default-rtdb.firebaseio.com",
  projectId: "learnelevate-1db86",
  storageBucket: "learnelevate-1db86.firebasestorage.app",
  messagingSenderId: "1037877959378",
  appId: "1:1037877959378:web:360f10129e8f040f396b0b",
  measurementId: "G-D2RG0XFKFY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const analytics = getAnalytics(app);

export { db };