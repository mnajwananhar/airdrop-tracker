// src/lib/session.js
import Cookies from "js-cookie";

// Set session token in cookie
export const setSessionCookie = (token) => {
  // Set secure cookie with 7 days expiration
  Cookies.set("session", token, {
    expires: 7,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
};

// Get session token from cookie
export const getSessionCookie = () => {
  return Cookies.get("session");
};

// Remove session token from cookie
export const removeSessionCookie = () => {
  Cookies.remove("session");
};
