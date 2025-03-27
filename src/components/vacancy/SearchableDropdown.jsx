// @/components/vacancy/SearchableDropdown.jsx
"use client";

import React, { useRef, useEffect, useState } from "react";
import { Search, X, ChevronDown } from "lucide-react";

const SearchableDropdown = ({
  options,
  value,
  onChange,
  placeholder,
  label,
  error,
  required = false,
  displayKey = "name",
  valueKey = "id",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const dropdownRef = useRef(null);

  // Get selected option display value
  const selectedOption = options?.find((option) => option[valueKey] === value);
  const displayValue = selectedOption ? selectedOption[displayKey] : "";

  // Filter options based on search value
  const filteredOptions =
    options?.filter((option) =>
      option[displayKey].toLowerCase().includes(searchValue.toLowerCase())
    ) || [];

  // Handle outside click to close the dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle option selection
  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchValue("");
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchValue("");
    }
  };

  // Clear selection
  const clearSelection = (e) => {
    e.stopPropagation();
    onChange("");
    setSearchValue("");
  };

  return (
    <div className="w-full" ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        <div
          onClick={toggleDropdown}
          className={`flex items-center justify-between w-full px-3 py-2 text-sm border ${
            error ? "border-red-300" : "border-gray-200"
          } rounded-lg cursor-pointer hover:border-gray-300 transition-colors ${
            isOpen ? "border-[#01DBC8] ring-1 ring-[#01DBC8]/20" : ""
          }`}
        >
          <div className="flex-1 truncate">
            {!isOpen ? (
              displayValue || (
                <span className="text-gray-400">{placeholder}</span>
              )
            ) : (
              <div className="flex items-center">
                <Search className="text-gray-400 mr-2" size={16} />
                <input
                  type="text"
                  autoFocus
                  className="w-full outline-none"
                  placeholder="Search..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}
          </div>

          <div className="flex items-center">
            {displayValue && !isOpen && (
              <button
                type="button"
                onClick={clearSelection}
                className="mr-1 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
            <ChevronDown
              size={16}
              className={`text-gray-400 transition-transform ${
                isOpen ? "transform rotate-180" : ""
              }`}
            />
          </div>
        </div>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
            <div className="sticky top-0 bg-gray-50 px-3 py-2 border-b">
              <span className="text-xs text-gray-500 font-medium">
                {filteredOptions.length}{" "}
                {filteredOptions.length === 1 ? "option" : "options"} found
              </span>
            </div>

            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option[valueKey]}
                  onClick={() => handleSelect(option[valueKey])}
                  className={`px-4 py-2 cursor-pointer hover:bg-gray-50 border-b last:border-b-0 ${
                    option[valueKey] === value ? "bg-[#f0fbfa]" : ""
                  }`}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center mr-3 border ${
                        option[valueKey] === value
                          ? "bg-[#0AAC9E] border-[#0AAC9E]"
                          : "border-gray-300"
                      }`}
                    >
                      {option[valueKey] === value && (
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
                    <div className="text-sm">{option[displayKey]}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-6 text-center">
                <div className="text-gray-400">No options found</div>
              </div>
            )}
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};

export default SearchableDropdown;
