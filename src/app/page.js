"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNotification } from "../contexts/NotificationContext";
import Header from "../components/Header";
import ActiveProjects from "../components/ActiveProjects";
import CompletedProjects from "../components/CompletedProjects";
import AddProjectModal from "../components/AddProjectModal";
import EditProjectModal from "../components/EditProjectModal";
import NotesModal from "../components/NotesModal";
import Navigation from "../components/Navigation";
import Loading from "../components/Loading";

export default function Home() {
  const { user } = useAuth();
  const { success, error: notifyError, info } = useNotification();

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
  const [sortDirection, setSortDirection] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const typeOptions = [
    { value: "daily", label: "Daily" },
    { value: "testnet", label: "Testnet" },
    { value: "retro", label: "Retroactive" },
    { value: "node", label: "Node" },
    { value: "depin", label: "DePIN" },
    { value: "waitlist", label: "Waitlist" },
    { value: "other", label: "Other" },
  ];

  const getAuthToken = async () => {
    if (!user) return null;
    try {
      return await user.getIdToken(true);
    } catch (error) {
      return null;
    }
  };

  // Make fetchProjects a useCallback to avoid unnecessary re-renders
  const fetchProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = await getAuthToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await fetch("/api/projects", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch projects");
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Invalid data format returned from API");
      }

      const completed = data.filter((p) => p.completed);
      const active = data.filter((p) => !p.completed);

      setProjects(active);
      setCompletedProjects(completed);
      setFilteredProjects(active);
      setFilteredCompletedProjects(completed);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []); // Empty dependency array since it doesn't depend on any state or props

  // Make filterProjects a useCallback to avoid unnecessary re-renders
  const filterProjects = useCallback(() => {
    let filteredActive = projects.filter((project) => {
      const matchesSearch =
        searchTerm === "" ||
        project.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter =
        activeFilters.length === 0 ||
        (project.types
          ? project.types.some((type) => activeFilters.includes(type))
          : project.type
          ? activeFilters.includes(project.type)
          : false);

      return matchesSearch && matchesFilter;
    });

    let filteredCompleted = completedProjects.filter((project) => {
      const matchesSearch =
        searchTerm === "" ||
        project.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter =
        activeFilters.length === 0 ||
        (project.types
          ? project.types.some((type) => activeFilters.includes(type))
          : project.type
          ? activeFilters.includes(project.type)
          : false);

      return matchesSearch && matchesFilter;
    });

    filteredActive = sortProjects(filteredActive);
    filteredCompleted = sortProjects(filteredCompleted);

    setFilteredProjects(filteredActive);
    setFilteredCompletedProjects(filteredCompleted);
  }, [projects, completedProjects, searchTerm, activeFilters, sortDirection]); // Add all dependencies here

  useEffect(() => {
    if (user) {
      fetchProjects();
    } else {
      setIsLoading(false);
    }
  }, [user, fetchProjects]); // Add fetchProjects as a dependency

  useEffect(() => {
    filterProjects();
  }, [filterProjects]); // Add filterProjects as a dependency

  const sortProjects = (projectsToSort) => {
    return [...projectsToSort].sort((a, b) => {
      const dateFieldA = a.completed ? a.dateCompleted : a.dateAdded;
      const dateFieldB = b.completed ? b.dateCompleted : b.dateAdded;

      const dateA = dateFieldA ? new Date(dateFieldA) : new Date(0);
      const dateB = dateFieldB ? new Date(dateFieldB) : new Date(0);

      const timeA = isNaN(dateA.getTime()) ? 0 : dateA.getTime();
      const timeB = isNaN(dateB.getTime()) ? 0 : dateB.getTime();

      return sortDirection ? timeA - timeB : timeB - timeA;
    });
  };

  // Toggle dropdown menu
  const toggleDropdown = (projectId) => {
    setActiveDropdown(projectId === activeDropdown ? null : projectId);
    if (projectId !== null && activeLinksDropdown !== null) {
      setActiveLinksDropdown(null);
    }
  };

  const toggleLinksDropdown = (projectId) => {
    setActiveLinksDropdown(
      projectId === activeLinksDropdown ? null : projectId
    );
    if (projectId !== null && activeDropdown !== null) {
      setActiveDropdown(null);
    }
  };

  const toggleMark = async (projectId) => {
    try {
      const token = await getAuthToken();
      if (!token) return;

      const projectToUpdate = projects.find((p) => p.id === projectId);
      if (!projectToUpdate) return;

      const updated = {
        ...projectToUpdate,
        marked: !projectToUpdate.marked,
      };

      setProjects(projects.map((p) => (p.id === projectId ? updated : p)));

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

      setFilteredProjects(
        filteredProjects.map((p) => (p.id === projectId ? updated : p))
      );
    } catch (error) {
      notifyError(`Failed to update project: ${error.message}`);
      await fetchProjects();
    }
  };

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

      setProjects(projects.filter((p) => p.id !== projectId));
      setCompletedProjects([updatedProject, ...completedProjects]);

      setFilteredProjects(filteredProjects.filter((p) => p.id !== projectId));
      setFilteredCompletedProjects([
        updatedProject,
        ...filteredCompletedProjects,
      ]);

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

      success(`Project ${updatedProject.name} marked as completed`);
    } catch (error) {
      notifyError(`Failed to complete project: ${error.message}`);
      await fetchProjects();
    }
  };

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

      setCompletedProjects(completedProjects.filter((p) => p.id !== projectId));
      setProjects([updatedProject, ...projects]);

      setFilteredCompletedProjects(
        filteredCompletedProjects.filter((p) => p.id !== projectId)
      );
      setFilteredProjects([updatedProject, ...filteredProjects]);

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

      success(`Project ${updatedProject.name} moved back to active`);
    } catch (error) {
      notifyError(`Failed to move project to active: ${error.message}`);
      await fetchProjects();
    }
  };

  const addProject = async (project) => {
    try {
      const token = await getAuthToken();
      if (!token) return;

      const newProject = {
        ...project,
        completed: false,
        marked: false,
        dateAdded: new Date().toISOString(),
      };

      const tempId = `temp-${Date.now()}`;
      const newProjectWithId = { ...newProject, id: tempId };

      setProjects([newProjectWithId, ...projects]);

      const shouldAddToFiltered =
        (searchTerm === "" ||
          newProject.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (activeFilters.length === 0 ||
          (newProject.types &&
            newProject.types.some((type) => activeFilters.includes(type))));

      if (shouldAddToFiltered) {
        setFilteredProjects([newProjectWithId, ...filteredProjects]);
      }

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

      const responseData = await response.json();

      const savedProject = {
        ...newProject,
        id: responseData.id || tempId,
      };

      setProjects((prevProjects) =>
        prevProjects.map((p) => (p.id === tempId ? savedProject : p))
      );

      if (shouldAddToFiltered) {
        setFilteredProjects((prevFiltered) =>
          prevFiltered.map((p) => (p.id === tempId ? savedProject : p))
        );
      }

      success(`Project ${savedProject.name} added successfully`);
    } catch (error) {
      notifyError(`Failed to add project: ${error.message}`);
      await fetchProjects();
    }
  };

  const deleteProject = async (projectId) => {
    try {
      const token = await getAuthToken();
      if (!token) return;

      const isActive = projects.some((p) => p.id === projectId);
      const projectName = isActive
        ? projects.find((p) => p.id === projectId)?.name
        : completedProjects.find((p) => p.id === projectId)?.name;

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

      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete project");
      }

      success(`Project ${projectName || ""} deleted successfully`);
    } catch (error) {
      notifyError(`Failed to delete project: ${error.message}`);
      await fetchProjects();
    }
  };

  const editProject = (projectId) => {
    const projectToEdit = projects.find((p) => p.id === projectId);
    if (projectToEdit) {
      setEditingProject(projectToEdit);
      setNewLink({ name: "", url: "" });
      setShowEditForm(true);
    }
  };

  const updateProject = async (e) => {
    e.preventDefault();

    try {
      const token = await getAuthToken();
      if (!token) return;

      setProjects(
        projects.map((p) => (p.id === editingProject.id ? editingProject : p))
      );

      setFilteredProjects(
        filteredProjects.map((p) =>
          p.id === editingProject.id ? editingProject : p
        )
      );

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

      success(`Project ${editingProject.name} updated successfully`);

      setShowEditForm(false);
      setEditingProject(null);
    } catch (error) {
      notifyError(`Failed to update project: ${error.message}`);
      await fetchProjects();
    }
  };

  const viewProjectNotes = (project) => {
    setActiveProjectNotes({
      name: project.name,
      notes: project.notes,
    });
    setShowNotesModal(true);
  };

  const resetAllMarks = async () => {
    if (projects.length === 0) return;

    try {
      const token = await getAuthToken();
      if (!token) return;

      const toReset = [...projects].map((p) => ({
        ...p,
        marked: false,
      }));

      setProjects(toReset);

      setFilteredProjects(
        filteredProjects.map((p) => ({
          ...p,
          marked: false,
        }))
      );

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

      const anyFailed = responses.some((response) => !response.ok);
      if (anyFailed) {
        throw new Error("One or more updates failed");
      }
    } catch (error) {
      notifyError(`Failed to reset all marks: ${error.message}`);
      await fetchProjects();
    }
  };

  if (isLoading) {
    return <Loading />;
  }

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
