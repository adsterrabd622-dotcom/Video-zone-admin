import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

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

async function sync() {
  const snap1 = await getDoc(doc(db, "adSettings", "global_settings"));
  if (snap1.exists()) {
    const data = snap1.data();
    await setDoc(doc(db, "settings", "ads"), {
      directLinkUrl: data.globalAdLink,
      popunderScript: data.popunder,
      socialBarScript: data.socialBar,
      bannerAdScript: data.banner728x90,
    }, { merge: true });
    console.log("Synced globalAdLink to settings/ads");
  }
}

sync().catch(console.error);
