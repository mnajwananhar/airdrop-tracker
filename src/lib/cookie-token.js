// src/lib/cookie-token.js
import { initFirebaseAdmin } from "./firebase-admin";
import { getAuth } from "firebase-admin/auth";

export async function verifyTokenFromCookie(token) {
  try {
    if (!token) {
      return null;
    }

    initFirebaseAdmin();

    const decodedToken = await getAuth().verifyIdToken(token);
    return decodedToken.uid;
  } catch (error) {
    return null;
  }
}

export async function getUserDataFromToken(token) {
  try {
    if (!token) {
      return null;
    }

    initFirebaseAdmin();

    const decodedToken = await getAuth().verifyIdToken(token);

    const userRecord = await getAuth().getUser(decodedToken.uid);

    return {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      photoURL: userRecord.photoURL,
    };
  } catch (error) {
    return null;
  }
}
