import { auth } from "./firebase";

export const setupTokenRefresh = (callback) => {
  const REFRESH_INTERVAL = 50 * 60 * 1000;

  const refreshToken = async () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const token = await currentUser.getIdToken(true);
        if (callback && typeof callback === "function") {
          callback(token);
        }
      }
    } catch (error) {}
  };

  const intervalId = setInterval(refreshToken, REFRESH_INTERVAL);

  return () => clearInterval(intervalId);
};

export const getAuthToken = async () => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return null;
    }

    const token = await currentUser.getIdToken(true);
    return token;
  } catch (error) {
    return null;
  }
};

export const getCurrentUser = () => {
  return auth.currentUser;
};
