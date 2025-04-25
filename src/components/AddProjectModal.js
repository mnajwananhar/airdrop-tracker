"use client";

import { useState } from "react";
import { X, PlusCircle, Save, Link as LinkIcon } from "lucide-react";
import MultiSelect from "./MultiSelect";

const AddProjectModal = ({ setShowAddForm, addProject, typeOptions }) => {
  const [newProject, setNewProject] = useState({
    name: "",
    notes: "",
    links: [],
    types: ["daily"],
  });
  const [newLink, setNewLink] = useState({ name: "", url: "" });
  const [highlightAddLink, setHighlightAddLink] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProject({ ...newProject, [name]: value });
  };

  const handleLinkChange = (e) => {
    const { name, value } = e.target;
    const fieldName = name === "linkName" ? "name" : name;
    const updatedLink = { ...newLink, [fieldName]: value };
    setNewLink(updatedLink);

    if (name === "linkName" && value.trim()) {
      setHighlightAddLink(updatedLink.url.trim() ? true : false);
    } else if (name === "url") {
      setHighlightAddLink(updatedLink.name.trim() && value.trim());
    }
  };

  const handleTypeChange = (selectedTypes) => {
    setNewProject({ ...newProject, types: selectedTypes });
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

    setNewProject({
      ...newProject,
      links: [...newProject.links, { name: newLink.name, url: formattedUrl }],
    });
    setNewLink({ name: "", url: "" });
    setHighlightAddLink(false);
  };

  const removeLink = (index) => {
    setNewProject({
      ...newProject,
      links: newProject.links.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (newLink.name.trim() || newLink.url.trim()) {
      setHighlightAddLink(true);
      return;
    }

    addProject(newProject);
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-0 overflow-y-auto">
      <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-md p-4 sm:p-8 my-4 sm:my-0 max-h-[90vh] sm:max-h-[85vh] flex flex-col">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-blue-400">
            Add New Project
          </h2>
          <button
            onClick={() => setShowAddForm(false)}
            className="text-gray-400 hover:text-white rounded-full hover:bg-gray-700 p-1 sm:p-2"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-container pr-1">
          <form
            id="add-project-form"
            onSubmit={handleSubmit}
            className="space-y-4 sm:space-y-6"
          >
            <div className="form-field">
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Project Name
              </label>
              <div className="input-container">
                <input
                  type="text"
                  name="name"
                  value={newProject.name}
                  onChange={handleInputChange}
                  className="input-field w-full bg-gray-800 border border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter project name"
                  required
                />
              </div>
            </div>
            <div className="form-field">
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Additional Notes
              </label>
              <div className="input-container">
                <textarea
                  name="notes"
                  value={newProject.notes}
                  onChange={handleInputChange}
                  className="input-field w-full bg-gray-800 border border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Add any notes or reminders for this project (optional)"
                  rows="3"
                  style={{ overflow: "auto", resize: "none" }}
                />
              </div>
            </div>
            <div className="form-field">
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Ecosystem Links
              </label>
              {newProject.links.length > 0 && (
                <div className="mb-3 bg-gray-800 rounded-lg p-3">
                  <div className="space-y-2 max-h-36 sm:max-h-48 overflow-y-auto pr-1 scrollbar-container">
                    {newProject.links.map((link, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between px-3 py-2 rounded-md bg-gray-700/50 border border-gray-700"
                      >
                        <div className="flex items-center space-x-2 overflow-hidden min-w-0 flex-1 mr-2">
                          <LinkIcon
                            size={14}
                            className="text-blue-400 flex-shrink-0"
                          />
                          <span className="text-sm text-gray-300 font-medium whitespace-nowrap">
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
                          className="text-red-400 hover:text-red-600 hover:bg-gray-600 rounded-full p-1 flex-shrink-0"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 gap-3">
                <div className="input-container">
                  <input
                    type="text"
                    name="linkName"
                    value={newLink.name}
                    onChange={handleLinkChange}
                    className="input-field w-full bg-gray-800 border border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Link name (e.g., Website)"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <div className="input-container flex-1">
                    <input
                      type="text"
                      name="url"
                      value={newLink.url}
                      onChange={handleLinkChange}
                      className={`input-field w-full bg-gray-800 border border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        newLink.name.trim() && !newLink.url.trim()
                          ? "border-2 border-red-500 animate-pulse shadow-lg shadow-red-500/50"
                          : ""
                      }`}
                      placeholder="Link URL (e.g., https://example.com)"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addLink}
                    className={`p-2 sm:p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex-shrink-0 transition-all duration-200 ${
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
            <div className="relative z-30">
              {" "}
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Airdrop Types (Select Multiple)
              </label>
              <MultiSelect
                options={typeOptions}
                selected={newProject.types}
                onChange={handleTypeChange}
                placeholder="Select airdrop types"
              />
            </div>

            <div className="h-16"></div>
          </form>
        </div>

        <div className="sticky bottom-0 pt-4 flex justify-end space-x-2 sm:space-x-3 bg-gray-900 border-t border-gray-800 mt-4 z-40">
          <button
            type="button"
            onClick={() => setShowAddForm(false)}
            className="px-3 sm:px-5 py-2 sm:py-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 font-medium transition-all duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="add-project-form"
            className="px-3 sm:px-5 py-2 sm:py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center font-medium transition-all duration-200"
          >
            <Save size={16} className="mr-1 sm:mr-2" />
            Add Project
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProjectModal;
