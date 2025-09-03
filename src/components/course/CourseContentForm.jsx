import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { 
  Plus, 

  ChevronLeft,
  Edit3, 
  Trash2,
  Clock,
  Eye,
  EyeOff,
  BookOpen,
  AlertCircle,
  CheckCircle,
  Video,
  File,
  Loader2,
  Save,
  ArrowRight,
  FileText,
  Globe,
  X,
  Monitor,
  Presentation,
  HelpCircle,
  ExternalLink,
  Info,
  GripVertical,
  Hash,
  MousePointer,
  RefreshCw
} from "lucide-react";

import {
  removeSection,
  setActiveSection,
  removeContentFromSection,
  setEditingContent,
  setContentModalType,
  setModalOpen,
  getSectionsByCourseIdAsync,
  nextStep,
  setCurrentStep,
  closeAllModals,
  updateSectionAsync,
  deleteSectionAsync
} from "@/redux/course/courseSlice";

import {
  getContentsBySectionAsync,
  deleteContentAsync,
  updateContentAsync // Changed from updateContentOrderAsync
} from "@/redux/courseContent/courseContentSlice";
import DraggableSection from "./DraggableSection";
// Import the ContentDetailView component
import ContentDetailView from "./ContentDetailViw";


// Draggable Content Item Component
const DraggableContentItem = ({ 
  content, 
  contentIndex, 
  sectionId, 
  onView, 
  onEdit, 
  onDelete,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  isDragging,
  dragOverIndex
}) => {
  const dragRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const getContentIcon = (type) => {
    const typeMapping = {
      0: Monitor, 1: FileText, 2: HelpCircle, 3: Globe, 4: Video, 5: File, 6: Presentation,
      'Page': Monitor, 'Quiz': HelpCircle, 'WebURL': Globe, 'Video': Video, 'OtherFile': File, 'PPTX': Presentation
    };
    return typeMapping[type] || FileText;
  };

  const getContentTypeLabel = (type) => {
    const typeMapping = {
      0: 'Page', 1: 'Content', 2: 'Quiz', 3: 'Link', 4: 'Video', 5: 'File', 6: 'Slides',
      'Page': 'Page', 'Quiz': 'Quiz', 'WebURL': 'Link', 'Video': 'Video', 'OtherFile': 'File', 'PPTX': 'Slides'
    };
    return typeMapping[type] || 'Content';
  };

  const getTypeColor = (type) => {
    const colorMapping = {
      0: 'blue', 1: 'gray', 2: 'green', 3: 'purple', 4: 'red', 5: 'orange', 6: 'indigo',
      'Page': 'blue', 'Quiz': 'green', 'WebURL': 'purple', 'Video': 'red', 'OtherFile': 'orange', 'PPTX': 'indigo'
    };
    return colorMapping[type] || 'gray';
  };

  const ContentIcon = getContentIcon(content.type || content.contentType);
  const typeLabel = getContentTypeLabel(content.type || content.contentType);
  const typeColor = getTypeColor(content.type || content.contentType);
  const contentId = content.id || content.contentId;

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-700 border-blue-200',
      red: 'bg-red-100 text-red-700 border-red-200',
      green: 'bg-green-100 text-green-700 border-green-200',
      purple: 'bg-purple-100 text-purple-700 border-purple-200',
      orange: 'bg-orange-100 text-orange-700 border-orange-200',
      indigo: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      gray: 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return colors[color] || colors.gray;
  };

  const handleDragStart = (e) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', contentIndex.toString());
    
    if (dragRef.current) {
      dragRef.current.style.opacity = '0.5';
    }
    
    onDragStart(contentIndex);
  };
  
  const handleDragEnd = (e) => {
    if (dragRef.current) {
      dragRef.current.style.opacity = '1';
    }
    setIsDragOver(false);
    onDragEnd();
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (!isDragging) {
      setIsDragOver(true);
      onDragOver(contentIndex);
    }
  };
  
  const handleDragEnter = (e) => {
    e.preventDefault();
    if (!isDragging) {
      setIsDragOver(true);
    }
  };
  
  const handleDragLeave = (e) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragOver(false);
    }
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const draggedIndex = parseInt(e.dataTransfer.getData('text/plain'));
    
    setIsDragOver(false);
    
    if (draggedIndex !== contentIndex) {
      onDrop(contentIndex, draggedIndex);
    }
  };

  const showDropIndicator = isDragOver && !isDragging;

  return (
    <div className="relative">
      {/* Drop indicator */}
      {showDropIndicator && (
        <div className="h-1 bg-[#0AAC9E] rounded-full mb-2 opacity-80 animate-pulse" />
      )}
      
      <div 
        ref={dragRef}
        className={`group flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer ${
          isDragging ? 'scale-95 shadow-lg' : ''
        } ${showDropIndicator ? 'ring-2 ring-[#0AAC9E]/30' : ''}`}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => onView(sectionId, content)}
      >
        {/* Drag Handle */}
        <div 
          className="cursor-move text-gray-400 hover:text-[#0AAC9E] transition-colors p-1"
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          title="Drag to reorder content"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-4 h-4" />
        </div>
        
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${getColorClasses(typeColor)}`}>
          <ContentIcon className="w-4 h-4" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
              #{contentIndex + 1}
            </span>
            <span className="text-sm font-medium text-gray-900 truncate">
              {content.description || content.title || content.name || `${typeLabel} ${contentIndex + 1}`}
            </span>
            <span className={`px-2 py-0.5 text-xs rounded-full border ${getColorClasses(typeColor)}`}>
              {typeLabel}
            </span>
            {content.hideContent && (
              <EyeOff className="w-4 h-4 text-gray-400 flex-shrink-0" />
            )}
          </div>
          {(content.contentString || content.data) && (
            <p className="text-xs text-gray-500 truncate">
              {(content.contentString || content.data).length > 60 
                ? (content.contentString || content.data).substring(0, 60) + '...'
                : (content.contentString || content.data)
              }
            </p>
          )}
        </div>

        {/* Content Actions */}
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onView(sectionId, content);
            }}
            className="p-1.5 text-gray-400 hover:text-[#0AAC9E] hover:bg-[#0AAC9E]/10 rounded transition-colors"
            title="View"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(sectionId, content);
            }}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
            title="Edit"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(sectionId, contentId);
            }}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};



// Quick Add Content Component (unchanged)
const QuickAddContent = ({ sectionId, onAdd, disabled }) => {
  const contentTypes = [
    { type: "page", label: "Page", icon: FileText, desc: "Rich text content", color: "blue" },
    { type: "video", label: "Video", icon: Video, desc: "Video content", color: "red" },
    { type: "quiz", label: "Quiz", icon: HelpCircle, desc: "Interactive quiz", color: "green" },
    { type: "url", label: "Link", icon: Globe, desc: "External link", color: "purple" },
    { type: "file", label: "File", icon: File, desc: "Document/PDF", color: "orange" },
    { type: "pptx", label: "Slides", icon: Presentation, desc: "PowerPoint", color: "indigo" }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'border-blue-200 hover:border-blue-400 hover:bg-blue-50 text-blue-700 hover:text-blue-800',
      red: 'border-red-200 hover:border-red-400 hover:bg-red-50 text-red-700 hover:text-red-800',
      green: 'border-green-200 hover:border-green-400 hover:bg-green-50 text-green-700 hover:text-green-800',
      purple: 'border-purple-200 hover:border-purple-400 hover:bg-purple-50 text-purple-700 hover:text-purple-800',
      orange: 'border-orange-200 hover:border-orange-400 hover:bg-orange-50 text-orange-700 hover:text-orange-800',
      indigo: 'border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50 text-indigo-700 hover:text-indigo-800'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Plus className="w-4 h-4 text-[#0AAC9E]" />
        <h4 className="text-xs font-medium text-gray-900">Add Content</h4>
        <div className="flex-1 h-px bg-gray-200"></div>
      </div>
      
      <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
        {contentTypes.map((contentType) => {
          const Icon = contentType.icon;
          return (
            <button
              key={contentType.type}
              onClick={() => onAdd(sectionId, contentType.type)}
              disabled={disabled}
              className={`group relative p-2 border-2 border-dashed rounded-lg transition-all text-center disabled:opacity-50 disabled:cursor-not-allowed ${getColorClasses(contentType.color)}`}
            >
              <Icon className="w-5 h-5 mx-auto mb-2" />
              <div className="text-xs font-medium mb-1">{contentType.label}</div>
              <div className="text-xs opacity-75">{contentType.desc}</div>
              
              {/* Hover effect */}
              <div className="absolute inset-0 rounded-lg bg-current opacity-0 group-hover:opacity-5 transition-opacity"></div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Utility function for debouncing
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

const CompleteCourseContentForm = ({ isEditing = false }) => {
  const dispatch = useDispatch();
  
  const { 
    sections = [],
    activeSection,
    sectionContents = {},
    formData = {},
    currentCourse,
    loading,
    error: courseError,
    lastSectionUpdate,
    modals
  } = useSelector((state) => state.course || {});

  const { 
    contentsBySection = {},
    contentLoading
  } = useSelector((state) => state.courseContent || {});

  // Drag and drop state - sections
  const [draggedSectionIndex, setDraggedSectionIndex] = useState(null);
  const [dragOverSectionIndex, setDragOverSectionIndex] = useState(null);
  const [isReorderingSections, setIsReorderingSections] = useState(false);
  
  // Drag and drop state - content
  const [draggedContentIndex, setDraggedContentIndex] = useState(null);
  const [dragOverContentIndex, setDragOverContentIndex] = useState(null);
  const [isReorderingContent, setIsReorderingContent] = useState(false);
  const [reorderingSectionId, setReorderingSectionId] = useState(null);

  const [optimisticSections, setOptimisticSections] = useState(null);

  // View state
  const [viewMode, setViewMode] = useState('sections');
  const [selectedContent, setSelectedContent] = useState(null);
  
  // NEW: Auto-refresh trigger
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Refs to prevent unnecessary operations and track state changes
  const lastSectionsLength = useRef(0);
  const hasAutoExpandedRef = useRef(false);
  const lastActiveSection = useRef(null);
  const lastUpdateTime = useRef(null);
  const contentCountBySection = useRef({});
  const sectionsStateRef = useRef(null);

  // Enhanced memoization with better dependencies and loop prevention
  const memoizedSections = useMemo(() => {
    const sectionsToProcess = optimisticSections || sections;
    
    if (!sectionsToProcess || sectionsToProcess.length === 0) {
      return [];
    }
    
    const processedSections = sectionsToProcess
      .map(section => {
        if (!section || !section.id) return null;
        
        const reduxContents = sectionContents[section.id] || [];
        const apiContents = contentsBySection[section.id] || [];
        
        // Create a Map to handle duplicates more efficiently using unique identifiers
        const contentMap = new Map();
        
        // Add redux contents first
        reduxContents.forEach(content => {
          if (!content) return;
          const key = content.id || content.contentId || `temp_${Date.now()}_${Math.random()}`;
          contentMap.set(key, content);
        });
        
        // Add API contents, but avoid duplicates
        apiContents.forEach(apiContent => {
          if (!apiContent) return;
          const key = apiContent.id || apiContent.contentId;
          if (key && !contentMap.has(key)) {
            contentMap.set(key, apiContent);
          } else if (key && contentMap.has(key)) {
            // Only update if the API content has more complete data
            const existing = contentMap.get(key);
            if (apiContent.description || apiContent.title || !existing.description) {
              contentMap.set(key, { ...existing, ...apiContent });
            }
          }
        });

        const allContents = Array.from(contentMap.values())
          .filter(content => content && (content.id || content.contentId))
          .sort((a, b) => (a.order || 0) - (b.order || 0));

        return {
          ...section,
          contents: allContents,
          _renderKey: `section-${section.id}-v2-${refreshTrigger}`,
          _contentCount: allContents.length
        };
      })
      .filter(Boolean)
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    return processedSections;
  }, [sections, optimisticSections, sectionContents, contentsBySection, refreshTrigger]);

  // Enhanced course creation check
  const isCourseCreated = useCallback(() => {
    if (currentCourse?.id && !currentCourse.id.toString().startsWith('temp_')) {
      return true;
    }
    if (currentCourse?.success && formData?.name && formData?.description) {
      return true;
    }
    return false;
  }, [currentCourse?.id, currentCourse?.success, formData?.name, formData?.description]);

  const [expandedSections, setExpandedSections] = useState(new Set());
  const [deleteModal, setDeleteModal] = useState({ 
    isOpen: false, 
    type: null, 
    id: null, 
    sectionId: null 
  });

  // Section drag and drop handlers
  const handleSectionDragStart = useCallback((index) => {
    setDraggedSectionIndex(index);
    setIsReorderingSections(false);
  }, []);

  const handleSectionDragEnd = useCallback(() => {
    setDraggedSectionIndex(null);
    setDragOverSectionIndex(null);
  }, []);

  const handleSectionDragOver = useCallback((index) => {
    if (draggedSectionIndex !== null && draggedSectionIndex !== index) {
      setDragOverSectionIndex(index);
    }
  }, [draggedSectionIndex]);

  const handleSectionDrop = useCallback(async (dropIndex, draggedIndexFromEvent) => {
    const actualDraggedIndex = draggedIndexFromEvent ?? draggedSectionIndex;
    
    if (actualDraggedIndex === null || actualDraggedIndex === dropIndex) {
      return;
    }

    const sourceSection = memoizedSections[actualDraggedIndex];
    const targetSection = memoizedSections[dropIndex];
    
    if (!sourceSection || !targetSection) {
      return;
    }

    // Optimistic update
    const sourceOrder = sourceSection.order || (actualDraggedIndex + 1);
    const targetOrder = targetSection.order || (dropIndex + 1);
    
    const optimisticSectionsUpdate = [...memoizedSections];
    optimisticSectionsUpdate[actualDraggedIndex] = { ...sourceSection, order: targetOrder };
    optimisticSectionsUpdate[dropIndex] = { ...targetSection, order: sourceOrder };
    
    setOptimisticSections(optimisticSectionsUpdate);

    try {
      const updatePromises = [
        dispatch(updateSectionAsync({
          sectionId: sourceSection.id,
          id: sourceSection.id,
          courseId: currentCourse?.id,
          description: sourceSection.description,
          order: targetOrder,
          duration: sourceSection.duration,
          hideSection: sourceSection.hideSection,
          mandatory: sourceSection.mandatory,
          courseContentIds: sourceSection.courseContentIds || [],
          contents: sourceSection.contents || []
        })).unwrap(),
        dispatch(updateSectionAsync({
          sectionId: targetSection.id,
          id: targetSection.id,
          courseId: currentCourse?.id,
          description: targetSection.description,
          order: sourceOrder,
          duration: targetSection.duration,
          hideSection: targetSection.hideSection,
          mandatory: targetSection.mandatory,
          courseContentIds: targetSection.courseContentIds || [],
          contents: targetSection.contents || []
        })).unwrap()
      ];

      setIsReorderingSections(true);
      await Promise.all(updatePromises);

      if (currentCourse?.id) {
        await dispatch(getSectionsByCourseIdAsync(currentCourse.id));
      }
      
      setOptimisticSections(null);
      
    } catch (error) {
      console.error('Failed to reorder sections:', error);
      setOptimisticSections(null);
    } finally {
      setTimeout(() => {
        setIsReorderingSections(false);
        setDraggedSectionIndex(null);
        setDragOverSectionIndex(null);
      }, 300);
    }
  }, [draggedSectionIndex, memoizedSections, dispatch, currentCourse?.id]);

  // Content drag and drop handlers - FIXED VERSION
  const handleContentDragStart = useCallback((index) => {
    setDraggedContentIndex(index);
    setIsReorderingContent(false);
  }, []);

  const handleContentDragEnd = useCallback(() => {
    setDraggedContentIndex(null);
    setDragOverContentIndex(null);
    setReorderingSectionId(null);
  }, []);

  const handleContentDragOver = useCallback((index) => {
    if (draggedContentIndex !== null && draggedContentIndex !== index) {
      setDragOverContentIndex(index);
    }
  }, [draggedContentIndex]);

  // FIXED: Content drop handler using the correct API structure
const handleContentDrop = useCallback(async (dropIndex, draggedIndexFromEvent, sectionId) => {
  const actualDraggedIndex = draggedIndexFromEvent ?? draggedContentIndex;
  
  if (actualDraggedIndex === null || actualDraggedIndex === dropIndex) {
    return;
  }

  const section = memoizedSections.find(s => s.id === sectionId);
  if (!section || !section.contents) {
    return;
  }

  const sourceContent = section.contents[actualDraggedIndex];
  const targetContent = section.contents[dropIndex];
  
  if (!sourceContent || !targetContent) {
    return;
  }

  setReorderingSectionId(sectionId);
  setIsReorderingContent(true);

  try {
    // Calculate new order values - swap them
    const sourceNewOrder = targetContent.order || (dropIndex + 1);
    const targetNewOrder = sourceContent.order || (actualDraggedIndex + 1);

    // FIXED: Use correct field names exactly as API expects (FormData structure)
    const updatePromises = [
      // Update source content with new order
      dispatch(updateContentAsync({
        contentId: sourceContent.id || sourceContent.contentId, // ContentId for FormData
        sectionId: sectionId, // Will be converted to CourseSectionId in the API layer
        description: sourceContent.description || "",
        hideContent: sourceContent.hideContent || false,
        isDiscussionEnabled: sourceContent.isDiscussionEnabled || false,
        isMeetingAllowed: sourceContent.isMeetingAllowed || false,
        type: sourceContent.type || sourceContent.contentType || 1,
        contentString: sourceContent.contentString || "",
        order: sourceNewOrder // Order for reordering
      })).unwrap(),
      
      // Update target content with new order
      dispatch(updateContentAsync({
        contentId: targetContent.id || targetContent.contentId, // ContentId for FormData
        sectionId: sectionId, // Will be converted to CourseSectionId in the API layer
        description: targetContent.description || "",
        hideContent: targetContent.hideContent || false,
        isDiscussionEnabled: targetContent.isDiscussionEnabled || false,
        isMeetingAllowed: targetContent.isMeetingAllowed || false,
        type: targetContent.type || targetContent.contentType || 1,
        contentString: targetContent.contentString || "",
        order: targetNewOrder // Order for reordering
      })).unwrap()
    ];

    await Promise.all(updatePromises);
    console.log('Content reorder successful:', updatePromises);

    // Reload section contents to get fresh data
    await dispatch(getContentsBySectionAsync(sectionId));
    
    // Trigger refresh
    setRefreshTrigger(prev => prev + 1);
    
  } catch (error) {
    console.error('Failed to reorder content:', error);
    alert(`Failed to reorder content: ${error.message || 'Unknown error'}`);
  } finally {
    setTimeout(() => {
      setIsReorderingContent(false);
      setReorderingSectionId(null);
      setDraggedContentIndex(null);
      setDragOverContentIndex(null);
    }, 300);
  }
}, [draggedContentIndex, memoizedSections, dispatch]);

  // Enhanced reload sections function with better loading control
  const reloadSections = useCallback(
    debounce(async (forceReload = false) => {
      const courseId = currentCourse?.id;
      
      if (loading || !courseId || courseId.toString().startsWith('temp_')) {
        return;
      }

      try {
        await dispatch(getSectionsByCourseIdAsync(courseId));
        
        // Also reload content for expanded sections
        const reloadPromises = Array.from(expandedSections).map(sectionId => {
          return dispatch(getContentsBySectionAsync(sectionId));
        });
        
        if (reloadPromises.length > 0) {
          await Promise.all(reloadPromises);
        }
        
        if (optimisticSections) {
          setOptimisticSections(null);
        }
        
        // Trigger refresh
        setRefreshTrigger(prev => prev + 1);
      } catch (error) {
        console.error('Failed to reload sections:', error);
      }
    }, 800),
    [dispatch, currentCourse?.id, optimisticSections, loading, expandedSections]
  );

  // State management for initialization
  const [lastLoadedCourseId, setLastLoadedCourseId] = useState(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(false);
  const loadingTimeoutRef = useRef(null);

  // Simplified load sections effect to prevent loops
  useEffect(() => {
    const courseId = currentCourse?.id;
    
    if (!isEditing || !courseId || courseId.toString().startsWith('temp_') || loading) {
      return;
    }

    if (courseId !== lastLoadedCourseId && !hasInitialized) {
      setLastLoadedCourseId(courseId);
      setHasInitialized(true);
      setIsInitialLoad(true);
      
      console.log('Loading sections for course:', courseId);
      dispatch(getSectionsByCourseIdAsync(courseId))
        .finally(() => {
          setTimeout(() => {
            setIsInitialLoad(false);
          }, 1000);
        });
    }
  }, [isEditing, currentCourse?.id, loading, lastLoadedCourseId, hasInitialized, dispatch]);

  // Reset initialization when course changes
  useEffect(() => {
    const courseId = currentCourse?.id;
    if (courseId && courseId !== lastLoadedCourseId) {
      setHasInitialized(false);
      setIsInitialLoad(false);
    }
  }, [currentCourse?.id, lastLoadedCourseId]);

  // Auto-expand first section when sections load
  useEffect(() => {
    if (memoizedSections.length > 0 && !hasAutoExpandedRef.current) {
      const firstRealSection = memoizedSections.find(s => 
        s.id && !s.id.toString().startsWith('temp_')
      );
      
      if (firstRealSection) {
        setExpandedSections(new Set([firstRealSection.id]));
        dispatch(setActiveSection(firstRealSection.id));
        hasAutoExpandedRef.current = true;
      }
    }
  }, [memoizedSections.length, dispatch]);

  // Auto-expand and set active section logic
  useEffect(() => {
    if (memoizedSections.length > 0 && memoizedSections.length !== lastSectionsLength.current) {
      lastSectionsLength.current = memoizedSections.length;
      
      const firstRealSection = memoizedSections.find(s => 
        s.id && !s.id.toString().startsWith('temp_')
      );
      
      if (firstRealSection) {
        const currentActiveSectionExists = memoizedSections.find(s => s.id === activeSection);
        
        if (!hasAutoExpandedRef.current || 
            !activeSection || 
            activeSection.toString().startsWith('temp_') ||
            !currentActiveSectionExists) {
          
          setExpandedSections(new Set([firstRealSection.id]));
          dispatch(setActiveSection(firstRealSection.id));
          hasAutoExpandedRef.current = true;
          lastActiveSection.current = firstRealSection.id;
        }
      }
    }
  }, [memoizedSections.length, activeSection, dispatch]);

  const toggleSection = useCallback((sectionId) => {
    setExpandedSections(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(sectionId)) {
        newExpanded.delete(sectionId);
      } else {
        newExpanded.add(sectionId);
      }
      return newExpanded;
    });
  }, []);

  const handleAddSection = useCallback(() => {
    if (!isCourseCreated()) {
      alert("Please create the course first (Step 1).");
      return;
    }
    dispatch(setModalOpen({ modal: 'addSection', isOpen: true }));
  }, [dispatch, isCourseCreated]);

  const handleEditSection = useCallback(async (section) => {
    dispatch(setActiveSection(section.id));
    
    setTimeout(() => {
      dispatch(setModalOpen({ modal: 'editSection', isOpen: true }));
    }, 10);
  }, [dispatch]);

  const validateSectionBeforeAddingContent = useCallback((sectionId) => {
    if (!sectionId) {
      alert("No section selected. Please create a section first.");
      return false;
    }
    
    const section = memoizedSections.find(s => s.id === sectionId);
    if (!section) {
      alert("Selected section not found. Please refresh and try again.");
      return false;
    }
    
    return true;
  }, [memoizedSections]);

  const handleAddContent = useCallback(
    debounce(async (sectionId, contentType) => {
      if (!validateSectionBeforeAddingContent(sectionId)) {
        return;
      }
      
      setExpandedSections(prev => new Set(prev).add(sectionId));
      
      dispatch(setActiveSection(sectionId));
      dispatch(setContentModalType(contentType));
      dispatch(setModalOpen({ modal: 'addContent', isOpen: true }));
    }, 300),
    [dispatch, validateSectionBeforeAddingContent]
  );

  const handleViewContent = useCallback((sectionId, content) => {
    const currentState = {
      sections: memoizedSections,
      expandedSections: Array.from(expandedSections),
      activeSection,
      timestamp: Date.now()
    };
    
    setSelectedContent({
      contentId: content.id || content.contentId,
      sectionId: sectionId,
      content: content,
      previousState: currentState
    });
    setViewMode('content-detail');
  }, [memoizedSections, expandedSections, activeSection]);

  const handleEditContent = useCallback((sectionId, content) => {
    dispatch(setEditingContent(content));
    dispatch(setActiveSection(sectionId));
    
    const typeMapping = {
      0: 'page', 2: 'quiz', 3: 'url', 4: 'video', 5: 'file', 6: 'pptx',
      'Page': 'page', 'Quiz': 'quiz', 'WebURL': 'url', 'Video': 'video', 'OtherFile': 'file', 'PPTX': 'pptx'
    };
    
    const contentType = content.type || content.contentType;
    const contentTypeKey = typeMapping[contentType] || 'page';
    
    dispatch(setContentModalType(contentTypeKey));
    dispatch(setModalOpen({ modal: 'editContent', isOpen: true }));
  }, [dispatch]);

  // Fixed delete handlers
  const handleDeleteContent = useCallback((sectionId, contentId) => {
    console.log('Delete content requested:', { sectionId, contentId });
    
    if (!sectionId || !contentId) {
      console.error('Missing sectionId or contentId for deletion');
      alert('Cannot delete content: missing required information');
      return;
    }
    
    setDeleteModal({
      isOpen: true,
      type: 'content',
      id: contentId,
      sectionId: sectionId
    });
  }, []);

  const handleDeleteSection = useCallback((sectionId) => {
    console.log('Delete section requested:', { sectionId });
    
    if (!sectionId) {
      console.error('Missing sectionId for deletion');
      alert('Cannot delete section: missing section ID');
      return;
    }
    
    setDeleteModal({
      isOpen: true,
      type: 'section',
      id: sectionId,
      sectionId: null
    });
  }, []);

  // FIXED: Updated confirmDelete function to use proper async thunks
  const confirmDelete = useCallback(async () => {
    console.log('Starting delete operation:', deleteModal);
    
    const courseId = currentCourse?.id;
    
    try {
      if (deleteModal.type === 'content') {
        console.log('Deleting content:', { sectionId: deleteModal.sectionId, contentId: deleteModal.id });
        
        const result = await dispatch(deleteContentAsync(deleteModal.id)).unwrap();
        
        console.log('Content delete success:', result);
        
        dispatch(removeContentFromSection({ 
          sectionId: deleteModal.sectionId, 
          contentId: deleteModal.id 
        }));
        
        // Reload content for the section
        setTimeout(async () => {
          await dispatch(getContentsBySectionAsync(deleteModal.sectionId));
          setRefreshTrigger(prev => prev + 1);
        }, 300);
        
      } else if (deleteModal.type === 'section') {
        console.log('Deleting section:', { sectionId: deleteModal.id });
        
        const result = await dispatch(deleteSectionAsync(deleteModal.id)).unwrap();
        
        console.log('Section delete success:', result);
        
        setExpandedSections(prev => {
          const newExpanded = new Set(prev);
          newExpanded.delete(deleteModal.id);
          return newExpanded;
        });
        
        if (activeSection === deleteModal.id) {
          const remainingSections = memoizedSections.filter(s => s.id !== deleteModal.id);
          if (remainingSections.length > 0) {
            dispatch(setActiveSection(remainingSections[0].id));
          } else {
            dispatch(setActiveSection(null));
          }
        }
      }
      
      setDeleteModal({ isOpen: false, type: null, id: null, sectionId: null });
      
      // Reload sections after successful delete
      if (courseId && !courseId.toString().startsWith('temp_')) {
        setTimeout(async () => {
          console.log('Reloading sections after delete...');
          await dispatch(getSectionsByCourseIdAsync(courseId));
          setRefreshTrigger(prev => prev + 1);
        }, 500);
      }
      
    } catch (error) {
      console.error('Delete operation failed:', error);
      alert(`Failed to delete ${deleteModal.type}. Error: ${error.message || 'Unknown error'}`);
      
      setDeleteModal({ isOpen: false, type: null, id: null, sectionId: null });
    }
  }, [dispatch, deleteModal, currentCourse?.id, activeSection, memoizedSections]);

  const closeDeleteModal = useCallback(() => {
    setDeleteModal({ isOpen: false, type: null, id: null, sectionId: null });
  }, []);

  const handleContinueToPublish = useCallback(() => {
    dispatch(nextStep());
  }, [dispatch]);

  const handleBackToSections = useCallback(() => {
    if (selectedContent?.previousState) {
      const { expandedSections: prevExpanded, activeSection: prevActive } = selectedContent.previousState;
      if (prevExpanded) {
        setExpandedSections(new Set(prevExpanded));
      }
      if (prevActive) {
        dispatch(setActiveSection(prevActive));
      }
    }
    
    setViewMode('sections');
    setSelectedContent(null);
    
    setTimeout(() => {
      reloadSections(true);
    }, 100);
  }, [selectedContent, dispatch, reloadSections]);

  const handleSectionExpand = useCallback((sectionId) => {
    toggleSection(sectionId);
    
    // Load content when expanding section
    if (!expandedSections.has(sectionId) && !contentLoading) {
      dispatch(getContentsBySectionAsync(sectionId))
        .then(() => {
          // Trigger refresh to show new content
          setRefreshTrigger(prev => prev + 1);
        });
    }
  }, [toggleSection, expandedSections, contentLoading, dispatch]);

  const getSectionProgress = useCallback((section) => {
    const contents = section.contents || [];
    return {
      total: contents.length,
      hasContent: contents.length > 0
    };
  }, []);

  const getTotalProgress = useCallback(() => {
    const totalSections = memoizedSections?.length || 0;
    const sectionsWithContent = memoizedSections?.filter(section => {
      const progress = getSectionProgress(section);
      return progress.hasContent;
    }).length || 0;
    
    return {
      totalSections,
      sectionsWithContent,
      percentage: totalSections > 0 ? Math.round((sectionsWithContent / totalSections) * 100) : 0
    };
  }, [memoizedSections, getSectionProgress]);

  const progress = getTotalProgress();

  // FIXED: Enhanced effect to handle modal closures and auto-refresh
  useEffect(() => {
    const modalsClosed = !modals?.addContent && !modals?.editContent && 
                        !modals?.addSection && !modals?.editSection;
    
    if (modalsClosed && lastUpdateTime.current !== lastSectionUpdate && !loading) {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      
      loadingTimeoutRef.current = setTimeout(() => {
        if (!loading) {
          reloadSections(true);
        }
      }, 500); // Increased timeout for better stability
      
      return () => {
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current);
        }
      };
    }
  }, [modals?.addContent, modals?.editContent, modals?.addSection, modals?.editSection, 
      lastSectionUpdate, reloadSections, loading]);

  // Manual refresh function
  const handleManualRefresh = useCallback(async () => {
    setRefreshTrigger(prev => prev + 1);
    await reloadSections(true);
  }, [reloadSections]);

  // Show warning if course not created
  if (!isCourseCreated()) {
    return (
      <div className="p-6">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#0AAC9E]/10 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-[#0AAC9E]" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Build Your Course Content
          </h2>
          <p className="text-gray-600 max-w-md mx-auto">
            Complete the basic course information first to start building content.
          </p>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 mb-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-6 h-6 text-orange-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-orange-800 mb-1">Course Not Created Yet</h3>
              <p className="text-sm text-orange-700">
                Please complete Step 1 (Basic Information) and save your course before adding content.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() => dispatch(setCurrentStep(1))}
            className="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-[#0AAC9E] rounded-lg hover:bg-[#0AAC9E]/90 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Go Back to Step 1
          </button>
        </div>
      </div>
    );
  }

  // Render content detail view
  if (viewMode === 'content-detail' && selectedContent) {
    return (
      <ContentDetailView
        contentId={selectedContent.contentId}
        sectionId={selectedContent.sectionId}
        onBack={handleBackToSections}
      />
    );
  }

  // Render main sections view
  return (
    <div className="p-6">
      {/* Header with refresh button */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-3 mb-2">
          <h2 className="text-lg font-semibold text-gray-900">
            Build Your Course Content
          </h2>
          <button
            onClick={handleManualRefresh}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-[#0AAC9E] hover:bg-[#0AAC9E]/10 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh content"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <p className="text-gray-600 text-xs mx-auto">
          Organize your course into sections and fill them with engaging learning materials. 
          <span className="inline-flex items-center ml-2">
            Drag sections and content to reorder
          </span>
        </p>
      </div>

      {/* Course Structure */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-medium text-gray-900">Course Structure</h3>
          {(isReorderingSections || isReorderingContent) && (
            <div className="flex items-center text-sm text-green-600 animate-pulse">
              <CheckCircle className="w-4 h-4 mr-2" />
              {isReorderingSections ? 'Updating section order...' : 'Updating content order...'}
            </div>
          )}
          <button
            onClick={handleAddSection}
            disabled={loading || isReorderingSections}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#0AAC9E] rounded-lg hover:bg-[#0AAC9E]/90 transition-colors disabled:opacity-50"
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
        {memoizedSections && memoizedSections.length > 0 ? (
          <div className="space-y-4">
            {memoizedSections.map((section, sectionIndex) => {
              const isExpanded = expandedSections.has(section.id);
              const isActive = activeSection === section.id;
              const sectionProgress = getSectionProgress(section);
              const contents = section.contents || [];
              const isDragging = draggedSectionIndex === sectionIndex;
              
              return (
                <DraggableSection
                  key={section._renderKey || `section-${section.id}-${sectionIndex}`}
                  section={section}
                  sectionIndex={sectionIndex}
                  isExpanded={isExpanded}
                  isActive={isActive}
                  sectionProgress={sectionProgress}
                  contents={contents}
                  onToggle={handleSectionExpand}
                  onEdit={handleEditSection}
                  onDelete={handleDeleteSection}
                  onDragStart={handleSectionDragStart}
                  onDragEnd={handleSectionDragEnd}
                  onDragOver={handleSectionDragOver}
                  onDrop={handleSectionDrop}
                  isDragging={isDragging}
                  dragOverIndex={dragOverSectionIndex}
                >
                  {/* Content Loading Indicator */}
                  {contentLoading && (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-5 h-5 animate-spin text-[#0AAC9E] mr-2" />
                      <span className="text-sm text-gray-600">Loading content...</span>
                    </div>
                  )}

                  {/* Content Items with Drag & Drop */}
                  {contents.length > 0 && (
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center space-x-2 mb-3">
                        <BookOpen className="w-4 h-4 text-gray-500" />
                        <h4 className="text-sm font-medium text-gray-700">Content ({contents.length})</h4>
                        <div className="flex-1 h-px bg-gray-200"></div>
                        {isReorderingContent && reorderingSectionId === section.id && (
                          <div className="text-xs text-green-600 animate-pulse">
                            Updating order...
                          </div>
                        )}
                      </div>
                      {contents.map((content, contentIndex) => {
                        const contentKey = content.id || content.contentId;
                        
                        if (!contentKey) {
                          console.warn('Content missing ID:', content);
                          return null;
                        }
                        
                        const isContentDragging = draggedContentIndex === contentIndex && reorderingSectionId === section.id;
                        
                        return (
                          <DraggableContentItem
                            key={`content-${contentKey}-${contentIndex}-${section.id}`}
                            content={content}
                            contentIndex={contentIndex}
                            sectionId={section.id}
                            onView={handleViewContent}
                            onEdit={handleEditContent}
                            onDelete={handleDeleteContent}
                            onDragStart={(index) => {
                              setReorderingSectionId(section.id);
                              handleContentDragStart(index);
                            }}
                            onDragEnd={handleContentDragEnd}
                            onDragOver={handleContentDragOver}
                            onDrop={(dropIndex, draggedIndex) => handleContentDrop(dropIndex, draggedIndex, section.id)}
                            isDragging={isContentDragging}
                            dragOverIndex={dragOverContentIndex}
                          />
                        );
                      })}
                    </div>
                  )}

                  {/* Empty State */}
                  {contents.length === 0 && (
                    <div className="text-center py-4 border border-dashed border-gray-300 rounded-lg mb-6 bg-gray-50/50">
                      <h4 className="text-sm font-medium text-gray-900 mb-1">No content yet</h4>
                      <p className="text-sm text-gray-500 mb-4">Add your first learning material to this section</p>
                    </div>
                  )}

                  {/* Quick Add Content */}
                  <QuickAddContent
                    sectionId={section.id}
                    onAdd={handleAddContent}
                    disabled={!validateSectionBeforeAddingContent(section.id)}
                  />
                </DraggableSection>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 border border-dashed border-gray-300 rounded-xl bg-gray-50/50">
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <GripVertical className="w-8 h-8 text-gray-300 absolute -top-2 -left-2" />
                <BookOpen className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No sections yet</h3>
              <p className="text-gray-500 mb-6 max-w-md text-center">
                Start building your course by adding your first section. You can drag and drop sections to reorder them later.
              </p>
              <button
                onClick={handleAddSection}
                disabled={loading}
                className="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-[#0AAC9E] rounded-lg hover:bg-[#0AAC9E]/90 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Add First Section
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Continue Button */}
      <div className="bg-white rounded-xl border border-gray-200 px-6 py-4 mt-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {progress.totalSections > 0 ? (
                <CheckCircle className="w-4 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-5 text-orange-600" />
              )}
              <span className={`text-xs font-medium ${
                progress.totalSections > 0 ? 'text-green-600' : 'text-orange-600'
              }`}>
                {progress.totalSections > 0 
                  ? `Ready to publish with ${progress.totalSections} section${progress.totalSections !== 1 ? 's' : ''}` 
                  : 'Add sections to continue'
                }
              </span>
            </div>
          </div>

          <button
            onClick={handleContinueToPublish}
            disabled={!isCourseCreated() || progress.totalSections === 0}
            className="inline-flex items-center px-6 py-2 text-xs font-medium text-white bg-[#0AAC9E] rounded-lg hover:bg-[#0AAC9E]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-4 h-4 mr-2" />
            Continue to Publish
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal with Enhanced Information */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Delete {deleteModal.type === 'section' ? 'Section' : 'Content'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    This action cannot be undone.
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-700 font-medium">
                  {deleteModal.type === 'section' ? 'Section ID:' : 'Content ID:'} {deleteModal.id}
                </p>
                {deleteModal.type === 'content' && deleteModal.sectionId && (
                  <p className="text-sm text-gray-600 mt-1">
                    Section ID: {deleteModal.sectionId}
                  </p>
                )}
              </div>
              
              <p className="text-sm text-gray-700 mb-6">
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
                  disabled={loading}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay - Only show when truly necessary */}
      {loading && hasInitialized && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-40">
          <div className="bg-white rounded-xl shadow-xl p-6 flex items-center space-x-3">
            <Loader2 className="w-6 h-6 animate-spin text-[#0AAC9E]" />
            <span className="text-sm font-medium text-gray-900">
              {isReorderingSections ? 'Reordering sections...' : 
               isReorderingContent ? 'Reordering content...' : 
               'Loading sections...'}
            </span>
          </div>
        </div>
      )}

      {/* Error Display */}
      {courseError && (
        <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 rounded-xl p-4 shadow-lg z-50 max-w-sm">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-red-900">Error</h4>
              <p className="text-sm text-red-700 mt-1">{courseError}</p>
            </div>
            <button
              onClick={() => dispatch(closeAllModals())}
              className="text-red-400 hover:text-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompleteCourseContentForm;