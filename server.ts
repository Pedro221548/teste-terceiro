import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import admin from "firebase-admin";
import axios from "axios";
import crypto from "crypto";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize Firebase Admin SDK inside startServer
  try {
    if (admin.apps.length === 0) {
      const fs = await import("fs");
      const config = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf-8"));
      
      console.log("Initializing Firebase Admin with project ID:", config.projectId);
      
      // Explicitly set the project ID in the environment to help the SDK
      process.env.GOOGLE_CLOUD_PROJECT = config.projectId;
      
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: config.projectId,
      });
      
      console.log("Firebase Admin initialized successfully.");
    }
  } catch (error) {
    console.error("Error initializing Firebase Admin:", error);
  }

  app.use(express.json({
    verify: (req: any, res, buf) => {
      req.rawBody = buf.toString();
    }
  }));

  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  console.log("NODE_ENV:", process.env.NODE_ENV);

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", env: process.env.NODE_ENV });
  });

  app.post("/api/create-user", async (req, res) => {
    console.log("Received POST request to /api/create-user");
    const { email, password, displayName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    try {
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
  });

  app.post("/api/delete-user", async (req, res) => {
    console.log("Received POST request to /api/delete-user");
    console.log("Request body:", req.body);
    
    const { uid, email } = req.body;
    if (!uid && !email) {
      console.warn("Delete request missing both UID and Email");
      return res.status(400).json({ error: "UID or Email is required" });
    }

    try {
      if (uid) {
        console.log(`Attempting to delete user by UID: ${uid}`);
        try {
          await admin.auth().deleteUser(uid);
          console.log(`Successfully deleted user ${uid} from Firebase Auth`);
          return res.json({ success: true });
        } catch (error: any) {
          if (error.code !== 'auth/user-not-found') throw error;
          console.log(`User UID ${uid} not found in Auth.`);
        }
      }

      if (email) {
        console.log(`Attempting to delete user by Email: ${email}`);
        try {
          const userRecord = await admin.auth().getUserByEmail(email);
          await admin.auth().deleteUser(userRecord.uid);
          console.log(`Successfully deleted user with email ${email} (UID: ${userRecord.uid}) from Firebase Auth`);
          return res.json({ success: true });
        } catch (error: any) {
          if (error.code !== 'auth/user-not-found') throw error;
          console.log(`User email ${email} not found in Auth.`);
        }
      }

      res.json({ success: true, message: "User not found in Auth, nothing to delete" });
    } catch (error: any) {
      console.error("Error deleting user from Firebase Auth:", error);
      res.status(500).json({ error: error.message || "Failed to delete user" });
    }
  });

  app.post("/api/didit/session", async (req, res) => {
    const { employeeId } = req.body;
    if (!employeeId) return res.status(400).json({ error: "employeeId is required" });

    try {
      // In a real scenario, you'd call Didit API here.
      // For now, we'll simulate the session creation and return a mock URL.
      // The user can replace this with actual Didit API calls.
      
      const sessionId = `didit_${Math.random().toString(36).substr(2, 9)}`;
      // This URL would normally be provided by Didit
      const sessionUrl = `https://didit.me/verify/${sessionId}`; 

      await admin.firestore().collection('diditSessions').doc(sessionId).set({
        employeeId,
        status: 'PENDING',
        createdAt: new Date().toISOString()
      });

      res.json({ sessionId, sessionUrl });
    } catch (error: any) {
      console.error("Error creating Didit session:", error);
      res.status(500).json({ error: error.message || "Failed to create Didit session" });
    }
  });

  app.post("/api/didit/webhook", async (req: any, res) => {
    const headers = req.headers;
    const rawBody = req.rawBody || '';
    const secret = process.env.DIDIT_CLIENT_SECRET || 'your-secret-here';

    console.log("Didit Webhook Headers:", headers);
    console.log("Didit Webhook Body:", req.body);

    // Signature Verification (V2)
    const signatureV2 = headers['x-signature-v2'];
    const timestamp = headers['x-timestamp'];
    const isTest = headers['x-didit-test-webhook'] === 'true';

    if (!isTest && signatureV2 && timestamp) {
      const hmac = crypto.createHmac('sha256', secret);
      hmac.update(timestamp + rawBody);
      const expectedSignature = hmac.digest('hex');

      if (signatureV2 !== expectedSignature) {
        console.warn("Invalid Didit Webhook Signature");
        return res.status(401).json({ error: "Invalid signature" });
      }
    }

    const { sessionId, status, result } = req.body;
    if (!sessionId && !isTest) return res.status(400).json({ error: "sessionId is required" });

    if (isTest) {
      console.log("Received Test Webhook from Didit");
      return res.json({ success: true, message: "Test webhook received" });
    }

    try {
      await admin.firestore().collection('diditSessions').doc(sessionId).update({
        status: status === 'success' ? 'COMPLETED' : 'FAILED',
        result: result || {},
        updatedAt: new Date().toISOString()
      });
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error handling Didit webhook:", error);
      res.status(500).json({ error: error.message || "Failed to handle webhook" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  // Global error handler
  app.use((err: any, req: any, res: any, next: any) => {
    console.error("Global error handler caught:", err);
    res.status(500).json({ error: err.message || "Internal Server Error" });
  });
}

startServer();
