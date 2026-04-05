import { getFirebaseAdmin } from "./lib/firebase-admin";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { uid, email } = req.body;
  if (!uid && !email) {
    return res.status(400).json({ error: "UID or Email is required" });
  }

  try {
    const admin = await getFirebaseAdmin();
    
    if (uid) {
      try {
        await admin.auth().deleteUser(uid);
        return res.json({ success: true });
      } catch (error: any) {
        if (error.code !== 'auth/user-not-found') throw error;
      }
    }

    if (email) {
      try {
        const userRecord = await admin.auth().getUserByEmail(email);
        await admin.auth().deleteUser(userRecord.uid);
        return res.json({ success: true });
      } catch (error: any) {
        if (error.code !== 'auth/user-not-found') throw error;
      }
    }

    res.json({ success: true, message: "User not found in Auth, nothing to delete" });
  } catch (error: any) {
    console.error("Error deleting user from Firebase Auth:", error);
    res.status(500).json({ error: error.message || "Failed to delete user" });
  }
}
