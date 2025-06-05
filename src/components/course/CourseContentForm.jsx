import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import {
  Plus,
  GripVertical,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  BookOpen,
  FileText,
  Video,
  HelpCircle,
  Link,
  Upload,
  Check,
  Clock,
  ChevronDown,
  Copy,
  Settings,
  Play
} from "lucide-react";
import {
  addSection,
  setActiveSection,
  updateSection,
  removeSection,
  reorderSections,
  addContentToSection,
  removeContentFromSection,
  reorderContentInSection,
  setModalOpen,
  setEditingContent,
  setContentModalType,
  nextStep,
  prevStep,
} from "@/redux/course/courseSlice";

// Sections Sidebar Component
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

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              Course Sections
            </h3>
            <p className="text-xs text-gray-500">{sections.length} sections</p>
          </div>
          <button
            onClick={handleAddSection}
            className="p-1.5 bg-[#0AAC9E] text-white rounded-lg hover:bg-[#0AAC9E]/90 transition-colors"
            title="Add new section"
          >
            <Plus className="w-4 h-4" />
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
                className={`p-3 space-y-2 ${
                  snapshot.isDraggingOver ? "bg-[#0AAC9E]/5" : ""
                }`}
              >
                {sections.map((section, index) => {
                  const isActive = activeSection === section.id;
                  const isEditing = editingSection === section.id;

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
                              ? "border-[#0AAC9E] bg-[#0AAC9E]/5 shadow-sm"
                              : "border-gray-200 bg-white hover:border-gray-300"
                          } ${snapshot.isDragging ? "shadow-lg rotate-1" : ""}`}
                        >
                          {/* Section Header */}
                          <div
                            className="p-3 cursor-pointer"
                            onClick={() => handleSectionClick(section.id)}
                          >
                            <div className="flex items-start space-x-2">
                              {/* Drag Handle */}
                              <div
                                {...provided.dragHandleProps}
                                className="mt-0.5 text-gray-400 hover:text-gray-600 cursor-move"
                              >
                                <GripVertical className="w-3.5 h-3.5" />
                              </div>

                              {/* Section Content */}
                              <div className="flex-1 min-w-0">
                                {/* Title */}
                                {isEditing ? (
                                  <div className="flex items-center space-x-1">
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
                                      className="flex-1 px-2 py-1 text-xs border border-[#0AAC9E] rounded focus:outline-none focus:ring-1 focus:ring-[#0AAC9E]"
                                      autoFocus
                                    />
                                    <button
                                      onClick={() => handleEditSave(section.id)}
                                      className="text-[#0AAC9E] hover:text-[#0AAC9E]/70"
                                    >
                                      <Check className="w-3 h-3" />
                                    </button>
                                  </div>
                                ) : (
                                  <h4
                                    className={`text-sm font-medium truncate ${
                                      isActive
                                        ? "text-[#0AAC9E]"
                                        : "text-gray-900"
                                    }`}
                                  >
                                    {section.title || `Section ${index + 1}`}
                                  </h4>
                                )}

                                {/* Section Stats */}
                                <div className="mt-1.5 space-y-1">
                                  <div className="flex items-center space-x-2 text-xs text-gray-500">
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
                                      <div className="flex items-center space-x-1">
                                        {section.contents
                                          .slice(0, 3)
                                          .map((content, idx) => {
                                            const IconComponent =
                                              getContentIcon(content.type);
                                            return (
                                              <div
                                                key={idx}
                                                className={`w-4 h-4 rounded text-xs flex items-center justify-center ${
                                                  isActive
                                                    ? "bg-[#0AAC9E]/20 text-[#0AAC9E]"
                                                    : "bg-gray-100 text-gray-500"
                                                }`}
                                              >
                                                <IconComponent className="w-2.5 h-2.5" />
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
                              <div className="flex items-center space-x-0.5">
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
                                    <EyeOff className="w-3.5 h-3.5" />
                                  ) : (
                                    <Eye className="w-3.5 h-3.5" />
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
                                  <Edit3 className="w-3.5 h-3.5" />
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
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Section Settings (when active) */}
                          {isActive && (
                            <div className="px-3 pb-3 space-y-2 border-t border-[#0AAC9E]/20">
                              <div className="grid grid-cols-2 gap-2 pt-2">
                                <div>
                                  <label className="block text-xs font-medium text-[#0AAC9E] mb-1">
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
                                    className="w-full px-2 py-1 text-xs border border-[#0AAC9E]/30 rounded focus:outline-none focus:ring-1 focus:ring-[#0AAC9E]"
                                    min="0"
                                  />
                                </div>

                                <div className="flex items-end">
                                  <label className="flex items-center space-x-1 text-xs text-[#0AAC9E]">
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
                                      className="w-3 h-3 text-[#0AAC9E] border-[#0AAC9E]/30 rounded focus:ring-[#0AAC9E]"
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
                  <div className="text-center py-6 text-gray-500">
                    <BookOpen className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-xs">No sections yet</p>
                    <p className="text-xs text-gray-400 mt-0.5">
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

// Course Content Area Component
const CourseContentArea = () => {
  const dispatch = useDispatch();
  const [showContentMenu, setShowContentMenu] = useState(false);

  const { sections, activeSection, modals } = useSelector(
    (state) => state.course
  );

  const currentSection = sections.find((s) => s.id === activeSection);
  const contentItems = currentSection?.contents || [];

  const contentTypes = [
    {
      type: "page",
      icon: FileText,
      label: "Page",
      description: "Rich text content",
      color: "bg-blue-100 text-blue-700"
    },
    {
      type: "text",
      icon: FileText,
      label: "Text Block",
      description: "Simple text content",
      color: "bg-gray-100 text-gray-700"
    },
    {
      type: "video",
      icon: Video,
      label: "Video",
      description: "Upload videos",
      color: "bg-red-100 text-red-700"
    },
    {
      type: "url",
      icon: Link,
      label: "Web Link",
      description: "External resources",
      color: "bg-purple-100 text-purple-700"
    },
    {
      type: "file",
      icon: Upload,
      label: "File Upload",
      description: "Documents, PDFs",
      color: "bg-orange-100 text-orange-700"
    },
    {
      type: "quiz",
      icon: HelpCircle,
      label: "Quiz",
      description: "Interactive questions",
      color: "bg-[#0AAC9E]/10 text-[#0AAC9E]"
    },
  ];

  const handleAddContent = (contentType) => {
    dispatch(setContentModalType(contentType));
    dispatch(setModalOpen({ modal: "addContent", isOpen: true }));
    setShowContentMenu(false);
  };

  const handleEditContent = (content) => {
    dispatch(setEditingContent(content));
    dispatch(
      setContentModalType(content.uiType || getContentTypeString(content.type))
    );
    dispatch(setModalOpen({ modal: "editContent", isOpen: true }));
  };

  const handleDeleteContent = (contentId) => {
    if (window.confirm("Are you sure you want to delete this content?")) {
      dispatch(
        removeContentFromSection({
          sectionId: activeSection,
          contentId,
        })
      );
    }
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    dispatch(
      reorderContentInSection({
        sectionId: activeSection,
        sourceIndex: result.source.index,
        destinationIndex: result.destination.index,
      })
    );
  };

  const getContentTypeString = (typeNumber) => {
    const typeMap = {
      0: "page",
      1: "text",
      2: "quiz",
      3: "url",
      4: "video",
      5: "file",
      6: "file",
    };
    return typeMap[typeNumber] || "text";
  };

  const getContentIcon = (type) => {
    const iconMap = {
      page: FileText,
      text: FileText,
      quiz: HelpCircle,
      url: Link,
      video: Video,
      file: Upload,
      0: FileText,
      1: FileText,
      2: HelpCircle,
      3: Link,
      4: Video,
      5: Upload,
      6: Upload,
    };
    return iconMap[type] || FileText;
  };

  const renderContentPreview = (content) => {
    const IconComponent = getContentIcon(content.type || content.uiType);

    switch (content.type || content.uiType) {
      case "page":
      case 0:
        try {
          const pageData =
            typeof content.contentString === "string"
              ? JSON.parse(content.contentString)
              : content;
          return (
            <div>
              <h4 className="text-sm font-medium text-gray-900">
                {pageData.title || content.title}
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">
                {pageData.description || content.description}
              </p>
            </div>
          );
        } catch {
          return (
            <div>
              <h4 className="text-sm font-medium text-gray-900">Page Content</h4>
              <p className="text-xs text-gray-500 mt-0.5">Rich text page</p>
            </div>
          );
        }

      case "text":
      case 1:
        return (
          <div>
            <h4 className="text-sm font-medium text-gray-900">Text Block</h4>
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
              {content.contentString || "Text content"}
            </p>
          </div>
        );

      case "quiz":
      case 2:
        const questionCount =
          content.quizzes?.[0]?.questions?.length ||
          content.quiz?.questions?.length ||
          0;
        return (
          <div>
            <h4 className="text-sm font-medium text-gray-900">
              {content.title || "Quiz"}
            </h4>
            <p className="text-xs text-gray-500 mt-0.5">
              {questionCount} question{questionCount !== 1 ? "s" : ""}
            </p>
          </div>
        );

      case "url":
      case 3:
        return (
          <div>
            <h4 className="text-sm font-medium text-gray-900">Web Link</h4>
            <p className="text-xs text-gray-500 mt-0.5 truncate">
              {content.contentString || content.url}
            </p>
          </div>
        );

      case "video":
      case 4:
        return (
          <div>
            <h4 className="text-sm font-medium text-gray-900">Video</h4>
            <p className="text-xs text-gray-500 mt-0.5">Video content</p>
          </div>
        );

      case "file":
      case 5:
      case 6:
        return (
          <div>
            <h4 className="text-sm font-medium text-gray-900">
              {content.fileName || "File"}
            </h4>
            <p className="text-xs text-gray-500 mt-0.5">
              {content.fileType || "Document"}
            </p>
          </div>
        );

      default:
        return (
          <div>
            <h4 className="text-sm font-medium text-gray-900">Content Item</h4>
            <p className="text-xs text-gray-500 mt-0.5">Learning material</p>
          </div>
        );
    }
  };

  if (!currentSection) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-gray-500">
        <BookOpen className="w-12 h-12 mb-3 text-gray-300" />
        <h3 className="text-base font-medium text-gray-900 mb-1">
          No Section Selected
        </h3>
        <p className="text-center text-sm">
          Select a section from the sidebar to start adding content, or create a
          new section to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Course Content
            </h2>
            <p className="text-sm text-gray-600">
              Currently editing:{" "}
              <span className="font-medium text-[#0AAC9E]">
                {currentSection.title}
              </span>
            </p>
          </div>

          {/* Add Content Button */}
          <div className="relative">
            <button
              onClick={() => setShowContentMenu(!showContentMenu)}
              className="flex items-center space-x-2 px-3 py-2 bg-[#0AAC9E] text-white rounded-lg hover:bg-[#0AAC9E]/90 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Content</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {/* Content Type Menu */}
            {showContentMenu && (
              <div className="absolute right-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-2">
                  {contentTypes.map((contentType) => {
                    const IconComponent = contentType.icon;
                    return (
                      <button
                        key={contentType.type}
                        onClick={() => handleAddContent(contentType.type)}
                        className="w-full flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                      >
                        <div className={`p-1.5 rounded-lg ${contentType.color}`}>
                          <IconComponent className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {contentType.label}
                          </div>
                          <div className="text-xs text-gray-500">
                            {contentType.description}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content List */}
      <div className="flex-1 overflow-y-auto">
        {contentItems.length > 0 ? (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="content-items">
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={`p-4 space-y-3 ${
                    snapshot.isDraggingOver ? "bg-[#0AAC9E]/5" : ""
                  }`}
                >
                  {contentItems.map((content, index) => {
                    const IconComponent = getContentIcon(
                      content.type || content.uiType
                    );

                    return (
                      <Draggable
                        key={content.id}
                        draggableId={content.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`flex items-center space-x-3 p-3 border rounded-lg transition-all ${
                              snapshot.isDragging
                                ? "border-[#0AAC9E] bg-[#0AAC9E]/5 shadow-lg rotate-1"
                                : "border-gray-200 hover:border-gray-300 bg-white"
                            }`}
                          >
                            {/* Drag Handle */}
                            <div
                              {...provided.dragHandleProps}
                              className="text-gray-400 hover:text-gray-600 cursor-move"
                            >
                              <GripVertical className="w-4 h-4" />
                            </div>

                            {/* Content Icon */}
                            <div className="p-2 bg-gray-100 rounded-lg">
                              <IconComponent className="w-4 h-4 text-gray-600" />
                            </div>

                            {/* Content Info */}
                            <div className="flex-1 min-w-0">
                              {renderContentPreview(content)}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => handleEditContent(content)}
                                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                                title="Edit content"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleDeleteContent(content.id)}
                                className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                title="Delete content"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Plus className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-base font-medium text-gray-900 mb-1">
                No content yet
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Start building your course by adding videos, documents, quizzes,
                and more.
              </p>
              <button
                onClick={() => setShowContentMenu(true)}
                className="px-4 py-2 bg-[#0AAC9E] text-white rounded-lg hover:bg-[#0AAC9E]/90 transition-colors text-sm"
              >
                Add Your First Content
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close menu */}
      {showContentMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowContentMenu(false)}
        />
      )}
    </div>
  );
};

// Main Content Builder Step Component
const ContentBuilderStep = ({ onNext, onBack }) => {
  const dispatch = useDispatch();
  const { sections } = useSelector((state) => state.course);

  const handleNext = () => {
    if (sections.length > 0) {
      dispatch(nextStep());
    }
  };

  const handleBack = () => {
    dispatch(prevStep());
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)]">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Course Content Builder
        </h2>
        <p className="text-sm text-gray-600">
          Create sections and add learning materials to build your course structure
        </p>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex h-full">
          {/* Sections Sidebar */}
          <div className="w-80 flex-shrink-0">
            <SectionsSidebar />
          </div>

          {/* Content Area */}
          <div className="flex-1 flex flex-col">
            <CourseContentArea />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <button
          onClick={handleBack}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
        >
          Back: Basic Info
        </button>

        <button
          onClick={handleNext}
          disabled={sections.length === 0}
          className="px-6 py-2 bg-[#0AAC9E] text-white rounded-lg hover:bg-[#0AAC9E]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
        >
          Next: Target Groups
        </button>
      </div>
    </div>
  );
};

export default ContentBuilderStep;