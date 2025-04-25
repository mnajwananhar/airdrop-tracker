"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, X, Check, Filter, Plus } from "lucide-react";

const MultiSelect = ({
  options = [],
  selected = [],
  onChange,
  placeholder = "Select options",
  maxVisibleItems = 3,
  showBadgeCount = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isOpen && containerRef.current && dropdownRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const availableSpaceBelow = window.innerHeight - containerRect.bottom;
      const dropdownHeight = dropdownRef.current.offsetHeight;

      if (
        availableSpaceBelow < dropdownHeight &&
        containerRect.top > dropdownHeight
      ) {
        dropdownRef.current.style.bottom = "100%";
        dropdownRef.current.style.top = "auto";
        dropdownRef.current.style.marginBottom = "8px";
        dropdownRef.current.style.marginTop = "0";
      } else {
        dropdownRef.current.style.top = "100%";
        dropdownRef.current.style.bottom = "auto";
        dropdownRef.current.style.marginTop = "8px";
        dropdownRef.current.style.marginBottom = "0";
      }
    }
  }, [isOpen]);

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
      case "other":
        return "bg-gray-700 text-gray-300";
      default:
        return "bg-indigo-900/50 text-indigo-300";
    }
  };

  const displayedItems =
    showBadgeCount && selected.length > maxVisibleItems
      ? selected.slice(0, maxVisibleItems)
      : selected;

  const remainingCount = selected.length - maxVisibleItems;

  return (
    <div className="relative" ref={containerRef}>
      <div
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 sm:px-4 py-2 text-white flex justify-between items-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center flex-1 overflow-hidden">
          <Filter size={18} className="text-gray-500 mr-2 flex-shrink-0" />
          <div className="flex flex-wrap gap-1 mr-2 max-w-full overflow-hidden">
            {selected.length === 0 ? (
              <span className="text-gray-400 truncate">{placeholder}</span>
            ) : (
              <div className="flex flex-wrap gap-1 max-w-full">
                {displayedItems.map((value) => {
                  const option = options.find((opt) => opt.value === value);
                  return (
                    <div
                      key={value}
                      className={`${getTypeColorClass(
                        value
                      )} text-xs sm:text-sm px-2 py-0.5 rounded-full flex items-center max-w-[100px] sm:max-w-[120px]`}
                    >
                      <span className="truncate">
                        {option ? option.label : value}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeOption(e, value);
                        }}
                        className="ml-1 text-gray-400 hover:text-white flex-shrink-0"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  );
                })}

                {showBadgeCount && remainingCount > 0 && (
                  <div className="bg-gray-700 text-gray-300 text-xs sm:text-sm px-2 py-0.5 rounded-full flex items-center">
                    <span>+{remainingCount}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <ChevronDown
          size={20}
          className={`text-gray-400 transition-transform duration-200 flex-shrink-0 ${
            isOpen ? "transform rotate-180" : ""
          }`}
        />
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto scrollbar-container"
        >
          <div className="py-1">
            {options.map((option) => (
              <div
                key={option.value}
                className="px-3 sm:px-4 py-2 flex items-center justify-between hover:bg-gray-700 cursor-pointer"
                onClick={() => toggleOption(option.value)}
              >
                <span className="text-white truncate">{option.label}</span>
                {selected.includes(option.value) && (
                  <Check size={16} className="text-blue-400 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  function removeOption(e, value) {
    e.stopPropagation();
    onChange(selected.filter((item) => item !== value));
  }
};

export default MultiSelect;
