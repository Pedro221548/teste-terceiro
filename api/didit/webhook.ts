import { getFirebaseAdmin } from "../lib/firebase-admin";
import crypto from "crypto";
import fs from "fs";
import path from "path";

// Helper to get raw body in Vercel
async function getRawBody(req: any) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const headers = req.headers;
  const rawBody = await getRawBody(req);
  const secret = process.env.DIDIT_CLIENT_SECRET || 'your-secret-here';

  console.log("Didit Webhook Headers (Vercel):", headers);
  
  // Parse body since we read the stream manually
  let body;
  try {
    body = JSON.parse(rawBody);
  } catch (e) {
    return res.status(400).json({ error: "Invalid JSON body" });
  }

  // Signature Verification (V2)
  const signatureV2 = headers['x-signature-v2'];
  const timestamp = headers['x-timestamp'];
  const isTest = headers['x-didit-test-webhook'] === 'true';

  if (!isTest && signatureV2 && timestamp) {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(timestamp + rawBody);
    const expectedSignature = hmac.digest('hex');

    if (signatureV2 !== expectedSignature) {
      console.warn("Invalid Didit Webhook Signature (Vercel)");
      return res.status(401).json({ error: "Invalid signature" });
    }
  }

  const { sessionId, status, result } = body;
  if (!sessionId && !isTest) return res.status(400).json({ error: "sessionId is required" });

  if (isTest) {
    console.log("Received Test Webhook from Didit (Vercel)");
    return res.json({ success: true, message: "Test webhook received" });
  }

  try {
    const admin = await getFirebaseAdmin();
    const configPath = path.join(process.cwd(), "firebase-applet-config.json");
    const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    const db = admin.firestore(config.firestoreDatabaseId);

    await db.collection('diditSessions').doc(sessionId).update({
      status: status === 'success' ? 'COMPLETED' : 'FAILED',
      result: result || {},
      updatedAt: new Date().toISOString()
    });
    res.json({ success: true });
  } catch (error: any) {
    console.error("Error handling Didit webhook in Vercel:", error);
    res.status(500).json({ error: error.message || "Failed to handle webhook" });
  }
}

// Disable body parsing to get raw body
export const config = {
  api: {
    bodyParser: false,
  },
};
