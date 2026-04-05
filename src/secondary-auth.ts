import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize a secondary Firebase app to create users without signing out the current user
const secondaryApp = initializeApp(firebaseConfig, 'Secondary');
const secondaryAuth = getAuth(secondaryApp);

export const createNewUser = async (email: string, pass: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, pass);
    const uid = userCredential.user.uid;
    
    // Sign out from the secondary app immediately to keep it clean
    await signOut(secondaryAuth);
    
    return uid;
  } catch (error) {
    console.error("Error in secondary auth creation:", error);
    throw error;
  }
};
