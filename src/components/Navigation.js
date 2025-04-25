"use client";

import { CheckSquare, Award } from "lucide-react";
import MultiSelect from "./MultiSelect";
import SortButton from "./SortButton";
import SearchBar from "./SearchBar";

const Navigation = ({
  showCompleted,
  setShowCompleted,
  searchTerm,
  setSearchTerm,
  activeFilters,
  setActiveFilters,
  typeOptions,
  sortDirection,
  setSortDirection,
}) => {
  return (
    <div className="flex flex-col mb-6 space-y-4 navigation-container">
      <div className="flex bg-gray-800 rounded-xl p-1">
        <button
          className={`flex-1 py-2 px-3 sm:px-4 rounded-lg transition-all duration-200 flex items-center justify-center ${
            !showCompleted
              ? "bg-blue-600 text-white shadow-lg"
              : "hover:bg-gray-700"
          }`}
          onClick={() => setShowCompleted(false)}
        >
          <CheckSquare size={16} className="mr-1 sm:mr-2" />
          <span className="text-sm sm:text-base">Active Tasks</span>
        </button>
        <button
          className={`flex-1 py-2 px-3 sm:px-4 rounded-lg transition-all duration-200 flex items-center justify-center ${
            showCompleted
              ? "bg-blue-600 text-white shadow-lg"
              : "hover:bg-gray-700"
          }`}
          onClick={() => setShowCompleted(true)}
        >
          <Award size={16} className="mr-1 sm:mr-2" />
          <span className="text-sm sm:text-base">Completed</span>
        </button>
      </div>

      <div className="grid grid-cols-12 gap-2 grid-layout">
        <div className="col-span-12 sm:col-span-7">
          <SearchBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            placeholder="Search projects or links..."
          />
        </div>

        <div className="col-span-4 sm:col-span-2">
          <SortButton
            sortDirection={sortDirection}
            setSortDirection={setSortDirection}
          />
        </div>

        <div className="col-span-8 sm:col-span-3">
          <MultiSelect
            options={typeOptions}
            selected={activeFilters}
            onChange={setActiveFilters}
            placeholder="Filter by type"
            maxVisibleItems={2}
            showBadgeCount={true}
          />
        </div>
      </div>
    </div>
  );
};

export default Navigation;
