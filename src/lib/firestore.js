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

const projectsCollection = collection(db, "projects");

export async function getAllProjects(userId) {
  try {
    if (!userId) {
      console.error("UserId is undefined or null");
      return [];
    }

    const q = query(
      projectsCollection,
      where("userId", "==", userId),
      orderBy("dateAdded", "desc")
    );

    const querySnapshot = await getDocs(q);

    const projects = [];

    querySnapshot.forEach((doc) => {
      const projectData = doc.data();

      if (projectData.isDeleted === true) {
        return;
      }

      projects.push({
        id: doc.id,
        ...projectData,
        links: projectData.links || [],
        types: projectData.types || ["daily"],
        notes: projectData.notes || "",
        completed: !!projectData.completed,
      });
    });

    return projects;
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw new Error("Failed to fetch projects: " + error.message);
  }
}

export async function getProjectById(projectId) {
  try {
    const projectRef = doc(db, "projects", projectId);
    const projectSnap = await getDoc(projectRef);

    if (!projectSnap.exists()) {
      return null;
    }

    const projectData = projectSnap.data();

    if (projectData.isDeleted === true) {
      return null;
    }

    return {
      id: projectSnap.id,
      ...projectData,
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

export async function createProject(projectData) {
  try {
    if (!projectData.name) {
      throw new Error("Project name is required");
    }

    const defaultProject = {
      links: [],
      notes: "",
      types: ["daily"],
      completed: false,
      marked: false,
      isDeleted: false,
    };

    const mergedData = {
      ...defaultProject,
      ...projectData,
      dateAdded: serverTimestamp(),
    };

    if (!mergedData.userId) {
      throw new Error("User ID is required");
    }

    const docRef = await addDoc(projectsCollection, mergedData);
    return docRef.id;
  } catch (error) {
    console.error("Error creating project:", error);
    throw new Error("Failed to create project: " + error.message);
  }
}

export async function updateProject(projectId, projectData) {
  try {
    if (!projectData.name) {
      throw new Error("Project name is required");
    }

    const projectRef = doc(db, "projects", projectId);
    const projectSnap = await getDoc(projectRef);

    if (!projectSnap.exists()) {
      throw new Error("Project not found");
    }

    const currentProject = projectSnap.data();

    const updates = {
      name: projectData.name,
      notes: projectData.notes ?? currentProject.notes,
      links: Array.isArray(projectData.links)
        ? projectData.links
        : currentProject.links || [],
      types: Array.isArray(projectData.types)
        ? projectData.types
        : currentProject.types || ["daily"],
      completed: projectData.completed ?? currentProject.completed,
      marked:
        projectData.marked !== undefined
          ? projectData.marked
          : currentProject.marked || false,
    };

    if (projectData.completed && !currentProject.completed) {
      updates.dateCompleted = serverTimestamp();
    } else if (!projectData.completed && currentProject.completed) {
      updates.dateCompleted = null;
    } else if (projectData.dateCompleted !== undefined) {
      updates.dateCompleted = projectData.dateCompleted;
    }

    await updateDoc(projectRef, updates);
    return true;
  } catch (error) {
    console.error(`Error updating project with ID ${projectId}:`, error);
    throw new Error("Failed to update project: " + error.message);
  }
}

export async function deleteProject(projectId) {
  try {
    const projectRef = doc(db, "projects", projectId);
    const projectSnap = await getDoc(projectRef);

    if (!projectSnap.exists()) {
      throw new Error("Project not found");
    }

    await updateDoc(projectRef, {
      isDeleted: true,
      deletedAt: serverTimestamp(),
    });

    return true;
  } catch (error) {
    console.error(`Error deleting project with ID ${projectId}:`, error);
    throw new Error("Failed to delete project: " + error.message);
  }
}
