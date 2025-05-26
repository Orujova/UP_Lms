"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Edit,
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  Search,
} from "lucide-react";

// ProfileInfoRow component - Enhanced with better spacing and transitions
const ProfileInfoRow = ({
  icon: Icon,
  label,
  value,
  fieldName,
  editMode,
  onEdit,
  type = "text",
  options = [],
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [searchText, setSearchText] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSave = () => {
    onEdit(fieldName, editValue);
    setIsEditing(false);
    setShowDropdown(false);
  };

  if (editMode && isEditing) {
    return (
      <div className="flex items-center py-3 transition-colors bg-gray-50 rounded-lg p-3 my-2">
        <Icon className="w-4 h-4 mr-3 text-gray-950 flex-shrink-0" />

        {type === "select" ? (
          <div className="flex-grow mr-3 relative" ref={dropdownRef}>
            <div
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-full px-3 py-2 border rounded-lg flex justify-between items-center cursor-pointer hover:border-[#01DBC8] bg-white transition-colors"
            >
              <span className="truncate">
                {options && Array.isArray(options) && options.length > 0
                  ? options.find((opt) => opt.id === parseInt(editValue))
                      ?.name || "Select an option"
                  : "Select an option"}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 transition-transform ${
                  showDropdown ? "transform rotate-180" : ""
                }`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>

            {showDropdown && options && Array.isArray(options) && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                <div className="p-2 sticky top-0 bg-white border-b">
                  <div className="relative">
                    <Search className="absolute left-2 top-2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-sm border rounded-md"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
                <div>
                  {options
                    .filter((option) =>
                      option.name
                        ?.toLowerCase()
                        .includes(searchText.toLowerCase())
                    )
                    .map((option) => (
                      <div
                        key={option.id}
                        className={`px-3 py-2 text-xs font-medium cursor-pointer hover:bg-[#f2fdfc] transition-colors ${
                          parseInt(editValue) === option.id
                            ? "bg-[#f2fdfc] text-[#0AAC9E] font-medium"
                            : ""
                        }`}
                        onClick={() => {
                          setEditValue(option.id.toString());
                          setShowDropdown(false);
                        }}
                      >
                        {option.name}
                      </div>
                    ))}
                  {options.filter((option) =>
                    option.name
                      ?.toLowerCase()
                      .includes(searchText.toLowerCase())
                  ).length === 0 && (
                    <div className="px-3 py-2 text-sm text-gray-500 italic text-center">
                      No results found
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <input
            type={type}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="flex-grow mr-3 px-3 py-2 border outline-0 rounded-lg focus:ring-0 focus:border-[#01DBC8] text-sm"
            autoFocus
          />
        )}

        <div className="flex space-x-2">
          <button
            onClick={handleSave}
            className="p-1.5 bg-[#ecfcfb] text-[#0AAC9E] rounded-md hover:bg-[#e0fbf8] transition-colors"
            title="Save"
          >
            <CheckCircle className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setIsEditing(false);
              setShowDropdown(false);
            }}
            className="p-1.5 bg-red-50 text-red-500 rounded-md hover:bg-red-100 transition-colors"
            title="Cancel"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center py-3 border-b border-gray-100 last:border-b-0 transition-colors hover:bg-gray-50 rounded-md px-3">
      <Icon className="w-4 h-4 text-gray-500 mr-3" />
      <div className="flex-grow">
        <span className="text-xs text-gray-500 block">{label}</span>
        <span className="font-medium text-gray-800 text-sm">
          {value || "N/A"}
        </span>
      </div>

      {editMode && (
        <button
          onClick={() => setIsEditing(true)}
          className="p-1.5 text-gray-400 hover:text-[#0AAC9E] hover:bg-[#f2fdfc] rounded-md transition-colors"
          title="Edit"
        >
          <Edit className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default ProfileInfoRow;
