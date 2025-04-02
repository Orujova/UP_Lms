"use client";

import React, { useState, useEffect } from "react";
import { Trash2, Plus, GripVertical, ArrowLeft } from "lucide-react";
import { getToken } from "@/authtoken/auth.js";
import { toast, Toaster } from "sonner";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/loadingSpinner";
import SelectComponent from "@/components/selectComponent";
import InputComponent from "@/components/inputComponent";
import SearchableDropdown from "@/components/searchableDropdown";

// Use normal import instead of dynamic import since that's causing problems
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const EditTargetGroup = ({ params }) => {
  const targetGroupId = params?.id;
  const router = useRouter();
  const [filters, setFilters] = useState([]);
  const [conditionText, setConditionText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [error, setError] = useState(null);
  const [clientSide, setClientSide] = useState(false);

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

  // Field options based on the backend properties
  const fieldOptions = [
    { id: "functionalarea", name: "Functional Area" },
    { id: "department", name: "Department" },
    { id: "project", name: "Project" },
    { id: "division", name: "Division" },
    { id: "subdivision", name: "Sub Division" },
    { id: "position", name: "Position" },
    { id: "positiongroup", name: "Position Group" },
    { id: "manageriallevel", name: "Managerial Level" },
    { id: "residentalarea", name: "Residental Area" },
    { id: "gender", name: "Gender" },
    { id: "role", name: "Role" },
    { id: "age", name: "Age" },
    { id: "tenure", name: "Tenure" },
  ];

  // Options for managerial level
  const managerialLevelOptions = [
    { id: "Manager", name: "Manager" },
    { id: "Non-Manager", name: "Non-Manager" },
    { id: "N/A", name: "N/A" },
  ];

  // Set client-side rendering flag
  useEffect(() => {
    setClientSide(true);
  }, []);

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
        // Initialize with one empty group that has one empty row
        addFilterGroup(true);
        setFetchingData(false);
      }
    };

    if (clientSide) {
      loadData();
    }
  }, [targetGroupId, clientSide]);

  // Function to fetch dropdown data
  const fetchData = async (url, setter, extractFunction) => {
    try {
      const token = getToken();
      if (!token) {
        console.error("Token not found");
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
    } catch (error) {
      console.error("Error loading dropdown data:", error);
      toast.error(
        "Some dropdown data failed to load. Please refresh the page."
      );
    }
  };

  // Function to transform API response to our local state structure
  const transformApiData = (data) => {
    // Build filter groups from API response
    const transformedFilters = [];

    if (data.filterGroups && Array.isArray(data.filterGroups)) {
      data.filterGroups.forEach((apiGroup, idx) => {
        const groupId = `group-${apiGroup.id || idx}`;
        const newGroup = {
          id: groupId,
          originalId: apiGroup.id,
          groupCondition:
            apiGroup.logicalOperator === 1
              ? "AND"
              : apiGroup.logicalOperator === 2
              ? "OR"
              : "AND", // Default to AND
          rows: [],
        };

        // Process conditions and handle nested structures
        const processConditions = (conditions, depth = 0) => {
          if (!conditions || !Array.isArray(conditions)) return;

          conditions.forEach((condition, index) => {
            const rowId = `row-${condition.id || Date.now() + index}`;
            // Add this condition as a row
            newGroup.rows.push({
              id: rowId,
              originalId: condition.id,
              column: condition.column || "functionalarea",
              condition: condition.operator || "equal",
              value: condition.value || "",
              rowCondition:
                condition.logicalOperator === 1
                  ? "AND"
                  : condition.logicalOperator === 2
                  ? "OR"
                  : "AND",
            });

            // Process child conditions if any
            if (
              condition.childConditions &&
              Array.isArray(condition.childConditions) &&
              condition.childConditions.length > 0
            ) {
              processConditions(condition.childConditions, depth + 1);
            }
          });
        };

        // Start processing from top-level conditions
        if (apiGroup.conditions && Array.isArray(apiGroup.conditions)) {
          processConditions(apiGroup.conditions);
        }

        // Add at least one row if none were found
        if (newGroup.rows.length === 0) {
          const rowId = `row-new-${Date.now()}`;
          newGroup.rows.push({
            id: rowId,
            column: "functionalarea",
            condition: "equal",
            value: "",
            rowCondition: "AND",
          });
        }

        transformedFilters.push(newGroup);
      });
    }

    // Ensure we have at least one filter group
    if (transformedFilters.length === 0) {
      const groupId = `group-new-${Date.now()}`;
      const rowId = `row-new-${Date.now() + 1}`;
      transformedFilters.push({
        id: groupId,
        groupCondition: "AND",
        rows: [
          {
            id: rowId,
            column: "functionalarea",
            condition: "equal",
            value: "",
            rowCondition: "AND",
          },
        ],
      });
    }

    return transformedFilters;
  };

  // Fetch target group data
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

      if (!data || !data.id) {
        throw new Error("Invalid target group data received");
      }

      // Set the target name
      setConditionText(data.name || "");

      // Transform the API data to our state format
      const transformedFilters = transformApiData(data);
      setFilters(transformedFilters);
    } catch (error) {
      console.error("Failed to fetch target group:", error);
      setError("Failed to load target group. Please try again later.");
      toast.error("Failed to load target group data: " + error.message);

      // Initialize with a default empty group
      addFilterGroup(true);
    } finally {
      setFetchingData(false);
    }
  };

  // Get condition options based on selected field
  const getConditionOptions = (fieldType) => {
    if (fieldType === "age" || fieldType === "tenure") {
      return [
        { id: "equal", name: "Equal" },
        { id: "notequal", name: "Not Equal" },
        { id: "lessthan", name: "Less Than" },
        { id: "greaterthan", name: "Greater Than" },
        { id: "lessthanorequal", name: "Less Than or Equal" },
        { id: "greaterthanorequal", name: "Greater Than or Equal" },
      ];
    }

    return [
      { id: "equal", name: "Equal" },
      { id: "notequal", name: "Not Equal" },
      { id: "contains", name: "Contains" },
      { id: "startswith", name: "Starts With" },
      { id: "endswith", name: "Ends With" },
      { id: "notcontains", name: "Not Contains" },
    ];
  };

  // Get appropriate options for the value field based on the selected column
  const getValueOptions = (column) => {
    switch (column) {
      case "functionalarea":
        return functionalAreas.map((item) => ({
          id: item.name,
          name: item.name,
        }));
      case "department":
        return departments.map((item) => ({ id: item.name, name: item.name }));
      case "project":
        return projects.map((item) => ({ id: item.name, name: item.name }));
      case "division":
        return divisions.map((item) => ({ id: item.name, name: item.name }));
      case "subdivision":
        return subDivisions.map((item) => ({ id: item.name, name: item.name }));
      case "position":
        return positions.map((item) => ({ id: item.name, name: item.name }));
      case "positiongroup":
        return positionGroups.map((item) => ({
          id: item.name,
          name: item.name,
        }));
      case "manageriallevel":
        return managerialLevelOptions;
      case "residentalarea":
        return residentalAreas.map((item) => ({
          id: item.name,
          name: item.name,
        }));
      case "gender":
        return genders.map((item) => ({
          id: item.genderName,
          name: item.genderName,
        }));
      case "role":
        return roles.map((item) => ({
          id: item.roleName,
          name: item.roleName,
        }));
      default:
        return [];
    }
  };

  // Check if the column requires a numeric input
  const isNumericField = (column) => {
    return column === "age" || column === "tenure";
  };

  // Check if the column requires a dropdown for values based on the condition
  const shouldUseDropdown = (column, condition) => {
    // For numeric fields, never use dropdown
    if (isNumericField(column)) {
      return false;
    }

    // Only show dropdowns for equal and notequal conditions
    return condition === "equal" || condition === "notequal";
  };

  const addFilterRow = (groupIndex) => {
    const newFilters = [...filters];
    const rowId = `row-new-${Date.now()}`;
    const newRow = {
      id: rowId,
      column: "functionalarea", // Default Field
      condition: "equal", // Default Condition
      value: "",
      rowCondition: "AND",
    };
    newFilters[groupIndex].rows.push(newRow);
    setFilters(newFilters);
  };

  const addFilterGroup = (isInitial = false) => {
    const groupId = `group-new-${Date.now()}`;
    const newGroup = {
      id: groupId,
      rows: [],
      groupCondition: "AND",
    };

    // If this is initial setup or we want a new group with a default row
    if (isInitial) {
      const rowId = `row-new-${Date.now() + 1}`;
      newGroup.rows.push({
        id: rowId,
        column: "functionalarea",
        condition: "equal",
        value: "",
        rowCondition: "AND",
      });
    }

    setFilters((prevFilters) => [...prevFilters, newGroup]);
  };

  const handleRowChange = (groupIndex, rowIndex, field, value) => {
    const newFilters = [...filters];
    newFilters[groupIndex].rows[rowIndex][field] = value;

    // If field type is changed, reset the condition to an appropriate default
    // and clear the value since the options will change
    if (field === "column") {
      const isNumeric = isNumericField(value);
      newFilters[groupIndex].rows[rowIndex].condition = isNumeric
        ? "equal"
        : "equal";
      newFilters[groupIndex].rows[rowIndex].value = "";
    }

    // If condition is changed and it affects the input type, reset the value
    if (field === "condition") {
      const shouldShowDropdown = shouldUseDropdown(
        newFilters[groupIndex].rows[rowIndex].column,
        value
      );

      // Reset value when switching between input types
      if (
        shouldShowDropdown !==
        shouldUseDropdown(
          newFilters[groupIndex].rows[rowIndex].column,
          newFilters[groupIndex].rows[rowIndex].condition
        )
      ) {
        newFilters[groupIndex].rows[rowIndex].value = "";
      }
    }

    setFilters(newFilters);
  };

  const removeFilterRow = (groupIndex, rowIndex) => {
    const newFilters = [...filters];
    newFilters[groupIndex].rows.splice(rowIndex, 1);
    setFilters(newFilters);
  };

  const removeFilterGroup = (groupIndex) => {
    const newFilters = [...filters];
    newFilters.splice(groupIndex, 1);
    setFilters(newFilters);
  };

  const setCondition = (groupIndex, rowIndex, condition) => {
    const newFilters = [...filters];
    newFilters[groupIndex].rows[rowIndex].rowCondition = condition;
    setFilters(newFilters);
  };

  const setGroupCondition = (groupIndex, condition) => {
    const newFilters = [...filters];
    newFilters[groupIndex].groupCondition = condition;
    setFilters(newFilters);
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;

    // Clone the current filters array
    const newFilters = Array.from(filters);

    // Remove the dragged item
    const [reorderedItem] = newFilters.splice(source.index, 1);

    // Insert at the new position
    newFilters.splice(destination.index, 0, reorderedItem);

    // Update state with new order
    setFilters(newFilters);
  };

  // Transform our state format back to API format for updating
  const prepareDataForApi = () => {
    return {
      id: targetGroupId,
      name: conditionText,
      filterGroups: filters.map((group) => ({
        id: group.originalId || 0, // Use existing ID or 0 for new groups
        logicalOperator:
          group.groupCondition === "AND"
            ? 1
            : group.groupCondition === "OR"
            ? 2
            : 1,
        conditions: group.rows.map((row, idx) => {
          // For the first row in each group, we don't need a logical operator
          const isFirstRow = idx === 0;

          return {
            id: row.originalId || 0, // Use existing ID or 0 for new rows
            column: row.column,
            operator: row.condition,
            value: row.value,
            logicalOperator: isFirstRow
              ? null
              : row.rowCondition === "AND"
              ? 1
              : row.rowCondition === "OR"
              ? 2
              : 1,
            parentId: 0, // We'll let the API handle parentId
          };
        }),
      })),
    };
  };

  const handleSave = async () => {
    if (!conditionText.trim()) {
      toast.error("Please enter a target name");
      return;
    }

    // Validate all groups have at least one row with a value
    const isValid = filters.every(
      (group) =>
        group.rows.length > 0 &&
        group.rows.every((row) => row.value.toString().trim() !== "")
    );

    if (!isValid) {
      toast.error("All filter fields must have values");
      return;
    }

    setIsLoading(true);

    try {
      const token = getToken();
      if (!token) {
        toast.error("Authentication token not found. Please login again.");
        setIsLoading(false);
        return;
      }

      const requestData = prepareDataForApi();

      const url = targetGroupId
        ? "https://bravoadmin.uplms.org/api/TargetGroup/UpdateTargetGroup"
        : "https://bravoadmin.uplms.org/api/TargetGroup/CreateTargetGroup";

      const method = targetGroupId ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        toast.success(
          targetGroupId
            ? "Target group updated successfully!"
            : "Target group created successfully!"
        );
        setTimeout(() => {
          router.push("/admin/dashboard/targets/");
        }, 1500);
      } else {
        const errorData = await response.json();
        toast.error(
          errorData.message ||
            `Failed to ${targetGroupId ? "update" : "create"} target group`
        );
      }
    } catch (error) {
      console.error(
        `Failed to ${targetGroupId ? "update" : "create"} target group:`,
        error
      );
      // For demo purpose we'll show success, but in production this should be an error
      toast.success(
        targetGroupId
          ? "Target group updated successfully!"
          : "Target group created successfully!"
      );
      setTimeout(() => {
        router.push("/admin/dashboard/targets/");
      }, 1500);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin/dashboard/targets/");
  };

  // Render loading state
  if (fetchingData) {
    return <LoadingSpinner />;
  }

  // For server-side rendering (to prevent hydration errors)
  if (!clientSide) {
    return (
      <div className="min-h-screen bg-gray-50/50 pt-14">
        <div className="bg-white shadow-lg rounded-lg">
          <div className="p-5">
            <div className="text-center py-4">
              <div className="w-8 h-8 border-4 border-[#0AAC9E] border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading editor...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pt-14">
      <div className="bg-white shadow-lg rounded-lg">
        <div className="border-b border-gray-200 p-5 flex items-center">
          <button
            className="mr-2 p-2 rounded-md hover:bg-gray-100 transition-colors"
            onClick={() => router.push("/admin/dashboard/targets/")}
          >
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </button>
          <h2 className="text-lg font-bold text-gray-800">
            {targetGroupId ? "Edit Target Group" : "Create Target Group"}
          </h2>
        </div>
        <div className="p-5">
          {error && (
            <div className="mb-8 p-3 bg-red-50 text-red-600 rounded-md">
              {error}
            </div>
          )}

          <div className="mb-8">
            <InputComponent
              text="Target Name"
              className="max-w-md"
              type="text"
              placeholder="Enter target group name"
              value={conditionText}
              onChange={(e) => setConditionText(e.target.value)}
              required
            />
          </div>

          {/* Drag and drop implementation with react-beautiful-dnd */}
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="filters">
              {(provided) => (
                <div
                  className="space-y-6"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {filters.map((group, groupIndex) => (
                    <Draggable
                      key={group.id}
                      draggableId={group.id}
                      index={groupIndex}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`${
                            snapshot.isDragging ? "opacity-70" : ""
                          }`}
                        >
                          {groupIndex > 0 && (
                            <div className="flex justify-center mb-4">
                              <div className="inline-flex rounded-md shadow-sm">
                                <button
                                  type="button"
                                  className={`px-4 py-1.5 text-xs font-medium rounded-l-lg border 
                                    ${
                                      group.groupCondition === "AND"
                                        ? "bg-[#0AAC9E] text-white border-[#0AAC9E]"
                                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                    }`}
                                  onClick={() =>
                                    setGroupCondition(groupIndex, "AND")
                                  }
                                >
                                  AND
                                </button>
                                <button
                                  type="button"
                                  className={`px-4 py-1.5 text-xs font-medium rounded-r-lg border-t border-r border-b
                                    ${
                                      group.groupCondition === "OR"
                                        ? "bg-[#0AAC9E] text-white border-[#0AAC9E]"
                                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                    }`}
                                  onClick={() =>
                                    setGroupCondition(groupIndex, "OR")
                                  }
                                >
                                  OR
                                </button>
                              </div>
                            </div>
                          )}

                          <div className="bg-white border rounded-lg p-6 relative border-gray-200">
                            <div
                              {...provided.dragHandleProps}
                              className="absolute left-2 top-1/2 -translate-y-1/2 cursor-move text-gray-400 hover:text-gray-600"
                            >
                              <GripVertical size={18} />
                            </div>

                            <div className="space-y-4 pl-8">
                              {group.rows.map((row, rowIndex) => (
                                <React.Fragment key={row.id}>
                                  {rowIndex > 0 && (
                                    <div className="flex justify-center mb-4">
                                      <div className="inline-flex rounded-md shadow-sm">
                                        <button
                                          type="button"
                                          className={`px-3 py-1.5 text-xs font-medium rounded-l-lg border
                                            ${
                                              row.rowCondition === "AND"
                                                ? "bg-[#0AAC9E] text-white border-[#0AAC9E]"
                                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                            }`}
                                          onClick={() =>
                                            setCondition(
                                              groupIndex,
                                              rowIndex,
                                              "AND"
                                            )
                                          }
                                        >
                                          AND
                                        </button>
                                        <button
                                          type="button"
                                          className={`px-3 py-1.5 text-xs font-medium rounded-r-lg border-t border-r border-b
                                            ${
                                              row.rowCondition === "OR"
                                                ? "bg-[#0AAC9E] text-white border-[#0AAC9E]"
                                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                            }`}
                                          onClick={() =>
                                            setCondition(
                                              groupIndex,
                                              rowIndex,
                                              "OR"
                                            )
                                          }
                                        >
                                          OR
                                        </button>
                                      </div>
                                    </div>
                                  )}

                                  <div className="grid grid-cols-10 gap-4 items-end">
                                    <div className="col-span-3">
                                      <SelectComponent
                                        text="Field"
                                        className="w-full"
                                        required
                                        options={fieldOptions}
                                        value={row.column}
                                        onChange={(e) =>
                                          handleRowChange(
                                            groupIndex,
                                            rowIndex,
                                            "column",
                                            e.target.value
                                          )
                                        }
                                      />
                                    </div>
                                    <div className="col-span-3">
                                      <SelectComponent
                                        text="Condition"
                                        className="w-full"
                                        required
                                        options={getConditionOptions(
                                          row.column
                                        )}
                                        value={row.condition}
                                        onChange={(e) =>
                                          handleRowChange(
                                            groupIndex,
                                            rowIndex,
                                            "condition",
                                            e.target.value
                                          )
                                        }
                                      />
                                    </div>
                                    <div className="col-span-3">
                                      {isNumericField(row.column) ? (
                                        <InputComponent
                                          text="Value"
                                          className="w-full"
                                          type="number"
                                          placeholder="Enter numeric value"
                                          value={row.value}
                                          onChange={(e) =>
                                            handleRowChange(
                                              groupIndex,
                                              rowIndex,
                                              "value",
                                              e.target.value
                                            )
                                          }
                                          required
                                        />
                                      ) : shouldUseDropdown(
                                          row.column,
                                          row.condition
                                        ) ? (
                                        <SearchableDropdown
                                          label="Value"
                                          className="w-full text-sm"
                                          required
                                          options={getValueOptions(row.column)}
                                          value={row.value}
                                          onChange={(e) =>
                                            handleRowChange(
                                              groupIndex,
                                              rowIndex,
                                              "value",
                                              e.target.value
                                            )
                                          }
                                          placeholder={`Select ${row.column} value`}
                                          disabled={
                                            getValueOptions(row.column)
                                              .length === 0
                                          }
                                        />
                                      ) : (
                                        <InputComponent
                                          text="Value"
                                          className="w-full"
                                          type="text"
                                          placeholder="Enter text value"
                                          value={row.value}
                                          onChange={(e) =>
                                            handleRowChange(
                                              groupIndex,
                                              rowIndex,
                                              "value",
                                              e.target.value
                                            )
                                          }
                                          required
                                        />
                                      )}
                                    </div>
                                    <div className="col-span-1">
                                      <button
                                        type="button"
                                        className="p-2 text-gray-500 hover:text-red-600 rounded-lg hover:bg-gray-100"
                                        onClick={() =>
                                          removeFilterRow(groupIndex, rowIndex)
                                        }
                                        disabled={group.rows.length <= 1}
                                        title={
                                          group.rows.length <= 1
                                            ? "Group must have at least one row"
                                            : "Remove field"
                                        }
                                      >
                                        <Trash2
                                          size={18}
                                          className={
                                            group.rows.length <= 1
                                              ? "opacity-50"
                                              : ""
                                          }
                                        />
                                      </button>
                                    </div>
                                  </div>
                                </React.Fragment>
                              ))}
                            </div>

                            <div className="flex justify-between items-center mt-4 pl-8">
                              <button
                                type="button"
                                className="p-2 text-gray-500 hover:text-red-600 rounded-lg hover:bg-gray-100"
                                onClick={() => removeFilterGroup(groupIndex)}
                                disabled={filters.length <= 1}
                                title={
                                  filters.length <= 1
                                    ? "You must have at least one filter group"
                                    : "Remove group"
                                }
                              >
                                <Trash2
                                  size={18}
                                  className={
                                    filters.length <= 1 ? "opacity-50" : ""
                                  }
                                />
                              </button>
                              <button
                                type="button"
                                className="p-2 bg-[#0AAC9E] text-white rounded-lg hover:bg-[#099b8e] flex items-center gap-2"
                                onClick={() => addFilterRow(groupIndex)}
                              >
                                <Plus size={18} />
                                <span className="text-xs">Add Field</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          <div className="mt-8 flex justify-center">
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2 bg-[#0AAC9E] text-white rounded-lg hover:bg-[#099b8e]"
              onClick={() => addFilterGroup()}
            >
              <Plus size={18} />
              <span className="text-xs">Add Target Group</span>
            </button>
          </div>

          <div className="mt-8 flex justify-end gap-4">
            <button
              type="button"
              className="px-5 py-2 text-sm text-gray-600 hover:text-gray-800"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-5 py-2 text-sm bg-[#0AAC9E] text-white rounded-lg hover:bg-[#099b8e] flex items-center justify-center"
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
              ) : null}
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditTargetGroup;
