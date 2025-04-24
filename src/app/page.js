"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNotification } from "../contexts/NotificationContext"; // Import the notification hook
import Header from "../components/Header";
import ActiveProjects from "../components/ActiveProjects";
import CompletedProjects from "../components/CompletedProjects";
import AddProjectModal from "../components/AddProjectModal";
import EditProjectModal from "../components/EditProjectModal";
import NotesModal from "../components/NotesModal";
import Navigation from "../components/Navigation";
import Loading from "../components/Loading";

export default function Home() {
  // Auth Context
  const { user } = useAuth();
  // Notification Context
  const { success, error: notifyError, info } = useNotification();

  // State declarations
  const [projects, setProjects] = useState([]);
  const [completedProjects, setCompletedProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [filteredCompletedProjects, setFilteredCompletedProjects] = useState(
    []
  );
  const [showCompleted, setShowCompleted] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [activeLinksDropdown, setActiveLinksDropdown] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [newLink, setNewLink] = useState({ name: "", url: "" });
  const [highlightAddLink, setHighlightAddLink] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [activeProjectNotes, setActiveProjectNotes] = useState({
    name: "",
    notes: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState([]);
  const [sortDirection, setSortDirection] = useState(false); // false = newest first (default), true = oldest first
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Constants
  const typeOptions = [
    { value: "daily", label: "Daily Tasks" },
    { value: "testnet", label: "Testnet" },
    { value: "retro", label: "Retroactive" },
    { value: "node", label: "Node" },
    { value: "depin", label: "DePIN" },
    { value: "other", label: "Other" },
  ];

  // Fetch projects on component mount atau when user changes
  useEffect(() => {
    if (user) {
      console.log("User authenticated, fetching projects...");
      fetchProjects();
    } else {
      console.log("No user, not fetching projects");
      setIsLoading(false);
    }
  }, [user]);

  // Filter projects when search or filters change or sort direction changes
  useEffect(() => {
    filterProjects();
  }, [projects, completedProjects, searchTerm, activeFilters, sortDirection]);

  // Fungsi untuk mendapatkan token autentikasi
  const getAuthToken = async () => {
    if (!user) return null;
    try {
      return await user.getIdToken(true);
    } catch (error) {
      console.error("Error getting auth token:", error);
      return null;
    }
  };

  // Fetch projects from API
  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("Fetching projects...");

      const token = await getAuthToken();
      if (!token) {
        console.error("No auth token available");
        setIsLoading(false);
        return;
      }

      console.log("Token obtained, calling API...");
      const response = await fetch("/api/projects", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("API response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        throw new Error(errorData.error || "Failed to fetch projects");
      }

      const data = await response.json();
      console.log("Projects data received:", data);
      console.log("Project count:", data.length);

      if (!Array.isArray(data)) {
        console.error("Received non-array data:", data);
        throw new Error("Invalid data format returned from API");
      }

      // Separate active and completed projects
      const completed = data.filter((p) => p.completed);
      const active = data.filter((p) => !p.completed);

      console.log(
        `Processing ${active.length} active projects and ${completed.length} completed projects`
      );

      setProjects(active);
      setCompletedProjects(completed);
      setFilteredProjects(active);
      setFilteredCompletedProjects(completed);

      console.log("Projects state updated");
    } catch (error) {
      console.error("Error fetching projects:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter projects based on search term and active filters
  const filterProjects = () => {
    console.log("Filtering projects with search term:", searchTerm);
    console.log("Active filters:", activeFilters);
    console.log(
      "Sort direction:",
      sortDirection ? "Oldest First" : "Newest First"
    );

    // Filter active projects
    let filteredActive = projects.filter((project) => {
      // Check search term
      const matchesSearch =
        searchTerm === "" ||
        project.name.toLowerCase().includes(searchTerm.toLowerCase());

      // Check filters
      const matchesFilter =
        activeFilters.length === 0 ||
        (project.types
          ? project.types.some((type) => activeFilters.includes(type))
          : project.type
          ? activeFilters.includes(project.type)
          : false);

      return matchesSearch && matchesFilter;
    });

    // Filter completed projects
    let filteredCompleted = completedProjects.filter((project) => {
      // Check search term
      const matchesSearch =
        searchTerm === "" ||
        project.name.toLowerCase().includes(searchTerm.toLowerCase());

      // Check filters
      const matchesFilter =
        activeFilters.length === 0 ||
        (project.types
          ? project.types.some((type) => activeFilters.includes(type))
          : project.type
          ? activeFilters.includes(project.type)
          : false);

      return matchesSearch && matchesFilter;
    });

    // Sort projects by date
    filteredActive = sortProjects(filteredActive);
    filteredCompleted = sortProjects(filteredCompleted);

    console.log(
      `Filtered to ${filteredActive.length} active and ${filteredCompleted.length} completed projects`
    );

    setFilteredProjects(filteredActive);
    setFilteredCompletedProjects(filteredCompleted);
  };

  // Sort projects by date
  const sortProjects = (projectsToSort) => {
    return [...projectsToSort].sort((a, b) => {
      // Default date field is dateAdded for active projects
      // or dateCompleted for completed projects
      const dateFieldA = a.completed ? a.dateCompleted : a.dateAdded;
      const dateFieldB = b.completed ? b.dateCompleted : b.dateAdded;

      const dateA = dateFieldA ? new Date(dateFieldA) : new Date(0);
      const dateB = dateFieldB ? new Date(dateFieldB) : new Date(0);

      // Handle potential invalid dates
      const timeA = isNaN(dateA.getTime()) ? 0 : dateA.getTime();
      const timeB = isNaN(dateB.getTime()) ? 0 : dateB.getTime();

      // Sort based on sortDirection
      // false = newest first (default), true = oldest first
      return sortDirection ? timeA - timeB : timeB - timeA;
    });
  };

  // Toggle dropdown menu
  const toggleDropdown = (projectId) => {
    setActiveDropdown(projectId === activeDropdown ? null : projectId);
    // Close links dropdown when opening another dropdown
    if (projectId !== null && activeLinksDropdown !== null) {
      setActiveLinksDropdown(null);
    }
  };

  // Toggle links dropdown
  const toggleLinksDropdown = (projectId) => {
    setActiveLinksDropdown(
      projectId === activeLinksDropdown ? null : projectId
    );
    // Close options dropdown when opening links dropdown
    if (projectId !== null && activeDropdown !== null) {
      setActiveDropdown(null);
    }
  };

  // Toggle project MARK status (bukan completed)
  const toggleMark = async (projectId) => {
    try {
      const token = await getAuthToken();
      if (!token) return;

      const projectToUpdate = projects.find((p) => p.id === projectId);
      if (!projectToUpdate) return;

      const updated = {
        ...projectToUpdate,
        marked: !projectToUpdate.marked, // Gunakan marked, bukan completed
        // completed tetap sama seperti sebelumnya
      };

      // Update UI optimistically - TETAP dalam array active projects
      setProjects(projects.map((p) => (p.id === projectId ? updated : p)));

      // Send update to API
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updated),
      });

      if (!response.ok) {
        throw new Error("Failed to update project mark status");
      }

      // Update filtered projects with result
      setFilteredProjects(
        filteredProjects.map((p) => (p.id === projectId ? updated : p))
      );

      // Show notification
      const action = updated.marked ? "marked" : "unmarked";
      success(`Project ${updated.name} ${action} successfully`);
    } catch (error) {
      console.error("Error toggling mark status:", error);
      // Show error notification
      notifyError(`Failed to update project: ${error.message}`);
      // Rollback optimistic update if failed
      await fetchProjects();
    }
  };

  // Move project to completed - this actually moves the project to the Completed tab
  const moveToCompleted = async (projectId) => {
    try {
      const token = await getAuthToken();
      if (!token) return;

      const projectToUpdate = projects.find((p) => p.id === projectId);
      if (!projectToUpdate) return;

      const updatedProject = {
        ...projectToUpdate,
        completed: true,
        dateCompleted: new Date().toISOString(),
      };

      // Update UI optimistically - moving to completed projects array
      setProjects(projects.filter((p) => p.id !== projectId));
      setCompletedProjects([updatedProject, ...completedProjects]);

      // Also update filtered arrays
      setFilteredProjects(filteredProjects.filter((p) => p.id !== projectId));
      setFilteredCompletedProjects([
        updatedProject,
        ...filteredCompletedProjects,
      ]);

      // Send update to API
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedProject),
      });

      if (!response.ok) {
        throw new Error("Failed to complete project");
      }

      // Show success notification
      success(`Project ${updatedProject.name} marked as completed`);
    } catch (error) {
      console.error("Error moving to completed:", error);
      // Show error notification
      notifyError(`Failed to complete project: ${error.message}`);
      // Only fetch all projects if there was an error
      await fetchProjects();
    }
  };

  // Move project back to active
  const moveToActive = async (projectId) => {
    try {
      const token = await getAuthToken();
      if (!token) return;

      const projectToUpdate = completedProjects.find((p) => p.id === projectId);
      if (!projectToUpdate) return;

      const updatedProject = {
        ...projectToUpdate,
        completed: false,
        dateCompleted: null,
      };

      // Update UI optimistically
      setCompletedProjects(completedProjects.filter((p) => p.id !== projectId));
      setProjects([updatedProject, ...projects]);

      // Also update filtered arrays
      setFilteredCompletedProjects(
        filteredCompletedProjects.filter((p) => p.id !== projectId)
      );
      setFilteredProjects([updatedProject, ...filteredProjects]);

      // Send update to API
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedProject),
      });

      if (!response.ok) {
        throw new Error("Failed to move project to active");
      }

      // Show success notification
      success(`Project ${updatedProject.name} moved back to active`);
    } catch (error) {
      console.error("Error moving to active:", error);
      // Show error notification
      notifyError(`Failed to move project to active: ${error.message}`);
      // Only refetch if there was an error
      await fetchProjects();
    }
  };

  // Add new project
  const addProject = async (project) => {
    try {
      const token = await getAuthToken();
      if (!token) return;

      // Debug logging
      console.log("Receiving project data in addProject:", project);
      console.log("Project name received:", project.name);

      const newProject = {
        ...project,
        completed: false,
        marked: false,
        dateAdded: new Date().toISOString(),
      };

      // Debug logging prepared project
      console.log("Prepared project for API:", newProject);

      // Generate temporary ID for optimistic update
      const tempId = `temp-${Date.now()}`;
      const newProjectWithId = { ...newProject, id: tempId };

      // Debug logging optimistic update
      console.log("Adding to UI with temp ID:", newProjectWithId);

      // Update UI optimistically
      setProjects([newProjectWithId, ...projects]);

      // Also update filtered projects if it would match current filters
      const shouldAddToFiltered =
        (searchTerm === "" ||
          newProject.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (activeFilters.length === 0 ||
          (newProject.types &&
            newProject.types.some((type) => activeFilters.includes(type))));

      if (shouldAddToFiltered) {
        setFilteredProjects([newProjectWithId, ...filteredProjects]);
      }

      // Debug logging API request
      console.log("Sending to API:", JSON.stringify(newProject));

      // Send to API
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newProject),
      });

      if (!response.ok) {
        throw new Error("Failed to add project");
      }

      // Get the response from the API (which only contains the ID)
      const responseData = await response.json();

      // Debug logging API response
      console.log("API response:", responseData);

      // Create a saved project object that combines our original data with the server-generated ID
      const savedProject = {
        ...newProject,
        id: responseData.id || tempId,
      };

      console.log("Complete saved project with name:", savedProject);

      // Replace the temporary project with the one from the server (with proper ID)
      setProjects((prevProjects) =>
        prevProjects.map((p) => (p.id === tempId ? savedProject : p))
      );

      if (shouldAddToFiltered) {
        setFilteredProjects((prevFiltered) =>
          prevFiltered.map((p) => (p.id === tempId ? savedProject : p))
        );
      }

      // Show success notification
      success(`Project ${savedProject.name} added successfully`);

      console.log("Project added successfully");
    } catch (error) {
      console.error("Error adding project:", error);
      // Show error notification
      notifyError(`Failed to add project: ${error.message}`);
      // Only refetch if there was an error
      await fetchProjects();
    }
  };

  // Delete project
  const deleteProject = async (projectId) => {
    try {
      const token = await getAuthToken();
      if (!token) return;

      // Determine if the project is in active or completed list
      const isActive = projects.some((p) => p.id === projectId);
      const projectName = isActive
        ? projects.find((p) => p.id === projectId)?.name
        : completedProjects.find((p) => p.id === projectId)?.name;

      // Update UI optimistically
      if (isActive) {
        setProjects(projects.filter((p) => p.id !== projectId));
        setFilteredProjects(filteredProjects.filter((p) => p.id !== projectId));
      } else {
        setCompletedProjects(
          completedProjects.filter((p) => p.id !== projectId)
        );
        setFilteredCompletedProjects(
          filteredCompletedProjects.filter((p) => p.id !== projectId)
        );
      }

      // Send delete request to API
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete project");
      }

      // Show success notification
      success(`Project ${projectName || ""} deleted successfully`);
    } catch (error) {
      console.error("Error deleting project:", error);
      // Show error notification
      notifyError(`Failed to delete project: ${error.message}`);
      // Only refetch if there was an error
      await fetchProjects();
    }
  };

  // Edit project
  const editProject = (projectId) => {
    const projectToEdit = projects.find((p) => p.id === projectId);
    if (projectToEdit) {
      setEditingProject(projectToEdit);
      setNewLink({ name: "", url: "" });
      setShowEditForm(true);
    }
  };

  // Update edited project
  const updateProject = async (e) => {
    e.preventDefault();

    try {
      const token = await getAuthToken();
      if (!token) return;

      // Update UI optimistically
      setProjects(
        projects.map((p) => (p.id === editingProject.id ? editingProject : p))
      );

      // Also update filtered projects to show changes immediately
      setFilteredProjects(
        filteredProjects.map((p) =>
          p.id === editingProject.id ? editingProject : p
        )
      );

      // Send update to API
      const response = await fetch(`/api/projects/${editingProject.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editingProject),
      });

      if (!response.ok) {
        throw new Error("Failed to update project");
      }

      // Show success notification
      success(`Project ${editingProject.name} updated successfully`);

      // Reset form
      setShowEditForm(false);
      setEditingProject(null);

      // No need to call fetchProjects() since we've updated the UI optimistically
    } catch (error) {
      console.error("Error updating project:", error);
      // Show error notification
      notifyError(`Failed to update project: ${error.message}`);
      // Only refetch if there was an error
      await fetchProjects();
    }
  };

  // View project notes
  const viewProjectNotes = (project) => {
    setActiveProjectNotes({
      name: project.name,
      notes: project.notes,
    });
    setShowNotesModal(true);
    // Show info notification
    info(`Viewing notes for ${project.name}`);
  };

  // Reset all project marks
  const resetAllMarks = async () => {
    if (projects.length === 0) return;

    try {
      const token = await getAuthToken();
      if (!token) return;

      // Mark all projects as not marked
      const toReset = [...projects].map((p) => ({
        ...p,
        marked: false, // Reset marking, bukan completed
      }));

      // Optimistic update
      setProjects(toReset);

      // Also update filtered projects to show changes immediately
      setFilteredProjects(
        filteredProjects.map((p) => ({
          ...p,
          marked: false,
        }))
      );

      // Send batch update to API
      const responses = await Promise.all(
        toReset.map((project) =>
          fetch(`/api/projects/${project.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(project),
          })
        )
      );

      // Check if any request failed
      const anyFailed = responses.some((response) => !response.ok);
      if (anyFailed) {
        throw new Error("One or more updates failed");
      }

      // Show success notification
      success(`All project marks have been reset`);
    } catch (error) {
      console.error("Error resetting marks:", error);
      // Show error notification
      notifyError(`Failed to reset all marks: ${error.message}`);
      // Only refetch if there was an error
      await fetchProjects();
    }
  };

  // Show loading state
  if (isLoading) {
    return <Loading />;
  }

  // Show error state
  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-center min-h-screen">
        <div className="bg-red-900/30 border border-red-500 rounded-lg p-6 max-w-md w-full text-center">
          <h2 className="text-xl font-bold text-white mb-2">Error</h2>
          <p className="text-red-300 mb-4">{error}</p>
          <button
            onClick={fetchProjects}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="max-w-6xl mx-auto px-4 py-6"
      style={{
        height: "calc(100vh - 40px)",
        overflow: "hidden",
        marginBottom: "40px",
      }}
    >
      <Header
        showCompleted={showCompleted}
        filteredProjects={filteredProjects}
        resetAllMarks={resetAllMarks}
        setShowAddForm={setShowAddForm}
      />

      <Navigation
        showCompleted={showCompleted}
        setShowCompleted={setShowCompleted}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        activeFilters={activeFilters}
        setActiveFilters={setActiveFilters}
        typeOptions={typeOptions}
        sortDirection={sortDirection}
        setSortDirection={setSortDirection}
      />

      <div className="mt-6">
        {!showCompleted ? (
          <ActiveProjects
            projects={projects}
            filteredProjects={filteredProjects}
            toggleMark={toggleMark}
            toggleDropdown={toggleDropdown}
            activeDropdown={activeDropdown}
            moveToCompleted={moveToCompleted}
            deleteProject={deleteProject}
            editProject={editProject}
            viewProjectNotes={viewProjectNotes}
            toggleLinksDropdown={toggleLinksDropdown}
            activeLinksDropdown={activeLinksDropdown}
            typeOptions={typeOptions}
          />
        ) : (
          <CompletedProjects
            completedProjects={completedProjects}
            filteredCompletedProjects={filteredCompletedProjects}
            viewProjectNotes={viewProjectNotes}
            toggleLinksDropdown={toggleLinksDropdown}
            activeLinksDropdown={activeLinksDropdown}
            typeOptions={typeOptions}
            moveToActive={moveToActive}
          />
        )}
      </div>

      {showAddForm && (
        <AddProjectModal
          setShowAddForm={setShowAddForm}
          addProject={addProject}
          typeOptions={typeOptions}
        />
      )}

      {showEditForm && editingProject && (
        <EditProjectModal
          editingProject={editingProject}
          setEditingProject={setEditingProject}
          newLink={newLink}
          setNewLink={setNewLink}
          updateProject={updateProject}
          setShowEditForm={setShowEditForm}
          highlightAddLink={highlightAddLink}
          setHighlightAddLink={setHighlightAddLink}
          typeOptions={typeOptions}
        />
      )}

      {showNotesModal && (
        <NotesModal
          activeProjectNotes={activeProjectNotes}
          setShowNotesModal={setShowNotesModal}
          setActiveProjectNotes={setActiveProjectNotes}
        />
      )}
    </div>
  );
}
