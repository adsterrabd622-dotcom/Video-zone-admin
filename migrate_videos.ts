import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc, deleteField } from 'firebase/firestore';

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

async function migrate() {
  const snap = await getDocs(collection(db, "videos"));
  for (const videoDoc of snap.docs) {
    const data = videoDoc.data();
    const updatePayload: any = {};
    let needsUpdate = false;
    
    if ('adLinks' in data) {
      updatePayload.adLinks = deleteField();
      needsUpdate = true;
    }
    
    if (data.targetLink === 'https://google.com') {
      updatePayload.targetLink = 'https://google.com/updated_target'; // Just so it's not the exact same. Or simply tell the user to update the secret link.
    }
    
    if (needsUpdate) {
      console.log(`Migrating video ${videoDoc.id}...`);
      await updateDoc(doc(db, "videos", videoDoc.id), updatePayload);
    }
  }
  
  console.log("Done.");
  process.exit(0);
}

migrate().catch(console.error);
