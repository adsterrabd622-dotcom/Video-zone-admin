import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

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
const db = getFirestore(app);

async function check() {
  const snap = await getDocs(collection(db, "videos"));
  snap.docs.forEach(doc => {
    console.log(`Video ${doc.id}:`, doc.data());
  });
  
  process.exit(0);
}

check().catch(console.error);
