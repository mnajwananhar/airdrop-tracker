import { NextResponse } from "next/server";
import { getAllProjects, createProject } from "../../../lib/firestore";
import { getAuth } from "firebase-admin/auth";
import { initFirebaseAdmin } from "../../../lib/firebase-admin";

// Helper untuk sanitasi data timestamp dari Firestore sebelum dikirim ke client
const sanitizeFirestoreData = (data) => {
  if (!data) return data;

  // Jika array, sanitasi setiap item
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeFirestoreData(item));
  }

  // Jika bukan object, kembalikan apa adanya
  if (typeof data !== "object" || data === null) {
    return data;
  }

  // Jika object dengan metode toDate (timestamp Firestore)
  if (data.toDate instanceof Function) {
    return data.toDate().toISOString();
  }

  // Jika object timestamp yang sudah di-serialize dengan seconds/nanoseconds
  if (data.seconds !== undefined && data.nanoseconds !== undefined) {
    return new Date(data.seconds * 1000).toISOString();
  }

  // Rekursif untuk object biasa
  const result = {};
  for (const key in data) {
    result[key] = sanitizeFirestoreData(data[key]);
  }

  return result;
};

// Middleware untuk verifikasi token dan mendapatkan userId
async function getUserIdFromToken(request) {
  try {
    console.log("Starting token verification...");

    // Ambil token dari header Authorization
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("Token tidak ditemukan di header Authorization");

      // Cek apakah token ada di cookies sebagai fallback
      const cookies = request.cookies;
      const sessionCookie = cookies.get("session");

      if (!sessionCookie || !sessionCookie.value) {
        console.error("Token juga tidak ditemukan di cookies");
        throw new Error("Token tidak ditemukan");
      }

      console.log("Token ditemukan di cookies, menggunakan sebagai fallback");
      const token = sessionCookie.value;

      // Inisialisasi Firebase Admin
      console.log("Menginisialisasi Firebase Admin...");
      initFirebaseAdmin();

      // Verifikasi token menggunakan Firebase Admin
      console.log("Verifikasi token dari cookies...");
      const decodedToken = await getAuth().verifyIdToken(token);
      console.log("Token berhasil diverifikasi, userId:", decodedToken.uid);
      return decodedToken.uid;
    }

    console.log("Token ditemukan di header Authorization");
    const token = authHeader.split("Bearer ")[1];

    // Inisialisasi Firebase Admin
    console.log("Menginisialisasi Firebase Admin...");
    initFirebaseAdmin();

    // Verifikasi token menggunakan Firebase Admin
    console.log("Verifikasi token...");
    const decodedToken = await getAuth().verifyIdToken(token);
    console.log("Token berhasil diverifikasi, userId:", decodedToken.uid);
    return decodedToken.uid;
  } catch (error) {
    console.error("Error verifikasi token:", error);
    throw error;
  }
}

export async function GET(request) {
  try {
    console.log("GET /api/projects - Request received");

    // Ambil userId dari token
    const userId = await getUserIdFromToken(request);
    console.log("User authenticated, userId:", userId);

    // Ambil semua proyek milik user
    console.log("Fetching projects for user...");
    const projects = await getAllProjects(userId);
    console.log(`Successfully fetched ${projects.length} projects`);

    // Sanitasi data sebelum dikirim ke client
    const sanitizedProjects = sanitizeFirestoreData(projects);
    console.log("Data sanitized for client");

    return NextResponse.json(sanitizedProjects);
  } catch (error) {
    console.error("Error handling GET /api/projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects: " + error.message },
      { status: error.message.includes("Token") ? 401 : 500 }
    );
  }
}

export async function POST(request) {
  try {
    console.log("POST /api/projects - Request received");

    // Ambil userId dari token
    const userId = await getUserIdFromToken(request);
    console.log("User authenticated, userId:", userId);

    // Ambil data proyek dari request body
    const projectData = await request.json();
    console.log("Project data received:", projectData.name);

    if (!projectData.name) {
      console.error("Project name is missing");
      return NextResponse.json(
        { error: "Project name is required" },
        { status: 400 }
      );
    }

    // Tambahkan userId ke data proyek
    const projectWithUserId = {
      ...projectData,
      userId: userId,
    };

    // Buat proyek baru
    console.log("Creating new project...");
    const projectId = await createProject(projectWithUserId);
    console.log("Project created successfully, ID:", projectId);

    return NextResponse.json({ id: projectId }, { status: 201 });
  } catch (error) {
    console.error("Error handling POST /api/projects:", error);
    return NextResponse.json(
      { error: "Failed to create project: " + error.message },
      { status: error.message.includes("Token") ? 401 : 500 }
    );
  }
}
