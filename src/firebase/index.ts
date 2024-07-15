import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAI7ZmwJPhhtBUFEhxu9D8lOPsxKoySO2k',
  authDomain: 'mfa-1d165.firebaseapp.com',
  projectId: 'mfa-1d165',
  storageBucket: 'mfa-1d165.appspot.com',
  messagingSenderId: '588241135226',
  appId: '1:588241135226:web:5c5e36b6c6e4c8663cbdc3',
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const authFirebase = getAuth();
export const storage = getStorage();
export const db = getFirestore();
