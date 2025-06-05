"use client";

import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import {
  Plus,
  GripVertical,
  Edit3,
  Trash2,
  Clock,
  Eye,
  EyeOff,
  BookOpen,
  FileText,
  Video,
  HelpCircle,
  Link,
  Upload,
  Check,
} from "lucide-react";
import {
  addSection,
  setActiveSection,
  updateSection,
  removeSection,
  reorderSections,
} from "@/redux/course/courseSlice";

const SectionsSidebar = () => {
  const dispatch = useDispatch();
  const { sections, activeSection } = useSelector((state) => state.course);
  const [editingSection, setEditingSection] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  const handleAddSection = () => {
    dispatch(addSection());
  };

  const handleSectionClick = (sectionId) => {
    if (editingSection !== sectionId) {
      dispatch(setActiveSection(sectionId));
    }
  };

  const handleEditStart = (sectionId, currentTitle) => {
    setEditingSection(sectionId);
    setEditTitle(currentTitle);
  };

  const handleEditSave = (sectionId) => {
    dispatch(
      updateSection({
        sectionId,
        updates: {
          title:
            editTitle.trim() ||
            `Section ${sections.findIndex((s) => s.id === sectionId) + 1}`,
        },
      })
    );
    setEditingSection(null);
    setEditTitle("");
  };

  const handleEditCancel = () => {
    setEditingSection(null);
    setEditTitle("");
  };

  const handleDeleteSection = (sectionId) => {
    if (window.confirm("Are you sure you want to delete this section?")) {
      dispatch(removeSection(sectionId));
    }
  };

  const handleToggleVisibility = (sectionId, currentVisibility) => {
    dispatch(
      updateSection({
        sectionId,
        updates: { hideSection: !currentVisibility },
      })
    );
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    dispatch(
      reorderSections({
        sourceIndex: result.source.index,
        destinationIndex: result.destination.index,
      })
    );
  };

  const getContentIcon = (contentType) => {
    switch (contentType) {
      case 0:
        return FileText; // Page
      case 1:
        return FileText; // Text
      case 2:
        return HelpCircle; // Quiz
      case 3:
        return Link; // URL
      case 4:
        return Video; // Video
      case 5:
        return Upload; // File
      case 6:
        return FileText; // PPTX
      default:
        return FileText;
    }
  };

  const getSectionStats = (section) => {
    const contents = section.contents || [];
    const totalDuration = contents.reduce(
      (acc, content) => acc + (content.duration || 0),
      0
    );
    const contentCounts = {
      videos: contents.filter((c) => c.type === 4).length,
      quizzes: contents.filter((c) => c.type === 2).length,
      documents: contents.filter((c) => [0, 1, 5, 6].includes(c.type)).length,
      links: contents.filter((c) => c.type === 3).length,
    };

    return { totalDuration, contentCounts };
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Course Sections
            </h3>
            <p className="text-sm text-gray-500">{sections.length} sections</p>
          </div>
          <button
            onClick={handleAddSection}
            className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            title="Add new section"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Sections List */}
      <div className="flex-1 overflow-y-auto">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="sections">
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={`p-4 space-y-3 ${
                  snapshot.isDraggingOver ? "bg-emerald-50" : ""
                }`}
              >
                {sections.map((section, index) => {
                  const isActive = activeSection === section.id;
                  const isEditing = editingSection === section.id;
                  const stats = getSectionStats(section);

                  return (
                    <Draggable
                      key={section.id}
                      draggableId={section.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`border rounded-lg transition-all ${
                            isActive
                              ? "border-emerald-500 bg-emerald-50 shadow-md"
                              : "border-gray-200 bg-white hover:border-gray-300"
                          } ${snapshot.isDragging ? "shadow-lg rotate-2" : ""}`}
                        >
                          {/* Section Header */}
                          <div
                            className="p-4 cursor-pointer"
                            onClick={() => handleSectionClick(section.id)}
                          >
                            <div className="flex items-start space-x-3">
                              {/* Drag Handle */}
                              <div
                                {...provided.dragHandleProps}
                                className="mt-1 text-gray-400 hover:text-gray-600 cursor-move"
                              >
                                <GripVertical className="w-4 h-4" />
                              </div>

                              {/* Section Content */}
                              <div className="flex-1 min-w-0">
                                {/* Title */}
                                {isEditing ? (
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="text"
                                      value={editTitle}
                                      onChange={(e) =>
                                        setEditTitle(e.target.value)
                                      }
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter")
                                          handleEditSave(section.id);
                                        if (e.key === "Escape")
                                          handleEditCancel();
                                      }}
                                      className="flex-1 px-2 py-1 text-sm border border-emerald-500 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                      autoFocus
                                    />
                                    <button
                                      onClick={() => handleEditSave(section.id)}
                                      className="text-emerald-600 hover:text-emerald-700"
                                    >
                                      <Check className="w-4 h-4" />
                                    </button>
                                  </div>
                                ) : (
                                  <h4
                                    className={`font-medium truncate ${
                                      isActive
                                        ? "text-emerald-900"
                                        : "text-gray-900"
                                    }`}
                                  >
                                    {section.title || `Section ${index + 1}`}
                                  </h4>
                                )}

                                {/* Section Stats */}
                                <div className="mt-2 space-y-1">
                                  <div className="flex items-center space-x-3 text-xs text-gray-500">
                                    <span className="flex items-center space-x-1">
                                      <BookOpen className="w-3 h-3" />
                                      <span>
                                        {section.contents?.length || 0} items
                                      </span>
                                    </span>
                                    <span className="flex items-center space-x-1">
                                      <Clock className="w-3 h-3" />
                                      <span>{section.duration || 0}m</span>
                                    </span>
                                  </div>

                                  {/* Content Types */}
                                  {section.contents &&
                                    section.contents.length > 0 && (
                                      <div className="flex items-center space-x-2">
                                        {section.contents
                                          .slice(0, 3)
                                          .map((content, idx) => {
                                            const IconComponent =
                                              getContentIcon(content.type);
                                            return (
                                              <div
                                                key={idx}
                                                className={`w-5 h-5 rounded text-xs flex items-center justify-center ${
                                                  isActive
                                                    ? "bg-emerald-200 text-emerald-700"
                                                    : "bg-gray-100 text-gray-500"
                                                }`}
                                              >
                                                <IconComponent className="w-3 h-3" />
                                              </div>
                                            );
                                          })}
                                        {section.contents.length > 3 && (
                                          <span className="text-xs text-gray-400">
                                            +{section.contents.length - 3}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                </div>
                              </div>

                              {/* Section Actions */}
                              <div className="flex items-center space-x-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleVisibility(
                                      section.id,
                                      section.hideSection
                                    );
                                  }}
                                  className="p-1 text-gray-400 hover:text-gray-600 rounded"
                                  title={
                                    section.hideSection
                                      ? "Show section"
                                      : "Hide section"
                                  }
                                >
                                  {section.hideSection ? (
                                    <EyeOff className="w-4 h-4" />
                                  ) : (
                                    <Eye className="w-4 h-4" />
                                  )}
                                </button>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditStart(
                                      section.id,
                                      section.title || `Section ${index + 1}`
                                    );
                                  }}
                                  className="p-1 text-gray-400 hover:text-gray-600 rounded"
                                  title="Edit section"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>

                                {sections.length > 1 && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteSection(section.id);
                                    }}
                                    className="p-1 text-gray-400 hover:text-red-600 rounded"
                                    title="Delete section"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Section Settings (when active) */}
                          {isActive && (
                            <div className="px-4 pb-4 space-y-3 border-t border-emerald-200">
                              <div className="grid grid-cols-2 gap-3 pt-3">
                                <div>
                                  <label className="block text-xs font-medium text-emerald-700 mb-1">
                                    Duration (min)
                                  </label>
                                  <input
                                    type="number"
                                    value={section.duration || 0}
                                    onChange={(e) =>
                                      dispatch(
                                        updateSection({
                                          sectionId: section.id,
                                          updates: {
                                            duration:
                                              parseInt(e.target.value) || 0,
                                          },
                                        })
                                      )
                                    }
                                    className="w-full px-2 py-1 text-sm border border-emerald-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    min="0"
                                  />
                                </div>

                                <div className="flex items-end">
                                  <label className="flex items-center space-x-2 text-xs text-emerald-700">
                                    <input
                                      type="checkbox"
                                      checked={section.mandatory || false}
                                      onChange={(e) =>
                                        dispatch(
                                          updateSection({
                                            sectionId: section.id,
                                            updates: {
                                              mandatory: e.target.checked,
                                            },
                                          })
                                        )
                                      }
                                      className="w-3 h-3 text-emerald-600 border-emerald-300 rounded focus:ring-emerald-500"
                                    />
                                    <span>Mandatory</span>
                                  </label>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}

                {sections.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">No sections yet</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Click the + button to add your first section
                    </p>
                  </div>
                )}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
};

export default SectionsSidebar;
