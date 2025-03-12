// src/components/announcement/TargetGroupSelector.jsx
"use client";

import React, { useRef, useEffect } from "react";
import { Search, X, Check } from "lucide-react";

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

  // Check if a group is already selected
  const isGroupSelected = (groupId) => {
    return selectedTargetGroups.some((group) => group.id === groupId);
  };

  return (
    <div
      className="bg-white rounded-lg p-5 border border-gray-200"
      ref={dropdownRef}
    >
      <h2 className="text-base font-medium mb-4 flex items-center justify-between">
        <span>
          Target Groups <span className="text-red-500">*</span>
        </span>
        {selectedTargetGroups.length > 0 && (
          <span className="text-xs bg-[#0AAC9E] text-white px-2 py-1 rounded-full">
            {selectedTargetGroups.length} selected
          </span>
        )}
      </h2>

      {/* Selected Target Groups Pills - Modern Design */}
      {selectedTargetGroups.length > 0 && (
        <div className="mb-4 p-2 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex flex-wrap gap-2">
            {selectedTargetGroups.map((group) => (
              <div
                key={group.id}
                className="bg-white border border-[#0AAC9E]/20 text-[#127D74] px-3 py-1.5 rounded-full flex items-center gap-2 text-sm shadow-sm"
              >
                <span className="font-medium">{group.name}</span>
                <button
                  type="button"
                  onClick={() => onRemove(group)}
                  className="text-[#127D74] hover:text-emerald-800 w-5 h-5 rounded-full flex items-center justify-center hover:bg-red-50 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="relative">
        <div className="flex items-center border rounded-lg transition-all duration-200 hover:border-[#01DBC8] focus-within:border-[#01DBC8] focus-within:ring-2 focus-within:ring-[#01DBC8]/20">
          <Search className="ml-3 text-gray-400 flex-shrink-0" size={16} />
          <input
            type="text"
            placeholder={
              selectedTargetGroups.length
                ? "Add more target groups..."
                : "Search target groups..."
            }
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            onClick={() => onToggleDropdown(true)}
            className="w-full px-2 py-2 text-sm rounded-lg focus:outline-none"
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

        {showDropdown && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-72 overflow-auto">
            <div className="sticky top-0 bg-gray-50 px-4 py-2 border-b">
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
                const selected = isGroupSelected(group.id);
                return (
                  <div
                    key={group.id}
                    className={`px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center ${
                      selected ? "bg-[#f0fbfa]" : ""
                    } border-b border-gray-100 last:border-b-0`}
                    onClick={() => onSelect(group)}
                  >
                    <div
                      className={`w-4 h-4 mr-3 rounded border flex-shrink-0 flex items-center justify-center ${
                        selected
                          ? "bg-[#0AAC9E] border-[#0AAC9E]"
                          : "border-gray-300"
                      }`}
                    >
                      {selected && <Check className="text-white w-3 h-3" />}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{group.name}</div>
                      <div className="text-xs text-gray-400 flex gap-3 mt-1">
                        <span className="flex items-center gap-1">
                          <span className="inline-block w-5 h-5 bg-[#0AAC9E]/10 rounded-full text-center text-xs leading-5 text-[#0AAC9E]">
                            U
                          </span>
                          {group.userCount} Users
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="inline-block w-5 h-5 bg-[#0AAC9E]/10 rounded-full text-center text-xs leading-5 text-[#0AAC9E]">
                            F
                          </span>
                          {group.filterGroupCount} Filters
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

            {targetGroups.filter((group) =>
              group.name.toLowerCase().includes(searchValue.toLowerCase())
            ).length === 0 && (
              <div className="px-4 py-8 text-center">
                <div className="text-gray-400 mb-2">No target groups found</div>
                <div className="text-xs text-gray-500">
                  Try a different search term
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TargetGroupSelector;
