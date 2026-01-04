/**
 * File         : docs/scripts/firebase.js
 * Description  : Firebase connect logic.
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBqVacqxDp5FEupmQ_NZSKljeH2ylCDvfs",
  authDomain: "strivers-opensheet-dsa.firebaseapp.com",
  projectId: "strivers-opensheet-dsa",
  storageBucket: "strivers-opensheet-dsa.firebasestorage.app",
  messagingSenderId: "1062727710444",
  appId: "1:1062727710444:web:4e05489bd52c2d2abc57c9",
  measurementId: "G-WXCHXB9C4R",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
