import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, sendPasswordResetEmail } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, getDocFromServer, doc } from 'firebase/firestore';
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import firebaseConfig from '../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
}, (firebaseConfig as any).firestoreDatabaseId);

let messagingInstance: any = null;
try {
  messagingInstance = getMessaging(app);
} catch (e) {
  console.warn("Firebase Messaging could not be initialized. It might not be supported in this browser environment.", e);
}
export const messaging = messagingInstance;

export const generateToken = async () => {
  if (!messaging) return null;
  try {
    await navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: '/' });
    const swReg = await navigator.serviceWorker.ready;
    const token = await getToken(messaging, {
      vapidKey: 'BNllv5gxpVUvOlkDdbQLxxIwkmXcCArF-3e8S7Y-kc1D51qExP2Bc4FTw7BaQ1KmzeJF-nd80nn4BbHS1BR34G4',
      serviceWorkerRegistration: swReg
    });
    return token;
  } catch (error) {
    console.error('An error occurred while retrieving token. ', error);
    return null;
  }
}
export { onMessage };

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
