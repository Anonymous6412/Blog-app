import { initializeApp } from "firebase/app";

import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA8xGqT7XU1CHFX0EPegIlRrTz6-3bBVm8",
  authDomain: "authentication-app-dc9ac.firebaseapp.com",
  databaseURL: "https://authentication-app-dc9ac-default-rtdb.firebaseio.com",
  projectId: "authentication-app-dc9ac",
  storageBucket: "authentication-app-dc9ac.firebasestorage.app",
  messagingSenderId: "1054197026602",
  appId: "1:1054197026602:web:8d8b401f9dd47af8af5853"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
