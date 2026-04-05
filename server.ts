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

  // Import Vercel handlers for local development
  const sessionHandler = (await import("./api/didit/session.js")).default;
  const webhookHandler = (await import("./api/didit/webhook.js")).default;
  const createUserHandler = (await import("./api/create-user.js")).default;
  const deleteUserHandler = (await import("./api/delete-user.js")).default;

  app.post("/api/create-user", async (req, res) => {
    await createUserHandler(req, res);
  });

  app.post("/api/delete-user", async (req, res) => {
    await deleteUserHandler(req, res);
  });

  app.post("/api/didit/session", async (req, res) => {
    // Vercel handlers expect (req, res)
    await sessionHandler(req, res);
  });

  app.post("/api/didit/webhook", async (req: any, res) => {
    // Vercel handlers expect (req, res)
    // Note: sessionHandler and webhookHandler are standard (req, res) handlers
    // But webhookHandler in Vercel disables bodyParser to get rawBody
    // In Express, we already have req.rawBody from middleware
    // So we can pass it along
    await webhookHandler(req, res);
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
