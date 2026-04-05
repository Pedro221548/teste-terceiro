import admin from "firebase-admin";
import fs from "fs";
import path from "path";

export async function getFirebaseAdmin() {
  if (admin.apps.length === 0) {
    try {
      // In Vercel, the config file should be at the root
      const configPath = path.join(process.cwd(), "firebase-applet-config.json");
      const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
      
      process.env.GOOGLE_CLOUD_PROJECT = config.projectId;
      
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: config.projectId,
      });
      console.log("Firebase Admin initialized successfully in Serverless Function.");
    } catch (error) {
      console.error("Error initializing Firebase Admin in Serverless Function:", error);
      throw error;
    }
  }
  return admin;
}
