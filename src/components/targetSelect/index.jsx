"use client";

import React, { useRef, useEffect } from "react";
import { Search, X } from "lucide-react";

const TargetGroupSelector = ({
  targetGroups,
  searchValue,
  selectedTargetGroups,
  showDropdown,
  onSearchChange,
  onToggleDropdown,
  onSelect,
  onRemove,
}) => {
  const dropdownRef = useRef(null);

  // Handle outside click to close the dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        if (showDropdown) {
          onToggleDropdown(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown, onToggleDropdown]);

  return (
    <div className="w-full" ref={dropdownRef}>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-800">
          Target Groups <span className="text-red-500">*</span>
        </label>
        {selectedTargetGroups.length > 0 && (
          <span className="text-xs bg-[#0AAC9E] text-white px-2 py-0.5 rounded-full">
            {selectedTargetGroups.length} selected
          </span>
        )}
      </div>

      {/* Selected Chips Area - Fixed Height Container */}
      <div
        className={`w-full mb-3 ${
          selectedTargetGroups.length > 0
            ? " overflow-y-auto p-2 bg-gray-50 border border-gray-200 rounded-lg"
            : ""
        }`}
      >
        <div className="flex flex-wrap gap-2">
          {selectedTargetGroups.map((group) => (
            <div
              key={group.id}
              className="inline-flex items-center gap-1 bg-white border border-[#0AAC9E]/20 rounded-full px-2 py-1"
            >
              <span className="text-xs font-medium text-[#0AAC9E] truncate max-w-[120px]">
                {group.name}
              </span>
              <button
                type="button"
                onClick={() => onRemove(group)}
                className="w-4 h-4 flex-shrink-0 flex items-center justify-center rounded-full text-[#0AAC9E] hover:bg-gray-100"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative mt-2">
        <div className="flex items-center border rounded-lg transition-colors focus-within:border-[#01dbc8] ">
          <Search className="ml-3 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Add more target groups..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            onClick={() => onToggleDropdown(true)}
            className="w-full px-2 py-2.5 text-sm rounded-lg focus:outline-none"
          />
          {searchValue && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="mr-3 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Dropdown List */}
        {showDropdown && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
            <div className="sticky top-0 bg-gray-50 px-3 py-2 border-b">
              <span className="text-xs text-gray-500 font-medium">
                {
                  targetGroups.filter((group) =>
                    group.name.toLowerCase().includes(searchValue.toLowerCase())
                  ).length
                }{" "}
                groups found
              </span>
            </div>

            {targetGroups
              .filter((group) =>
                group.name.toLowerCase().includes(searchValue.toLowerCase())
              )
              .map((group) => {
                const isSelected = selectedTargetGroups.some(
                  (selected) => selected.id === group.id
                );
                return (
                  <div
                    key={group.id}
                    onClick={() => onSelect(group)}
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-50 border-b last:border-b-0 ${
                      isSelected ? "bg-[#f0fbfa]" : ""
                    }`}
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center mr-3 border ${
                          isSelected
                            ? "bg-[#0AAC9E] border-[#0AAC9E]"
                            : "border-gray-300"
                        }`}
                      >
                        {isSelected && (
                          <svg
                            width="10"
                            height="10"
                            viewBox="0 0 10 10"
                            fill="none"
                          >
                            <path
                              d="M8 3L4 7L2 5"
                              stroke="white"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>
                      <div>
                        <div className="text-sm">{group.name}</div>
                      </div>
                    </div>
                  </div>
                );
              })}

            {targetGroups.filter((group) =>
              group.name.toLowerCase().includes(searchValue.toLowerCase())
            ).length === 0 && (
              <div className="px-4 py-6 text-center">
                <div className="text-gray-400">No groups found</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TargetGroupSelector;
