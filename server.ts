import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import admin from "firebase-admin";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize Firebase Admin SDK inside startServer
  try {
    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: "gen-lang-client-0020131327",
      });
      console.log("Firebase Admin initialized successfully");
    }
  } catch (error) {
    console.error("Error initializing Firebase Admin:", error);
  }

  app.use(express.json());

  app.use((req, res, next) => {
    console.log("Request received:", req.method, req.url);
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
}

startServer();
