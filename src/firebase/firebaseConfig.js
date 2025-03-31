import { initializeApp } from "firebase/app";

import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration with fallback values
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyA8xGqT7XU1CHFX0EPegIlRrTz6-3bBVm8",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "authentication-app-dc9ac.firebaseapp.com",
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL || "https://authentication-app-dc9ac-default-rtdb.firebaseio.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "authentication-app-dc9ac",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "authentication-app-dc9ac.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "1054197026602",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:1054197026602:web:8d8b401f9dd47af8af5853"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
