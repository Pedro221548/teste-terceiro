import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, sendPasswordResetEmail } from 'firebase/auth';
import { getFirestore, getDocFromServer, doc, enableMultiTabIndexedDbPersistence } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);

// Habilitar persistência offline (Cache)
enableMultiTabIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Múltiplas abas abertas, persistência ativada em apenas uma.');
  } else if (err.code === 'unimplemented') {
    console.warn('Navegador não suporta persistência offline.');
  }
});

export const googleProvider = new GoogleAuthProvider();
export { sendPasswordResetEmail };

async function testConnection() {
  try {
    const docRef = doc(db, 'test', 'connection');
    await getDocFromServer(docRef);
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firebase client is currently offline. This may be expected during initial load or if there's a temporary network issue.");
    } else {
      console.error("Firebase connection test failed with error:", error);
    }
  }
}
testConnection();
