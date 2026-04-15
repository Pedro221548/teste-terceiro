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
        
        admin.initializeApp({
          credential: admin.credential.applicationDefault(),
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
