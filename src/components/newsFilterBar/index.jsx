"use client";
import React, { useState } from "react";
import {
  Download,
  Filter,
  Layers,
  Calendar,
  Search,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  User,
  X,
  Tag,
  Info,
} from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";

// Simplified interest level options with softer colors
const INTEREST_LEVELS = [
  { value: "", label: "All Levels", color: "#94A3B8" },
  { value: "Low", label: "Low", color: "#FDA4AF" },
  { value: "Normal", label: "Normal", color: "#93C5FD" },
  { value: "High", label: "High", color: "#86EFAC" },
];

const NewsFilterBar = ({
  filters = {},
  onFilterChange,
  categoryOptions = [],
  onExport,
  loading = false,
  creatorOptions = [],
}) => {
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);

  // Format category options for react-select
  const formattedCategoryOptions = categoryOptions.map((cat) => ({
    value: cat.id,
    label: cat.name,
  }));

  // Format creator options for dropdown
  const formattedCreatorOptions = creatorOptions.map((creator) => ({
    value: creator,
    label: creator,
  }));

  // Handle date change
  const handleDateChange = (key, date) => {
    if (onFilterChange) {
      onFilterChange(key, date);
    }
  };

  // Handle category change (multiple select)
  const handleCategoryChange = (selected) => {
    const values = selected ? selected.map((item) => item.value) : [];
    onFilterChange("newsCategory", values);
  };

  // Handle interest level change
  const handleInterestLevelChange = (level) => {
    onFilterChange("interestLevel", level);
  };

  // Handle reset
  const handleReset = () => {
    onFilterChange("reset");
  };

  // Determine active filters count
  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.interestLevel) count++;
    if (filters.newsCategory && filters.newsCategory.length > 0) count++;
    if (filters.createdBy) count++;
    if (filters.startViewDate) count++;
    if (filters.endViewDate) count++;
    if (filters.startCreatedDate) count++;
    if (filters.endCreatedDate) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  // Custom styles for react-select with softer focus and better contrast
  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      borderColor: state.isFocused ? "#60A5FA" : "#e2e8f0",
      boxShadow: state.isFocused ? "0 0 0 1px #60A5FA" : "none",
      "&:hover": {
        borderColor: "#60A5FA",
      },
      minHeight: "42px",
      paddingLeft: "34px",
      backgroundColor: "#F9FAFB",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#60A5FA"
        : state.isFocused
        ? "#EFF6FF"
        : "transparent",
      color: state.isSelected ? "white" : "#374151",
      padding: "10px 12px",
      "&:hover": {
        backgroundColor: state.isSelected ? "#60A5FA" : "#EFF6FF",
      },
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: "#EFF6FF",
      border: "1px solid #BFDBFE",
      borderRadius: "4px",
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: "#2563EB",
      fontSize: "0.85rem",
      padding: "2px 6px",
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: "#2563EB",
      "&:hover": {
        backgroundColor: "#BFDBFE",
        color: "#1E40AF",
      },
    }),
    menu: (base) => ({
      ...base,
      zIndex: 100,
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
      borderRadius: "8px",
    }),
    placeholder: (base) => ({
      ...base,
      color: "#9CA3AF",
    }),
  };

  return (
    <div className="bg-white rounded-xl p-5 mb-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center">
          <h3 className="text-gray-800 font-medium text-lg">Filters</h3>
          {activeFiltersCount > 0 && (
            <span className="ml-2 px-3 py-1 text-xs bg-blue-50 text-blue-700 rounded-full font-medium">
              {activeFiltersCount} active
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-sm ${
              activeFiltersCount > 0
                ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                : "text-gray-400 cursor-default"
            }`}
            disabled={loading || activeFiltersCount === 0}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Clear
          </button>
          <button
            onClick={() => setAdvancedFiltersOpen(!advancedFiltersOpen)}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 px-3 py-1.5 rounded hover:bg-blue-50 transition-colors"
          >
            {advancedFiltersOpen ? "Basic" : "Advanced"}
            {advancedFiltersOpen ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
        {/* Interest Level Filter - cleaner design */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Interest Level
          </label>
          <div className="flex flex-wrap gap-2">
            {INTEREST_LEVELS.map((level) => (
              <button
                key={level.value}
                onClick={() => handleInterestLevelChange(level.value)}
                disabled={loading}
                className={`py-2 px-4 text-sm font-medium rounded-lg transition-all ${
                  filters.interestLevel === level.value
                    ? "shadow-sm"
                    : "hover:shadow-sm"
                }`}
                style={{
                  backgroundColor:
                    filters.interestLevel === level.value
                      ? level.color
                      : `${level.color}20`,
                  color:
                    filters.interestLevel === level.value
                      ? "#1F2937"
                      : "#4B5563",
                }}
              >
                {level.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter - cleaner multiple select */}
        {categoryOptions.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2 flex items-center">
              Categories
              <span className="ml-1 text-gray-400 text-xs font-normal">
                (Multiple)
              </span>
            </label>
            <div className="relative">
              <Layers className="absolute left-3 top-3 z-10 pointer-events-none text-gray-400 w-4 h-4" />
              <Select
                isMulti
                name="categories"
                options={formattedCategoryOptions}
                className="w-full"
                classNamePrefix="react-select"
                placeholder="Select categories..."
                value={
                  Array.isArray(filters.newsCategory)
                    ? filters.newsCategory
                        .map((id) =>
                          formattedCategoryOptions.find(
                            (opt) => opt.value === id
                          )
                        )
                        .filter(Boolean)
                    : []
                }
                onChange={handleCategoryChange}
                isDisabled={loading}
                styles={customSelectStyles}
                noOptionsMessage={() => "No categories found"}
                closeMenuOnSelect={false}
              />
            </div>
          </div>
        )}

        {/* Created By Filter - cleaner select */}
        {creatorOptions.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Created By
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 z-10 pointer-events-none text-gray-400 w-4 h-4" />
              <Select
                options={formattedCreatorOptions}
                className="w-full"
                classNamePrefix="react-select"
                placeholder="Select creator..."
                value={
                  filters.createdBy
                    ? { value: filters.createdBy, label: filters.createdBy }
                    : null
                }
                onChange={(selected) =>
                  onFilterChange("createdBy", selected ? selected.value : "")
                }
                isDisabled={loading}
                styles={customSelectStyles}
                isClearable
              />
            </div>
          </div>
        )}
      </div>

      {/* Advanced Filters - smoother animation */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          advancedFiltersOpen
            ? "max-h-80 opacity-100 mb-4"
            : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <div className="pt-4 border-t border-gray-100 mt-2 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          {/* View Date Range */}
          <div>
            <h4 className="text-sm font-medium text-gray-600 flex items-center mb-3">
              <Calendar className="w-4 h-4 mr-2 text-blue-500" />
              View Date Range
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">From</label>
                <div className="relative">
                  <DatePicker
                    selected={
                      filters.startViewDate
                        ? new Date(filters.startViewDate)
                        : null
                    }
                    onChange={(date) => handleDateChange("startViewDate", date)}
                    selectsStart
                    startDate={
                      filters.startViewDate
                        ? new Date(filters.startViewDate)
                        : null
                    }
                    endDate={
                      filters.endViewDate ? new Date(filters.endViewDate) : null
                    }
                    className="border border-gray-200 rounded-lg pl-9 py-2.5 text-sm w-full bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholderText="Start Date"
                    dateFormat="yyyy-MM-dd"
                    disabled={loading}
                  />
                  <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  {filters.startViewDate && (
                    <button
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-red-500"
                      onClick={() => handleDateChange("startViewDate", null)}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">To</label>
                <div className="relative">
                  <DatePicker
                    selected={
                      filters.endViewDate ? new Date(filters.endViewDate) : null
                    }
                    onChange={(date) => handleDateChange("endViewDate", date)}
                    selectsEnd
                    startDate={
                      filters.startViewDate
                        ? new Date(filters.startViewDate)
                        : null
                    }
                    endDate={
                      filters.endViewDate ? new Date(filters.endViewDate) : null
                    }
                    minDate={
                      filters.startViewDate
                        ? new Date(filters.startViewDate)
                        : null
                    }
                    className="border border-gray-200 rounded-lg pl-9 py-2.5 text-sm w-full bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholderText="End Date"
                    dateFormat="yyyy-MM-dd"
                    disabled={loading}
                  />
                  <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  {filters.endViewDate && (
                    <button
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-red-500"
                      onClick={() => handleDateChange("endViewDate", null)}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Creation Date Range */}
          <div>
            <h4 className="text-sm font-medium text-gray-600 flex items-center mb-3">
              <Calendar className="w-4 h-4 mr-2 text-green-500" />
              Creation Date Range
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">From</label>
                <div className="relative">
                  <DatePicker
                    selected={
                      filters.startCreatedDate
                        ? new Date(filters.startCreatedDate)
                        : null
                    }
                    onChange={(date) =>
                      handleDateChange("startCreatedDate", date)
                    }
                    selectsStart
                    startDate={
                      filters.startCreatedDate
                        ? new Date(filters.startCreatedDate)
                        : null
                    }
                    endDate={
                      filters.endCreatedDate
                        ? new Date(filters.endCreatedDate)
                        : null
                    }
                    className="border border-gray-200 rounded-lg pl-9 py-2.5 text-sm w-full bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholderText="Start Date"
                    dateFormat="yyyy-MM-dd"
                    disabled={loading}
                  />
                  <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  {filters.startCreatedDate && (
                    <button
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-red-500"
                      onClick={() => handleDateChange("startCreatedDate", null)}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">To</label>
                <div className="relative">
                  <DatePicker
                    selected={
                      filters.endCreatedDate
                        ? new Date(filters.endCreatedDate)
                        : null
                    }
                    onChange={(date) =>
                      handleDateChange("endCreatedDate", date)
                    }
                    selectsEnd
                    startDate={
                      filters.startCreatedDate
                        ? new Date(filters.startCreatedDate)
                        : null
                    }
                    endDate={
                      filters.endCreatedDate
                        ? new Date(filters.endCreatedDate)
                        : null
                    }
                    minDate={
                      filters.startCreatedDate
                        ? new Date(filters.startCreatedDate)
                        : null
                    }
                    className="border border-gray-200 rounded-lg pl-9 py-2.5 text-sm w-full bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholderText="End Date"
                    dateFormat="yyyy-MM-dd"
                    disabled={loading}
                  />
                  <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  {filters.endCreatedDate && (
                    <button
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-red-500"
                      onClick={() => handleDateChange("endCreatedDate", null)}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export button moved to a fixed position at the bottom */}
      <div className="flex justify-end mt-5">
        <button
          onClick={onExport}
          className="flex items-center gap-2 bg-blue-100 text-blue-700 px-5 py-2.5 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
          disabled={loading}
        >
          <Download className="w-4 h-4" />
          Export Data
        </button>
      </div>

      {/* Loading indicator - more subtle */}
      {loading && (
        <div className="w-full mt-4 bg-blue-50 text-blue-700 p-3 rounded-lg flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
          Loading results...
        </div>
      )}
    </div>
  );
};

export default NewsFilterBar;
