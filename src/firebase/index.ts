import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';

// const firebaseConfig = {
//   apiKey: process.env.REACT_APP_FIREBASE_KEY,
//   authDomain: "chat-ab746.firebaseapp.com",
//   projectId: "chat-ab746",
//   storageBucket: "chat-ab746.appspot.com",
//   messagingSenderId: "901216368405",
//   appId: "1:901216368405:web:8ec942ee51611df5c49b1c",
// };
const firebaseConfig = {
 apiKey: "AIzaSyAsTTkF8IhgzsNuDwiR-cnBXT7vMeM5v3g",
  authDomain: "my-food-angels-9f9ca.firebaseapp.com",
  projectId: "my-food-angels-9f9ca",
  storageBucket: "my-food-angels-9f9ca.appspot.com",
  messagingSenderId: "793918696364",
  appId: "1:793918696364:web:ba7227a170a0e76cb86809"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const authFirebase = getAuth();
export const storage = getStorage();
export const db = getFirestore();
