import { NextResponse } from "next/server";
import {
  getProjectById,
  updateProject,
  deleteProject,
} from "../../../../lib/firestore";
import { getAuth } from "firebase-admin/auth";
import { initFirebaseAdmin } from "../../../../lib/firebase-admin";
import { serverTimestamp } from "firebase/firestore";

const sanitizeFirestoreData = (data) => {
  if (!data) return data;

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeFirestoreData(item));
  }

  if (typeof data !== "object" || data === null) {
    return data;
  }

  if (data.toDate instanceof Function) {
    return data.toDate().toISOString();
  }

  if (data.seconds !== undefined && data.nanoseconds !== undefined) {
    return new Date(data.seconds * 1000).toISOString();
  }

  const result = {};
  for (const key in data) {
    result[key] = sanitizeFirestoreData(data[key]);
  }

  return result;
};

async function getUserIdFromToken(request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new Error("Token tidak ditemukan");
    }

    const token = authHeader.split("Bearer ")[1];

    initFirebaseAdmin();

    const decodedToken = await getAuth().verifyIdToken(token);
    return decodedToken.uid;
  } catch (error) {
    console.error("Error verifikasi token:", error);
    throw error;
  }
}

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

    const project = await verifyProjectOwnership(id, userId);

    const sanitizedProject = sanitizeFirestoreData(project);

    return NextResponse.json(sanitizedProject);
  } catch (error) {
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

    const existingProject = await verifyProjectOwnership(id, userId);

    const projectData = await request.json();

    if (!projectData.name) {
      return NextResponse.json(
        { error: "Project name is required" },
        { status: 400 }
      );
    }

    if (projectData.completed && !existingProject.completed) {
      projectData.dateCompleted = serverTimestamp();
    } else if (!projectData.completed && existingProject.completed) {
      projectData.dateCompleted = null;
    }

    await updateProject(id, projectData);

    const updatedProject = await getProjectById(id);
    const sanitizedProject = sanitizeFirestoreData(updatedProject);

    return NextResponse.json(sanitizedProject);
  } catch (error) {
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

    await verifyProjectOwnership(id, userId);

    await deleteProject(id);
    return NextResponse.json({
      success: true,
      message: "Project has been permanently deleted",
    });
  } catch (error) {
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
