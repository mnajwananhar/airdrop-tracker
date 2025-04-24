"use client";

import {
  Check,
  MoreHorizontal,
  Link as LinkIcon,
  ExternalLink,
  FileCheck,
  FileText,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const ActiveProjects = ({
  projects,
  filteredProjects,
  toggleMark, // Updated function
  toggleDropdown,
  activeDropdown,
  moveToCompleted,
  deleteProject,
  editProject,
  viewProjectNotes,
  toggleLinksDropdown,
  activeLinksDropdown,
  typeOptions = [],
}) => {
  // State declarations - all together at the top
  const [expandedLinkDropdowns, setExpandedLinkDropdowns] = useState({});
  const [optionsPosition, setOptionsPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const [linksPosition, setLinksPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [modalProjectId, setModalProjectId] = useState(null);
  const [isScrollLocked, setIsScrollLocked] = useState(false); // Add scroll lock state

  // Ref declarations
  const mainContainerRef = useRef(null);
  const optionsButtonRefs = useRef({});
  const linksButtonRefs = useRef({});
  const scrollContainerRef = useRef(null); // Add ref for scroll container

  // Constants
  const MAX_ITEMS_BEFORE_SCROLL = 7; // Changed to 7 items
  // Selalu aktifkan scrollbar terlepas dari jumlah item
  const shouldScroll = true;
  const MAX_LINKS_TO_SHOW = 4;

  // Helper functions
  const getTypeIcon = (type) => {
    switch (type) {
      case "daily":
        return <FileCheck size={16} className="text-blue-400" />;
      case "testnet":
        return <FileCheck size={16} className="text-purple-400" />;
      case "retro":
        return <FileCheck size={16} className="text-pink-400" />;
      case "node":
        return <FileCheck size={16} className="text-green-400" />;
      case "depin":
        return <FileCheck size={16} className="text-orange-400" />;
      default:
        return <FileCheck size={16} className="text-indigo-400" />;
    }
  };

  const getTypeLabel = (type) => {
    const option = Array.isArray(typeOptions)
      ? typeOptions.find((opt) => opt.value === type)
      : null;
    return option ? option.label : type;
  };

  const getProjectName = (projectId) => {
    const project = projects.find((p) => p.id === projectId);
    return project ? project.name : "this project";
  };

  // Function to calculate position with boundary detection
  const calculatePosition = (buttonRect, width, height = 150) => {
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    // Default position below the button
    let top = buttonRect.bottom + window.scrollY + 5;
    let left = buttonRect.right - width;

    // Check if dropdown would go below viewport
    if (top + height > viewportHeight + window.scrollY) {
      // Position above the button if there's not enough space below
      top = buttonRect.top + window.scrollY - height - 5;
    }

    // Check if dropdown would go beyond right edge
    if (left + width > viewportWidth) {
      left = viewportWidth - width - 10; // 10px padding from edge
    }

    // Check if dropdown would go beyond left edge
    if (left < 10) {
      left = 10; // 10px padding from edge
    }

    return { top, left, width };
  };

  // Action handler functions
  const toggleExpandLinks = (projectId) => {
    setExpandedLinkDropdowns((prev) => ({
      ...prev,
      [projectId]: !prev[projectId],
    }));
  };

  const handleShowDeleteModal = (projectId) => {
    setModalProjectId(projectId);
    setShowDeleteModal(true);
    toggleDropdown(null);
  };

  const confirmDelete = () => {
    if (modalProjectId) {
      deleteProject(modalProjectId);
      setShowDeleteModal(false);
      setModalProjectId(null);
    }
  };

  const handleShowCompleteModal = (projectId) => {
    setModalProjectId(projectId);
    setShowCompleteModal(true);
    toggleDropdown(null);
  };

  const confirmCompletion = () => {
    if (modalProjectId) {
      moveToCompleted(modalProjectId);
      setShowCompleteModal(false);
      setModalProjectId(null);
    }
  };

  // Effect for updating dropdown positions
  useEffect(() => {
    if (activeDropdown && optionsButtonRefs.current[activeDropdown]) {
      const buttonRect =
        optionsButtonRefs.current[activeDropdown].getBoundingClientRect();

      // Calculate position with boundary detection
      const position = calculatePosition(buttonRect, 144, 120);
      setOptionsPosition(position);
    }

    if (activeLinksDropdown && linksButtonRefs.current[activeLinksDropdown]) {
      const buttonRect =
        linksButtonRefs.current[activeLinksDropdown].getBoundingClientRect();
      const width =
        linksButtonRefs.current[activeLinksDropdown].dataset.linksCount > 4
          ? 300
          : 250;

      // Get project to determine dropdown height
      const project = filteredProjects.find(
        (p) => p.id === activeLinksDropdown
      );
      const linksCount = project?.links?.length || 0;
      const estimatedHeight = Math.min(linksCount * 40 + 20, 400); // 40px per item + padding

      // Calculate position with boundary detection
      const position = calculatePosition(buttonRect, width, estimatedHeight);
      setLinksPosition(position);
    }
  }, [activeDropdown, activeLinksDropdown, filteredProjects]);

  // Effect for click outside handling
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        activeDropdown &&
        optionsButtonRefs.current[activeDropdown] &&
        !optionsButtonRefs.current[activeDropdown].contains(e.target) &&
        !document.getElementById("options-dropdown-portal").contains(e.target)
      ) {
        toggleDropdown(null);
      }

      if (
        activeLinksDropdown &&
        linksButtonRefs.current[activeLinksDropdown] &&
        !linksButtonRefs.current[activeLinksDropdown].contains(e.target) &&
        !document.getElementById("links-dropdown-portal").contains(e.target)
      ) {
        toggleLinksDropdown(null);
      }

      if (showDeleteModal) {
        const modalContent = document.querySelector(".delete-modal-content");
        if (modalContent && !modalContent.contains(e.target)) {
          setShowDeleteModal(false);
        }
      }

      if (showCompleteModal) {
        const modalContent = document.querySelector(".complete-modal-content");
        if (modalContent && !modalContent.contains(e.target)) {
          setShowCompleteModal(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [
    activeDropdown,
    activeLinksDropdown,
    toggleDropdown,
    toggleLinksDropdown,
    showDeleteModal,
    showCompleteModal,
  ]);

  // Effect for creating portal containers
  useEffect(() => {
    const createPortalContainer = (id) => {
      if (!document.getElementById(id)) {
        const portalDiv = document.createElement("div");
        portalDiv.id = id;
        document.body.appendChild(portalDiv);
      }
    };

    createPortalContainer("options-dropdown-portal");
    createPortalContainer("links-dropdown-portal");
    createPortalContainer("delete-modal-portal");
    createPortalContainer("complete-modal-portal");

    return () => {
      const cleanupPortal = (id) => {
        const portal = document.getElementById(id);
        if (portal) document.body.removeChild(portal);
      };

      cleanupPortal("options-dropdown-portal");
      cleanupPortal("links-dropdown-portal");
      cleanupPortal("delete-modal-portal");
      cleanupPortal("complete-modal-portal");
    };
  }, []);

  // Effect to handle scroll locking when dropdowns are open
  useEffect(() => {
    // Lock scrolling when any dropdown is open
    const shouldLockScroll =
      activeDropdown !== null ||
      activeLinksDropdown !== null ||
      showDeleteModal ||
      showCompleteModal;

    // Set the scroll lock state
    setIsScrollLocked(shouldLockScroll);

    if (shouldLockScroll && scrollContainerRef.current) {
      // Save the current scroll position
      const scrollTop = scrollContainerRef.current.scrollTop;

      // Prevent scrolling on the container
      const preventScroll = (e) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      };

      const container = scrollContainerRef.current;
      container.style.overflow = "hidden";
      container.addEventListener("wheel", preventScroll, { passive: false });
      container.addEventListener("touchmove", preventScroll, {
        passive: false,
      });

      return () => {
        // Restore scrolling when dropdown is closed
        container.style.overflow = "";
        container.removeEventListener("wheel", preventScroll);
        container.removeEventListener("touchmove", preventScroll);
        // Restore scroll position
        container.scrollTop = scrollTop;
      };
    }
  }, [activeDropdown, activeLinksDropdown, showDeleteModal, showCompleteModal]);

  // Effect untuk mempertahankan scroll state setelah perubahan data
  useEffect(() => {
    // Pastikan scrollbar selalu muncul dan styling konsisten setelah aksi apapun
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.overflowY = "auto";
      scrollContainerRef.current.style.maxHeight = "calc(66vh - 30px)";
    }

    // Jaga styling setelah modal ditutup atau perubahan data
    if (
      !showDeleteModal &&
      !showCompleteModal &&
      !activeDropdown &&
      !activeLinksDropdown
    ) {
      setTimeout(() => {
        if (scrollContainerRef.current) {
          // Force refresh styling container
          const currentScroll = scrollContainerRef.current.scrollTop;
          scrollContainerRef.current.style.overflow = "";
          scrollContainerRef.current.style.overflow = "auto";
          scrollContainerRef.current.scrollTop = currentScroll;
        }
      }, 50);
    }
  }, [
    filteredProjects,
    showDeleteModal,
    showCompleteModal,
    activeDropdown,
    activeLinksDropdown,
  ]);

  // Prepare portal contents - defined inside the component
  const optionsDropdownPortal =
    activeDropdown &&
    createPortal(
      <div
        className="fixed py-1 w-36 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-50"
        style={{
          top: `${optionsPosition.top}px`,
          left: `${optionsPosition.left}px`,
          width: `${optionsPosition.width}px`,
        }}
      >
        <button
          onClick={() => handleShowCompleteModal(activeDropdown)}
          className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-300 hover:bg-gray-700"
        >
          <FileCheck size={14} className="mr-2 text-blue-400" />
          Complete
        </button>
        <button
          onClick={() => {
            editProject(activeDropdown);
            toggleDropdown(null);
          }}
          className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-300 hover:bg-gray-700"
        >
          <Edit size={14} className="mr-2 text-yellow-400" />
          Edit
        </button>
        <button
          onClick={() => handleShowDeleteModal(activeDropdown)}
          className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-300 hover:bg-gray-700"
        >
          <Trash2 size={14} className="mr-2 text-red-400" />
          Delete
        </button>
      </div>,
      document.getElementById("options-dropdown-portal")
    );

  const linksDropdownPortal =
    activeLinksDropdown &&
    createPortal(
      <div
        className="fixed py-1 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-50"
        style={{
          top: `${linksPosition.top}px`,
          left: `${linksPosition.left}px`,
          width: `${linksPosition.width}px`,
          maxHeight: "400px",
          overflowY: "auto",
        }}
      >
        {filteredProjects.find((p) => p.id === activeLinksDropdown)?.links &&
          (expandedLinkDropdowns[activeLinksDropdown]
            ? filteredProjects.find((p) => p.id === activeLinksDropdown).links
            : filteredProjects
                .find((p) => p.id === activeLinksDropdown)
                .links.slice(0, MAX_LINKS_TO_SHOW)
          ).map((link, index) => (
            <a
              key={index}
              href={
                link.url.startsWith("http") ? link.url : `https://${link.url}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
            >
              <span className="mr-2 truncate max-w-[200px]">{link.name}</span>
              <ExternalLink
                size={12}
                className="text-blue-400 ml-auto flex-shrink-0"
              />
            </a>
          ))}

        {filteredProjects.find((p) => p.id === activeLinksDropdown)?.links
          ?.length > MAX_LINKS_TO_SHOW && (
          <button
            onClick={() => toggleExpandLinks(activeLinksDropdown)}
            className="flex items-center justify-center w-full px-4 py-2 text-sm text-gray-400 hover:bg-gray-700 border-t border-gray-700"
          >
            {expandedLinkDropdowns[activeLinksDropdown] ? (
              <>
                <ChevronUp size={14} className="mr-1" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown size={14} className="mr-1" />
                Show{" "}
                {filteredProjects.find((p) => p.id === activeLinksDropdown)
                  .links.length - MAX_LINKS_TO_SHOW}{" "}
                More
              </>
            )}
          </button>
        )}
      </div>,
      document.getElementById("links-dropdown-portal")
    );

  const deleteModalPortal =
    showDeleteModal &&
    createPortal(
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-lg border border-gray-700 shadow-xl max-w-md w-full p-5 delete-modal-content">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              <div className="mr-3 flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-red-900/50">
                <AlertTriangle size={20} className="text-red-400" />
              </div>
              <h3 className="text-lg font-medium text-white">Delete Project</h3>
            </div>
            <button
              onClick={() => setShowDeleteModal(false)}
              className="text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
          <div className="mb-6">
            <p className="text-gray-300 mb-2">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-white">
                {getProjectName(modalProjectId)}
              </span>
              ?
            </p>
            <p className="text-red-400 text-sm">
              This action cannot be undone.
            </p>
          </div>
          <div className="flex space-x-3 justify-end">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 rounded-md bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center"
            >
              <Trash2 size={16} className="mr-1" />
              Delete
            </button>
          </div>
        </div>
      </div>,
      document.getElementById("delete-modal-portal")
    );

  const completeModalPortal =
    showCompleteModal &&
    createPortal(
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-lg border border-gray-700 shadow-xl max-w-md w-full p-5 complete-modal-content">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              <div className="mr-3 flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-blue-900/50">
                <FileCheck size={20} className="text-blue-400" />
              </div>
              <h3 className="text-lg font-medium text-white">
                Complete Project
              </h3>
            </div>
            <button
              onClick={() => setShowCompleteModal(false)}
              className="text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
          <div className="mb-6">
            <p className="text-gray-300">
              Are you sure you want to mark{" "}
              <span className="font-semibold text-white">
                {getProjectName(modalProjectId)}
              </span>{" "}
              as complete?
            </p>
          </div>
          <div className="flex space-x-3 justify-end">
            <button
              onClick={() => setShowCompleteModal(false)}
              className="px-4 py-2 rounded-md bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmCompletion}
              className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center"
            >
              <Check size={16} className="mr-1" />
              Complete
            </button>
          </div>
        </div>
      </div>,
      document.getElementById("complete-modal-portal")
    );

  // Main render
  return (
    <div ref={mainContainerRef} className="relative pb-8">
      {" "}
      {/* Added padding-bottom for counter */}
      {filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          {projects.length === 0 ? (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800 mb-4">
                <FileCheck size={32} className="text-blue-400" />
              </div>
              <p className="text-xl text-gray-400 mb-4">No active projects</p>
            </>
          ) : (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800 mb-4">
                <FileCheck size={32} className="text-gray-400" />
              </div>
              <p className="text-xl text-gray-400 mb-4">
                No matching projects found
              </p>
            </>
          )}
        </div>
      ) : (
        <>
          <div
            ref={scrollContainerRef}
            className={`space-y-3 ${shouldScroll ? "scrollbar-container" : ""}`}
            style={{
              maxHeight: "calc(66vh - 30px)",
              overflowY: "auto",
              overflowX: "hidden",
              paddingRight: "12px",
              marginRight: "-8px",
            }}
          >
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between p-4 rounded-lg border border-gray-800 bg-gray-800/30 backdrop-blur-sm hover:bg-gray-800/50 transition-all duration-200"
              >
                <div className="flex items-start">
                  {/* Left side with icon and content */}
                  <div className="flex-shrink-0 w-8 h-8 mr-3 flex items-center justify-center rounded-full bg-gray-900">
                    {getTypeIcon(
                      project.types && project.types.length > 0
                        ? project.types[0]
                        : project.type || "daily"
                    )}
                  </div>

                  <div>
                    <h3
                      className={`font-medium ${
                        project.marked ? "opacity-70" : ""
                      }`}
                    >
                      {project.name}
                    </h3>

                    {/* Type badges with better spacing */}
                    <div className="flex flex-wrap gap-1 mt-1">
                      {project.types && project.types.length > 0
                        ? project.types.map((type) => (
                            <span
                              key={type}
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                type === "daily"
                                  ? "bg-blue-900/50 text-blue-300"
                                  : type === "testnet"
                                  ? "bg-purple-900/50 text-purple-300"
                                  : type === "retro"
                                  ? "bg-pink-900/50 text-pink-300"
                                  : type === "node"
                                  ? "bg-green-900/50 text-green-300"
                                  : type === "depin"
                                  ? "bg-orange-900/50 text-orange-300"
                                  : "bg-indigo-900/50 text-indigo-300"
                              }`}
                            >
                              {getTypeLabel(type)}
                            </span>
                          ))
                        : project.type && (
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                project.type === "daily"
                                  ? "bg-blue-900/50 text-blue-300"
                                  : project.type === "testnet"
                                  ? "bg-purple-900/50 text-purple-300"
                                  : project.type === "retro"
                                  ? "bg-pink-900/50 text-pink-300"
                                  : project.type === "node"
                                  ? "bg-green-900/50 text-green-300"
                                  : project.type === "depin"
                                  ? "bg-orange-900/50 text-orange-300"
                                  : "bg-indigo-900/50 text-indigo-300"
                              }`}
                            >
                              {getTypeLabel(project.type)}
                            </span>
                          )}
                    </div>
                  </div>
                </div>

                {/* Right side with action buttons */}
                <div className="flex items-center ml-auto space-x-2">
                  {/* Notes button */}
                  {project.notes && (
                    <button
                      onClick={() => viewProjectNotes(project)}
                      className="flex-shrink-0 p-1.5 rounded-full hover:bg-gray-700"
                      title="View Notes"
                    >
                      <FileText size={18} className="text-yellow-400" />
                    </button>
                  )}

                  {/* Links button */}
                  {project.links && project.links.length > 0 && (
                    <button
                      ref={(el) => {
                        linksButtonRefs.current[project.id] = el;
                      }}
                      data-links-count={project.links.length}
                      onClick={() =>
                        toggleLinksDropdown(
                          activeLinksDropdown === project.id ? null : project.id
                        )
                      }
                      className={`flex-shrink-0 p-1.5 rounded-full hover:bg-gray-700 ${
                        activeLinksDropdown === project.id ? "bg-gray-700" : ""
                      }`}
                      title="View Links"
                    >
                      <LinkIcon size={18} className="text-blue-400" />
                    </button>
                  )}

                  {/* Check button - only toggle marked/unmarked status */}
                  <button
                    onClick={() => toggleMark(project.id)}
                    className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 ${
                      project.marked // Use marked, not completed
                        ? "bg-green-600/20 text-green-400 border border-green-500"
                        : "bg-gray-700 hover:bg-gray-600 text-gray-400 border border-gray-600"
                    }`}
                    title={project.marked ? "Unmark" : "Mark as Complete"}
                  >
                    <Check size={16} />
                  </button>

                  {/* Menu dropdown */}
                  <button
                    ref={(el) => {
                      optionsButtonRefs.current[project.id] = el;
                    }}
                    onClick={() =>
                      toggleDropdown(
                        activeDropdown === project.id ? null : project.id
                      )
                    }
                    className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 transition-all duration-200 ${
                      activeDropdown === project.id ? "bg-gray-600" : ""
                    }`}
                    title="More Options"
                  >
                    <MoreHorizontal size={16} className="text-gray-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Counter positioned absolutely at the bottom with clear space */}
          <div className="absolute bottom-0 right-0 text-sm text-gray-400 pb-1 pt-2">
            Showing {filteredProjects.length} projects
          </div>
        </>
      )}
      {/* Render all portals directly in the return statement */}
      {optionsDropdownPortal}
      {linksDropdownPortal}
      {deleteModalPortal}
      {completeModalPortal}
    </div>
  );
};

export default ActiveProjects;
