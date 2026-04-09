import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import admin from "firebase-admin";
import axios from "axios";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

export async function createServer() {
  const app = express();

  // Initialize Firebase Admin SDK
  try {
    if (admin.apps.length === 0) {
      const fs = await import("fs");
      const configPath = path.join(process.cwd(), "firebase-applet-config.json");
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
        console.log("Initializing Firebase Admin with project ID:", config.projectId);
        process.env.GOOGLE_CLOUD_PROJECT = config.projectId;
        admin.initializeApp({
          credential: admin.credential.applicationDefault(),
          projectId: config.projectId,
        });
        console.log("Firebase Admin initialized successfully.");
      } else {
        console.warn("firebase-applet-config.json not found. Firebase Admin might not work correctly.");
      }
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

  // Didit API Endpoints
  app.post("/api/didit/create-session", async (req, res) => {
    try {
      const { employeeId, agencyId, type, location, accessPointId } = req.body;

      if (!employeeId || !agencyId || !type) {
        return res.status(400).json({ error: "Missing required fields (employeeId, agencyId, type)" });
      }

      const apiKey = process.env.DIDIT_API_KEY;
      const workflowId = process.env.DIDIT_WORKFLOW_ID;

      if (!apiKey || !workflowId) {
        console.error("Missing Didit environment variables: DIDIT_API_KEY or DIDIT_WORKFLOW_ID");
        return res.status(500).json({ error: "Server configuration error: Missing Didit credentials" });
      }

      const db = admin.firestore();
      const checkInRef = db.collection("checkIns").doc();
      const checkInId = checkInRef.id;

      // Create pending check-in
      await checkInRef.set({
        id: checkInId,
        employeeId,
        agencyId,
        type,
        location: location || "N/A",
        accessPointId: accessPointId || "N/A",
        timestamp: new Date().toISOString(),
        status: "PENDING",
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log(`Creating Didit session for check-in: ${checkInId}`);

      const response = await axios.post("https://verification.didit.me/v3/session/", {
        workflow_id: workflowId,
        user_id: checkInId, // Use checkInId as user_id to link back in webhook
        features: {
          face_verification: true
        }
      }, {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        }
      });

      const data = response.data;
      
      // Update check-in with session ID
      await checkInRef.update({
        diditSessionId: data.id
      });

      res.json({ url: data.url, checkInId });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message;
      console.error("Error creating Didit session:", error.response?.data || error.message);
      res.status(500).json({ error: `Didit API Error: ${errorMessage}` });
    }
  });

  app.post("/api/didit/webhook", async (req, res) => {
    try {
      const data = req.body;
      console.log("Received Didit Webhook:", JSON.stringify(data, null, 2));

      // The user_id we passed is the checkInId
      const checkInId = data.user_id;
      const status = data.status; // e.g., "approved", "rejected"

      if (!checkInId) {
        console.warn("Webhook received without user_id");
        return res.status(200).end();
      }

      const db = admin.firestore();
      const checkInRef = db.collection("checkIns").doc(checkInId);
      const checkInDoc = await checkInRef.get();

      if (!checkInDoc.exists) {
        console.error(`Check-in document not found: ${checkInId}`);
        return res.status(200).end();
      }

      if (status === "approved") {
        await checkInRef.update({
          status: "APPROVED",
          photoUrl: data.face_verification?.image_url || "",
          verifiedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`Check-in ${checkInId} APPROVED`);

        // Update Assignment status if it's an OUT punch
        const checkInData = checkInDoc.data();
        if (checkInData && checkInData.type === 'OUT') {
          const today = new Date().toISOString().split('T')[0];
          const assignmentsRef = db.collection("assignments");
          const q = assignmentsRef
            .where('employeeId', '==', checkInData.employeeId)
            .where('date', '==', today)
            .where('status', '==', 'SCHEDULED');
          
          const snapshot = await q.get();
          if (!snapshot.empty) {
            const batch = db.batch();
            snapshot.docs.forEach(doc => {
              batch.update(doc.ref, { status: 'COMPLETED' });
            });
            await batch.commit();
            console.log(`Assignments updated to COMPLETED for employee ${checkInData.employeeId}`);
          }
        }
      } else {
        await checkInRef.update({
          status: "REJECTED",
          rejectionReason: data.rejection_reason || "Verification failed",
          verifiedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`Check-in ${checkInId} REJECTED`);
      }

      res.status(200).end();
    } catch (error: any) {
      console.error("Error processing Didit webhook:", error.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // 404 handler for API routes (must be before Vite middleware)
  app.all("/api/*", (req, res) => {
    res.status(404).json({ error: `API route not found: ${req.method} ${req.url}` });
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

  // Global error handler
  app.use((err: any, req: any, res: any, next: any) => {
    console.error("Global error handler caught:", err);
    res.status(500).json({ error: err.message || "Internal Server Error" });
  });

  return app;
}

if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  const PORT = 3000;
  createServer().then(app => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }).catch(err => {
    console.error("Failed to start server:", err);
  });
}
