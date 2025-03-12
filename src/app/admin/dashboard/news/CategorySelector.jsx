"use client";
import React, { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";

const CategorySelector = ({ value, onChange, options, error, hideLabel }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [localSelected, setLocalSelected] = useState(null);
  const componentRef = useRef(null);

  // Normalize options to ensure they all have consistent property names
  const normalizedOptions = options.map((option) => ({
    id: option.id,
    name: option.name || option.categoryName,
    categoryName: option.categoryName || option.name,
    userCount: option.userCount || 0,
    filterGroupCount: option.filterGroupCount || 0,
  }));

  // Find the selected category using either property name
  const selectedGroup = value
    ? normalizedOptions.find(
        (group) =>
          group.id.toString() === value.toString() ||
          (group.name && group.name.toString() === value.toString())
      )
    : localSelected;

  // Initialize search query with selected category name when component mounts or value changes
  useEffect(() => {
    if (value && selectedGroup) {
      const displayName = selectedGroup.name || selectedGroup.categoryName;
      setSearchQuery(displayName || "");
      // Only update local selected if it's different to avoid circular updates
      if (
        !localSelected ||
        localSelected.id.toString() !== selectedGroup.id.toString()
      ) {
        setLocalSelected(selectedGroup);
      }
    }
  }, [value]);

  // Handle clicks outside the component
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        componentRef.current &&
        !componentRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle selection change - try to match the parent component's expected event format
  const handleSelect = (group) => {
    console.log("Selecting group:", group);

    // Create a normalized event with both possible property structures
    const eventValue = {
      target: {
        name: "newsCategoryId",
        value: group.id.toString(),
      },
    };

    // Pass the event to parent component
    onChange(eventValue);

    // Update local state
    const displayName = group.name || group.categoryName;
    setSearchQuery(displayName || "");
    setLocalSelected(group);
    setShowDropdown(false);
  };

  // Handle clearing selection
  const handleClear = () => {
    console.log("Clearing selection");

    // Clear with proper event structure
    onChange({
      target: {
        name: "newsCategoryId",
        value: "",
      },
    });

    setSearchQuery("");
    setLocalSelected(null);
  };

  // Get display name for an option considering both possible property names
  const getDisplayName = (option) => option.name || option.categoryName || "";

  return (
    <div
      className="bg-white rounded-lg p-4 border border-gray-200"
      ref={componentRef}
    >
      {!hideLabel && (
        <h3 className="text-sm font-medium mb-2 leading-5 text-gray-800/90">
          Category
        </h3>
      )}

      <div className="relative">
        <input
          type="text"
          placeholder="Search Category..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowDropdown(true);
          }}
          onClick={() => setShowDropdown(true)}
          className="w-full px-4 py-2 text-[0.85rem] font-normal border rounded-md focus:outline-none focus:border-[#01dbc8]"
        />
        <Search className="absolute right-3 top-2.5 text-gray-400" size={18} />

        {showDropdown && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
            {normalizedOptions
              .filter((group) => {
                const displayName = getDisplayName(group);
                return displayName
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase());
              })
              .map((group) => (
                <div
                  key={group.id}
                  className={`px-4 py-2 hover:bg-gray-50 cursor-pointer ${
                    group.id.toString() === value ? "bg-emerald-50" : ""
                  }`}
                  onClick={() => handleSelect(group)}
                >
                  <div className="font-medium">{getDisplayName(group)}</div>
                  <div className="text-xs text-gray-400 flex gap-2 mt-1">
                    <span className="flex items-center gap-1">
                      <span className="inline-block w-4 h-4 bg-gray-200 rounded-full text-center text-xs leading-4">
                        U
                      </span>
                      {group.userCount || 0} Users
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="inline-block w-4 h-4 bg-gray-200 rounded-full text-center text-xs leading-4">
                        F
                      </span>
                      {group.filterGroupCount || 0} Filters
                    </span>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {(value || localSelected) && selectedGroup && (
        <div className="mt-2 bg-[#f9fefe] text-[#0AAC9E] px-3 py-2 rounded-lg flex justify-between items-center">
          <span>Selected: {getDisplayName(selectedGroup)}</span>
          <button
            type="button"
            onClick={handleClear}
            className="text-[#0AAC9E] hover:text-emerald-800"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
};

export default CategorySelector;
