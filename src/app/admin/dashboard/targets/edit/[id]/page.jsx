"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Trash2, Plus, GripVertical, ArrowLeft } from "lucide-react";
import { getToken } from "@/authtoken/auth.js";
import { toast, Toaster } from "sonner";
import { useRouter } from "next/navigation";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import debounce from "lodash/debounce";

import LoadingSpinner from "@/components/loadingSpinner";
import SelectComponent from "@/components/selectComponent";
import InputComponent from "@/components/inputComponent";
import SearchableDropdown from "@/components/searchableDropdown";

const EditTargetGroup = ({ params }) => {
  const targetGroupId = params?.id;
  const router = useRouter();

  const [name, setName] = useState("");
  const [filters, setFilters] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState(null);
  const [clientSide, setClientSide] = useState(false);

  const [dropdownData, setDropdownData] = useState({
    functionalAreas: [],
    departments: [],
    projects: [],
    divisions: [],
    subDivisions: [],
    positions: [],
    positionGroups: [],
    genders: [],
    roles: [],
    residentalAreas: [],
  });

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

  const managerialLevelOptions = [
    { id: "Manager", name: "Manager" },
    { id: "Non-Manager", name: "Non-Manager" },
    { id: "N/A", name: "N/A" },
  ];

  useEffect(() => {
    setClientSide(true);
  }, []);

  useEffect(() => {
    if (!clientSide) return;

    const loadData = async () => {
      setIsFetching(true);
      try {
        await loadDropdownData();
        if (targetGroupId) {
          await fetchTargetGroup(targetGroupId);
        } else {
          addFilterGroup();
        }
      } catch (err) {
        setError("Failed to load data. Please try again.");
        toast.error("Error loading data: " + err.message);
      } finally {
        setIsFetching(false);
      }
    };

    loadData();
  }, [clientSide, targetGroupId]);

  useEffect(() => {
    filters.forEach((group, index) => {
      if (!Array.isArray(group.rows)) {
        console.error(`Invalid rows in group ${index}:`, group);
      }
    });
  }, [filters]);

  const loadDropdownData = async () => {
    const endpoints = [
      {
        url: "https://bravoadmin.uplms.org/api/FunctionalArea",
        key: "functionalAreas",
        extract: (data) => data[0]?.functionalAreas || [],
      },
      {
        url: "https://bravoadmin.uplms.org/api/Department",
        key: "departments",
        extract: (data) => data[0]?.departments || [],
      },
      {
        url: "https://bravoadmin.uplms.org/api/Project",
        key: "projects",
        extract: (data) => data[0]?.projects || [],
      },
      {
        url: "https://bravoadmin.uplms.org/api/Division",
        key: "divisions",
        extract: (data) => data[0]?.divisions || [],
      },
      {
        url: "https://bravoadmin.uplms.org/api/SubDivision",
        key: "subDivisions",
        extract: (data) => data[0]?.subDivisions || [],
      },
      {
        url: "https://bravoadmin.uplms.org/api/Position",
        key: "positions",
        extract: (data) => data[0]?.positions || [],
      },
      {
        url: "https://bravoadmin.uplms.org/api/PositionGroup",
        key: "positionGroups",
        extract: (data) => data[0]?.positionGroups || [],
      },
      {
        url: "https://bravoadmin.uplms.org/api/Gender",
        key: "genders",
        extract: (data) => data || [],
      },
      {
        url: "https://bravoadmin.uplms.org/api/Role",
        key: "roles",
        extract: (data) => data[0]?.roles || [],
      },
      {
        url: "https://bravoadmin.uplms.org/api/ResidentalArea",
        key: "residentalAreas",
        extract: (data) => data[0]?.residentalAreas || [],
      },
    ];

    const token = getToken();
    if (!token) {
      throw new Error("Authentication token not found");
    }

    const results = await Promise.all(
      endpoints.map(async ({ url, key, extract }) => {
        try {
          const response = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!response.ok) throw new Error(`Failed to fetch ${key}`);
          const data = await response.json();
          return { key, data: extract(data) || [] };
        } catch (err) {
          console.error(`Error fetching ${key}:`, err);
          return { key, data: [] };
        }
      })
    );

    const newDropdownData = results.reduce(
      (acc, { key, data }) => ({
        ...acc,
        [key]: Array.isArray(data) ? data : [],
      }),
      {}
    );
    setDropdownData(newDropdownData);
  };

  const fetchTargetGroup = async (id) => {
    const token = getToken();
    if (!token) throw new Error("Authentication token not found");

    const response = await fetch(
      `https://bravoadmin.uplms.org/api/TargetGroup/${id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok)
      throw new Error(`Failed to fetch target group: ${response.status}`);

    const data = await response.json();
    if (!data || typeof data !== "object") {
      throw new Error("Invalid target group data");
    }

    setName(data.name || "");
    setFilters(transformApiData(data));
  };

  const transformApiData = (data) => {
    if (!data.filterGroups?.length) {
      return [
        {
          id: `group-new-${Date.now()}`,
          groupCondition: "AND",
          rows: [createNewRow()],
        },
      ];
    }

    const groups = data.filterGroups
      .map((apiGroup, idx) => ({
        id: `group-${apiGroup.id || idx}`,
        originalId: apiGroup.id,
        groupCondition: apiGroup.logicalOperator === 1 ? "AND" : "OR",
        rows: (apiGroup.conditions || []).map((condition, rowIdx) => ({
          id: `row-${condition.id || Date.now() + rowIdx}`,
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
        })),
      }))
      .filter((group) => group.rows.length);

    return groups.length > 0
      ? groups
      : [
          {
            id: `group-new-${Date.now()}`,
            groupCondition: "AND",
            rows: [createNewRow()],
          },
        ];
  };

  const createNewRow = () => ({
    id: `row-new-${Date.now()}`,
    column: "functionalarea",
    condition: "equal",
    value: "",
    rowCondition: "AND",
  });

  const getConditionOptions = (column) => {
    if (["age", "tenure"].includes(column)) {
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

  const getValueOptions = (column) => {
    const mapToOptions = (items, key) =>
      Array.isArray(items)
        ? items.map((item) => ({ id: item[key], name: item[key] }))
        : [];
    switch (column) {
      case "functionalarea":
        return mapToOptions(dropdownData.functionalAreas, "name");
      case "department":
        return mapToOptions(dropdownData.departments, "name");
      case "project":
        return mapToOptions(dropdownData.projects, "name");
      case "division":
        return mapToOptions(dropdownData.divisions, "name");
      case "subdivision":
        return mapToOptions(dropdownData.subDivisions, "name");
      case "position":
        return mapToOptions(dropdownData.positions, "name");
      case "positiongroup":
        return mapToOptions(dropdownData.positionGroups, "name");
      case "manageriallevel":
        return managerialLevelOptions;
      case "residentalarea":
        return mapToOptions(dropdownData.residentalAreas, "name");
      case "gender":
        return mapToOptions(dropdownData.genders, "genderName");
      case "role":
        return mapToOptions(dropdownData.roles, "roleName");
      default:
        return [];
    }
  };

  const isNumericField = (column) => ["age", "tenure"].includes(column);

  const shouldUseDropdown = (column, condition) =>
    !isNumericField(column) && ["equal", "notequal"].includes(condition);

  const addFilterGroup = () => {
    setFilters((prev) => [
      ...prev,
      {
        id: `group-new-${Date.now()}`,
        groupCondition: "AND",
        rows: [createNewRow()],
      },
    ]);
  };

  const addFilterRow = (groupIndex) => {
    setFilters((prev) => {
      const newFilters = [...prev];
      newFilters[groupIndex].rows.push(createNewRow());
      return newFilters;
    });
  };

  const removeFilterRow = (groupIndex, rowIndex) => {
    setFilters((prev) => {
      const newFilters = [...prev];
      newFilters[groupIndex].rows.splice(rowIndex, 1);
      return newFilters;
    });
  };

  const removeFilterGroup = (groupIndex) => {
    setFilters((prev) => prev.filter((_, idx) => idx !== groupIndex));
  };

  const handleRowChange = (groupIndex, rowIndex, field, value) => {
    setFilters((prev) => {
      const newFilters = [...prev];
      newFilters[groupIndex].rows[rowIndex][field] = value;

      if (field === "column") {
        newFilters[groupIndex].rows[rowIndex].condition = isNumericField(value)
          ? "equal"
          : "equal";
        newFilters[groupIndex].rows[rowIndex].value = "";
      } else if (field === "condition") {
        const shouldResetValue =
          shouldUseDropdown(
            newFilters[groupIndex].rows[rowIndex].column,
            value
          ) !==
          shouldUseDropdown(
            newFilters[groupIndex].rows[rowIndex].column,
            prev[groupIndex].rows[rowIndex].condition
          );
        if (shouldResetValue) newFilters[groupIndex].rows[rowIndex].value = "";
      }

      return newFilters;
    });
  };

  const setGroupCondition = (groupIndex, condition) => {
    setFilters((prev) => {
      const newFilters = [...prev];
      newFilters[groupIndex].groupCondition = condition;
      return newFilters;
    });
  };

  const setRowCondition = (groupIndex, rowIndex, condition) => {
    setFilters((prev) => {
      const newFilters = [...prev];
      newFilters[groupIndex].rows[rowIndex].rowCondition = condition;
      return newFilters;
    });
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    setFilters((prev) => {
      const newFilters = [...prev];
      const [moved] = newFilters.splice(result.source.index, 1);
      newFilters.splice(result.destination.index, 0, moved);
      return newFilters;
    });
  };

  const debouncedSetName = useCallback(
    debounce((value) => setName(value), 300),
    []
  );

  const prepareDataForApi = () => ({
    id: targetGroupId || 0,
    name: name.trim(),
    filterGroups: filters.map((group) => ({
      id: group.originalId || 0,
      logicalOperator: group.groupCondition === "AND" ? 1 : 2,
      conditions: group.rows.map((row, idx) => ({
        id: row.originalId || 0,
        column: row.column,
        operator: row.condition,
        value: row.value,
        logicalOperator: idx === 0 ? null : row.rowCondition === "AND" ? 1 : 2,
        parentId: null,
      })),
    })),
  });

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Target group name is required");
      return;
    }

    const isValid = filters.every(
      (group) =>
        Array.isArray(group.rows) &&
        group.rows.length > 0 &&
        group.rows.every((row) => {
          const value = row.value.toString().trim();
          if (isNumericField(row.column)) {
            const num = parseFloat(value);
            return !isNaN(num) && num >= 0;
          }
          return value !== "";
        })
    );

    if (!isValid) {
      toast.error("All filter fields must have valid values");
      return;
    }

    setIsLoading(true);
    try {
      const token = getToken();
      if (!token) {
        toast.error("Session expired. Please log in.");
        router.push("/login");
        return;
      }

      const response = await fetch(
        "https://bravoadmin.uplms.org/api/TargetGroup/UpdateTargetGroup",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(prepareDataForApi()),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          toast.error("Unauthorized. Please log in.");
          router.push("/login");
        } else {
          toast.error(errorData.message || "Failed to update target group");
        }
        return;
      }

      toast.success("Target group updated successfully");
      setTimeout(() => router.push("/admin/dashboard/targets"), 1500);
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Failed to save target group: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => router.push("/admin/dashboard/targets");

  if (isFetching || !clientSide) {
    return (
      <div className="min-h-screen bg-gray-50/50 pt-14 flex justify-center items-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pt-14">
      <Toaster position="top-right" richColors />
      <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-lg">
        <div className="border-b border-gray-200 p-5 flex items-center">
          <button
            className="mr-2 p-2 rounded-md hover:bg-gray-100"
            onClick={handleCancel}
            aria-label="Back to targets"
          >
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </button>
          <h2 className="text-lg font-bold text-gray-800">
            {targetGroupId ? "Edit Target Group" : "Create Target Group"}
          </h2>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-md">
              {error}
            </div>
          )}

          <div className="mb-6">
            <InputComponent
              text="Target Name"
              className="max-w-md"
              type="text"
              placeholder="Enter target group name"
              value={name}
              onChange={(e) => debouncedSetName(e.target.value)}
              required
            />
          </div>

          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="filters">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-6"
                >
                  {Array.isArray(filters) && filters.length > 0 ? (
                    filters.map((group, groupIndex) => (
                      <Draggable
                        key={group.id}
                        draggableId={group.id}
                        index={groupIndex}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`border rounded-lg p-6 bg-white ${
                              snapshot.isDragging
                                ? "border-[#0AAC9E] shadow-lg"
                                : "border-gray-200"
                            }`}
                          >
                            {groupIndex > 0 && (
                              <div className="flex justify-center mb-4">
                                <div className="inline-flex rounded-md shadow-sm">
                                  <button
                                    className={`px-4 py-1.5 text-xs font-medium rounded-l-lg border ${
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
                                    className={`px-4 py-1.5 text-xs font-medium rounded-r-lg border ${
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

                            <div
                              {...provided.dragHandleProps}
                              className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-move"
                            >
                              <GripVertical size={18} />
                            </div>

                            <div className="space-y-4 pl-8">
                              {Array.isArray(group.rows) &&
                              group.rows.length > 0 ? (
                                group.rows.map((row, rowIndex) => (
                                  <React.Fragment key={row.id}>
                                    {rowIndex > 0 && (
                                      <div className="flex justify-center mb-4">
                                        <div className="inline-flex rounded-md shadow-sm">
                                          <button
                                            className={`px-3 py-1.5 text-xs font-medium rounded-l-lg border ${
                                              row.rowCondition === "AND"
                                                ? "bg-[#0AAC9E] text-white border-[#0AAC9E]"
                                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                            }`}
                                            onClick={() =>
                                              setRowCondition(
                                                groupIndex,
                                                rowIndex,
                                                "AND"
                                              )
                                            }
                                          >
                                            AND
                                          </button>
                                          <button
                                            className={`px-3 py-1.5 text-xs font-medium rounded-r-lg border ${
                                              row.rowCondition === "OR"
                                                ? "bg-[#0AAC9E] text-white border-[#0AAC9E]"
                                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                            }`}
                                            onClick={() =>
                                              setRowCondition(
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
                                            min="0"
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
                                            options={getValueOptions(
                                              row.column
                                            )}
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
                                              !getValueOptions(row.column)
                                                .length
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
                                          className={`p-2 rounded-lg hover:bg-gray-100 ${
                                            group.rows.length <= 1
                                              ? "text-gray-300 cursor-not-allowed"
                                              : "text-gray-500 hover:text-red-600"
                                          }`}
                                          onClick={() =>
                                            removeFilterRow(
                                              groupIndex,
                                              rowIndex
                                            )
                                          }
                                          disabled={group.rows.length <= 1}
                                          aria-label="Remove field"
                                        >
                                          <Trash2 size={18} />
                                        </button>
                                      </div>
                                    </div>
                                  </React.Fragment>
                                ))
                              ) : (
                                <div className="text-center text-gray-500">
                                  No rows in this group. Add a field to start.
                                </div>
                              )}
                            </div>

                            <div className="flex justify-between mt-4 pl-8">
                              <button
                                type="button"
                                className={`p-2 rounded-lg hover:bg-gray-100 ${
                                  filters.length <= 1
                                    ? "text-gray-300 cursor-not-allowed"
                                    : "text-gray-500 hover:text-red-600"
                                }`}
                                onClick={() => removeFilterGroup(groupIndex)}
                                disabled={filters.length <= 1}
                                aria-label="Remove group"
                              >
                                <Trash2 size={18} />
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
                        )}
                      </Draggable>
                    ))
                  ) : (
                    <div className="text-center text-gray-500">
                      No filter groups available. Add a new group to start.
                    </div>
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          <div className="mt-6 flex justify-center">
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
              className="px-5 py-2 text-sm bg-[#0AAC9E] text-white rounded-lg hover:bg-[#099b8e] flex items-center gap-2"
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditTargetGroup;
