import { initializeApp } from "firebase/app";

import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration with fallback values
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyDLVlMQgdaEqEep8vPwD2fxJhFcr6QeNV0",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "blog-app-97d50.firebaseapp.com",
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL || "https://blog-app-97d50-default-rtdb.firebaseio.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "blog-app-97d50",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "blog-app-97d50.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "183100232616",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:183100232616:web:2eaea1ec69bede55dbdbb0"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
