"use client";
import React, { useState, useEffect } from "react";

import {
  Filter,
  Search,
  Calendar,
  Tag,
  ChevronDown,
  X,
  CalendarDays,
} from "lucide-react";

import { useRef } from "react";

const FilterPanel = ({ filters, onFilterChange, onClose, categories }) => {
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const categoryDropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target)
      ) {
        setCategoryDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleChange = (field, value) => {
    const updatedFilters = { ...filters };

    if (field === "ViewRange") {
      if (!updatedFilters.ViewRange) {
        updatedFilters.ViewRange = {};
      }
      updatedFilters.ViewRange = {
        ...updatedFilters.ViewRange,
        ...value,
      };
      // Remove ViewRange if both values are empty
      if (!updatedFilters.ViewRange.Start && !updatedFilters.ViewRange.End) {
        delete updatedFilters.ViewRange;
      }
    } else if (field === "NewsCategoryIds") {
      // Handle multi-category selection
      if (!updatedFilters.NewsCategoryIds) {
        updatedFilters.NewsCategoryIds = [];
      }

      // Toggle selection
      if (updatedFilters.NewsCategoryIds.includes(value)) {
        updatedFilters.NewsCategoryIds = updatedFilters.NewsCategoryIds.filter(
          (id) => id !== value
        );
      } else {
        updatedFilters.NewsCategoryIds.push(value);
      }

      // Remove NewsCategoryIds if array is empty
      if (updatedFilters.NewsCategoryIds.length === 0) {
        delete updatedFilters.NewsCategoryIds;
      }
    } else {
      if (value && value.trim() !== "") {
        updatedFilters[field] = value;
      } else {
        delete updatedFilters[field];
      }
    }

    onFilterChange(updatedFilters);
  };

  const applyFilters = () => {
    onClose();
  };

  // Get selected category names for display
  const getSelectedCategoryNames = () => {
    if (!filters.NewsCategoryIds || filters.NewsCategoryIds.length === 0) {
      return "All Categories";
    }

    const selectedCategories = categories.filter((cat) =>
      filters.NewsCategoryIds.includes(cat.id.toString())
    );

    if (selectedCategories.length <= 2) {
      return selectedCategories.map((cat) => cat.categoryName).join(", ");
    } else {
      return `${selectedCategories.length} categories selected`;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-6">
      <div className="p-5 border-b border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-1 bg-[#f2fdfc] rounded-lg">
              <Filter className="w-4 h-4 text-[#0AAC9E]" />
            </div>
            <h2 className="text-sm font-semibold text-gray-900">
              Filter Options
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-700">
              Title
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={filters.SearchInput || ""}
                onChange={(e) => handleChange("SearchInput", e.target.value)}
                placeholder="Search by title..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-[#01DBC8]/20 focus:border-[#01DBC8]"
              />
            </div>
          </div>

          <div
            className="space-y-2 col-span-2 relative"
            ref={categoryDropdownRef}
          >
            <label className="block text-xs font-medium text-gray-700">
              Categories
            </label>
            <div className="relative">
              <div className="flex items-center">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <div
                  className="w-full pl-10 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs cursor-pointer flex items-center justify-between"
                  onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                >
                  <div className="truncate">{getSelectedCategoryNames()}</div>
                  <ChevronDown
                    className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-transform ${
                      categoryDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </div>

              {categoryDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
                  <div className="p-2 max-h-56 overflow-y-auto">
                    {categories.length > 0 ? (
                      <>
                        <div className="flex items-center justify-between px-2 py-1.5 border-b border-gray-100 mb-1">
                          <span className="text-xs font-medium text-gray-700">
                            Select Categories
                          </span>
                          <button
                            className="text-xs text-[#0AAC9E] hover:underline"
                            onClick={(e) => {
                              e.stopPropagation();
                              onFilterChange({
                                ...filters,
                                NewsCategoryIds: undefined,
                              });
                            }}
                          >
                            Clear all
                          </button>
                        </div>
                        {categories.map((category) => (
                          <div
                            key={category.id}
                            className="flex items-center px-2 py-1.5 hover:bg-gray-50 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleChange(
                                "NewsCategoryIds",
                                category.id.toString()
                              );
                            }}
                          >
                            <div
                              className={`w-4 h-4 border rounded flex-shrink-0 mr-2 flex items-center justify-center ${
                                filters.NewsCategoryIds?.includes(
                                  category.id.toString()
                                )
                                  ? "bg-[#0AAC9E] border-[#0AAC9E]"
                                  : "border-gray-300"
                              }`}
                            >
                              {filters.NewsCategoryIds?.includes(
                                category.id.toString()
                              ) && (
                                <svg
                                  className="w-3 h-3 text-white"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M5 13l4 4L19 7"
                                  ></path>
                                </svg>
                              )}
                            </div>
                            <span className="text-xs text-gray-700 truncate">
                              {category.categoryName}
                            </span>
                          </div>
                        ))}
                      </>
                    ) : (
                      <div className="p-3 text-center text-xs text-gray-500">
                        No categories available
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-700">
              Order By
            </label>
            <div className="relative">
              <select
                value={filters.OrderBy || ""}
                onChange={(e) => handleChange("OrderBy", e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border outline-none border-gray-200 rounded-lg text-xs appearance-none focus:ring-2 focus:ring-[#01DBC8]/20 focus:border-[#01DBC8]"
              >
                <option value="">Default (Newest First)</option>
                <optgroup label="Date">
                  <option value="datedesc">Date (Newest First)</option>
                  <option value="dateasc">Date (Oldest First)</option>
                </optgroup>
                <optgroup label="Title">
                  <option value="titleasc">Title (A-Z)</option>
                  <option value="titledesc">Title (Z-A)</option>
                </optgroup>
                <optgroup label="Views">
                  <option value="viewasc">Views (Low to High)</option>
                  <option value="viewdesc">Views (High to Low)</option>
                </optgroup>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-6 mt-6">
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-700">
              Start Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={filters.StartDate || ""}
                onChange={(e) => handleChange("StartDate", e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-[#01DBC8]/20 focus:border-[#01DBC8]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-700">
              End Date
            </label>
            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={filters.EndDate || ""}
                onChange={(e) => handleChange("EndDate", e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-[#01DBC8]/20 focus:border-[#01DBC8]"
              />
            </div>
          </div>

          <div className="space-y-2 col-span-2">
            <label className="block text-xs font-medium text-gray-700">
              Views Range
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={filters.ViewRange?.Start || ""}
                onChange={(e) =>
                  handleChange("ViewRange", {
                    ...filters.ViewRange,
                    Start: e.target.value,
                  })
                }
                placeholder="Min"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-[#01DBC8]/20 focus:border-[#01DBC8]"
              />
              <span className="text-gray-500">to</span>
              <input
                type="number"
                value={filters.ViewRange?.End || ""}
                onChange={(e) =>
                  handleChange("ViewRange", {
                    ...filters.ViewRange,
                    End: e.target.value,
                  })
                }
                placeholder="Max"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-[#01DBC8]/20 focus:border-[#01DBC8]"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
        <button
          onClick={() => onFilterChange({})}
          className="px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          Clear Filters
        </button>
        <button
          onClick={applyFilters}
          className="px-4 py-2 text-xs font-medium text-white bg-[#0AAC9E] rounded-lg hover:bg-[#127D74]"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default FilterPanel;
