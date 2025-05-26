"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  User,
  Briefcase,
  Building2,
  Save,
  RefreshCw,
  ChevronDown,
  Search,
  CheckCircle2,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";

const levelOptions = [
  {
    value: 0,
    label: "Manager",
    icon: <Briefcase size={16} className="text-gray-500" />,
  },
  {
    value: 1,
    label: "Non-Manager",
    icon: <User size={16} className="text-gray-500" />,
  },
  {
    value: 2,
    label: "N/A",
    icon: <AlertCircle size={16} className="text-gray-500" />,
  },
];

const PositionFormModal = ({
  isOpen,
  onClose,
  name,
  setName,
  level,
  setLevel,
  selectedPositionGroups,
  setSelectedPositionGroups,
  availablePositionGroups,
  isLoading,
  isEditing,
  positionId,
  searchTerm,
  setSearchTerm,
  handleSubmit,
  resetForm,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const dropdownContentRef = useRef(null);
  const searchInputRef = useRef(null);
  const modalRef = useRef(null);

  // Close modal if clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        if (!isLoading) {
          // Prevent closing while loading
          onClose();
        }
      }
    }

    function handleEscapeKey(event) {
      if (event.key === "Escape" && !isLoading) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen, onClose, isLoading]);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef, searchInputRef]);

  // Position dropdown in viewport
  useEffect(() => {
    if (isDropdownOpen && dropdownContentRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const dropdownHeight = dropdownContentRef.current.offsetHeight;
      const viewportHeight = window.innerHeight;

      // Check if dropdown would go below viewport
      if (rect.bottom + dropdownHeight > viewportHeight) {
        // Position above the trigger if it would go below
        dropdownContentRef.current.style.bottom = "100%";
        dropdownContentRef.current.style.top = "auto";
      } else {
        // Position below the trigger (default)
        dropdownContentRef.current.style.top = "100%";
        dropdownContentRef.current.style.bottom = "auto";
      }
    }
  }, [isDropdownOpen]);

  // Position group selection handling
  const handlePositionGroupChange = (id) => {
    setSelectedPositionGroups((prevSelected) => {
      if (prevSelected.includes(id)) {
        return prevSelected.filter((groupId) => groupId !== id);
      } else {
        return [...prevSelected, id];
      }
    });
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    if (!isDropdownOpen) {
      setIsDropdownOpen(true);
    }
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Form submission
  const onSubmit = (e) => {
    e.preventDefault();

    if (!name) {
      return alert("Please enter a position name");
    }

    if (selectedPositionGroups.length === 0) {
      return alert("Please select at least one position group");
    }

    const positionData = {
      name: name,
      positionGroupId: selectedPositionGroups,
      level: level,
    };

    handleSubmit(positionData);
  };

  // Filter position groups based on search term
  const filteredPositionGroups = availablePositionGroups.filter((group) =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    // Modal backdrop
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      {/* Modal content */}
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Modal header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Briefcase size={18} className="mr-2 text-[#0AAC9E]" />
            {isEditing ? "Edit Position" : "Add New Position"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
            disabled={isLoading}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal body with scrollable content */}
        <div className="overflow-y-auto p-6">
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center text-gray-700">
                  <User size={16} className="mr-2" />
                  <h2 className="text-base font-medium">
                    Position Information
                  </h2>
                </div>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-500 mb-1"
                >
                  Position Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-0 focus:border-[#01DBC8]"
                    placeholder="Enter position name"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Briefcase size={16} className="text-gray-400" />
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="level"
                  className="block text-sm font-medium text-gray-500 mb-1"
                >
                  Manager Level
                </label>
                <div className="relative">
                  <select
                    id="level"
                    value={level}
                    onChange={(e) => setLevel(parseInt(e.target.value))}
                    className="w-full pl-10 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-0 outline-0 focus:border-[#01DBC8] appearance-none"
                  >
                    {levelOptions.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                        className=""
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {levelOptions.find((option) => option.value === level)
                      ?.icon || <User size={16} className="text-gray-400" />}
                  </div>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <ChevronDown size={16} className="text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center mb-4 text-gray-700">
                <Building2 size={16} className="mr-2" />
                <h2 className="text-base font-medium">Position Groups</h2>
              </div>

              {/* Improved position group dropdown with fixed positioning */}
              <div className="relative" ref={dropdownRef}>
                <div
                  className="w-full flex justify-between items-center px-4 py-2 text-left bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  onClick={toggleDropdown}
                >
                  <div className="flex items-center text-sm">
                    <Building2 size={18} className="mr-2 text-gray-400" />
                    <span>
                      {selectedPositionGroups.length
                        ? `${selectedPositionGroups.length} groups selected`
                        : "Select position groups"}
                    </span>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${
                      isDropdownOpen ? "transform rotate-180" : ""
                    }`}
                  />
                </div>

                {/* Search and dropdown panel - fixed position */}
                {isDropdownOpen && (
                  <div
                    ref={dropdownContentRef}
                    className="absolute left-0 right-0 z-10 mt-1 bg-white border border-gray-300 rounded-md shadow-lg"
                    style={{ maxHeight: "300px" }}
                  >
                    {/* Search input */}
                    <div className="sticky top-0 bg-white p-2 border-b border-gray-200 z-20">
                      <div className="relative">
                        <input
                          ref={searchInputRef}
                          type="text"
                          value={searchTerm}
                          onChange={handleSearchChange}
                          className="w-full pl-8 pr-2 py-2 text-xs border border-gray-200 rounded-lg focus:ring-0 focus:border-[#01DBC8]"
                          placeholder="Search position groups..."
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                          <Search size={16} className="text-gray-400" />
                        </div>
                        {searchTerm && (
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-2 flex items-center"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSearchTerm("");
                            }}
                          >
                            <X
                              size={14}
                              className="text-gray-400 hover:text-gray-600"
                            />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Options list */}
                    <div className="overflow-y-auto max-h-48">
                      {filteredPositionGroups.length > 0 ? (
                        filteredPositionGroups.map((group) => (
                          <div
                            key={group.id}
                            className={`flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer ${
                              selectedPositionGroups.includes(group.id)
                                ? "bg-[#f9fefe]"
                                : ""
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePositionGroupChange(group.id);
                            }}
                          >
                            <div
                              className={`w-5 h-5 border rounded mr-3 flex items-center justify-center`}
                              style={{
                                backgroundColor:
                                  selectedPositionGroups.includes(group.id)
                                    ? "#85d6cf"
                                    : "white",
                                borderColor: selectedPositionGroups.includes(
                                  group.id
                                )
                                  ? "#85d6cf"
                                  : "",
                              }}
                            >
                              {selectedPositionGroups.includes(group.id) && (
                                <CheckCircle2
                                  size={14}
                                  className="text-white"
                                />
                              )}
                            </div>
                            <span className="text-sm">{group.name}</span>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-gray-500 text-center text-sm">
                          No matching position groups
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="border-t border-gray-200 p-2 bg-gray-50 flex justify-between sticky bottom-0">
                      <button
                        type="button"
                        className="text-sm text-gray-600 hover:text-gray-800"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPositionGroups([]);
                        }}
                      >
                        Clear all
                      </button>
                      <button
                        type="button"
                        className="text-sm font-medium text-[#0AAC9E]"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsDropdownOpen(false);
                        }}
                      >
                        Done
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Selected position groups tags */}
              {selectedPositionGroups.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedPositionGroups.map((id) => {
                    const group = availablePositionGroups.find(
                      (g) => g.id === id
                    );
                    return group ? (
                      <span
                        key={id}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors bg-[#f2fdfc] text-[#0AAC9E]"
                      >
                        {group.name}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePositionGroupChange(id);
                          }}
                          className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors"
                        >
                          <span className="sr-only">Remove</span>
                          <X size={12} />
                        </button>
                      </span>
                    ) : null;
                  })}
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Modal footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
          <button
            type="button"
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 flex items-center text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none transition-colors"
              disabled={isLoading}
            >
              <RefreshCw size={14} className="mr-2" />
              Reset
            </button>

            <button
              onClick={onSubmit}
              disabled={isLoading}
              className="px-4 py-2 text-sm flex items-center text-white rounded-md focus:outline-none transition-colors disabled:opacity-70 bg-[#0AAC9E]"
            >
              {isLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin mr-2" />
                  {isEditing ? "Updating..." : "Saving..."}
                </>
              ) : (
                <>
                  <Save size={14} className="mr-2" />
                  {isEditing ? "Update Position" : "Save Position"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PositionFormModal;
