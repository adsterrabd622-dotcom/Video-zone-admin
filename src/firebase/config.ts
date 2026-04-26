import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCg215OeSLZyDuKCNXnNPYEpYPrs5pZdq4",
  authDomain: "ideo-zone.firebaseapp.com",
  projectId: "ideo-zone",
  storageBucket: "ideo-zone.firebasestorage.app",
  messagingSenderId: "568630052024",
  appId: "1:568630052024:web:45251a60c0c5b6c421e04d",
  measurementId: "G-1RSVKF3JZT"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
