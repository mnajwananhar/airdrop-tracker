import { NextResponse } from "next/server";
import { getAllProjects, createProject } from "../../../lib/firestore";
import { getAuth } from "firebase-admin/auth";
import { initFirebaseAdmin } from "../../../lib/firebase-admin";

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
      const cookies = request.cookies;
      const sessionCookie = cookies.get("session");

      if (!sessionCookie || !sessionCookie.value) {
        throw new Error("Token tidak ditemukan");
      }

      const token = sessionCookie.value;
      initFirebaseAdmin();
      const decodedToken = await getAuth().verifyIdToken(token);
      return decodedToken.uid;
    }

    const token = authHeader.split("Bearer ")[1];
    initFirebaseAdmin();
    const decodedToken = await getAuth().verifyIdToken(token);
    return decodedToken.uid;
  } catch (error) {
    throw error;
  }
}

export async function GET(request) {
  try {
    const userId = await getUserIdFromToken(request);
    const projects = await getAllProjects(userId);
    const sanitizedProjects = sanitizeFirestoreData(projects);
    return NextResponse.json(sanitizedProjects);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch projects: " + error.message },
      { status: error.message.includes("Token") ? 401 : 500 }
    );
  }
}

export async function POST(request) {
  try {
    const userId = await getUserIdFromToken(request);
    const projectData = await request.json();

    if (!projectData.name) {
      return NextResponse.json(
        { error: "Project name is required" },
        { status: 400 }
      );
    }

    const projectWithUserId = {
      ...projectData,
      userId: userId,
    };

    const projectId = await createProject(projectWithUserId);
    return NextResponse.json({ id: projectId }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create project: " + error.message },
      { status: error.message.includes("Token") ? 401 : 500 }
    );
  }
}
