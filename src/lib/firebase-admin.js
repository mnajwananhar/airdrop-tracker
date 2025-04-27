import { getApps, initializeApp, cert, getApp } from "firebase-admin/app";

export function initFirebaseAdmin() {
  try {
    if (getApps().length > 0) {
      return getApp();
    }

    let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
    if (privateKey && !privateKey.includes("\\n")) {
      // No need to replace if already formatted correctly
    } else if (privateKey) {
      privateKey = privateKey.replace(/\\n/g, "\n");
    } else {
      console.error("Firebase Admin private key is missing");
      throw new Error("Firebase Admin private key is missing");
    }

    const serviceAccount = {
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: privateKey,
    };

    const missingFields = [];
    if (!serviceAccount.projectId) missingFields.push("projectId");
    if (!serviceAccount.clientEmail) missingFields.push("clientEmail");
    if (!serviceAccount.privateKey) missingFields.push("privateKey");

    if (missingFields.length > 0) {
      console.error(
        `Missing service account fields: ${missingFields.join(", ")}`
      );
      throw new Error(
        `Missing service account fields: ${missingFields.join(", ")}`
      );
    }

    console.log(
      "Initializing Firebase Admin with project ID:",
      serviceAccount.projectId
    );

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
