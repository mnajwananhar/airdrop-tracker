"use client";

import { Search, X } from "lucide-react";

const SearchBar = ({
  searchTerm,
  setSearchTerm,
  placeholder = "Search projects or links...",
}) => {
  return (
    <div className="search-container">
      <div className="search-icon">
        <Search size={18} className="text-gray-500" />
      </div>
      <input
        type="text"
        placeholder={placeholder}
        value={searchTerm || ""}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />
      {searchTerm && searchTerm.length > 0 && (
        <button
          onClick={() => setSearchTerm("")}
          className="search-clear-button"
          aria-label="Clear search"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
