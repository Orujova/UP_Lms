import React, { useState, useEffect } from "react";
import { Search, Filter, X } from "lucide-react";
import SearchableDropdown from "./SearchableDropdown";

const FilterPanel = ({ departments = [], onFilter, lineManagers = [] }) => {
  // Initialize state with properly cased parameters matching API expectations
  const [filters, setFilters] = useState({
    Search: "",
    DepartmentId: "",
    MinSalary: "",
    MaxSalary: "",
    LineManagerId: "",
    StartDate: "",
    EndDate: "",
  });

  const [isExpanded, setIsExpanded] = useState(false);

  // Apply filters when search changes with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      // Apply filters even when Search is empty to reset to all results
      applyFilters();
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [filters.Search]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Convert field names to match API parameter casing
    // Map form field names to API parameter names
    const fieldMap = {
      search: "Search",
      minSalary: "MinSalary",
      maxSalary: "MaxSalary",
      startDate: "StartDate",
      endDate: "EndDate",
    };

    const apiFieldName = fieldMap[name] || name;

    setFilters((prev) => ({ ...prev, [apiFieldName]: value }));
  };

  // Handle dropdown change
  const handleDropdownChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    applyFilters();
  };

  // Format and apply filters
  const applyFilters = () => {
    // Create a new object with only non-empty values
    const formattedFilters = Object.entries(filters).reduce(
      (acc, [key, value]) => {
        if (value && value.toString().trim() !== "") {
          // Handle numeric values
          if (key === "MinSalary" || key === "MaxSalary") {
            acc[key] = parseFloat(value);
          } else if (key === "DepartmentId" || key === "LineManagerId") {
            if (value !== "") {
              acc[key] = parseInt(value);
            }
          } else {
            acc[key] = value;
          }
        }
        return acc;
      },
      {}
    );

    // Add Page parameter for pagination
    formattedFilters.Page = 1; // Reset to first page on filter apply

    console.log("Applying filters:", formattedFilters);
    onFilter(formattedFilters);
  };

  const resetFilters = () => {
    setFilters({
      Search: "",
      DepartmentId: "",
      MinSalary: "",
      MaxSalary: "",
      LineManagerId: "",
      StartDate: "",
      EndDate: "",
    });

    // Reset with just pagination parameters
    onFilter({ Page: 1 });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base font-semibold text-gray-900">
          Filter Vacancies
        </h2>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          {isExpanded ? (
            <X className="w-5 h-5" />
          ) : (
            <Filter className="w-5 h-5" />
          )}
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              name="search"
              value={filters.Search}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-0 focus:border-[#01DBC8] transition-all duration-200"
              placeholder="Search vacancies..."
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2" />
            {filters.Search && (
              <button
                type="button"
                className="absolute right-3 top-2 text-gray-400 hover:text-gray-600"
                onClick={() => {
                  setFilters((prev) => ({ ...prev, Search: "" }));
                  // Trigger an immediate filter reset when clearing search
                  setTimeout(() => onFilter({ Page: 1 }), 0);
                }}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            <div>
              <SearchableDropdown
                options={departments}
                value={filters.DepartmentId}
                onChange={(value) =>
                  handleDropdownChange("DepartmentId", value)
                }
                placeholder="All Departments"
                label="Department"
              />
            </div>

            <div>
              <SearchableDropdown
                options={lineManagers}
                value={filters.LineManagerId}
                onChange={(value) =>
                  handleDropdownChange("LineManagerId", value)
                }
                placeholder="All Line Managers"
                label="Line Manager"
                displayKey="firstName"
                valueKey="id"
              />
            </div>

            <div>
              <label
                htmlFor="minSalary"
                className="block text-xs font-medium text-gray-700 mb-1"
              >
                Min Salary
              </label>
              <input
                type="number"
                id="minSalary"
                name="minSalary"
                value={filters.MinSalary}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#01DBC8] focus:border-[#01DBC8] transition-all duration-200"
                placeholder="Min Salary"
              />
            </div>

            <div>
              <label
                htmlFor="maxSalary"
                className="block text-xs font-medium text-gray-700 mb-1"
              >
                Max Salary
              </label>
              <input
                type="number"
                id="maxSalary"
                name="maxSalary"
                value={filters.MaxSalary}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#01DBC8] focus:border-[#01DBC8] transition-all duration-200"
                placeholder="Max Salary"
              />
            </div>

            <div>
              <label
                htmlFor="startDate"
                className="block text-xs font-medium text-gray-700 mb-1"
              >
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={filters.StartDate}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#01DBC8] focus:border-[#01DBC8] transition-all duration-200"
              />
            </div>

            <div>
              <label
                htmlFor="endDate"
                className="block text-xs font-medium text-gray-700 mb-1"
              >
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={filters.EndDate}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#01DBC8] focus:border-[#01DBC8] transition-all duration-200"
              />
            </div>
          </div>
        )}

        {isExpanded && (
          <div className="flex justify-end mt-4 gap-2">
            <button
              type="button"
              onClick={resetFilters}
              className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Reset
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-[#0AAC9E] rounded-lg hover:bg-[#127D74] transition-colors"
            >
              Apply Filters
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default FilterPanel;
