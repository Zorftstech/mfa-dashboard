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
  apiKey: 'AIzaSyBRQh0FdZo0Cq5F9ln0iWg1SnwjRqCkNWo',
  authDomain: 'myfoodangels-7711d.firebaseapp.com',
  projectId: 'myfoodangels-7711d',
  storageBucket: 'myfoodangels-7711d.appspot.com',
  messagingSenderId: '49313223918',
  appId: '1:49313223918:web:c61dff71c79bafcbd8cfff',
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const authFirebase = getAuth();
export const storage = getStorage();
export const db = getFirestore();
