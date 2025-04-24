// src/lib/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Firebase konfigurasi
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Inisialisasi Firebase
let firebaseApp;

if (!getApps().length) {
  console.log("Initializing Firebase");
  firebaseApp = initializeApp(firebaseConfig);
} else {
  console.log("Firebase already initialized");
  firebaseApp = getApp();
}

// Inisialisasi Firestore
const db = getFirestore(firebaseApp);

// Inisialisasi Auth
const auth = getAuth(firebaseApp);
const googleProvider = new GoogleAuthProvider();

// Konfigurasi provider
googleProvider.setCustomParameters({
  prompt: "select_account",
});

console.log("Firebase initialized successfully");

export { db, auth, googleProvider };
