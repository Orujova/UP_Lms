import React, { useState, useCallback } from "react";
import { 
  Plus, 
  FileText, 
  Video, 
  Link, 
  Upload, 
  Edit2, 
  Trash2, 
  ChevronDown,
  ChevronRight,
  Clock,
  Eye,
  EyeOff,
  Settings,
  BookOpen,
  Globe,
  File,
  HelpCircle,
  CheckCircle,
  BarChart3,
  PlayCircle,
  GripVertical
} from "lucide-react";

const CourseContentForm = () => {
  const [sections, setSections] = useState([]);
  const [activeSection, setActiveSection] = useState(null);
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, type: null, id: null, sectionId: null });
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverTarget, setDragOverTarget] = useState(null);

  const contentTypes = [
    { 
      type: "page", 
      label: "Page", 
      icon: FileText, 
      description: "Rich content"
    },
    { 
      type: "text", 
      label: "Text", 
      icon: BookOpen, 
      description: "Simple text"
    },
    { 
      type: "video", 
      label: "Video", 
      icon: Video, 
      description: "Video content"
    },
    { 
      type: "url", 
      label: "Link", 
      icon: Globe, 
      description: "External link"
    },
    { 
      type: "file", 
      label: "File", 
      icon: File, 
      description: "Document"
    },
    {
      type: "quiz",
      label: "Quiz",
      icon: HelpCircle,
      description: "Assessment"
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
    const newSection = {
      id: `section-${Date.now()}`,
      description: "",
      contents: [],
      duration: 0,
      mandatory: false,
      hideSection: false
    };
    setSections([...sections, newSection]);
    setExpandedSections(prev => new Set([...prev, newSection.id]));
  };

  const handleAddContent = (sectionId, contentType) => {
    const newContent = {
      id: `content-${Date.now()}`,
      type: contentType === "page" ? 0 : contentType === "text" ? 1 : contentType === "quiz" ? 2 : contentType === "url" ? 3 : contentType === "video" ? 4 : 5,
      title: `New ${contentType}`,
      contentString: "",
      fileName: "",
      fileSize: 0,
      duration: 0
    };
    
    setSections(sections.map(section => 
      section.id === sectionId 
        ? { ...section, contents: [...section.contents, newContent] }
        : section
    ));
  };

  const handleEditContent = (sectionId, content) => {
    console.log('Edit content:', content);
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
      setSections(sections.map(section => 
        section.id === deleteModal.sectionId 
          ? { ...section, contents: section.contents.filter(c => c.id !== deleteModal.id) }
          : section
      ));
    } else if (deleteModal.type === 'section') {
      setSections(sections.filter(s => s.id !== deleteModal.id));
    }
    setDeleteModal({ isOpen: false, type: null, id: null, sectionId: null });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, type: null, id: null, sectionId: null });
  };

  const updateSection = (sectionId, updates) => {
    setSections(sections.map(section => 
      section.id === sectionId 
        ? { ...section, ...updates }
        : section
    ));
  };

  const getContentIcon = (type) => {
    switch (type) {
      case 0: return FileText;
      case 1: return BookOpen;
      case 2: return HelpCircle;
      case 3: return Globe;
      case 4: return Video;
      case 5: return File;
      default: return FileText;
    }
  };

  const getContentTypeLabel = (type) => {
    switch (type) {
      case 0: return "Page";
      case 1: return "Text";
      case 2: return "Quiz";
      case 3: return "Link";
      case 4: return "Video";
      case 5: return "File";
      default: return "Content";
    }
  };

  const formatContentTitle = (content) => {
    if (content.title) return content.title;
    
    try {
      if (content.type === 0 && content.contentString) {
        const pageData = JSON.parse(content.contentString);
        return pageData.title || "Untitled Page";
      }
    } catch (e) {
      // Fallback for parsing errors
    }
    
    if (content.fileName) return content.fileName;
    if (content.contentString) {
      const preview = content.contentString.substring(0, 30);
      return preview.length < content.contentString.length ? `${preview}...` : preview;
    }
    
    return `${getContentTypeLabel(content.type)} Content`;
  };

  const calculateCourseStats = () => {
    const totalSections = sections.length;
    const totalContent = sections.reduce((total, section) => total + (section.contents?.length || 0), 0);
    const estimatedDuration = sections.reduce((total, section) => total + (section.duration || 0), 0);
    
    return { totalSections, totalContent, estimatedDuration };
  };

  const stats = calculateCourseStats();

  // Enhanced Drag and Drop handlers
  const handleDragStart = (e, item, type, sourceIndex, sourceSectionId = null) => {
    setDraggedItem({ 
      item, 
      type, 
      sourceIndex, 
      sourceSectionId 
    });
    e.dataTransfer.effectAllowed = 'move';
    e.target.classList.add('opacity-50');
  };

  const handleDragEnd = (e) => {
    e.target.classList.remove('opacity-50');
    setDraggedItem(null);
    setDragOverTarget(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e, targetId, targetType) => {
    e.preventDefault();
    setDragOverTarget({ id: targetId, type: targetType });
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverTarget(null);
    }
  };

  const handleDrop = (e, targetId, targetType, targetIndex) => {
    e.preventDefault();
    setDragOverTarget(null);
    
    if (!draggedItem) return;

    if (draggedItem.type === 'section' && targetType === 'section') {
      // Reorder sections
      const newSections = [...sections];
      const draggedSection = newSections[draggedItem.sourceIndex];
      newSections.splice(draggedItem.sourceIndex, 1);
      newSections.splice(targetIndex, 0, draggedSection);
      setSections(newSections);
    } else if (draggedItem.type === 'content' && targetType === 'content') {
      // Reorder content within or between sections
      const newSections = [...sections];
      
      // Remove from source
      const sourceSection = newSections.find(s => s.id === draggedItem.sourceSectionId);
      const draggedContent = sourceSection.contents[draggedItem.sourceIndex];
      sourceSection.contents.splice(draggedItem.sourceIndex, 1);
      
      // Add to target
      const targetSection = newSections.find(s => s.contents.some(c => c.id === targetId));
      const targetContentIndex = targetSection.contents.findIndex(c => c.id === targetId);
      targetSection.contents.splice(targetContentIndex, 0, draggedContent);
      
      setSections(newSections);
    }
    
    setDraggedItem(null);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-[#0AAC9E]/5">
        {/* Modern Header with Glass Effect */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
          <div className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-bold text-gray-900 mb-1">Course Builder</h1>
                <p className="text-xs text-gray-600">Design engaging learning experiences</p>
              </div>
              
              {/* Quick Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAddSection}
                  className="flex items-center gap-2 px-3 py-2 bg-[#0AAC9E] hover:bg-[#0AAC9E]/80 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Section</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 max-w-6xl mx-auto pb-6">
          {/* Progressive Stats Dashboard */}
          {sections.length > 0 && (
            <div className="mb-4 bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200/50 p-4 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#0AAC9E]" />
                  Course Overview
                </h2>
                <div className="text-xs text-gray-500">
                  {stats.totalSections > 0 && `${((stats.totalContent / stats.totalSections) || 0).toFixed(1)} items per section`}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="group bg-gradient-to-br from-[#0AAC9E]/10 to-[#0AAC9E]/5 p-3 rounded-lg border border-[#0AAC9E]/20 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xl font-bold text-[#0AAC9E] mb-1">{stats.totalSections}</div>
                      <div className="text-xs text-gray-600 font-medium">Learning Sections</div>
                    </div>
                    <div className="w-10 h-10 bg-[#0AAC9E]/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <BookOpen className="w-5 h-5 text-[#0AAC9E]" />
                    </div>
                  </div>
                </div>
                
                <div className="group bg-gradient-to-br from-[#0AAC9E]/10 to-[#0AAC9E]/5 p-3 rounded-lg border border-[#0AAC9E]/20 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xl font-bold text-[#0AAC9E] mb-1">{stats.totalContent}</div>
                      <div className="text-xs text-gray-600 font-medium">Content Items</div>
                    </div>
                    <div className="w-10 h-10 bg-[#0AAC9E]/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <FileText className="w-5 h-5 text-[#0AAC9E]" />
                    </div>
                  </div>
                </div>
                
                <div className="group bg-gradient-to-br from-[#0AAC9E]/10 to-[#0AAC9E]/5 p-3 rounded-lg border border-[#0AAC9E]/20 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xl font-bold text-[#0AAC9E] mb-1">{stats.estimatedDuration}</div>
                      <div className="text-xs text-gray-600 font-medium">Total Minutes</div>
                    </div>
                    <div className="w-10 h-10 bg-[#0AAC9E]/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <Clock className="w-5 h-5 text-[#0AAC9E]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Sections with Modern Card Design */}
          <div className="space-y-3">
            {sections.map((section, index) => {
              const isExpanded = expandedSections.has(section.id);
              const contents = section.contents || [];
              const isDragOver = dragOverTarget?.id === section.id && dragOverTarget?.type === 'section';

              return (
                <div 
                  key={section.id} 
                  className={`group bg-white/70 backdrop-blur-sm rounded-xl border transition-all duration-300 hover:shadow-lg ${
                    isExpanded 
                      ? 'border-[#0AAC9E]/30 shadow-lg shadow-[#0AAC9E]/10' 
                      : 'border-gray-200/50 hover:border-[#0AAC9E]/20'
                  } ${isDragOver ? 'border-[#0AAC9E] bg-[#0AAC9E]/5' : ''}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, section, 'section', index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={handleDragOver}
                  onDragEnter={(e) => handleDragEnter(e, section.id, 'section')}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, section.id, 'section', index)}
                >
                  
                  {/* Section Header with Modern Typography */}
                  <div className={`p-4 border-b transition-all duration-300 ${
                    isExpanded 
                      ? 'bg-gradient-to-r from-[#0AAC9E]/5 to-[#0AAC9E]/10 border-[#0AAC9E]/20' 
                      : 'bg-gray-50/50 border-gray-200/50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        {/* Drag Handle */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <GripVertical className="w-4 h-4 text-gray-400 hover:text-[#0AAC9E] cursor-grab active:cursor-grabbing" />
                        </div>

                        <button
                          onClick={() => toggleSection(section.id)}
                          className="p-1.5 text-gray-500 hover:text-[#0AAC9E] hover:bg-white/80 rounded-lg transition-all duration-200 transform hover:scale-110"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>

                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 bg-[#0AAC9E] text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md">
                            {index + 1}
                          </div>
                          
                          <div className="flex-1">
                            <input
                              type="text"
                              value={section.description || ""}
                              onChange={(e) =>
                                updateSection(section.id, { description: e.target.value })
                              }
                              placeholder="Section title"
                              className="text-sm font-semibold text-gray-900 bg-transparent border-none outline-none focus:bg-white/90 focus:border-2 focus:border-[#0AAC9E] focus:rounded-md px-2 py-1 -mx-2 -my-1 w-full transition-all duration-200 hover:bg-white/50"
                            />
                            
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                              <span className="flex items-center gap-1">
                                <div> <FileText className="w-4 h-3" /></div>
                               
                                {contents.length} {contents.length === 1 ? 'item' : 'items'}
                              </span>
                              {section.duration && (
                                <span className="flex items-center gap-1">
                                 
                                  <div> <Clock className="w-4 h-3" /></div>
                                  {section.duration}min
                                </span>
                              )}
                              {section.mandatory && (
                                <span className="flex items-center gap-1 text-[#0AAC9E]">
                                  <div> <CheckCircle className="w-4 h-3" /></div>
                                 
                                  Required
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Section Actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={() =>
                            updateSection(section.id, { hideSection: !section.hideSection })
                          }
                          className={`p-1.5 rounded-lg transition-all duration-200 ${
                            section.hideSection
                              ? "text-orange-500 hover:bg-orange-50"
                              : "text-[#0AAC9E] hover:bg-[#0AAC9E]/10"
                          }`}
                          title={section.hideSection ? "Section is hidden" : "Section is visible"}
                        >
                          {section.hideSection ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>

                        <button
                          onClick={() => handleDeleteSection(section.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Section Content */}
                  {isExpanded && (
                    <div className="p-4 space-y-4">
                      {/* Enhanced Settings Panel */}
                      <div className="bg-gradient-to-r from-gray-50 to-gray-25 p-3 rounded-lg border border-gray-200">
                        <h3 className="text-xs font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <div><Settings className="w-4 h-3 text-[#0AAC9E]" /></div>
                          
                          Section Configuration
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Duration (minutes)</label>
                            <input
                              type="number"
                              value={section.duration || ""}
                              onChange={(e) =>
                                updateSection(section.id, { duration: parseInt(e.target.value) || 0 })
                              }
                              placeholder="60"
                              className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0AAC9E]/20 focus:border-[#0AAC9E] transition-all duration-200"
                            />
                          </div>
                          <div className="flex items-end">
                            <div className="flex items-center gap-2 cursor-pointer">
                              <div>
                                  <input
                                type="checkbox"
                                checked={section.mandatory || false}
                                onChange={(e) =>
                                  updateSection(section.id, { mandatory: e.target.checked })
                                }
                                className="w-4 h-3 rounded border-2 border-gray-300 text-[#0AAC9E] focus:ring-[#0AAC9E] focus:ring-2 focus:ring-offset-0 bg-white checked:bg-[#0AAC9E] checked:border-[#0AAC9E]"
                              />
                              </div>
                            
                              <div>
                                <span className="text-xs font-medium text-gray-700">Required Section</span>
                              </div>
                              
                            </div>
                          </div>
                          <div className="flex items-end">
                            <div className="flex items-center gap-2 cursor-pointer">
                              <div><input
                                type="checkbox"
                                checked={section.hideSection || false}
                                onChange={(e) =>
                                  updateSection(section.id, { hideSection: e.target.checked })
                                }
                                className="w-4 h-3 rounded border-2 border-gray-300 text-orange-500 focus:ring-orange-500 focus:ring-2 focus:ring-offset-0 bg-white checked:bg-orange-500 checked:border-orange-500"
                              /></div>
                              
                              <span className="text-xs font-medium text-gray-700">Hide from Students</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Modern Content Management */}
                      <div>
                        <h3 className="text-xs font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <div><FileText className="w-4 h-3 text-[#0AAC9E]" /></div>
                          
                          Learning Materials
                          <span className="ml-auto text-xs font-normal text-gray-500">
                            {contents.length} {contents.length === 1 ? 'item' : 'items'}
                          </span>
                        </h3>
                        
                        {contents.length > 0 ? (
                          <div className="space-y-2 mb-4">
                            {contents.map((content, contentIndex) => {
                              const ContentIcon = getContentIcon(content.type);
                              const isDragOver = dragOverTarget?.id === content.id && dragOverTarget?.type === 'content';
                              
                              return (
                                <div
                                  key={content.id}
                                  className={`group bg-gradient-to-r from-white to-gray-50 p-3 rounded-lg border border-gray-200 hover:border-[#0AAC9E]/30 transition-all duration-200 hover:shadow-md ${
                                    isDragOver ? 'border-[#0AAC9E] bg-[#0AAC9E]/5' : ''
                                  }`}
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, content, 'content', contentIndex, section.id)}
                                  onDragEnd={handleDragEnd}
                                  onDragOver={handleDragOver}
                                  onDragEnter={(e) => handleDragEnter(e, content.id, 'content')}
                                  onDragLeave={handleDragLeave}
                                  onDrop={(e) => handleDrop(e, content.id, 'content', contentIndex)}
                                >
                                  <div className="flex items-center gap-2">
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                      <GripVertical className="w-3 h-3 text-gray-400 cursor-grab active:cursor-grabbing" />
                                    </div>
                                    
                                    <div className="w-8 h-8 bg-gradient-to-br from-white to-gray-50 rounded-lg border border-gray-200 flex items-center justify-center shadow-sm">
                                      <ContentIcon className="w-4 h-4 text-gray-600" />
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                      <h4 className="text-xs font-semibold text-gray-900 truncate mb-1">
                                        {formatContentTitle(content)}
                                      </h4>
                                      <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span className="font-medium">{getContentTypeLabel(content.type)}</span>
                                        {content.fileSize && (
                                          <>
                                            <span>•</span>
                                            <span>{(content.fileSize / 1024 / 1024).toFixed(1)}MB</span>
                                          </>
                                        )}
                                        {content.duration && (
                                          <>
                                            <span>•</span>
                                            <span>{content.duration}s</span>
                                          </>
                                        )}
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                      <button
                                        onClick={() => handleEditContent(section.id, content)}
                                        className="p-1.5 text-gray-400 hover:text-[#0AAC9E] hover:bg-[#0AAC9E]/10 rounded-md transition-all duration-200"
                                      >
                                        <Edit2 className="w-4 h-3" />
                                      </button>
                                      
                                      <button
                                        onClick={() => handleDeleteContent(section.id, content.id)}
                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all duration-200"
                                      >
                                        <Trash2 className="w-4 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-4 bg-gradient-to-br from-gray-50 to-gray-25 rounded-lg border-2 border-dashed border-gray-300 mb-4">
                            <div><FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" /></div>
                            
                            <h4 className="text-xs font-semibold text-gray-600 mb-1">No content yet</h4>
                            <p className="text-xs text-gray-500">Add learning materials to make this section engaging</p>
                          </div>
                        )}

                        {/* Enhanced Content Type Selector */}
                        <div>
                          <h4 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Add Learning Material</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {contentTypes.map((contentType) => {
                              const Icon = contentType.icon;
                              return (
                                <button
                                  key={contentType.type}
                                  onClick={() => handleAddContent(section.id, contentType.type)}
                                  className="group flex flex-col items-center p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#0AAC9E] hover:bg-[#0AAC9E]/5 transition-all duration-200 transform hover:scale-105"
                                >
                                  <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-50 group-hover:from-[#0AAC9E]/20 group-hover:to-[#0AAC9E]/10 rounded-lg flex items-center justify-center mb-1 transition-all duration-200">
                                    <Icon className="w-4 h-4 text-gray-600 group-hover:text-[#0AAC9E] transition-colors duration-200" />
                                  </div>
                                  <span className="text-xs font-semibold text-gray-700 group-hover:text-[#0AAC9E] text-center transition-colors duration-200">
                                    {contentType.label}
                                  </span>
                                  <span className="text-xs text-gray-500 text-center mt-1">
                                    {contentType.description}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Enhanced Empty State */}
          {sections.length === 0 && (
            <div className="text-center py-8 bg-gradient-to-br from-white to-[#0AAC9E]/5 rounded-xl border border-gray-200 shadow-lg">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-gradient-to-br from-[#0AAC9E]/20 to-[#0AAC9E]/10 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <BookOpen className="w-8 h-8 text-[#0AAC9E]" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Design Your First Course
                </h3>
                <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                  Transform your knowledge into engaging learning experiences. Start by creating your first section to organize content into logical learning modules.
                </p>
                <button
                  onClick={handleAddSection}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#0AAC9E] hover:bg-[#0AAC9E]/80 text-white rounded-lg hover:shadow-lg transition-all duration-200 text-sm font-semibold transform hover:scale-105"
                >
                  <div>
                   <Plus className="w-4 h-4" />  
                  </div>
                 
                  <span>Create Your First Section</span>
                </button>
              </div>
            </div>
          )}

       
        </div>
      </div>

      {/* Enhanced Delete Modal */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        type={deleteModal.type}
      />
    </>
  );
};

// Modern Delete Modal Component with Enhanced Design
const DeleteModal = ({ isOpen, onClose, onConfirm, type }) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getModalContent = () => {
    if (type === 'section') {
      return {
        title: 'Delete Learning Section',
        description: 'This will permanently remove the section and all its learning materials. Students will lose access to this content immediately.',
        warning: 'This action affects all enrolled students and cannot be reversed.',
        buttonText: 'Delete Section',
        icon: BookOpen,
        color: 'red'
      };
    }
    return {
      title: 'Delete Content Item',
      description: 'This learning material will be permanently removed from the course.',
      warning: 'Students will no longer be able to access this content.',
      buttonText: 'Delete Content',
      icon: FileText,
      color: 'red'
    };
  };

  const content = getModalContent();
  const Icon = content.icon;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden transform transition-all duration-300 scale-100">
        
        {/* Modern Header with Enhanced Gradient */}
        <div className="relative p-4 bg-gradient-to-br from-red-50 via-orange-50 to-red-50 border-b border-red-100">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 rounded-xl flex items-center justify-center shadow-lg">
              <Icon className="w-6 h-6 text-red-600" />
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {content.title}
              </h3>
              <div className="flex items-center gap-1 text-xs text-red-600 font-medium">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                Permanent action - cannot be undone
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Content */}
        <div className="p-4 space-y-3">
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-700 leading-relaxed mb-2">
              {content.description}
            </p>
            <div className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 p-2 rounded-md border border-amber-200">
              <div className="w-1 h-1 bg-amber-500 rounded-full"></div>
              {content.warning}
            </div>
          </div>

          {/* Enhanced Action Buttons */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200 hover:scale-105 transform"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {content.buttonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseContentForm;