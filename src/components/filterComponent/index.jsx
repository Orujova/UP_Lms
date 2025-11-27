import React, { useState, useEffect } from "react";
import { Filter, X, Search, ChevronDown } from "lucide-react";
const API_URL = "https://demoadmin.databyte.app/api/";

const FilterComponent = ({ onApplyFilters, buttonClassName }) => {
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState({
    functionalArea: "",
    department: "",
    project: "",
    division: "",
    subDivision: "",
    positionGroup: "",
    position: "",
  });

  const [dropdownStates, setDropdownStates] = useState({
    functionalArea: false,
    department: false,
    project: false,
    division: false,
    subDivision: false,
    positionGroup: false,
    position: false,
  });

  const [options, setOptions] = useState({
    functionalAreas: [],
    departments: [],
    projects: [],
    divisions: [],
    subDivisions: [],
    positionGroups: [],
    positions: [],
  });

  const [searchTerms, setSearchTerms] = useState({
    functionalArea: "",
    department: "",
    project: "",
    division: "",
    subDivision: "",
    positionGroup: "",
    position: "",
  });

  const fetchOptions = async (endpoint) => {
    try {
      const response = await fetch(`${API_URL}${endpoint}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      return [];
    }
  };

  useEffect(() => {
    const loadAllOptions = async () => {
      const [
        functionalAreas,
        departments,
        projects,
        divisions,
        subDivisions,
        positionGroups,
        positions,
      ] = await Promise.all([
        fetchOptions("FunctionalArea"),
        fetchOptions("Department"),
        fetchOptions("Project"),
        fetchOptions("Division"),
        fetchOptions("SubDivision"),
        fetchOptions("PositionGroup"),
        fetchOptions("Position"),
      ]);

      setOptions({
        functionalAreas,
        departments,
        projects,
        divisions,
        subDivisions,
        positionGroups,
        positions,
      });
    };

    loadAllOptions();
  }, []);

  const handleSearchChange = (field, value) => {
    setSearchTerms((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const filterOptions = (options, searchTerm) => {
    return options.filter((option) =>
      option.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const handleApply = () => {
    onApplyFilters(filters);
    setOpen(false);
  };

  const handleReset = () => {
    setFilters({
      functionalArea: "",
      department: "",
      project: "",
      division: "",
      subDivision: "",
      positionGroup: "",
      position: "",
    });
    setSearchTerms({
      functionalArea: "",
      department: "",
      project: "",
      division: "",
      subDivision: "",
      positionGroup: "",
      position: "",
    });
  };

  const toggleDropdown = (field) => {
    setDropdownStates((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleClickOutside = (field) => {
    setTimeout(() => {
      setDropdownStates((prev) => ({
        ...prev,
        [field]: false,
      }));
    }, 100);
  };

  return (
    <div className="relative">
      <button className={buttonClassName} onClick={() => setOpen(!open)}>
        <Filter className="h-4 w-4" />
        <span>Filter</span>
      </button>

      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl m-4 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Filter Users
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              {Object.entries({
                "Functional Area": "functionalArea",
                Department: "department",
                Project: "project",
                Division: "division",
                "Sub Division": "subDivision",
                "Position Group": "positionGroup",
                Position: "position",
              }).map(([label, field]) => (
                <div key={field} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {label}
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder={`Search ${label}...`}
                        value={searchTerms[field]}
                        onChange={(e) =>
                          handleSearchChange(field, e.target.value)
                        }
                      />
                    </div>
                    <div className="relative w-[200px]">
                      <button
                        type="button"
                        className="w-full flex items-center justify-between px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        onClick={() => toggleDropdown(field)}
                        onBlur={() => handleClickOutside(field)}
                      >
                        <span className="truncate">
                          {filters[field]
                            ? options[`${field}s`]?.find(
                                (o) => o.id.toString() === filters[field]
                              )?.name
                            : "Select..."}
                        </span>
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      </button>

                      {dropdownStates[field] && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                          {filterOptions(
                            options[`${field}s`] || [],
                            searchTerms[field]
                          ).map((option) => (
                            <button
                              key={option.id}
                              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 focus:outline-none"
                              onClick={() => {
                                setFilters((prev) => ({
                                  ...prev,
                                  [field]: option.id.toString(),
                                }));
                                toggleDropdown(field);
                              }}
                            >
                              {option.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between mt-8 pt-4 border-t border-gray-200">
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Reset Filters
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApply}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterComponent;
