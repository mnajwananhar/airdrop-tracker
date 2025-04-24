"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, X, Check, Filter } from "lucide-react";

const MultiSelect = ({
  options = [],
  selected = [],
  onChange,
  placeholder = "Select options",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (value) => {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  // Get display names for selected values
  const getDisplayValues = () => {
    if (selected.length === 0) return placeholder;

    return selected
      .map((value) => {
        const option = options.find((opt) => opt.value === value);
        return option ? option.label : value;
      })
      .join(", ");
  };

  const removeOption = (e, value) => {
    e.stopPropagation();
    onChange(selected.filter((item) => item !== value));
  };

  // Get color class based on type
  const getTypeColorClass = (type) => {
    switch (type) {
      case "daily":
        return "bg-blue-900/50 text-blue-300";
      case "testnet":
        return "bg-purple-900/50 text-purple-300";
      case "retro":
        return "bg-pink-900/50 text-pink-300";
      case "node":
        return "bg-green-900/50 text-green-300";
      case "depin":
        return "bg-orange-900/50 text-orange-300";
      default:
        return "bg-indigo-900/50 text-indigo-300";
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <div
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white flex justify-between items-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center flex-1">
          <Filter size={18} className="text-gray-500 mr-2" />
          <div className="flex flex-wrap gap-1 mr-2">
            {selected.length === 0 ? (
              <span className="text-gray-400">{placeholder}</span>
            ) : (
              <div className="flex flex-wrap gap-1">
                {selected.map((value) => {
                  const option = options.find((opt) => opt.value === value);
                  return (
                    <div
                      key={value}
                      className={`${getTypeColorClass(
                        value
                      )} text-sm px-2 py-0.5 rounded-full flex items-center`}
                    >
                      <span>{option ? option.label : value}</span>
                      <button
                        onClick={(e) => removeOption(e, value)}
                        className="ml-1 text-gray-400 hover:text-white"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <ChevronDown
          size={20}
          className={`text-gray-400 transition-transform duration-200 ${
            isOpen ? "transform rotate-180" : ""
          }`}
        />
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto custom-scrollbar">
          <div className="py-1">
            {options.map((option) => (
              <div
                key={option.value}
                className="px-4 py-2 flex items-center justify-between hover:bg-gray-700 cursor-pointer"
                onClick={() => toggleOption(option.value)}
              >
                <span className="text-white">{option.label}</span>
                {selected.includes(option.value) && (
                  <Check size={16} className="text-blue-400" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelect;
