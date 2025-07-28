'use client'
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { 
  Plus, 
  ChevronDown, 
  ChevronRight, 
  Edit3, 
  Trash2, 
  GripVertical,
  Play,
  FileText,
  Link,
  HelpCircle,
  Download,
  Globe,
  Clock,
  Eye,
  EyeOff,
  Settings,
  BookOpen,
  AlertCircle,
  CheckCircle,
  Video,
  File,
  Loader2
} from "lucide-react";
import {
  addSection,
  removeSection,
  updateSection,
  setActiveSection,
  addContentToSection,
  removeContentFromSection,
  reorderContentInSection,
  setEditingContent,
  setContentModalType,
  setModalOpen,
  getSectionsByCourseIdAsync
} from "@/redux/course/courseSlice";

const CourseContentForm = ({ isEditing = false }) => {
  const dispatch = useDispatch();
  
  const { 
    sections,
    activeSection,
    sectionContents,
    formData,
    currentCourse,
    loading
  } = useSelector((state) => state.course || {});

  const [expandedSections, setExpandedSections] = useState(new Set());
  const [deleteModal, setDeleteModal] = useState({ 
    isOpen: false, 
    type: null, 
    id: null, 
    sectionId: null 
  });

  // Load sections for editing mode
  useEffect(() => {
    if (isEditing && currentCourse?.id && (!sections || sections.length === 0)) {
      dispatch(getSectionsByCourseIdAsync(currentCourse.id));
    }
  }, [dispatch, isEditing, currentCourse?.id, sections]);

  // Auto-expand first section and set as active
  useEffect(() => {
    if (sections && sections.length > 0 && expandedSections.size === 0) {
      setExpandedSections(new Set([sections[0].id]));
      if (!activeSection) {
        dispatch(setActiveSection(sections[0].id));
      }
    }
  }, [sections, expandedSections.size, activeSection, dispatch]);

  // Content types with exact API enum mapping
  const contentTypes = [
    { 
      type: "video", 
      label: "Video", 
      icon: Video, 
      description: "Video content from file or URL",
      color: "red",
      apiType: 4 // VIDEO = 4
    },
    { 
      type: "text", 
      label: "Text", 
      icon: FileText, 
      description: "Rich text content",
      color: "blue",
      apiType: 1 // TEXT_BOX = 1
    },
    { 
      type: "url", 
      label: "Link", 
      icon: Globe, 
      description: "External website link",
      color: "green",
      apiType: 3 // WEB_URL = 3
    },
    { 
      type: "file", 
      label: "File", 
      icon: File, 
      description: "Document upload",
      color: "purple",
      apiType: 5 // OTHER_FILE = 5
    },
    {
      type: "quiz",
      label: "Quiz",
      icon: HelpCircle,
      description: "Assessment quiz",
      color: "orange",
      apiType: 2 // QUIZ = 2
    }
  ];

  const toggleSection = (sectionId) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const handleAddSection = () => {
    if (!currentCourse?.id) {
      alert("Əvvəlcə kursu yadda saxlayın.");
      return;
    }
    
    dispatch(setModalOpen({ modal: 'addSection', isOpen: true }));
  };

  const handleEditSection = (section) => {
    dispatch(setActiveSection(section.id));
    dispatch(setModalOpen({ modal: 'editSection', isOpen: true }));
  };

  const handleAddContent = (sectionId, contentType) => {
    dispatch(setActiveSection(sectionId));
    
    if (contentType === "quiz") {
      dispatch(setModalOpen({ modal: 'addQuiz', isOpen: true }));
    } else {
      dispatch(setContentModalType(contentType));
      dispatch(setModalOpen({ modal: 'addContent', isOpen: true }));
    }
  };

  const handleEditContent = (sectionId, content) => {
    dispatch(setEditingContent(content));
    dispatch(setActiveSection(sectionId));
    
    if (content.type === "quiz" || content.type === 2) { // QUIZ = 2
      dispatch(setModalOpen({ modal: 'editQuiz', isOpen: true }));
    } else {
      // Map API content type to our content type
      const typeMapping = {
        1: 'text',    // TEXT_BOX
        3: 'url',     // WEB_URL
        4: 'video',   // VIDEO
        5: 'file',    // OTHER_FILE
        6: 'file'     // PPTX (treat as file)
      };
      
      const contentTypeKey = typeMapping[content.type] || 'text';
      dispatch(setContentModalType(contentTypeKey));
      dispatch(setModalOpen({ modal: 'editContent', isOpen: true }));
    }
  };

  const handleDeleteContent = (sectionId, contentId) => {
    setDeleteModal({
      isOpen: true,
      type: 'content',
      id: contentId,
      sectionId: sectionId
    });
  };

  const handleDeleteSection = (sectionId) => {
    setDeleteModal({
      isOpen: true,
      type: 'section',
      id: sectionId,
      sectionId: null
    });
  };

  const confirmDelete = () => {
    if (deleteModal.type === 'content') {
      dispatch(removeContentFromSection({ 
        sectionId: deleteModal.sectionId, 
        contentId: deleteModal.id 
      }));
    } else if (deleteModal.type === 'section') {
      dispatch(removeSection(deleteModal.id));
    }
    setDeleteModal({ isOpen: false, type: null, id: null, sectionId: null });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, type: null, id: null, sectionId: null });
  };

  const getContentIcon = (type) => {
    // Handle both string and numeric types
    if (typeof type === 'number') {
      const typeMapping = {
        0: FileText,    // PAGE
        1: FileText,    // TEXT_BOX
        2: HelpCircle,  // QUIZ
        3: Globe,       // WEB_URL
        4: Video,       // VIDEO
        5: File,        // OTHER_FILE
        6: File         // PPTX
      };
      return typeMapping[type] || FileText;
    }
    
    const contentType = contentTypes.find(ct => ct.type === type);
    return contentType ? contentType.icon : FileText;
  };

  const getContentTypeLabel = (type) => {
    // Handle both string and numeric types
    if (typeof type === 'number') {
      const typeMapping = {
        0: 'Page',
        1: 'Text',
        2: 'Quiz',
        3: 'Link',
        4: 'Video',
        5: 'File',
        6: 'PowerPoint'
      };
      return typeMapping[type] || 'Content';
    }
    
    const contentType = contentTypes.find(ct => ct.type === type);
    return contentType ? contentType.label : 'Content';
  };

  const getContentTypeColor = (type) => {
    // Handle both string and numeric types
    if (typeof type === 'number') {
      const typeMapping = {
        0: 'gray',      // PAGE
        1: 'blue',      // TEXT_BOX
        2: 'orange',    // QUIZ
        3: 'green',     // WEB_URL
        4: 'red',       // VIDEO
        5: 'purple',    // OTHER_FILE
        6: 'indigo'     // PPTX
      };
      return typeMapping[type] || 'gray';
    }
    
    const contentType = contentTypes.find(ct => ct.type === type);
    return contentType ? contentType.color : 'gray';
  };

  const getSectionProgress = (section) => {
    const contents = sectionContents[section.id] || section.contents || [];
    return {
      total: contents.length,
      hasContent: contents.length > 0
    };
  };

  const getTotalProgress = () => {
    const totalSections = sections?.length || 0;
    const sectionsWithContent = sections?.filter(section => {
      const progress = getSectionProgress(section);
      return progress.hasContent;
    }).length || 0;
    
    return {
      totalSections,
      sectionsWithContent,
      percentage: totalSections > 0 ? Math.round((sectionsWithContent / totalSections) * 100) : 0
    };
  };

  const progress = getTotalProgress();

  // Show course creation required message if no course
  if (!currentCourse?.id) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center w-16 h-16 bg-[#0AAC9E]/10 rounded-xl mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-[#0AAC9E]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Build Your Course Content
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Complete the basic course information first to start building content.
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-center">
            <AlertCircle className="w-6 h-6 text-yellow-600 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-800">Course Not Created Yet</h3>
              <p className="text-yellow-700 mt-1">
                Please complete Step 1 (Basic Information) and save your course before adding content.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center w-16 h-16 bg-[#0AAC9E]/10 rounded-xl mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-[#0AAC9E]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Build Your Course Content
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Organize your course into sections and fill them with engaging learning materials. 
            Each section represents a key learning module or topic.
          </p>
        </div>

        {/* Course Info */}
        <div className="bg-gradient-to-r from-[#0AAC9E]/5 to-[#0AAC9E]/10 rounded-xl p-6 border border-[#0AAC9E]/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{currentCourse.name}</h3>
              <p className="text-gray-600 text-sm mt-1">{currentCourse.description}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {currentCourse.duration} minutes
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  {sections?.length || 0} sections
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">Course ID</div>
              <div className="text-sm font-mono text-gray-700">#{currentCourse.id}</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Content Progress</h3>
              <p className="text-sm text-gray-600">
                {progress.sectionsWithContent} of {progress.totalSections} sections have content
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-[#0AAC9E]">{progress.percentage}%</div>
              <div className="text-sm text-gray-500">Complete</div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-[#0AAC9E] h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>

        {/* Course Structure */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Course Structure</h3>
            <button
              onClick={handleAddSection}
              disabled={loading}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-[#0AAC9E] rounded-lg hover:bg-[#0AAC9E]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Add Section
            </button>
          </div>

          {/* Sections List */}
          {sections && sections.length > 0 ? (
            <div className="space-y-4">
              {sections.map((section, sectionIndex) => {
                const isExpanded = expandedSections.has(section.id);
                const isActive = activeSection === section.id;
                const sectionProgress = getSectionProgress(section);
                const contents = sectionContents[section.id] || section.contents || [];
                
                return (
                  <div 
                    key={section.id}
                    className={`border rounded-xl transition-all duration-200 ${
                      isActive 
                        ? 'border-[#0AAC9E] shadow-lg bg-[#0AAC9E]/5' 
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    {/* Section Header */}
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1">
                          <button
                            onClick={() => toggleSection(section.id)}
                            className="flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-5 h-5" />
                            ) : (
                              <ChevronRight className="w-5 h-5" />
                            )}
                          </button>

                          <div className="flex items-center space-x-3 flex-1">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              sectionProgress.hasContent 
                                ? 'bg-green-100 text-green-600' 
                                : 'bg-gray-100 text-gray-400'
                            }`}>
                              {sectionProgress.hasContent ? (
                                <CheckCircle className="w-4 h-4" />
                              ) : (
                                <BookOpen className="w-4 h-4" />
                              )}
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h4 className="font-medium text-gray-900">
                                  Section {sectionIndex + 1}: {section.description || "Untitled Section"}
                                </h4>
                                {section.hideSection && (
                                  <EyeOff className="w-4 h-4 text-gray-400" />
                                )}
                                {section.mandatory && (
                                  <div className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full">
                                    Required
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center space-x-4 mt-1">
                                <span className="text-sm text-gray-500 flex items-center">
                                  <Clock className="w-4 h-4 mr-1" />
                                  {section.duration || 0} min
                                </span>
                                <span className="text-sm text-gray-500">
                                  {contents.length} content item{contents.length !== 1 ? 's' : ''}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Section Actions */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditSection(section)}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSection(section.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Section Content */}
                    {isExpanded && (
                      <div className="border-t border-gray-200 bg-gray-50">
                        <div className="p-4">
                          {/* Content Items */}
                          {contents.length > 0 ? (
                            <div className="space-y-3 mb-4">
                              {contents.map((content, contentIndex) => {
                                const ContentIcon = getContentIcon(content.type);
                                const colorClass = getContentTypeColor(content.type);
                                
                                return (
                                  <div 
                                    key={content.id}
                                    className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                                  >
                                    <div className="flex items-center space-x-3 flex-1">
                                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-${colorClass}-100 text-${colorClass}-600`}>
                                        <ContentIcon className="w-4 h-4" />
                                      </div>
                                      
                                      <div className="flex-1">
                                        <div className="flex items-center space-x-2">
                                          <span className="font-medium text-gray-900">
                                            {content.description || content.title || content.name || `${getContentTypeLabel(content.type)} ${contentIndex + 1}`}
                                          </span>
                                          <span className={`px-2 py-1 text-xs rounded-full bg-${colorClass}-100 text-${colorClass}-600`}>
                                            {getContentTypeLabel(content.type)}
                                          </span>
                                          {content.hideContent && (
                                            <EyeOff className="w-4 h-4 text-gray-400" />
                                          )}
                                        </div>
                                        {content.contentString && (
                                          <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                                            {content.contentString.length > 100 
                                              ? content.contentString.substring(0, 100) + '...'
                                              : content.contentString
                                            }
                                          </p>
                                        )}
                                      </div>
                                    </div>

                                    {/* Content Actions */}
                                    <div className="flex items-center space-x-2">
                                      <button
                                        onClick={() => handleEditContent(section.id, content)}
                                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                      >
                                        <Edit3 className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteContent(section.id, content.id)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg mb-4">
                              <BookOpen className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                              <p className="text-sm font-medium text-gray-900 mb-1">No content yet</p>
                              <p className="text-sm text-gray-500">Add your first learning material to this section</p>
                            </div>
                          )}

                          {/* Add Content Buttons */}
                          <div className="flex flex-wrap gap-2">
                            {contentTypes.map((contentType) => {
                              const Icon = contentType.icon;
                              return (
                                <button
                                  key={contentType.type}
                                  onClick={() => handleAddContent(section.id, contentType.type)}
                                  className={`flex items-center px-3 py-2 text-sm font-medium border rounded-lg transition-colors hover:bg-${contentType.color}-50 hover:border-${contentType.color}-200 hover:text-${contentType.color}-700 border-gray-300 text-gray-700`}
                                >
                                  <Icon className="w-4 h-4 mr-2" />
                                  Add {contentType.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No sections yet</h3>
              <p className="text-gray-500 mb-6">
                Start building your course by adding your first section
              </p>
              <button
                onClick={handleAddSection}
                disabled={loading}
                className="flex items-center px-6 py-3 text-sm font-medium text-white bg-[#0AAC9E] rounded-lg hover:bg-[#0AAC9E]/90 transition-colors mx-auto disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Add First Section
              </button>
            </div>
          )}
        </div>

        {/* Course Requirements */}
        {sections && sections.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-blue-900 mb-2">Content Requirements</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Each section must contain at least one content item</li>
                  <li>• Consider adding quizzes to assess learning progress</li>
                  <li>• Mix different content types for better engagement</li>
                  <li>• Set appropriate durations for each section</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Delete {deleteModal.type === 'section' ? 'Section' : 'Content'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    This action cannot be undone.
                  </p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete this {deleteModal.type}? 
                {deleteModal.type === 'section' && ' All content within this section will also be removed.'}
              </p>

              <div className="flex space-x-3">
                <button
                  onClick={closeDeleteModal}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CourseContentForm;