"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  limit,
  serverTimestamp,
} from "firebase/firestore";
import { getAuth as getClientAuth } from "firebase/auth";

export default function TestPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [userDetails, setUserDetails] = useState(null);
  const [tokenDetails, setTokenDetails] = useState(null);
  const [testCollection, setTestCollection] = useState(null);
  const [testStatus, setTestStatus] = useState("idle");

  const addLog = (message) => {
    setLogs((prev) => [...prev, `${new Date().toISOString()} - ${message}`]);
  };

  useEffect(() => {
    if (user) {
      setUserDetails({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      });

      // Get token for testing
      user
        .getIdToken(true)
        .then((token) => {
          // Don't show entire token for security
          setTokenDetails({
            token: `${token.substring(0, 10)}...${token.substring(
              token.length - 10
            )}`,
            length: token.length,
          });
        })
        .catch((error) => {
          addLog(`Error getting token: ${error.message}`);
        });
    } else {
      setUserDetails(null);
      setTokenDetails(null);
    }
  }, [user]);

  const runFirestoreTest = async () => {
    try {
      setTestStatus("running");
      addLog("Starting Firestore test...");

      // Test collection read
      addLog("Testing collection read...");
      const testCollectionRef = collection(db, "test_collection");
      const q = query(testCollectionRef, limit(1));
      const snapshot = await getDocs(q);
      addLog(
        `Collection read status: ${snapshot.empty ? "Empty" : "Has documents"}`
      );
      setTestCollection({
        name: "test_collection",
        exists: true,
        empty: snapshot.empty,
      });

      // Test document write
      addLog("Testing document write...");
      const newDocRef = await addDoc(testCollectionRef, {
        message: "Test document",
        createdAt: serverTimestamp(),
        userId: user?.uid || "anonymous",
      });
      addLog(`Document write successful. ID: ${newDocRef.id}`);

      setTestStatus("success");
      addLog("Firestore test completed successfully");
    } catch (error) {
      setTestStatus("error");
      addLog(`Firestore test error: ${error.message}`);
      console.error("Firestore test error:", error);
    }
  };

  const testApiEndpoint = async () => {
    try {
      setTestStatus("running");
      addLog("Testing API endpoint...");

      // Get token
      const token = await user.getIdToken(true);
      addLog("Retrieved token, sending request to API...");

      // Call API
      const response = await fetch("/api/projects", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      addLog(`API response status: ${response.status}`);

      if (response.ok) {
        addLog(
          `API call successful. Received ${
            Array.isArray(data) ? data.length : "non-array"
          } response.`
        );
        setTestStatus("success");
      } else {
        addLog(`API error: ${data.error || "Unknown error"}`);
        setTestStatus("error");
      }
    } catch (error) {
      setTestStatus("error");
      addLog(`API test error: ${error.message}`);
      console.error("API test error:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl font-bold text-center mb-6">
        Firebase Debug Page
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-4 shadow">
          <h2 className="text-xl font-semibold mb-4">User Information</h2>
          {userDetails ? (
            <div className="space-y-2">
              <p>
                <span className="font-semibold">UID:</span> {userDetails.uid}
              </p>
              <p>
                <span className="font-semibold">Email:</span>{" "}
                {userDetails.email}
              </p>
              <p>
                <span className="font-semibold">Name:</span>{" "}
                {userDetails.displayName || "Not set"}
              </p>
              <p>
                <span className="font-semibold">Photo:</span>{" "}
                {userDetails.photoURL ? "Available" : "Not available"}
              </p>
            </div>
          ) : (
            <p className="text-red-400">User not logged in</p>
          )}

          {tokenDetails && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Token Information</h3>
              <p>
                <span className="font-semibold">Token:</span>{" "}
                {tokenDetails.token}
              </p>
              <p>
                <span className="font-semibold">Length:</span>{" "}
                {tokenDetails.length} characters
              </p>
            </div>
          )}
        </div>

        <div className="bg-gray-800 rounded-lg p-4 shadow">
          <h2 className="text-xl font-semibold mb-4">Firebase Tests</h2>
          <div className="space-y-4">
            <button
              onClick={runFirestoreTest}
              disabled={!user || testStatus === "running"}
              className={`px-4 py-2 rounded ${
                testStatus === "running"
                  ? "bg-yellow-600"
                  : testStatus === "success"
                  ? "bg-green-600"
                  : testStatus === "error"
                  ? "bg-red-600"
                  : "bg-blue-600"
              } text-white font-medium`}
            >
              {testStatus === "running"
                ? "Testing..."
                : "Test Firestore Access"}
            </button>

            <button
              onClick={testApiEndpoint}
              disabled={!user || testStatus === "running"}
              className={`ml-4 px-4 py-2 rounded ${
                testStatus === "running" ? "bg-yellow-600" : "bg-purple-600"
              } text-white font-medium`}
            >
              Test API Endpoint
            </button>

            {testCollection && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Collection Information</h3>
                <p>
                  <span className="font-semibold">Name:</span>{" "}
                  {testCollection.name}
                </p>
                <p>
                  <span className="font-semibold">Status:</span>{" "}
                  {testCollection.exists ? "Exists" : "Does not exist"}
                </p>
                <p>
                  <span className="font-semibold">Content:</span>{" "}
                  {testCollection.empty ? "Empty" : "Has documents"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 bg-gray-800 rounded-lg p-4 shadow">
        <h2 className="text-xl font-semibold mb-4">Test Logs</h2>
        <div className="bg-gray-900 p-3 rounded overflow-auto max-h-80">
          {logs.length > 0 ? (
            <pre className="text-sm text-gray-300 whitespace-pre-wrap">
              {logs.join("\n")}
            </pre>
          ) : (
            <p className="text-gray-500 italic">
              No logs yet. Run a test to see results.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
