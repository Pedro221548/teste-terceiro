import { getFirebaseAdmin } from "./lib/firebase-admin";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { email, password, displayName } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const admin = await getFirebaseAdmin();
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName,
    });
    console.log(`Successfully created new user: ${userRecord.uid}`);
    res.json({ uid: userRecord.uid });
  } catch (error: any) {
    console.error("Error creating user in Firebase Auth:", error);
    res.status(500).json({ error: error.message || "Failed to create user" });
  }
}
