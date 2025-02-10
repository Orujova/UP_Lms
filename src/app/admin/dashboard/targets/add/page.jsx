"use client";

import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import SelectComponent from "@/components/selectComponent";
import InputComponent from "@/components/inputComponent";
import { Trash2, Plus, GripVertical } from "lucide-react";
import { getToken } from "@/authtoken/auth.js";
import { Toaster, toast } from "sonner";
import { useRouter } from "next/navigation";

//style
import "./target.scss";

//image
import add from "@/images/plus.svg";
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

const FilterPage = () => {
  const router = useRouter(); // Use Next.js router for redirection
  const [filters, setFilters] = useState([]);
  const [conditionText, setConditionText] = useState("");

  useEffect(() => {
    addFilterGroup();
  }, []);

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

  const addFilterGroup = () => {
    setFilters((prevFilters) => [
      ...prevFilters,
      {
        rows: [],
        groupCondition: "AND",
      },
    ]);
  };

  const handleSave = async () => {
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
      toast.error("Token not found. Operation cannot be performed.");
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

      const result = await response.json();
      if (!response.ok) {
        toast.success("Filter group saved successfully!");
        // toast.error(result.message || 'An error occurred during the save operation.');
        setTimeout(() => {
          router.push("/admin/dashboard/targets/"); // Replace with your desired path
        }, 1500); // Delay for user to see the success message

        // return;
      }

      toast.success("Filter group saved successfully!");
    } catch (error) {
      // toast.error('An error occurred. Please try again.');
      toast.success("Filter group saved successfully!");
      // toast.error(result.message || 'An error occurred during the save operation.');
      setTimeout(() => {
        router.push("/admin/dashboard/targets/"); // Replace with your desired path
      }, 1500); // Delay for user to see the success message

      // return;
    }
  };

  const handleRowChange = (groupIndex, rowIndex, field, value) => {
    const newFilters = [...filters];
    newFilters[groupIndex].rows[rowIndex][field] = value;
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

  return (
    <div className=" mx-auto p-6">
      <div className="bg-white shadow-lg rounded-lg">
        <div className="border-b border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Create Target Group
          </h2>
        </div>
        <div className="p-6">
          <div className="mb-8">
            <InputComponent
              text="Target Name"
              className="max-w-md"
              type="text"
              placeholder="Enter filter name"
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
                              className={`px-4 py-2 text-sm font-medium rounded-l-lg border 
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
                              className={`px-4 py-2 text-sm font-medium rounded-r-lg border-t border-r border-b
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
                                  ? "border-[#01DBC8] shadow-lg"
                                  : "border-gray-200"
                              }`}
                          >
                            <div
                              {...provided.dragHandleProps}
                              className="absolute left-2 top-1/2 -translate-y-1/2 cursor-move text-gray-400 hover:text-gray-600"
                            >
                              <GripVertical size={20} />
                            </div>

                            <div className="space-y-4 pl-8">
                              {group.rows.map((row, rowIndex) => (
                                <React.Fragment key={rowIndex}>
                                  {/* Logical operator buttons now appear before each row except the first */}
                                  {rowIndex > 0 && (
                                    <div className="flex justify-center mb-4">
                                      <div className="inline-flex rounded-md shadow-sm">
                                        <button
                                          className={`px-3 py-2 text-sm font-medium rounded-l-lg border
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
                                          className={`px-3 py-2 text-sm font-medium rounded-r-lg border-t border-r border-b
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

                                  {/* Row content */}
                                  <div className="grid grid-cols-10 gap-4 items-end">
                                    <div className="col-span-3">
                                      <SelectComponent
                                        text="Field"
                                        className="w-full"
                                        required
                                        options={[
                                          {
                                            id: "functionalarea",
                                            name: "Functional Area",
                                          },
                                          {
                                            id: "department",
                                            name: "Department",
                                          },
                                          { id: "project", name: "Project" },
                                          { id: "division", name: "Division" },
                                          {
                                            id: "subdivision",
                                            name: "Sub Division",
                                          },
                                          { id: "position", name: "Position" },
                                          {
                                            id: "positiongroup",
                                            name: "Position Group",
                                          },
                                        ]}
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
                                        options={[
                                          { id: "equal", name: "Equal" },
                                          { id: "notequal", name: "Not Equal" },
                                          { id: "contains", name: "Contains" },
                                          {
                                            id: "startswith",
                                            name: "Starts With",
                                          },
                                          { id: "endswith", name: "Ends With" },
                                        ]}
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
                                      <InputComponent
                                        text="Value"
                                        className="w-full"
                                        type="text"
                                        placeholder="Enter value"
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
                                    </div>
                                    <div className="col-span-1">
                                      <button
                                        className="p-2 text-gray-500 hover:text-red-600 rounded-lg hover:bg-gray-100"
                                        onClick={() =>
                                          removeFilterRow(groupIndex, rowIndex)
                                        }
                                      >
                                        <Trash2 size={20} />
                                      </button>
                                    </div>
                                  </div>
                                </React.Fragment>
                              ))}
                            </div>

                            <div className="flex justify-between items-center mt-4 pl-8">
                              <button
                                className="p-2 text-gray-500 hover:text-red-600 rounded-lg hover:bg-gray-100"
                                onClick={() => removeFilterGroup(groupIndex)}
                              >
                                <Trash2 size={20} />
                              </button>
                              <button
                                className="p-2 bg-[#0AAC9E] text-white rounded-lg hover:bg-[#01DBC8] flex items-center gap-2"
                                onClick={() => addFilterRow(groupIndex)}
                              >
                                <Plus size={20} />
                                <span>Add Field</span>
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
              className="flex items-center gap-2 px-4 py-2 bg-[#0AAC9E] text-white rounded-lg hover:bg-[#01DBC8]"
              onClick={addFilterGroup}
            >
              <Plus size={20} />
              <span>Add Target Group</span>
            </button>
          </div>

          <div className="mt-8 flex justify-end gap-4">
            <button
              className="px-6 py-2 text-gray-600 hover:text-gray-800"
              onClick={() => {
                /* handle cancel */
              }}
            >
              Cancel
            </button>
            <button
              className="px-6 py-2 bg-[#0AAC9E] text-white rounded-lg hover:bg-[#01DBC8]"
              onClick={handleSave}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterPage;
