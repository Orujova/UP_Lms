import React, { useState } from "react";
import { Search, Filter, X } from "lucide-react";

const FilterPanel = ({ departments = [], onFilter, lineManagers = [] }) => {
  const [filters, setFilters] = useState({
    search: "",
    departmentId: "",
    minSalary: "",
    maxSalary: "",
    lineManagerId: "",
    startDate: "",
    endDate: "",
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilter(filters);
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      departmentId: "",
      minSalary: "",
      maxSalary: "",
      lineManagerId: "",
      startDate: "",
      endDate: "",
    });
    onFilter({});
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base font-semibold text-gray-900">
          Filter Vacancies
        </h2>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-500 hover:text-gray-700"
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
              value={filters.search}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-0 focus:border-[#01DBC8]"
              placeholder="Search vacancies..."
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2" />
          </div>
        </div>

        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            <div>
              <label
                htmlFor="departmentId"
                className="block text-xs font-medium text-gray-700 mb-1"
              >
                Department
              </label>
              <select
                id="departmentId"
                name="departmentId"
                value={filters.departmentId}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-0 focus:border-[#01DBC8]"
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="lineManagerId"
                className="block text-xs font-medium text-gray-700 mb-1"
              >
                Line Manager
              </label>
              <select
                id="lineManagerId"
                name="lineManagerId"
                value={filters.lineManagerId}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-0 focus:border-[#01DBC8]"
              >
                <option value="">All Line Managers</option>
                {lineManagers.map((manager) => (
                  <option key={manager.id} value={manager.id}>
                    {manager.firstName} {manager.lastName}
                  </option>
                ))}
              </select>
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
                value={filters.minSalary}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-0 focus:border-[#01DBC8]"
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
                value={filters.maxSalary}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-0 focus:border-[#01DBC8]"
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
                value={filters.startDate}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-0 focus:border-[#01DBC8]"
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
                value={filters.endDate}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-0 focus:border-[#01DBC8]"
              />
            </div>
          </div>
        )}

        <div className="flex justify-end mt-4 gap-2">
          <button
            type="button"
            onClick={resetFilters}
            className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            Reset
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-medium text-white bg-[#0AAC9E] rounded-lg hover:bg-[#127D74]"
          >
            Apply Filters
          </button>
        </div>
      </form>
    </div>
  );
};

export default FilterPanel;
