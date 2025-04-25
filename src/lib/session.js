import Cookies from "js-cookie";

export const setSessionCookie = (token) => {
  Cookies.set("session", token, {
    expires: 7,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
};

export const getSessionCookie = () => {
  return Cookies.get("session");
};

export const removeSessionCookie = () => {
  Cookies.remove("session");
};
