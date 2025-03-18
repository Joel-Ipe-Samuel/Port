// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth,GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBLL0NsFzJDylMOM0_M0S6P42pHIe7g1Bg",
  authDomain: "mental-3809d.firebaseapp.com",
  projectId: "mental-3809d",
  storageBucket: "mental-3809d.firebasestorage.app",
  messagingSenderId: "963007528858",
  appId: "1:963007528858:web:a52c6b75f30330a6f50423",
  measurementId: "G-KC8F4NQZPE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider(auth)
export const db=getFirestore(app)
export default auth;
