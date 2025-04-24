"use client";

import { Calendar, ArrowDown, ArrowUp } from "lucide-react";

const SortButton = ({ sortDirection, setSortDirection }) => {
  return (
    <button
      onClick={() => setSortDirection(!sortDirection)}
      className="w-full h-10 flex items-center justify-center bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white hover:bg-gray-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    >
      <div className="flex items-center">
        <Calendar size={16} className="text-blue-400 mr-2" />
        <span className="text-sm mr-1">
          {sortDirection ? "Oldest" : "Newest"}
        </span>
        {sortDirection ? (
          <ArrowUp size={14} className="text-blue-400" />
        ) : (
          <ArrowDown size={14} className="text-blue-400" />
        )}
      </div>
    </button>
  );
};

export default SortButton;
