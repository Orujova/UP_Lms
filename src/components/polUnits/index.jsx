"use client";

import React, { useRef, useEffect } from "react";
import { Search, X } from "lucide-react";

const PollUnitSelector = ({
  pollUnits,
  searchValue,
  selectedPollUnitId,
  showDropdown,
  onSearchChange,
  onToggleDropdown,
  onSelect,
  onClear,
}) => {
  const dropdownRef = useRef(null);

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
    <div
      className="bg-white rounded-lg p-4 border border-gray-200"
      ref={dropdownRef}
    >
      <h2 className="text-sm font-medium mb-3">Poll Unit</h2>
      <div className="relative">
        <div className="flex items-center border rounded-md transition-all duration-200 hover:border-[#01DBC8] focus-within:border-[#01DBC8] focus-within:ring-2 focus-within:ring-[#01DBC8]/20">
          <Search className="ml-3 text-gray-400 flex-shrink-0" size={16} />
          <input
            type="text"
            placeholder="Search poll units..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            onClick={() => onToggleDropdown(true)}
            className="w-full text-sm px-2 py-2 rounded-md focus:outline-none"
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
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
            {pollUnits
              .filter((unit) =>
                unit.title.toLowerCase().includes(searchValue.toLowerCase())
              )
              .map((unit) => (
                <div
                  key={unit.id}
                  className="px-4 py-2 text-xs hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  onClick={() => onSelect(unit)}
                >
                  <div className="font-medium">{unit.title}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {unit.description}
                  </div>
                </div>
              ))}

            {pollUnits.filter((unit) =>
              unit.title.toLowerCase().includes(searchValue.toLowerCase())
            ).length === 0 && (
              <div className="px-4 py-8 text-center">
                <div className="text-gray-400 mb-2">No poll units found</div>
                <div className="text-xs text-gray-500">
                  Try a different search term
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {selectedPollUnitId && (
        <div className="mt-2 bg-[#f9fefe] text-[#127D74] px-3 py-2 rounded-lg flex justify-between items-center">
          <span className="text-xs">
            Selected Poll Unit ID: {selectedPollUnitId}
          </span>
          <button
            type="button"
            onClick={onClear}
            className="text-[#127D74] hover:text-emerald-800"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export default PollUnitSelector;
