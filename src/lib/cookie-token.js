// src/lib/cookie-token.js
import { initFirebaseAdmin } from "./firebase-admin";
import { getAuth } from "firebase-admin/auth";

/**
 * Verifikasi token dari cookie dan dapatkan user ID
 * @param {string} token - Token Firebase auth
 * @returns {Promise<string|null>} User ID jika token valid, null jika tidak
 */
export async function verifyTokenFromCookie(token) {
  try {
    if (!token) {
      console.error("Token tidak ditemukan");
      return null;
    }

    console.log("Verifying token from cookie...");

    // Inisialisasi Firebase Admin
    initFirebaseAdmin();

    // Verifikasi token
    const decodedToken = await getAuth().verifyIdToken(token);
    console.log("Token verified, user ID:", decodedToken.uid);

    return decodedToken.uid;
  } catch (error) {
    console.error("Error verifying token from cookie:", error);
    return null;
  }
}

/**
 * Ambil user data langsung dari token
 * @param {string} token - Token Firebase auth
 * @returns {Promise<Object|null>} Data user jika token valid, null jika tidak
 */
export async function getUserDataFromToken(token) {
  try {
    if (!token) {
      console.error("Token tidak ditemukan");
      return null;
    }

    // Inisialisasi Firebase Admin
    initFirebaseAdmin();

    // Verifikasi token
    const decodedToken = await getAuth().verifyIdToken(token);

    // Ambil data user
    const userRecord = await getAuth().getUser(decodedToken.uid);

    return {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      photoURL: userRecord.photoURL,
    };
  } catch (error) {
    console.error("Error getting user data from token:", error);
    return null;
  }
}
