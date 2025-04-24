"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import {
  setSessionCookie,
  getSessionCookie,
  removeSessionCookie,
} from "../lib/session";
import Loading from "../components/Loading";
import { useRouter } from "next/navigation";

// Buat context
const AuthContext = createContext();

// Hook untuk menggunakan auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider untuk auth context
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fungsi untuk login dengan Google
  const signInWithGoogle = async () => {
    try {
      setLoading(true);

      // Set persistensi login agar tetap login setelah refresh
      await setPersistence(auth, browserLocalPersistence);

      const result = await signInWithPopup(auth, googleProvider);

      // Dapatkan token
      const token = await result.user.getIdToken(true);

      // Simpan token di cookie
      setSessionCookie(token);

      // Setelah login berhasil, simpan user ke Firestore
      await saveUserToFirestore(result.user);

      // Refresh halaman untuk memastikan semua state diperbarui
      router.refresh();

      return result.user;
    } catch (error) {
      console.error("Error login dengan Google:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk logout
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      // Hapus cookie session
      removeSessionCookie();
      // Arahkan ke halaman login setelah logout
      router.push("/login");
    } catch (error) {
      console.error("Error logout:", error);
      throw error;
    }
  };

  // Fungsi untuk menyimpan user ke Firestore
  const saveUserToFirestore = async (user) => {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    // Menyiapkan data user
    const userData = {
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      lastLogin: serverTimestamp(),
    };

    if (!userSnap.exists()) {
      // Jika user belum ada, tambahkan data tambahan
      userData.createdAt = serverTimestamp();
    }

    // Simpan data user
    await setDoc(userRef, userData, { merge: true });
  };

  // Efek untuk mendengarkan perubahan status autentikasi
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      try {
        if (authUser) {
          // User telah login
          console.log("User logged in:", authUser);
          setUser(authUser);

          // Update session token
          const token = await authUser.getIdToken(true);
          setSessionCookie(token);
        } else {
          // User telah logout atau belum login
          console.log("User not logged in");
          setUser(null);
          removeSessionCookie();
        }
      } catch (error) {
        console.error("Auth state error:", error);
        setUser(null);
        removeSessionCookie();
      } finally {
        setLoading(false);
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Debug: cek status session cookie
  useEffect(() => {
    console.log("Session cookie:", getSessionCookie());
  }, [user]);

  // Nilai yang akan disediakan oleh context
  const value = {
    user,
    loading,
    signInWithGoogle,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? <Loading /> : children}
    </AuthContext.Provider>
  );
};
