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

  // Didit API Endpoints
  app.post("/api/didit/create-session", async (req, res) => {
    try {
      const { employeeId, agencyId, type, location, accessPointId } = req.body;

      if (!employeeId || !agencyId || !type) {
        return res.status(400).json({ error: "Missing required fields" });
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
        workflow_id: process.env.DIDIT_WORKFLOW_ID,
        user_id: checkInId, // Use checkInId as user_id to link back in webhook
        features: {
          face_verification: true
        }
      }, {
        headers: {
          "Authorization": `Bearer ${process.env.DIDIT_API_KEY}`,
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
      console.error("Error creating Didit session:", error.response?.data || error.message);
      res.status(500).json({ error: "Failed to create verification session" });
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
