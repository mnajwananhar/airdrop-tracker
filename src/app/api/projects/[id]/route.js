import { NextResponse } from "next/server";
import {
  getProjectById,
  updateProject,
  deleteProject,
} from "../../../../lib/firestore";
import { getAuth } from "firebase-admin/auth";
import { initFirebaseAdmin } from "../../../../lib/firebase-admin";
import { serverTimestamp } from "firebase/firestore";

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
    // Ambil token dari header Authorization
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new Error("Token tidak ditemukan");
    }

    const token = authHeader.split("Bearer ")[1];

    // Inisialisasi Firebase Admin
    initFirebaseAdmin();

    // Verifikasi token menggunakan Firebase Admin
    const decodedToken = await getAuth().verifyIdToken(token);
    return decodedToken.uid;
  } catch (error) {
    console.error("Error verifikasi token:", error);
    throw error;
  }
}

// Middleware untuk memverifikasi kepemilikan proyek
async function verifyProjectOwnership(projectId, userId) {
  const project = await getProjectById(projectId);

  if (!project) {
    throw new Error("Project not found");
  }

  if (project.userId !== userId) {
    throw new Error("Unauthorized access to project");
  }

  return project;
}

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const userId = await getUserIdFromToken(request);

    // Verifikasi kepemilikan proyek
    const project = await verifyProjectOwnership(id, userId);

    // Sanitasi data sebelum dikirim ke client
    const sanitizedProject = sanitizeFirestoreData(project);

    return NextResponse.json(sanitizedProject);
  } catch (error) {
    // Get params.id safely for error logging
    const id = params ? (await params).id : "unknown";
    console.error(`Error fetching project with ID ${id}:`, error);

    if (error.message === "Project not found") {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (error.message === "Unauthorized access to project") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(
      { error: "Failed to fetch project: " + error.message },
      { status: error.message.includes("Token") ? 401 : 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const userId = await getUserIdFromToken(request);

    // Verifikasi kepemilikan proyek
    const existingProject = await verifyProjectOwnership(id, userId);

    // Ambil data pembaruan dari request body
    const projectData = await request.json();

    if (!projectData.name) {
      return NextResponse.json(
        { error: "Project name is required" },
        { status: 400 }
      );
    }

    // Handling khusus untuk timestamp dateCompleted
    // Jika status berubah dari tidak selesai menjadi selesai
    if (projectData.completed && !existingProject.completed) {
      console.log("Project status changed to completed, adding timestamp");
      projectData.dateCompleted = serverTimestamp();
    }
    // Jika status berubah dari selesai menjadi tidak selesai
    else if (!projectData.completed && existingProject.completed) {
      console.log(
        "Project status changed to not completed, removing timestamp"
      );
      projectData.dateCompleted = null;
    }

    // Perbarui proyek
    await updateProject(id, projectData);

    // Sanitasi data untuk respons
    const updatedProject = await getProjectById(id);
    const sanitizedProject = sanitizeFirestoreData(updatedProject);

    return NextResponse.json(sanitizedProject);
  } catch (error) {
    // Get params.id safely for error logging
    const id = params ? (await params).id : "unknown";
    console.error(`Error updating project with ID ${id}:`, error);

    if (error.message === "Project not found") {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (error.message === "Unauthorized access to project") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(
      { error: "Failed to update project: " + error.message },
      { status: error.message.includes("Token") ? 401 : 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const userId = await getUserIdFromToken(request);

    // Verifikasi kepemilikan proyek
    await verifyProjectOwnership(id, userId);

    // Hapus proyek
    await deleteProject(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    // Get params.id safely for error logging
    const id = params ? (await params).id : "unknown";
    console.error(`Error deleting project with ID ${id}:`, error);

    if (error.message === "Project not found") {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (error.message === "Unauthorized access to project") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(
      { error: "Failed to delete project: " + error.message },
      { status: error.message.includes("Token") ? 401 : 500 }
    );
  }
}
