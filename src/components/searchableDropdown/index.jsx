"use client";
import React, { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";

const SearchableDropdown = ({
  options,
  value,
  onChange,
  className = "",
  placeholder = "Select...",
  label,
  required = false,
  disabled = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState(options);
  const dropdownRef = useRef(null);

  // If value exists, find its display name from options
  const selectedOption = options.find((option) => option.id === value);
  const displayValue = selectedOption ? selectedOption.name : "";

  // Update filtered options when search term changes
  useEffect(() => {
    if (searchTerm === "") {
      setFilteredOptions(options);
    } else {
      const filtered = options.filter((option) =>
        option.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOptions(filtered);
    }
  }, [searchTerm, options]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleOptionSelect = (option) => {
    onChange({ target: { value: option.id } });
    setIsOpen(false);
    setSearchTerm("");
  };

  // Allow custom value entry (will pass the typed value as is)
  const handleCustomValue = () => {
    if (searchTerm.trim() !== "") {
      onChange({ target: { value: searchTerm } });
      setIsOpen(false);
      setSearchTerm("");
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div
        className={`flex items-center border rounded-md p-2 cursor-pointer bg-white ${
          disabled ? "opacity-60 cursor-not-allowed" : ""
        }`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="flex-1 truncate">
          {value ? displayValue : placeholder}
        </div>
        <svg
          className={`w-4 h-4 ml-2 transition-transform ${
            isOpen ? "transform rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg">
          <div className="flex items-center p-2 border-b">
            <Search size={16} className="text-gray-400 mr-2" />
            <input
              type="text"
              className="w-full focus:outline-none text-sm"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearchChange}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          </div>

          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.id}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                  onClick={() => handleOptionSelect(option)}
                >
                  {option.name}
                </div>
              ))
            ) : (
              <div className="p-3 text-sm text-gray-500">
                No matches found.
                <button
                  className="block w-full mt-1 text-left text-xs text-blue-600 hover:underline"
                  onClick={handleCustomValue}
                >
                  Use "{searchTerm}" as custom value
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableDropdown;
