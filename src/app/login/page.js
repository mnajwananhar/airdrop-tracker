"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Balloon } from "../../components/Header";
import { FcGoogle } from "react-icons/fc";
import { Loader2 } from "lucide-react";
import Image from "next/image";

export default function Login() {
  const { user, signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace("/");
    }
  }, [user, router]);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError("");
      await signInWithGoogle();
    } catch (error) {
      setError("Login failed. Please try again. " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="max-w-md w-full space-y-8 bg-gray-800/70 backdrop-blur-md p-8 rounded-xl shadow-2xl border border-gray-700">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Balloon size={64} className="text-blue-400" />
          </div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            Airdrop Tracker
          </h2>
          <p className="mt-2 text-gray-400">
            Track and manage your airdrop projects with ease
          </p>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-500 text-red-300 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="rounded-lg overflow-hidden shadow-md">
          <div className="p-6 bg-blue-900/20 backdrop-blur-sm">
            <h3 className="text-lg font-medium text-gray-200 mb-4">
              Sign in to continue
            </h3>
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className={`group relative w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-white font-medium
                ${
                  loading
                    ? "bg-blue-800 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                } transition-all duration-200`}
            >
              {loading ? (
                <span className="flex items-center">
                  <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center">
                  <FcGoogle className="h-6 w-6 mr-2" />
                  Sign in with Google
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>

        <div className="flex flex-col items-center space-y-3 mt-8 pt-8 border-t border-gray-700">
          <p className="text-gray-400 text-sm">Your data is securely stored</p>
          <div className="flex space-x-4">
            <div className="p-2 rounded-full bg-blue-900/30">
              <svg
                className="w-5 h-5 text-blue-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </div>
            <div className="p-2 rounded-full bg-blue-900/30">
              <svg
                className="w-5 h-5 text-blue-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </div>
            <div className="p-2 rounded-full bg-blue-900/30">
              <svg
                className="w-5 h-5 text-blue-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
