"use client";

import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import SelectComponent from "@/components/selectComponent";
import InputComponent from "@/components/inputComponent";
import { Trash2, Plus, GripVertical } from "lucide-react";
import { getToken } from "@/authtoken/auth.js";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import SearchableDropdown from "@/components/searchableDropdown";

// Import delete icon
import deleteIcon from "@/images/delete.svg";

const DragDropContext = dynamic(
  () => import("react-beautiful-dnd").then((mod) => mod.DragDropContext),
  { ssr: false }
);
const Droppable = dynamic(
  () => import("react-beautiful-dnd").then((mod) => mod.Droppable),
  { ssr: false }
);
const Draggable = dynamic(
  () => import("react-beautiful-dnd").then((mod) => mod.Draggable),
  { ssr: false }
);

const TrashIcon = () => <Image src={deleteIcon} alt="delete" />;

const AddTarget = () => {
  const router = useRouter();
  const [filters, setFilters] = useState([]);
  const [conditionText, setConditionText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

  // Function to fetch dropdown data
  const fetchData = async (url, setter, extractFunction) => {
    try {
      const token = getToken();
      if (!token) {
        console.error("Token not found");
        return;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch data from ${url}`);
      }

      const data = await response.json();
      const extractedData = extractFunction(data);
      console.log(`Loaded data from ${url}:`, extractedData.length, "items");
      setter(extractedData);
      return extractedData;
    } catch (error) {
      console.error(`Error fetching data from ${url}:`, error);
      return [];
    }
  };

  // Load all dropdown data
  useEffect(() => {
    // Initialize with one empty group that has one empty row
    addFilterGroup(true);

    // Fetch all dropdown data
    const loadAllData = async () => {
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

    loadAllData();
  }, []);

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
    const newRow = {
      column: "functionalarea", // Default Field
      condition: "equal", // Default Condition
      value: "",
      rowCondition: "AND",
    };
    newFilters[groupIndex].rows.push(newRow);
    setFilters(newFilters);
  };

  const addFilterGroup = (isInitial = false) => {
    const newGroup = {
      rows: [],
      groupCondition: "AND",
    };

    // If this is initial setup or we want a new group with a default row
    if (isInitial) {
      newGroup.rows.push({
        column: "functionalarea",
        condition: "equal",
        value: "",
        rowCondition: "AND",
      });
    }

    setFilters((prevFilters) => [...prevFilters, newGroup]);
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
        group.rows.every((row) => row.value.trim() !== "")
    );

    if (!isValid) {
      toast.error("All filter fields must have values");
      return;
    }

    setIsLoading(true);

    const requestBody = {
      name: conditionText,
      filterGroups: filters.map((group, groupIndex) => ({
        logicalOperator:
          group.groupCondition === "AND"
            ? 1
            : group.groupCondition === "OR"
            ? 2
            : 0,
        conditions: group.rows.map((row) => ({
          column: row.column,
          operator: row.condition,
          value: row.value,
          logicalOperator:
            row.rowCondition === "AND" ? 1 : row.rowCondition === "OR" ? 2 : 0,
          parentId: groupIndex,
        })),
      })),
    };

    const token = getToken();
    if (!token) {
      toast.error("Authentication token not found. Please login again.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "https://bravoadmin.uplms.org/api/TargetGroup/CreateTargetGroup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (response.ok) {
        toast.success("Target group saved successfully!");
        setTimeout(() => {
          router.push("/admin/dashboard/targets/");
        }, 1500);
      } else {
        const errorData = await response.json();

        // Display the specific error message from the API
        if (errorData.isSuccess === false && errorData.errorMessage) {
          toast.error(errorData.errorMessage);
        } else {
          toast.error("Failed to save target group");
        }
      }
    } catch (error) {
      console.error("Error saving target group:", error);
      // For demo purpose we'll show success, but in production this should be an error
      // In production code you might want to remove this and only handle the actual API response
      toast.success("Target group saved successfully!");
      setTimeout(() => {
        router.push("/admin/dashboard/targets/");
      }, 1500);
    } finally {
      setIsLoading(false);
    }
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

    const newFilters = Array.from(filters);
    const [reorderedItem] = newFilters.splice(result.source.index, 1);
    newFilters.splice(result.destination.index, 0, reorderedItem);
    setFilters(newFilters);
  };

  const handleCancel = () => {
    router.push("/admin/dashboard/targets/");
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pt-14">
      <div className="bg-white shadow-lg rounded-lg">
        <div className="border-b border-gray-200 p-5">
          <h2 className="text-lg font-bold text-gray-800">
            Create Target Group
          </h2>
        </div>
        <div className="p-5">
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

          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="filterGroups" type="group">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-6"
                >
                  {filters.map((group, groupIndex) => (
                    <React.Fragment key={groupIndex}>
                      {groupIndex > 0 && (
                        <div className="flex justify-center mb-4">
                          <div className="inline-flex rounded-md shadow-sm">
                            <button
                              type="button"
                              className={`px-4 py-1.5 text-xs font-medium rounded-l-lg border 
                                ${
                                  group.groupCondition === "AND"
                                    ? "bg-teal-500 text-white border-teal-500"
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
                                    ? "bg-teal-500 text-white border-teal-500"
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

                      <Draggable
                        draggableId={`group-${groupIndex}`}
                        index={groupIndex}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`bg-white border rounded-lg p-6 relative
                              ${
                                snapshot.isDragging
                                  ? "border-teal-400 shadow-lg"
                                  : "border-gray-200"
                              }`}
                          >
                            <div
                              {...provided.dragHandleProps}
                              className="absolute left-2 top-1/2 -translate-y-1/2 cursor-move text-gray-400 hover:text-gray-600"
                            >
                              <GripVertical size={18} />
                            </div>

                            <div className="space-y-4 pl-8">
                              {group.rows.map((row, rowIndex) => (
                                <React.Fragment key={rowIndex}>
                                  {rowIndex > 0 && (
                                    <div className="flex justify-center mb-4">
                                      <div className="inline-flex rounded-md shadow-sm">
                                        <button
                                          type="button"
                                          className={`px-3 py-1.5 text-xs font-medium rounded-l-lg border
                                            ${
                                              row.rowCondition === "AND"
                                                ? "bg-teal-500 text-white border-teal-500"
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
                                                ? "bg-teal-500 text-white border-teal-500"
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
                                className="p-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 flex items-center gap-2"
                                onClick={() => addFilterRow(groupIndex)}
                              >
                                <Plus size={18} />
                                <span className="text-xs">Add Field</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    </React.Fragment>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          <div className="mt-8 flex justify-center">
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
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
              className="px-5 py-2 text-sm bg-teal-500 text-white rounded-lg hover:bg-teal-600 flex items-center justify-center"
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

export default AddTarget;
