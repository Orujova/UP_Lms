"use client";
import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  Users,
  Search,
  Save,
  Plus,
  Trash2,
  MoveVertical,
  ArrowLeft,
  Edit2,
  Edit,
} from "lucide-react";
import { getToken } from "@/authtoken/auth.js";
import { toast, Toaster } from "sonner";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/loadingSpinner";
import SearchableDropdown from "@/components/SearchableDropdown";
const EditTargetGroup = ({ params }) => {
  const targetGroupId = params?.id;
  const router = useRouter();
  const [targetGroup, setTargetGroup] = useState({
    id: targetGroupId || 0,
    name: "",
    filterGroups: [
      {
        id: 0,
        logicalOperator: 1, // Default to AND (1)
        conditions: [
          {
            id: 0,
            column: "functionalarea",
            operator: "equal",
            value: "",
            logicalOperator: 1,
            parentId: 0,
          },
        ],
      },
    ],
  });

  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Data for dropdowns
  const [functionalAreas, setFunctionalAreas] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [subDivisions, setSubDivisions] = useState([]);
  const [positions, setPositions] = useState([]);
  const [positionGroups, setPositionGroups] = useState([]);
  const [genders, setGenders] = useState([]);
  const [roles, setRoles] = useState([]);
  const [residentalAreas, setResidentalAreas] = useState([]);

  // Fetch target group data if editing existing
  useEffect(() => {
    const loadData = async () => {
      setFetchingData(true);
      if (targetGroupId) {
        // Load dropdown data first to ensure we have options for existing values
        await loadAllDropdownData();
        // Then fetch the target group
        await fetchTargetGroup(targetGroupId);
      } else {
        await loadAllDropdownData();
        setFetchingData(false);
      }
    };

    loadData();
  }, [targetGroupId]);

  // Function to fetch dropdown data with better error handling
  const fetchData = async (url, setter, extractFunction) => {
    try {
      const token = getToken();
      if (!token) {
        console.error("Token not found");
        toast.error("Authentication failed. Please log in again.");
        return [];
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch data from ${url}: ${response.status}`);
      }

      const data = await response.json();
      const extractedData = extractFunction(data);
      console.log(
        `Loaded data from ${url}:`,
        extractedData?.length || 0,
        "items"
      );
      setter(extractedData || []);
      return extractedData || [];
    } catch (error) {
      console.error(`Error fetching data from ${url}:`, error);
      return [];
    }
  };

  // Load all dropdown data
  const loadAllDropdownData = async () => {
    try {
      await Promise.all([
        fetchData(
          "https://bravoadmin.uplms.org/api/FunctionalArea",
          setFunctionalAreas,
          (data) => data[0]?.functionalAreas || []
        ),

        fetchData(
          "https://bravoadmin.uplms.org/api/Department",
          setDepartments,
          (data) => data[0]?.departments || []
        ),

        fetchData(
          "https://bravoadmin.uplms.org/api/Project",
          setProjects,
          (data) => data[0]?.projects || []
        ),

        fetchData(
          "https://bravoadmin.uplms.org/api/Division",
          setDivisions,
          (data) => data[0]?.divisions || []
        ),

        fetchData(
          "https://bravoadmin.uplms.org/api/SubDivision",
          setSubDivisions,
          (data) => data[0]?.subDivisions || []
        ),

        fetchData(
          "https://bravoadmin.uplms.org/api/Position",
          setPositions,
          (data) => data[0]?.positions || []
        ),

        fetchData(
          "https://bravoadmin.uplms.org/api/PositionGroup",
          setPositionGroups,
          (data) => data[0]?.positionGroups || []
        ),

        fetchData(
          "https://bravoadmin.uplms.org/api/Gender",
          setGenders,
          (data) => data || []
        ),

        fetchData(
          "https://bravoadmin.uplms.org/api/Role",
          setRoles,
          (data) => data[0]?.roles || []
        ),

        fetchData(
          "https://bravoadmin.uplms.org/api/ResidentalArea",
          setResidentalAreas,
          (data) => data[0]?.residentalAreas || []
        ),
      ]);

      console.log("All dropdown data loaded successfully");
    } catch (error) {
      console.error("Error loading dropdown data:", error);
      toast.error(
        "Some dropdown data failed to load. Please refresh the page."
      );
    }
  };

  // Fetch and properly handle target group data
  const fetchTargetGroup = async (id) => {
    setFetchingData(true);
    try {
      const token = getToken();
      if (!token) {
        setError("Authentication token not found. Please login again.");
        return;
      }

      const response = await fetch(
        `https://bravoadmin.uplms.org/api/TargetGroup/${id}`,
        {
          method: "GET",
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch data. Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Fetched target group:", data);

      // Enhanced data validation and transformation based on the actual API response
      if (!data || !data.id) {
        throw new Error("Invalid target group data received");
      }

      // Ensure all required data is present and properly structured
      // The API returns logicalOperator as null, but we need it as 1 (AND) or 2 (OR)
      const processedData = {
        id: data.id,
        name: data.name || "",
        filterGroups: Array.isArray(data.filterGroups)
          ? data.filterGroups.map((group) => ({
              id: group.id || Date.now() + Math.floor(Math.random() * 1000),
              // Convert null to 1 (AND)
              logicalOperator: group.logicalOperator || 1,
              conditions: Array.isArray(group.conditions)
                ? group.conditions.map((condition) => ({
                    id:
                      condition.id ||
                      Date.now() + Math.floor(Math.random() * 1000),
                    column: condition.column || "functionalarea",
                    operator: condition.operator || "equal",
                    value: condition.value || "",
                    // Convert null to 1 (AND)
                    logicalOperator: condition.logicalOperator || 1,
                    // Convert null to 0
                    parentId: condition.parentId || 0,
                  }))
                : [
                    {
                      id: Date.now(),
                      column: "functionalarea",
                      operator: "equal",
                      value: "",
                      logicalOperator: 1,
                      parentId: 0,
                    },
                  ],
            }))
          : [
              {
                id: Date.now(),
                logicalOperator: 1,
                conditions: [
                  {
                    id: Date.now() + 1,
                    column: "functionalarea",
                    operator: "equal",
                    value: "",
                    logicalOperator: 1,
                    parentId: 0,
                  },
                ],
              },
            ],
      };

      console.log("Processed target group data:", processedData);
      setTargetGroup(processedData);
    } catch (error) {
      console.error("Failed to fetch target group:", error);
      setError("Failed to load target group. Please try again later.");
      toast.error("Failed to load target group data: " + error.message);
    } finally {
      setFetchingData(false);
    }
  };

  // Handle target name change
  const handleNameChange = (e) => {
    setTargetGroup({ ...targetGroup, name: e.target.value });
  };

  // Add new filter group
  const addFilterGroup = () => {
    const newFilterGroup = {
      id: Date.now(), // Temporary ID for UI
      logicalOperator: 1,
      conditions: [
        {
          id: Date.now() + 1,
          column: "functionalarea",
          operator: "equal",
          value: "",
          logicalOperator: 1,
          parentId: 0,
        },
      ],
    };

    setTargetGroup({
      ...targetGroup,
      filterGroups: [...targetGroup.filterGroups, newFilterGroup],
    });
  };

  // Remove filter group
  const removeFilterGroup = (groupId) => {
    if (targetGroup.filterGroups.length <= 1) {
      toast.error("You must have at least one filter group");
      return;
    }

    setTargetGroup({
      ...targetGroup,
      filterGroups: targetGroup.filterGroups.filter(
        (group) => group.id !== groupId
      ),
    });
  };

  // Toggle logical operator (AND/OR) for a filter group
  const toggleGroupOperator = (groupId) => {
    setTargetGroup({
      ...targetGroup,
      filterGroups: targetGroup.filterGroups.map((group) => {
        if (group.id === groupId) {
          return {
            ...group,
            logicalOperator: group.logicalOperator === 1 ? 2 : 1, // Toggle between AND (1) and OR (2)
          };
        }
        return group;
      }),
    });
  };

  // Add condition to a filter group
  const addCondition = (groupId) => {
    setTargetGroup({
      ...targetGroup,
      filterGroups: targetGroup.filterGroups.map((group) => {
        if (group.id === groupId) {
          return {
            ...group,
            conditions: [
              ...group.conditions,
              {
                id: Date.now(),
                column: "functionalarea",
                operator: "equal",
                value: "",
                logicalOperator: 1,
                parentId: 0,
              },
            ],
          };
        }
        return group;
      }),
    });
  };

  // Remove condition from a filter group
  const removeCondition = (groupId, conditionId) => {
    const group = targetGroup.filterGroups.find((g) => g.id === groupId);
    if (group && group.conditions.length <= 1) {
      toast.error("Group must have at least one condition");
      return;
    }

    setTargetGroup({
      ...targetGroup,
      filterGroups: targetGroup.filterGroups.map((group) => {
        if (group.id === groupId) {
          return {
            ...group,
            conditions: group.conditions.filter(
              (condition) => condition.id !== conditionId
            ),
          };
        }
        return group;
      }),
    });
  };

  // Update condition values
  const updateCondition = (groupId, conditionId, field, value) => {
    setTargetGroup({
      ...targetGroup,
      filterGroups: targetGroup.filterGroups.map((group) => {
        if (group.id === groupId) {
          return {
            ...group,
            conditions: group.conditions.map((condition) => {
              if (condition.id === conditionId) {
                // If field type is changed, reset the value since the options will change
                if (field === "column") {
                  const isNumeric = isNumericField(value);
                  return {
                    ...condition,
                    [field]: value,
                    operator: isNumeric ? "equal" : "equal",
                    value: "",
                  };
                }

                // If condition operator is changed, check if we need to reset the value
                if (field === "operator") {
                  const shouldShowDropdown = shouldUseDropdown(
                    condition.column,
                    value
                  );
                  const currentlyShowsDropdown = shouldUseDropdown(
                    condition.column,
                    condition.operator
                  );

                  // Reset value when switching between input types
                  if (shouldShowDropdown !== currentlyShowsDropdown) {
                    return { ...condition, [field]: value, value: "" };
                  }
                }

                return { ...condition, [field]: value };
              }
              return condition;
            }),
          };
        }
        return group;
      }),
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!targetGroup.name.trim()) {
      toast.error("Please enter a target name");
      return;
    }

    // Validate all conditions have values
    const isValid = targetGroup.filterGroups.every(
      (group) =>
        group.conditions.length > 0 &&
        group.conditions.every(
          (condition) => condition.value.toString().trim() !== ""
        )
    );

    if (!isValid) {
      toast.error("All filter fields must have values");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const token = getToken();
      if (!token) {
        setError("Authentication token not found. Please login again.");
        setLoading(false);
        return;
      }

      console.log("Submitting target group data:", targetGroup);

      const response = await fetch(
        "https://bravoadmin.uplms.org/api/TargetGroup/UpdateTargetGroup",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            accept: "*/*",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(targetGroup),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to save data. Status: ${response.status}. Details: ${errorText}`
        );
      }

      setSuccess(true);
      toast.success("Target group updated successfully!");

      // Give user time to see the success message before redirecting
      setTimeout(() => {
        router.push("/admin/dashboard/targets/");
      }, 1500);
    } catch (error) {
      console.error("Failed to update target group:", error);
      setError("Failed to save changes. Please try again: " + error.message);
      toast.error("Update failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Field options based on the backend properties
  const fieldOptions = [
    { value: "functionalarea", label: "Functional Area" },
    { value: "department", label: "Department" },
    { value: "project", label: "Project" },
    { value: "division", label: "Division" },
    { value: "subdivision", label: "Sub Division" },
    { value: "position", label: "Position" },
    { value: "positiongroup", label: "Position Group" },
    { value: "manageriallevel", label: "Managerial Level" },
    { value: "residentalarea", label: "Residental Area" },
    { value: "gender", label: "Gender" },
    { value: "role", label: "Role" },
    { value: "age", label: "Age" },
    { value: "tenure", label: "Tenure" },
  ];

  // Options for managerial level
  const managerialLevelOptions = [
    { id: "Manager", name: "Manager" },
    { id: "Non-Manager", name: "Non-Manager" },
    { id: "N/A", name: "N/A" },
  ];

  // Check if the column requires a numeric input
  const isNumericField = (column) => {
    return column === "age" || column === "tenure";
  };

  // Check if the column requires a dropdown for values based on the condition
  const shouldUseDropdown = (column, operator) => {
    // For numeric fields, never use dropdown
    if (isNumericField(column)) {
      return false;
    }

    // For text fields like names, emails, etc., never use dropdown
    if (["firstName", "lastName", "email", "phoneNumber"].includes(column)) {
      return false;
    }

    // Only show dropdowns for equal and notequal conditions on categorical fields
    return operator === "equal" || operator === "notequal";
  };

  // Get condition options based on selected field
  const getConditionOptions = (fieldType) => {
    if (fieldType === "age" || fieldType === "tenure") {
      return [
        { value: "equal", label: "Equal" },
        { value: "notequal", label: "Not Equal" },
        { value: "lessthan", label: "Less Than" },
        { value: "greaterthan", label: "Greater Than" },
        { value: "lessthanorequal", label: "Less Than or Equal" },
        { value: "greaterthanorequal", label: "Greater Than or Equal" },
      ];
    }

    return [
      { value: "equal", label: "Equal" },
      { value: "notequal", label: "Not Equal" },
      { value: "contains", label: "Contains" },
      { value: "startswith", label: "Starts With" },
      { value: "endswith", label: "Ends With" },
      { value: "notcontains", label: "Not Contains" },
    ];
  };

  // Convert dropdown options to the format expected by SearchableDropdown
  const formatDropdownOptions = (options, valueKey, labelKey) => {
    if (!options || !Array.isArray(options)) return [];
    return options.map((option) => ({
      id: option[valueKey],
      name: option[labelKey],
    }));
  };

  // Get appropriate options for the value field based on the selected column
  const getValueOptions = (column) => {
    switch (column) {
      case "functionalarea":
        return formatDropdownOptions(functionalAreas, "name", "name");
      case "department":
        return formatDropdownOptions(departments, "name", "name");
      case "project":
        return formatDropdownOptions(projects, "name", "name");
      case "division":
        return formatDropdownOptions(divisions, "name", "name");
      case "subdivision":
        return formatDropdownOptions(subDivisions, "name", "name");
      case "position":
        return formatDropdownOptions(positions, "name", "name");
      case "positiongroup":
        return formatDropdownOptions(positionGroups, "name", "name");
      case "manageriallevel":
        return managerialLevelOptions;
      case "residentalarea":
        return formatDropdownOptions(residentalAreas, "name", "name");
      case "gender":
        return formatDropdownOptions(genders, "genderName", "genderName");
      case "role":
        return formatDropdownOptions(roles, "roleName", "roleName");
      default:
        return [];
    }
  };

  // Render loading state
  if (fetchingData) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pt-14">
      <Toaster position="top-right" />
      {/* Header */}
      <div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button
              className="p-2 rounded-md hover:bg-gray-100 transition-colors"
              onClick={() => router.push("/admin/dashboard/targets/")}
            >
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </button>
            <h2 className="text-base font-bold text-gray-900">
              Edit Target Group
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/admin/dashboard/targets/")}
              className="px-4 py-2 text-sm text-gray-700 bg-white rounded-lg hover:bg-gray-100 border border-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 text-sm text-white bg-[#0AAC9E] rounded-lg hover:bg-[#099b8e] flex items-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 max-w-6xl mx-auto">
        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-3 bg-green-50 text-green-600 rounded-md">
            Target group was successfully saved
          </div>
        )}

        {/* Target Group Name */}
        <div className="mb-8 max-w-md mx-auto bg-white p-6 rounded-lg shadow-sm">
          <label
            htmlFor="groupName"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Target Group Name
          </label>
          <div className="relative">
            <Edit2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              id="groupName"
              value={targetGroup.name}
              onChange={handleNameChange}
              placeholder="Enter target group name"
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0AAC9E]/20 focus:border-[#0AAC9E] shadow-sm"
            />
          </div>
        </div>

        {/* Filter Groups */}
        <div className="space-y-6">
          {targetGroup.filterGroups.map((group, groupIndex) => (
            <div
              key={group.id}
              className="border border-gray-200 rounded-lg p-6 relative bg-white shadow-sm"
            >
              {/* Drag Handle */}
              <div className="absolute left-3 top-6 cursor-move">
                <MoveVertical className="w-4 h-4 text-gray-400" />
              </div>

              {/* Group Operator */}
              <div className="max-w-xs mx-auto mb-6">
                <div className="flex rounded-md overflow-hidden border border-gray-200 shadow-sm">
                  <button
                    className={`flex-1 px-4 py-2 text-sm font-medium ${
                      group.logicalOperator === 1
                        ? "bg-[#0AAC9E] text-white"
                        : "bg-white text-gray-700"
                    }`}
                    onClick={() => {
                      if (group.logicalOperator !== 1) {
                        toggleGroupOperator(group.id);
                      }
                    }}
                  >
                    AND
                  </button>
                  <button
                    className={`flex-1 px-4 py-2 text-sm font-medium ${
                      group.logicalOperator === 2
                        ? "bg-[#0AAC9E] text-white"
                        : "bg-white text-gray-700"
                    }`}
                    onClick={() => {
                      if (group.logicalOperator !== 2) {
                        toggleGroupOperator(group.id);
                      }
                    }}
                  >
                    OR
                  </button>
                </div>
              </div>

              {/* Conditions */}
              <div className="space-y-4 pl-6">
                {group.conditions.map((condition, conditionIndex) => (
                  <div
                    key={condition.id}
                    className="grid grid-cols-12 gap-4 items-end"
                  >
                    {/* Column */}
                    <div className="col-span-4">
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Field
                      </label>
                      <select
                        value={condition.column || ""}
                        onChange={(e) =>
                          updateCondition(
                            group.id,
                            condition.id,
                            "column",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0AAC9E]/20 focus:border-[#0AAC9E] shadow-sm"
                      >
                        <option value="">Select field</option>
                        {fieldOptions.map((col) => (
                          <option key={col.value} value={col.value}>
                            {col.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Operator */}
                    <div className="col-span-3">
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Operator
                      </label>
                      <select
                        value={condition.operator || "equal"}
                        onChange={(e) =>
                          updateCondition(
                            group.id,
                            condition.id,
                            "operator",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:outline-0 focus:ring-[#0AAC9E]/20 focus:border-[#0AAC9E] shadow-sm"
                      >
                        {getConditionOptions(condition.column).map((op) => (
                          <option key={op.value} value={op.value}>
                            {op.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Value */}
                    <div className="col-span-4">
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Value
                      </label>
                      {isNumericField(condition.column) ? (
                        <input
                          type="number"
                          value={condition.value || ""}
                          onChange={(e) =>
                            updateCondition(
                              group.id,
                              condition.id,
                              "value",
                              e.target.value
                            )
                          }
                          placeholder="Enter numeric value"
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0AAC9E]/20 focus:border-[#0AAC9E] focus:outline-0 shadow-sm"
                        />
                      ) : shouldUseDropdown(
                          condition.column,
                          condition.operator
                        ) ? (
                        // Use SearchableDropdown instead of select
                        <SearchableDropdown
                          options={getValueOptions(condition.column)}
                          value={condition.value}
                          onChange={(e) =>
                            updateCondition(
                              group.id,
                              condition.id,
                              "value",
                              e.target.value
                            )
                          }
                          placeholder="Select value"
                          className="w-full"
                        />
                      ) : (
                        <input
                          type="text"
                          value={condition.value || ""}
                          onChange={(e) =>
                            updateCondition(
                              group.id,
                              condition.id,
                              "value",
                              e.target.value
                            )
                          }
                          placeholder="Enter text value"
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0AAC9E]/20 focus:border-[#0AAC9E]  focus:outline-0 shadow-sm"
                        />
                      )}
                    </div>
                    {/* Remove Button */}
                    <div className="col-span-1">
                      <button
                        onClick={() => removeCondition(group.id, condition.id)}
                        disabled={group.conditions.length === 1}
                        className={`p-2 rounded-md ${
                          group.conditions.length === 1
                            ? "text-gray-300 cursor-not-allowed"
                            : "text-red-500 hover:bg-red-50"
                        }`}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Add Condition Button */}
                <div className="mt-4">
                  <button
                    onClick={() => addCondition(group.id)}
                    className="inline-flex items-center px-3 py-2 text-sm text-[#0AAC9E] bg-white border border-[#0AAC9E] rounded-md hover:bg-[#ecfcfb]"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Condition
                  </button>
                </div>
              </div>

              {/* Remove Group Button */}
              {targetGroup.filterGroups.length > 1 && (
                <button
                  onClick={() => removeFilterGroup(group.id)}
                  className="absolute top-3 right-3 p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-md"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}

          {/* Add Filter Group Button */}
          <div className="flex justify-center mt-6">
            <button
              onClick={addFilterGroup}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 shadow-sm"
            >
              <Plus className="w-4 h-4 mr-2 text-[#0AAC9E]" />
              Add Filter Group
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mt-8">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 text-sm text-white bg-[#0AAC9E] rounded-lg hover:bg-[#099b8e] min-w-24 text-center shadow-sm"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
            ) : (
              "Save"
            )}
          </button>
          <button
            onClick={() => router.push("/admin/dashboard/targets/")}
            className="px-6 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 min-w-24 shadow-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditTargetGroup;
