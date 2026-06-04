// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAGTDu3mf97CJ5D-24a9DvbF6oDnMyboVs",
  authDomain: "voiceweb-cb081.firebaseapp.com",
  databaseURL: "https://voiceweb-cb081-default-rtdb.firebaseio.com",
  projectId: "voiceweb-cb081",
  storageBucket: "voiceweb-cb081.firebasestorage.app",
  messagingSenderId: "848535487258",
  appId: "1:848535487258:web:5912ef9d7c9d9f9a39a2a3",
  measurementId: "G-7BC2S8ZZFD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Only initialize analytics in production (or disable for development)
let analytics = null;
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  analytics = getAnalytics(app);
}

const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

// Export authentication functions
const createUser = createUserWithEmailAndPassword;
const signIn = signInWithEmailAndPassword;
const logOut = signOut;
const resetPassword = sendPasswordResetEmail;

export { 
  app, 
  db, 
  storage, 
  auth, 
  analytics,
  createUser,
  signIn,
  logOut,
  resetPassword,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail
};