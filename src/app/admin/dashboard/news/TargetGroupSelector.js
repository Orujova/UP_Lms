"use client";
import React, { useState, useRef, useEffect } from "react";
import { Search, X, Check, ChevronDown } from "lucide-react";

const TargetGroupSelector = ({
  targetGroups,
  value,
  onChange,
  error,
  hideLabel,
  multiple = false,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const componentRef = useRef(null);
  const inputRef = useRef(null);

  // Handle multiple selection (array of IDs) or single selection (string ID)
  const selectedGroups = multiple
    ? targetGroups.filter((group) => value.includes(group.id.toString()))
    : targetGroups.filter((group) => group.id.toString() === value);

  // Set search query when value changes
  useEffect(() => {
    if (!multiple && value && selectedGroups.length > 0) {
      setSearchQuery(selectedGroups[0].name);
    } else if (!showDropdown) {
      setSearchQuery("");
    }
  }, [value, selectedGroups, multiple, showDropdown]);

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

  // Toggle selection for multiple mode
  const toggleSelection = (groupId) => {
    if (value.includes(groupId)) {
      onChange(value.filter((id) => id !== groupId));
    } else {
      onChange([...value, groupId]);
    }
  };

  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Filter groups based on search query
  const filteredGroups = targetGroups.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md"
      ref={componentRef}
    >
      {!hideLabel && (
        <h3 className="text-sm font-semibold mb-2 leading-5 text-gray-800">
          {multiple ? "Target Groups" : "Target Group"}
        </h3>
      )}

      <div className="relative">
        <div
          className={`flex items-center border ${
            showDropdown
              ? "border-[#01dbc8] ring-2 ring-[#01dbc8]/20"
              : "border-gray-200"
          } rounded-lg transition-all duration-200 ${
            multiple && selectedGroups.length > 0 ? "pb-1" : "pb-0"
          }`}
          onClick={focusInput}
        >
          <div className="flex-grow flex flex-wrap items-center px-3 pt-2">
            {multiple && selectedGroups.length > 0 && (
              <div className="flex flex-wrap gap-1 w-full mb-1">
                {selectedGroups.map((group) => (
                  <div
                    key={group.id}
                    className="bg-[#ebfaf9] text-[#0AAC9E] text-xs px-2 py-1 rounded-md flex items-center gap-1 transition-all hover:bg-[#d7f6f3]"
                  >
                    <span className="max-w-[180px] truncate">{group.name}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelection(group.id.toString());
                      }}
                      className="text-[#0AAC9E] hover:text-emerald-800 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <input
              ref={inputRef}
              type="text"
              placeholder={`${
                multiple && selectedGroups.length > 0
                  ? "Add more..."
                  : `Search target group${multiple ? "s" : ""}...`
              }`}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowDropdown(true);
              }}
              onClick={(e) => {
                e.stopPropagation();
                setShowDropdown(true);
              }}
              className="w-full py-2 text-sm font-normal focus:outline-none bg-transparent"
            />
          </div>
          <div className="flex items-center pr-3">
            {searchQuery && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchQuery("");
                }}
                className="mr-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={16} />
              </button>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowDropdown(!showDropdown);
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showDropdown ? (
                <ChevronDown
                  size={18}
                  className="transform rotate-180 transition-transform duration-200"
                />
              ) : (
                <ChevronDown
                  size={18}
                  className="transition-transform duration-200"
                />
              )}
            </button>
          </div>
        </div>

        {/* Dropdown menu */}
        {showDropdown && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
            {filteredGroups.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                No matching groups found
              </div>
            ) : (
              filteredGroups.map((group) => {
                const isSelected = multiple
                  ? value.includes(group.id.toString())
                  : group.id.toString() === value;

                return (
                  <div
                    key={group.id}
                    className={`px-4 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors duration-150 ${
                      isSelected ? "bg-emerald-50" : ""
                    }`}
                    onClick={() => {
                      if (multiple) {
                        toggleSelection(group.id.toString());
                        // Keep focus on input after selection in multiple mode
                        focusInput();
                      } else {
                        onChange(group.id.toString());
                        setSearchQuery(group.name);
                        setShowDropdown(false);
                      }
                    }}
                  >
                    <div className="flex items-center">
                      {multiple && (
                        <div
                          className={`w-5 h-5 mr-2 flex-shrink-0 rounded border ${
                            isSelected
                              ? "bg-[#01dbc8] border-[#01dbc8]"
                              : "border-gray-300"
                          } flex items-center justify-center`}
                        >
                          {isSelected && (
                            <Check size={14} className="text-white" />
                          )}
                        </div>
                      )}
                      <div className="flex-grow">
                        <div className="font-medium text-sm">{group.name}</div>
                        <div className="text-xs text-gray-500 flex gap-3 mt-1">
                          <span className="flex items-center gap-1">
                            <span className="inline-block w-4 h-4 bg-[#f0f0f0] rounded-full text-center text-xs leading-4">
                              U
                            </span>
                            {group.userCount || 0} Users
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="inline-block w-4 h-4 bg-[#f0f0f0] rounded-full text-center text-xs leading-4">
                              F
                            </span>
                            {group.filterGroupCount || 0} Filters
                          </span>
                        </div>
                      </div>
                      {!multiple && isSelected && (
                        <Check size={16} className="text-[#01dbc8] ml-2" />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Display selected item for single selection mode */}
      {!multiple && value && selectedGroups.length > 0 && !showDropdown && (
        <div className="mt-2 bg-[#ebfaf9] text-[#0AAC9E] px-3 py-2 rounded-lg flex justify-between items-center transition-all duration-200 hover:bg-[#d7f6f3]">
          <span className="text-sm">Selected: {selectedGroups[0].name}</span>
          <button
            type="button"
            onClick={() => {
              onChange("");
              setSearchQuery("");
            }}
            className="text-[#0AAC9E] hover:text-emerald-800 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Selection summary for multiple mode */}
      {multiple && selectedGroups.length > 0 && (
        <div className="mt-2 text-xs text-gray-500">
          {selectedGroups.length} group{selectedGroups.length > 1 ? "s" : ""}{" "}
          selected
        </div>
      )}

      {error && (
        <p className="text-red-500 text-xs mt-2 transition-all duration-300">
          {error}
        </p>
      )}
    </div>
  );
};

export default TargetGroupSelector;
