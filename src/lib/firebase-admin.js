// src/lib/firebase-admin.js
import { getApps, initializeApp, cert, getApp } from "firebase-admin/app";

// Inisialisasi Firebase Admin SDK
export function initFirebaseAdmin() {
  try {
    console.log("Initializing Firebase Admin...");

    // Check if already initialized
    if (getApps().length > 0) {
      console.log("Firebase Admin already initialized, returning existing app");
      return getApp();
    }

    // Persiapkan service account
    console.log("Preparing service account...");

    // Log environment variables (tanpa menampilkan nilai sebenarnya)
    console.log(
      "FIREBASE_ADMIN_PROJECT_ID is set:",
      !!process.env.FIREBASE_ADMIN_PROJECT_ID
    );
    console.log(
      "FIREBASE_ADMIN_CLIENT_EMAIL is set:",
      !!process.env.FIREBASE_ADMIN_CLIENT_EMAIL
    );
    console.log(
      "FIREBASE_ADMIN_PRIVATE_KEY is set:",
      !!process.env.FIREBASE_ADMIN_PRIVATE_KEY
    );

    // Make sure private key is properly formatted
    let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
    if (privateKey && !privateKey.includes("\\n")) {
      // If private key doesn't contain newlines, try to use it as is
      console.log("Private key doesn't contain escape sequences, using as is");
    } else if (privateKey) {
      // If it contains escape sequences, replace them with actual newlines
      console.log("Formatting private key by replacing escape sequences");
      privateKey = privateKey.replace(/\\n/g, "\n");
    } else {
      console.error("Private key is missing");
      throw new Error("Firebase Admin private key is missing");
    }

    // Create service account object
    const serviceAccount = {
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: privateKey,
    };

    // Check for missing fields
    const missingFields = [];
    if (!serviceAccount.projectId) missingFields.push("projectId");
    if (!serviceAccount.clientEmail) missingFields.push("clientEmail");
    if (!serviceAccount.privateKey) missingFields.push("privateKey");

    if (missingFields.length > 0) {
      throw new Error(
        `Missing service account fields: ${missingFields.join(", ")}`
      );
    }

    console.log("Service account prepared, initializing app...");
    const app = initializeApp({
      credential: cert(serviceAccount),
    });

    console.log("Firebase Admin initialized successfully");
    return app;
  } catch (error) {
    console.error("Firebase admin initialization error:", error);
    throw new Error("Firebase admin initialization failed: " + error.message);
  }
}
