// src/lib/firestore.js
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

// Koleksi projects
const projectsCollection = collection(db, "projects");

// Mendapatkan semua proyek dari user tertentu
export async function getAllProjects(userId) {
  try {
    console.log("Fetching projects for userId:", userId);

    if (!userId) {
      console.error("UserId is undefined or null");
      return [];
    }

    const q = query(
      projectsCollection,
      where("userId", "==", userId),
      orderBy("dateAdded", "desc")
    );

    console.log("Query created, executing...");
    const querySnapshot = await getDocs(q);
    console.log("Query executed, projects count:", querySnapshot.size);

    const projects = [];

    querySnapshot.forEach((doc) => {
      // Gabungkan ID dokumen dengan data lainnya
      const projectData = doc.data();

      // Tambahkan data proyek ke array
      projects.push({
        id: doc.id,
        ...projectData,
        // Pastikan field penting selalu ada
        links: projectData.links || [],
        types: projectData.types || ["daily"],
        notes: projectData.notes || "",
        completed: !!projectData.completed,
      });
    });

    // Log untuk debugging
    console.log(`Retrieved ${projects.length} projects`);

    return projects;
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw new Error("Failed to fetch projects: " + error.message);
  }
}

// Mendapatkan proyek berdasarkan ID
export async function getProjectById(projectId) {
  try {
    console.log(`Fetching project with ID: ${projectId}`);
    const projectRef = doc(db, "projects", projectId);
    const projectSnap = await getDoc(projectRef);

    if (!projectSnap.exists()) {
      console.log("Project not found");
      return null;
    }

    const projectData = projectSnap.data();
    console.log("Project found:", projectData.name);

    return {
      id: projectSnap.id,
      ...projectData,
      // Pastikan field penting selalu ada
      links: projectData.links || [],
      types: projectData.types || ["daily"],
      notes: projectData.notes || "",
      completed: !!projectData.completed,
    };
  } catch (error) {
    console.error(`Error fetching project with ID ${projectId}:`, error);
    throw new Error(`Failed to fetch project: ${error.message}`);
  }
}

// Membuat proyek baru
export async function createProject(projectData) {
  try {
    console.log("Creating new project:", projectData.name);
    if (!projectData.name) {
      throw new Error("Project name is required");
    }

    // Pastikan nilai-nilai default tersedia
    const defaultProject = {
      links: [],
      notes: "",
      types: ["daily"],
      completed: false,
      marked: false,
    };

    // Gabungkan dengan data yang disediakan
    const mergedData = {
      ...defaultProject,
      ...projectData,
      // Tambahkan timestamp untuk dateAdded
      dateAdded: serverTimestamp(),
    };

    // Pastikan userId tersedia
    if (!mergedData.userId) {
      throw new Error("User ID is required");
    }

    const docRef = await addDoc(projectsCollection, mergedData);
    console.log("Project created with ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error creating project:", error);
    throw new Error("Failed to create project: " + error.message);
  }
}

// Memperbarui proyek
export async function updateProject(projectId, projectData) {
  try {
    console.log(`Updating project with ID: ${projectId}`);

    if (!projectData.name) {
      throw new Error("Project name is required");
    }

    const projectRef = doc(db, "projects", projectId);
    const projectSnap = await getDoc(projectRef);

    if (!projectSnap.exists()) {
      throw new Error("Project not found");
    }

    const currentProject = projectSnap.data();

    // Bangun objek update berdasarkan data saat ini dan perubahan
    const updates = {
      // Pastikan field yang diupdate ada
      name: projectData.name,
      notes: projectData.notes ?? currentProject.notes,
      links: Array.isArray(projectData.links)
        ? projectData.links
        : currentProject.links || [],
      types: Array.isArray(projectData.types)
        ? projectData.types
        : currentProject.types || ["daily"],
      completed: projectData.completed ?? currentProject.completed,
      // Ensure marked is never undefined by setting a default false value
      marked:
        projectData.marked !== undefined
          ? projectData.marked
          : currentProject.marked || false,
    };

    // Jika status berubah menjadi completed, tambahkan timestamp
    if (projectData.completed && !currentProject.completed) {
      updates.dateCompleted = serverTimestamp();
      console.log("Project marked as completed, adding timestamp");
    }
    // Jika status berubah menjadi tidak completed, hapus timestamp
    else if (!projectData.completed && currentProject.completed) {
      updates.dateCompleted = null;
      console.log("Project marked as not completed, removing timestamp");
    }
    // Jika dateCompleted diatur secara eksplisit dalam request
    else if (projectData.dateCompleted !== undefined) {
      updates.dateCompleted = projectData.dateCompleted;
    }

    await updateDoc(projectRef, updates);
    console.log("Project updated successfully");
    return true;
  } catch (error) {
    console.error(`Error updating project with ID ${projectId}:`, error);
    throw new Error("Failed to update project: " + error.message);
  }
}

// Menghapus proyek
export async function deleteProject(projectId) {
  try {
    console.log(`Deleting project with ID: ${projectId}`);
    const projectRef = doc(db, "projects", projectId);
    const projectSnap = await getDoc(projectRef);

    if (!projectSnap.exists()) {
      throw new Error("Project not found");
    }

    await deleteDoc(projectRef);
    console.log("Project deleted successfully");
    return true;
  } catch (error) {
    console.error(`Error deleting project with ID ${projectId}:`, error);
    throw new Error("Failed to delete project: " + error.message);
  }
}
