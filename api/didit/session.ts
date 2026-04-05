import { getFirebaseAdmin } from "../lib/firebase-admin";
import fs from "fs";
import path from "path";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { employeeId } = req.body;
  if (!employeeId) return res.status(400).json({ error: "employeeId is required" });

  try {
    const admin = await getFirebaseAdmin();
    
    // Read the config for the database ID
    const configPath = path.join(process.cwd(), "firebase-applet-config.json");
    const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    const db = admin.firestore(config.firestoreDatabaseId);
    
    const sessionId = `didit_${Math.random().toString(36).substr(2, 9)}`;
    const sessionUrl = `https://didit.me/verify/${sessionId}`; 

    await db.collection('diditSessions').doc(sessionId).set({
      employeeId,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    });

    res.json({ sessionId, sessionUrl });
  } catch (error: any) {
    console.error("Error creating Didit session in Serverless Function:", error);
    res.status(500).json({ error: error.message || "Failed to create Didit session" });
  }
}
