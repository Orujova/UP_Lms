"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Filter, X } from "lucide-react";
import SearchableDropdown from "../vacancy/SearchableDropdown";
import { useDispatch, useSelector } from "react-redux";
import { adminApplicationUserAsync } from "@/redux/adminApplicationUser/adminApplicationUser";
import { functionalAreaAsync } from "@/redux/functionalArea/functionalArea";
import { departmentAsync } from "@/redux/department/department";
import { projectAsync } from "@/redux/project/project";
import { divisionAsync } from "@/redux/division/division";
import { subDivisionAsync } from "@/redux/subDivision/subDivision";
import { positionGroupAsync } from "@/redux/positionGroup/positionGroup";
import { positionAsync } from "@/redux/position/position";
import { createSelector } from "reselect";

// Create memoized selectors
const selectFunctionalAreas = createSelector(
  [(state) => state.functionalArea?.data?.[0]?.functionalAreas],
  (functionalAreas) => functionalAreas || []
);

const selectDepartments = createSelector(
  [(state) => state.department?.data?.[0]?.departments],
  (departments) => departments || []
);

const selectProjects = createSelector(
  [(state) => state.project?.data?.[0]?.projects],
  (projects) => projects || []
);

const selectDivisions = createSelector(
  [(state) => state.division?.data?.[0]?.divisions],
  (divisions) => divisions || []
);

const selectSubDivisions = createSelector(
  [(state) => state.subDivision?.data?.[0]?.subDivisions],
  (subDivisions) => subDivisions || []
);

const selectPositionGroups = createSelector(
  [(state) => state.positionGroup?.data?.[0]?.positionGroups],
  (positionGroups) => positionGroups || []
);

const selectPositions = createSelector(
  [(state) => state.position?.data?.[0]?.positions],
  (positions) => positions || []
);

const FilterPanel = ({
  isOpen,
  setIsOpen,
  onFiltersApplied,
  activeFilters = {},
}) => {
  const dispatch = useDispatch();
  const panelRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  // Use memoized selectors
  const functionalAreas = useSelector(selectFunctionalAreas);
  const departments = useSelector(selectDepartments);
  const projects = useSelector(selectProjects);
  const divisions = useSelector(selectDivisions);
  const subDivisions = useSelector(selectSubDivisions);
  const positionGroups = useSelector(selectPositionGroups);
  const positions = useSelector(selectPositions);

  // Initialize filters with activeFilters from props
  const [filters, setFilters] = useState({
    functionalAreaId: activeFilters.functionalAreaId || "",
    departmentId: activeFilters.departmentId || "",
    projectId: activeFilters.projectId || "",
    divisionId: activeFilters.divisionId || "",
    subDivisionId: activeFilters.subDivisionId || "",
    positionGroupId: activeFilters.positionGroupId || "",
    positionId: activeFilters.positionId || "",
  });

  // Update filters when activeFilters change and panel opens
  useEffect(() => {
    if (isOpen) {
      setFilters({
        functionalAreaId: activeFilters.functionalAreaId || "",
        departmentId: activeFilters.departmentId || "",
        projectId: activeFilters.projectId || "",
        divisionId: activeFilters.divisionId || "",
        subDivisionId: activeFilters.subDivisionId || "",
        positionGroupId: activeFilters.positionGroupId || "",
        positionId: activeFilters.positionId || "",
      });
    }
  }, [isOpen, activeFilters]);

  // Load data once on component mount
  const dataLoaded = useRef(false);

  useEffect(() => {
    if (!dataLoaded.current) {
      Promise.all([
        dispatch(functionalAreaAsync()),
        dispatch(departmentAsync()),
        dispatch(projectAsync()),
        dispatch(divisionAsync()),
        dispatch(subDivisionAsync()),
        dispatch(positionGroupAsync()),
        dispatch(positionAsync()),
      ]).then(() => {
        dataLoaded.current = true;
      });
    }
  }, [dispatch]);

  // Close panel functionality
  const onClose = () => {
    setIsOpen(false);
  };

  // Apply filters function
  const applyFilters = useCallback(
    (updatedFilters) => {
      setIsLoading(true);

      // Build query params object with only non-empty filters
      const queryParams = { page: 1 };
      Object.entries(updatedFilters).forEach(([key, value]) => {
        if (value) {
          queryParams[key] = value;
        }
      });

      // Convert to PascalCase for API consistency
      const apiFilters = {};
      Object.entries(updatedFilters).forEach(([key, value]) => {
        if (value) {
          // Convert to PascalCase for the parent component
          const pascalKey = key.charAt(0).toUpperCase() + key.slice(1);
          apiFilters[pascalKey] = value;
        }
      });

      // Notify parent component about filter changes
      if (onFiltersApplied) {
        onFiltersApplied(apiFilters);
      }

      // Dispatch action with filters
      dispatch(adminApplicationUserAsync(queryParams)).finally(() => {
        setIsLoading(false);
      });
    },
    [dispatch, onFiltersApplied]
  );

  // Handle filter changes
  const handleFilterChange = useCallback(
    (key, value) => {
      setFilters((prev) => {
        const updatedFilters = {
          ...prev,
          [key]: value,
        };

        // Auto apply the filter
        applyFilters(updatedFilters);

        return updatedFilters;
      });
    },
    [applyFilters]
  );

  // Reset filters
  const resetFilters = useCallback(() => {
    const emptyFilters = {
      functionalAreaId: "",
      departmentId: "",
      projectId: "",
      divisionId: "",
      subDivisionId: "",
      positionGroupId: "",
      positionId: "",
    };

    setFilters(emptyFilters);

    // Convert to PascalCase for API consistency
    const emptyApiFilters = {
      FunctionalAreaId: "",
      DepartmentId: "",
      ProjectId: "",
      DivisionId: "",
      SubDivisionId: "",
      PositionGroupId: "",
      PositionId: "",
    };

    // Notify parent component
    if (onFiltersApplied) {
      onFiltersApplied(emptyApiFilters);
    }

    applyFilters(emptyFilters);
  }, [applyFilters, onFiltersApplied]);

  // Count active filters
  const activeFilterCount = Object.values(filters).filter(
    (v) => v !== ""
  ).length;

  return (
    <div
      className={`bg-white rounded-xl shadow-lg border border-gray-200 mb-6 w-full ${
        !isOpen && "hidden"
      }`}
      ref={panelRef}
    >
      {/* Filter Panel Content */}
      <div className="p-4 border-b border-gray-100">
        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#f2fdfc] rounded-lg">
              <Filter className="w-4 h-4 text-[#0AAC9E]" />
            </div>
            <h2 className="text-xs font-semibold text-gray-900">
              Filter Options{" "}
              {activeFilterCount > 0 && `(${activeFilterCount} active)`}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-10">
            <div className="flex items-center gap-2">
              <svg
                className="animate-spin h-5 w-5 text-[#0AAC9E]"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span className="text-sm text-gray-600">Applying filters...</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-y-4">
          {/* Filter dropdowns structure remains the same */}
          {/* First Row - Functional Area and Department */}
          <div className="grid grid-cols-2 gap-x-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Functional Area
              </label>
              <SearchableDropdown
                options={functionalAreas}
                value={filters.functionalAreaId}
                onChange={(value) =>
                  handleFilterChange("functionalAreaId", value)
                }
                placeholder="All Functional Areas"
                displayKey="name"
                valueKey="id"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Department
              </label>
              <SearchableDropdown
                options={departments}
                value={filters.departmentId}
                onChange={(value) => handleFilterChange("departmentId", value)}
                placeholder="All Departments"
                displayKey="name"
                valueKey="id"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Second Row - Project and Division */}
          <div className="grid grid-cols-2 gap-x-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Project
              </label>
              <SearchableDropdown
                options={projects}
                value={filters.projectId}
                onChange={(value) => handleFilterChange("projectId", value)}
                placeholder="All Projects"
                displayKey="name"
                valueKey="id"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Division
              </label>
              <SearchableDropdown
                options={divisions}
                value={filters.divisionId}
                onChange={(value) => handleFilterChange("divisionId", value)}
                placeholder="All Divisions"
                displayKey="name"
                valueKey="id"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Third Row - Sub Division and Position Group */}
          <div className="grid grid-cols-2 gap-x-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Sub Division
              </label>
              <SearchableDropdown
                options={subDivisions}
                value={filters.subDivisionId}
                onChange={(value) => handleFilterChange("subDivisionId", value)}
                placeholder="All Sub Divisions"
                displayKey="name"
                valueKey="id"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Position Group
              </label>
              <SearchableDropdown
                options={positionGroups}
                value={filters.positionGroupId}
                onChange={(value) =>
                  handleFilterChange("positionGroupId", value)
                }
                placeholder="All Position Groups"
                displayKey="name"
                valueKey="id"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Fourth Row - Position */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">
              Position
            </label>
            <SearchableDropdown
              options={positions}
              value={filters.positionId}
              onChange={(value) => handleFilterChange("positionId", value)}
              placeholder="All Positions"
              displayKey="name"
              valueKey="id"
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-3 py-3 flex items-center justify-end gap-3 border-t border-gray-100">
        <button
          onClick={onClose}
          className="px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-200"
          disabled={isLoading}
        >
          Close
        </button>
        <button
          onClick={resetFilters}
          className="px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-200"
          disabled={isLoading}
        >
          Clear All
        </button>
        <button
          onClick={() => applyFilters(filters)}
          className={`px-4 py-1.5 text-xs font-medium text-white bg-[#0AAC9E] rounded-lg hover:bg-[#127D74] flex items-center gap-1 ${
            isLoading ? "opacity-75 cursor-not-allowed" : ""
          }`}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin h-3 w-3 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Applying...</span>
            </>
          ) : (
            "Apply Filters"
          )}
        </button>
      </div>
    </div>
  );
};

export default FilterPanel;
