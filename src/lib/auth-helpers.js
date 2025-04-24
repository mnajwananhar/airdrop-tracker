// src/lib/auth-helpers.js
import { auth } from "./firebase";

// Function to refresh token periodically
export const setupTokenRefresh = (callback) => {
  // Refresh token setiap 50 menit (token Firebase biasanya berlaku 1 jam)
  const REFRESH_INTERVAL = 50 * 60 * 1000; // 50 menit

  const refreshToken = async () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        // Force refresh token
        const token = await currentUser.getIdToken(true);
        if (callback && typeof callback === "function") {
          callback(token);
        }
        console.log("Token refreshed successfully");
      }
    } catch (error) {
      console.error("Error refreshing token:", error);
    }
  };

  // Set interval untuk refresh token
  const intervalId = setInterval(refreshToken, REFRESH_INTERVAL);

  // Return function untuk membersihkan interval
  return () => clearInterval(intervalId);
};

// Function untuk memastikan token valid sebelum request API
export const getAuthToken = async () => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.log("No user logged in");
      return null;
    }

    // Get fresh token
    const token = await currentUser.getIdToken(true);
    return token;
  } catch (error) {
    console.error("Error getting auth token:", error);
    return null;
  }
};

// Function untuk mengambil user data dari Auth
export const getCurrentUser = () => {
  return auth.currentUser;
};
