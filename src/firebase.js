import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
const firebaseConfig = {
  apiKey: "AIzaSyA2WauxIRuNMGDO71KY6IgMJKVHr3ahrgg",
  authDomain: "tilawah-tracker-2beeb.firebaseapp.com",
  projectId: "tilawah-tracker-2beeb",
  storageBucket: "tilawah-tracker-2beeb.firebasestorage.app",
  messagingSenderId: "402910286144",
  appId: "1:402910286144:web:5c9d7aa26949e65fa6eaa5",
  measurementId: "G-1CWTXDKXNG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
