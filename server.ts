import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import dotenv from "dotenv";

dotenv.config();

export async function createServer() {
  const app = express();

  // Initialize Firebase Admin SDK
  let firestoreDatabaseId = "(default)";
  try {
    if (admin.apps.length === 0) {
      const fs = await import("fs");
      const configPath = path.join(process.cwd(), "firebase-applet-config.json");
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
        firestoreDatabaseId = config.firestoreDatabaseId || "(default)";
        console.log(`Initializing Firebase Admin: Project=${config.projectId}, DB=${firestoreDatabaseId}`);
        
        process.env.GOOGLE_CLOUD_PROJECT = config.projectId;
        
        let credential;
        if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
          try {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
            credential = admin.credential.cert(serviceAccount);
            console.log("Firebase Admin initialized via FIREBASE_SERVICE_ACCOUNT_KEY");
          } catch(e) {
            console.error("Invalid FIREBASE_SERVICE_ACCOUNT_KEY JSON format", e);
            credential = admin.credential.applicationDefault();
          }
        } else {
          credential = admin.credential.applicationDefault();
          console.log("Firebase Admin initialized via Application Default Credentials");
        }

        admin.initializeApp({
          credential,
          projectId: config.projectId
        });
        console.log("Firebase Admin initialized successfully.");
      } else {
        console.error("CRITICAL: firebase-applet-config.json not found!");
      }
    }
  } catch (error) {
    console.error("FATAL: Error initializing Firebase Admin:", error);
  }

  const getDb = () => {
    return getFirestore(firestoreDatabaseId);
  };

  app.use(express.json({
    limit: '10mb',
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

  app.post("/api/send-push", async (req, res) => {
    try {
      const { tokens, title, body, icon, targetRoles, targetAgencyId, targetUserId, targetCompanyId } = req.body;
      
      if (admin.apps.length === 0) {
        return res.status(500).json({ error: 'Firebase Admin not initialized' });
      }

      const db = getFirestore(firestoreDatabaseId);
      const userTokens = new Set<string>();

      if (tokens) {
        (Array.isArray(tokens) ? tokens : [tokens]).forEach(t => userTokens.add(t));
      }

      if (targetRoles || targetAgencyId || targetUserId || targetCompanyId) {
        const usersSnapshot = await db.collection('users').get();
        usersSnapshot.forEach(doc => {
          const user = doc.data();
          if (user.fcmToken) {
            let match = false;
            if (targetRoles && targetRoles.includes(user.role)) match = true;
            if (targetAgencyId && user.agencyId === targetAgencyId) match = true;
            if (targetUserId && user.id === targetUserId) match = true;
            if (targetCompanyId && user.companyId === targetCompanyId) match = true;
            
            if (match) {
              userTokens.add(user.fcmToken);
            }
          }
        });
      }

      const finalTokens = Array.from(userTokens);

      if (finalTokens.length === 0) {
        return res.status(400).json({ error: 'No valid tokens found to send to' });
      }

      const message = {
        notification: {
          title: title || 'Nova Notificação',
          body: body || 'Alguém interagiu no sistema.',
        },
        tokens: finalTokens,
      };

      const response = await admin.messaging().sendEachForMulticast(message);
      res.json({ success: true, response });
    } catch (error) {
      console.error('Error sending push:', error);
      res.status(500).json({ error: 'Failed to send push notification', details: String(error) });
    }
  });

  app.post("/api/delete-user", async (req, res) => {
    try {
      const { uid } = req.body;
      if (!uid) {
        return res.status(400).json({ error: "Missing uid" });
      }
      if (admin.apps.length === 0) {
        return res.status(500).json({ error: "Firebase Admin not initialized" });
      }
      await admin.auth().deleteUser(uid);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting user via Admin SDK:", error);
      res.status(500).json({ error: "Failed to delete user", details: error.message });
    }
  });

  // Global error handler to ensure JSON responses
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Global error:", err);
    res.status(500).json({ 
      error: "Erro interno do servidor", 
      message: err.message 
    });
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
