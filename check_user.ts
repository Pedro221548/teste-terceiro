import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function check() {
  const q = query(collection(db, 'users'), where('email', '==', 'pedroass.11577@gmail.com'));
  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    console.log('No user document found for pedroass.11577@gmail.com');
  } else {
    snapshot.forEach(doc => {
      console.log('User doc:', doc.id, doc.data());
    });
  }
  process.exit(0);
}
check();
