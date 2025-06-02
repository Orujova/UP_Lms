"use client";
import React, { useState } from "react";
import { 
  Filter, 
  Download, 
  X, 
  Calendar, 
  User, 
  Tag, 
  TrendingUp,
  Search,
  RefreshCw,
  ChevronDown,
  Check
} from "lucide-react";

const NewsFilterBar = ({ 
  filters, 
  onFilterChange, 
  onExport, 
  loading = false, 
  categoryOptions = [], 
  creatorOptions = [], 
  activeTab = "views" 
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

  // Interest level options
  const interestLevels = [
    { value: "", label: "All Interest Levels" },
    { value: "High", label: "High Interest" },
    { value: "Normal", label: "Normal Interest" },
    { value: "Low", label: "Low Interest" }
  ];

  // API Filter configurations for each tab
  const tabFilterConfig = {
    views: {
      title: "Views Interest Analysis",
      supportedFilters: ["interestLevel", "startCreatedDate", "endCreatedDate", "createdBy", "newsCategory"],
      apiFilters: ["Page", "ShowMore.Take", "InterestLevel", "StartCreatedDate", "EndCreatedDate", "CreatedBy", "NewsCategory"]
    },
    likes: {
      title: "Likes Interest Analysis", 
      supportedFilters: ["interestLevel"],
      apiFilters: ["Page", "ShowMore.Take", "InterestLevel"]
    },
    saves: {
      title: "Saves Interest Analysis",
      supportedFilters: ["interestLevel"], 
      apiFilters: ["Page", "ShowMore.Take", "InterestLevel"]
    },
    categories: {
      title: "Category Interest Analysis",
      supportedFilters: ["interestLevel", "startCreatedDate", "endCreatedDate", "createdBy", "newsCategory"],
      apiFilters: ["Page", "ShowMore.Take", "InterestLevel", "StartCreatedDate", "EndCreatedDate", "CreatedBy", "NewsCategory"]
    }
  };

  const currentConfig = tabFilterConfig[activeTab] || tabFilterConfig.views;

  // Check if filter is supported for current tab
  const isFilterSupported = (filterName) => {
    return currentConfig.supportedFilters.includes(filterName);
  };

  // Check if any filters are active
  const hasActiveFilters = () => {
    return currentConfig.supportedFilters.some(filterName => {
      const value = filters[filterName];
      return value && (Array.isArray(value) ? value.length > 0 : value !== "");
    });
  };

  // Handle category selection for multi-select
  const handleCategoryToggle = (categoryId) => {
    if (!isFilterSupported("newsCategory")) return;
    
    const currentCategories = filters.newsCategory || [];
    const updatedCategories = currentCategories.includes(categoryId)
      ? currentCategories.filter(id => id !== categoryId)
      : [...currentCategories, categoryId];
    
    onFilterChange("newsCategory", updatedCategories);
  };

  // Clear all filters
  const clearAllFilters = () => {
    onFilterChange("reset", null);
    setSearchTerm("");
    setCategoryDropdownOpen(false);
  };

  // Filter categories based on search
  const filteredCategories = categoryOptions.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    currentConfig.supportedFilters.forEach(filterName => {
      const value = filters[filterName];
      if (value && (Array.isArray(value) ? value.length > 0 : value !== "")) {
        count++;
      }
    });
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className="bg-white rounded-xl p-5 mb-6 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-semibold text-gray-900">
          {currentConfig.title}
        </h3>
        <button
          onClick={onExport}
          disabled={loading}
          className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          Export to Excel
        </button>
      </div>

      {/* Filter Controls */}
      <div className="space-y-4">
        {/* First Row - Interest Level (available for all tabs) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Interest Level - Always available */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700">Interest Level</label>
            <select
              value={filters.interestLevel || ""}
              onChange={(e) => onFilterChange("interestLevel", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-0 focus:border-teal-500"
            >
              {interestLevels.map(level => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>

          {/* Creator Filter - Only for Views and Categories */}
          {isFilterSupported("createdBy") && creatorOptions.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700">Created By</label>
              <select
                value={filters.createdBy || ""}
                onChange={(e) => onFilterChange("createdBy", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-0 focus:border-teal-500"
              >
                <option value="">All Creators</option>
                {creatorOptions.map(creator => (
                  <option key={creator} value={creator}>
                    {creator}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Second Row - Date Range and Categories (Only for Views and Categories) */}
        {(isFilterSupported("startCreatedDate") || isFilterSupported("newsCategory")) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date Range - Only for Views and Categories */}
            {isFilterSupported("startCreatedDate") && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700">Created Date Range</label>
                <div className="flex items-center gap-3">
                  <input
                    type="date"
                    value={filters.startCreatedDate || ""}
                    onChange={(e) => onFilterChange("startCreatedDate", e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-0 focus:border-teal-500"
                    placeholder="Start date"
                  />
                  <span className="text-gray-400 text-xs font-medium">to</span>
                  <input
                    type="date"
                    value={filters.endCreatedDate || ""}
                    onChange={(e) => onFilterChange("endCreatedDate", e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-0 focus:border-teal-500"
                    placeholder="End date"
                  />
                </div>
              </div>
            )}

            {/* Categories Multi-Select - Only for Views and Categories */}
            {isFilterSupported("newsCategory") && categoryOptions.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700">Categories</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-0 focus:border-teal-500 flex items-center justify-between text-left bg-white"
                  >
                    <span className="text-gray-700">
                      {filters.newsCategory && filters.newsCategory.length > 0
                        ? `${filters.newsCategory.length} categories selected`
                        : "Select categories"}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${categoryDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {categoryDropdownOpen && (
                    <div className="absolute z-20 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {/* Search */}
                      <div className="p-3 border-b border-gray-100">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search categories..."
                            className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-0 focus:border-teal-500"
                          />
                        </div>
                      </div>

                      {/* Options */}
                      <div className="py-2">
                        {filteredCategories.length > 0 ? (
                          filteredCategories.map(category => (
                            <label
                              key={category.id}
                              className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer text-xs"
                            >
                              <input
                                type="checkbox"
                                checked={(filters.newsCategory || []).includes(category.id)}
                                onChange={() => handleCategoryToggle(category.id)}
                                className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500 mr-3"
                              />
                              <span className="text-gray-700">{category.name}</span>
                            </label>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-xs text-gray-500 text-center">
                            No categories found
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {hasActiveFilters() && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-2 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-xs border border-gray-300"
              >
                <RefreshCw className="w-4 h-4" />
                Clear Filters
              </button>
            )}
            
            {activeFilterCount > 0 && (
              <span className="text-xs text-gray-500">
                {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} applied
              </span>
            )}

            {/* Show available filters info */}
            <span className="text-xs text-gray-400">
              Available: {currentConfig.supportedFilters.join(", ")}
            </span>
          </div>

          {/* Selected Categories Display */}
          {isFilterSupported("newsCategory") && filters.newsCategory && filters.newsCategory.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {filters.newsCategory.slice(0, 3).map(categoryId => {
                const category = categoryOptions.find(cat => cat.id === categoryId);
                return category ? (
                  <span
                    key={categoryId}
                    className="inline-flex items-center space-x-1 px-2 py-1 bg-teal-100 text-teal-800 text-xs rounded-full"
                  >
                    <span>{category.name}</span>
                    <button
                      onClick={() => handleCategoryToggle(categoryId)}
                      className="hover:bg-teal-200 rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ) : null;
              })}
              {filters.newsCategory.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{filters.newsCategory.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

       
      </div>
    </div>
  );
};

export default NewsFilterBar;