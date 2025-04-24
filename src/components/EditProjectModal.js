"use client";

import { X, PlusCircle, Save, Link as LinkIcon } from "lucide-react";
import MultiSelect from "./MultiSelect";
import { useState } from "react";

const EditProjectModal = ({
  editingProject,
  setEditingProject,
  newLink,
  setNewLink,
  updateProject,
  setShowEditForm,
  highlightAddLink,
  setHighlightAddLink,
  typeOptions,
}) => {
  if (!editingProject) return null; // Ensure modal doesn't render without data

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditingProject({ ...editingProject, [name]: value });
  };

  const handleLinkChange = (e) => {
    const { name, value } = e.target;
    // Map linkName field to name property in newLink state
    const fieldName = name === "linkName" ? "name" : name;
    const updatedLink = { ...newLink, [fieldName]: value };
    setNewLink(updatedLink);

    // Highlight logic for URL field and Add button
    if (name === "linkName" && value.trim()) {
      // If name is filled, highlight URL field if it's empty
      setHighlightAddLink(updatedLink.url.trim() ? true : false);
    } else if (name === "url") {
      // If URL is being filled and name is already filled, highlight Add button
      setHighlightAddLink(updatedLink.name.trim() && value.trim());
    }
  };

  const handleTypeChange = (selectedTypes) => {
    setEditingProject({ ...editingProject, types: selectedTypes });
  };

  const addLink = () => {
    if (!newLink.name.trim() || !newLink.url.trim()) {
      setHighlightAddLink(true);
      return;
    }

    let formattedUrl = newLink.url.trim();
    if (
      !formattedUrl.startsWith("http://") &&
      !formattedUrl.startsWith("https://")
    ) {
      formattedUrl = "https://" + formattedUrl;
    }

    setEditingProject({
      ...editingProject,
      links: [
        ...editingProject.links,
        { name: newLink.name, url: formattedUrl },
      ],
    });
    setNewLink({ name: "", url: "" });
    setHighlightAddLink(false);
  };

  const removeLink = (index) => {
    setEditingProject({
      ...editingProject,
      links: editingProject.links.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-md p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-blue-400">Edit Project</h2>
          <button
            onClick={() => {
              setShowEditForm(false);
              setEditingProject(null);
              setHighlightAddLink(false);
            }}
            className="text-gray-400 hover:text-white rounded-full hover:bg-gray-700 p-2"
          >
            <X size={20} />
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();

            // Check if link fields have content but haven't been added yet
            if (newLink.name.trim() || newLink.url.trim()) {
              setHighlightAddLink(true);
              return; // Prevent submission until the link is added or fields are cleared
            }

            updateProject(e);
          }}
          className="space-y-6"
        >
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Project Name
            </label>
            <input
              type="text"
              name="name"
              value={editingProject.name}
              onChange={handleInputChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter project name"
              required
            />
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Additional Notes
            </label>
            <textarea
              name="notes"
              value={editingProject.notes || ""}
              onChange={handleInputChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Add any notes or reminders for this project (optional)"
              rows="3"
            />
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Ecosystem Links
            </label>
            {editingProject.links && editingProject.links.length > 0 && (
              <div className="mb-3 bg-gray-800 rounded-lg p-3">
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                  {editingProject.links.map((link, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between px-3 py-2 rounded-md bg-gray-700/50 border border-gray-700"
                    >
                      <div className="flex items-center space-x-2 overflow-hidden">
                        <LinkIcon
                          size={14}
                          className="text-blue-400 flex-shrink-0"
                        />
                        <span className="text-sm text-gray-300 font-medium">
                          {link.name}:
                        </span>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:underline text-sm truncate"
                        >
                          {link.url}
                        </a>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeLink(index)}
                        className="text-red-400 hover:text-red-600 hover:bg-gray-600 rounded-full p-1 flex-shrink-0 ml-2"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 gap-3">
              <input
                type="text"
                name="linkName"
                value={newLink.name}
                onChange={handleLinkChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Link name (e.g., Website)"
              />
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  name="url"
                  value={newLink.url}
                  onChange={handleLinkChange}
                  className={`flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    newLink.name.trim() && !newLink.url.trim()
                      ? "border-2 border-red-500 animate-pulse shadow-lg shadow-red-500/50"
                      : ""
                  }`}
                  placeholder="Link URL (e.g., https://example.com)"
                />
                <button
                  type="button"
                  onClick={addLink}
                  className={`p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex-shrink-0 transition-all duration-200 ${
                    highlightAddLink
                      ? "border-2 border-red-500 animate-pulse shadow-lg shadow-red-500/50"
                      : ""
                  }`}
                  title="Add link"
                >
                  <PlusCircle size={20} />
                </button>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Airdrop Types (Select Multiple)
            </label>
            <MultiSelect
              options={typeOptions}
              selected={
                editingProject.types || [editingProject.type || "daily"]
              }
              onChange={handleTypeChange}
              placeholder="Select airdrop types"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowEditForm(false);
                setEditingProject(null);
                setHighlightAddLink(false);
              }}
              className="px-5 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 font-medium transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center font-medium transition-all duration-200"
            >
              <Save size={16} className="mr-2" />
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProjectModal;
