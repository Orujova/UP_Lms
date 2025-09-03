import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { 
  X, 
  Video, 
  Globe, 
  File,
  AlertCircle, 
  CheckCircle,
  Loader2,
  Save,
  Link,
  Eye,
  Monitor,
  Type,
  Presentation,
  HelpCircle,
  Hash,
  FileVideo,
  Timer
} from "lucide-react";
import {
  addContentAsync,
  updateContentAsync,
  setModalOpen,
  closeAllModals
} from "@/redux/course/courseSlice";

// Import the video upload progress component
import VideoUploadProgress from './VideoUploadProgress';
import SimpleRichTextEditor from '@/components/SimpleRichText';

const ContentModal = () => {
  const dispatch = useDispatch();
  
  const { 
    modals, 
    activeSection,
    editingContent,
    contentModalType,
    currentCourse,
    formData,
    sections,
    loading 
  } = useSelector((state) => state.course || {});
  
  const isOpen = modals?.addContent || modals?.editContent || false;
  const isEditing = modals?.editContent || false;
  
  // Prevent infinite loops with refs
  const isInitialized = useRef(false);
  const prevIsOpen = useRef(false);
  const prevIsEditing = useRef(false);
  const prevEditingContentId = useRef(null);
  
  // Upload progress state
  const [showUploadProgress, setShowUploadProgress] = useState(false);
  const [uploadedContentId, setUploadedContentId] = useState(null);
  
  // Memoize stable values
  const courseId = useMemo(() => {
    if (currentCourse?.id && 
        currentCourse.id !== null && 
        !currentCourse.id.toString().startsWith('temp_') &&
        currentCourse.id.toString() !== 'null' &&
        currentCourse.id.toString() !== 'undefined') {
      return parseInt(currentCourse.id);
    }
    
    if (formData?.id && 
        formData.id !== null && 
        !formData.id.toString().startsWith('temp_') &&
        formData.id.toString() !== 'null' &&
        formData.id.toString() !== 'undefined') {
      return parseInt(formData.id);
    }
    
    if (formData?.courseId && 
        formData.courseId !== null && 
        !formData.courseId.toString().startsWith('temp_') &&
        formData.courseId.toString() !== 'null' &&
        formData.courseId.toString() !== 'undefined') {
      return parseInt(formData.courseId);
    }
    
    return null;
  }, [currentCourse?.id, formData?.id, formData?.courseId]);

  const sectionId = useMemo(() => {
    if (activeSection && 
        activeSection !== null && 
        !activeSection.toString().startsWith('temp_') &&
        activeSection.toString() !== 'null' &&
        activeSection.toString() !== 'undefined') {
      return parseInt(activeSection);
    }
    
    // If editing content, get section from content
    if (isEditing && editingContent) {
      if (editingContent.courseSectionId) return parseInt(editingContent.courseSectionId);
      if (editingContent.sectionId) return parseInt(editingContent.sectionId);
    }
    
    // First available section with real ID
    if (sections && sections.length > 0) {
      const realSection = sections.find(s => 
        s.id && 
        !s.id.toString().startsWith('temp_') &&
        s.id.toString() !== 'null' &&
        s.id.toString() !== 'undefined'
      );
      if (realSection) return parseInt(realSection.id);
    }
    
    return null;
  }, [activeSection, isEditing, editingContent, sections]);
  
  // Content type enum mapping
  const CONTENT_TYPES = useMemo(() => ({
    PAGE: 0,
    QUIZ: 2,
    WEB_URL: 3,
    VIDEO: 4,
    OTHER_FILE: 5,
    PPTX: 6
  }), []);

  // Initial form state
  const initialFormState = useMemo(() => ({
    sectionId: null,
    description: "",
    hideContent: false,
    type: 0, 
    isDiscussionEnabled: false,
    isMeetingAllowed: false,
    contentString: "",
    contentFile: null,
    order: 1,
    // Quiz specific fields
    duration: 20,
    canSkip: true
  }), []);
  
  // Local state
  const [formState, setFormState] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filePreview, setFilePreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // Helper function to strip HTML tags for validation
  const stripHtmlTags = useCallback((html) => {
    if (!html) return '';
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  }, []);

  // Get content type configuration
  const getContentTypeConfig = useCallback((type) => {
    const configs = {
      page: {
        icon: Monitor,
        title: "Page Content",
        description: "Static page or landing page content",
        color: "gray",
        acceptedFiles: null,
        maxSize: null,
        placeholder: "Enter page description...",
        apiType: CONTENT_TYPES.PAGE,
        allowUrl: false,
        allowFile: false,
        requiresText: true
      },
      quiz: {
        icon: HelpCircle,
        title: "Quiz",
        description: "Interactive quiz with questions and answers",
        color: "yellow",
        acceptedFiles: null,
        maxSize: null,
        placeholder: "Enter quiz description...",
        apiType: CONTENT_TYPES.QUIZ,
        allowUrl: false,
        allowFile: false,
        requiresText: false // Changed to false since we don't want text content for quiz
      },
      url: {
        icon: Globe,
        title: "External Link",
        description: "Link to external websites and resources",
        color: "green",
        acceptedFiles: null,
        maxSize: null,
        placeholder: "Enter link description...",
        apiType: CONTENT_TYPES.WEB_URL,
        allowUrl: true,
        allowFile: false,
        requiresUrl: true
      },
      video: {
        icon: Video,
        title: "Video Content", 
        description: "Upload video file for streaming",
        color: "red",
        acceptedFiles: "video/*,.mp4,.mov,.avi,.mkv,.webm,.flv",
        maxSize: 500 * 1024 * 1024 * 1024, // 500MB
        placeholder: "Enter video description...",
        apiType: CONTENT_TYPES.VIDEO,
        allowUrl: false,
        allowFile: true,
        requiresFile: true
      },
      file: {
        icon: File,
        title: "File Upload",
        description: "Documents, PDFs, and other files",
        color: "purple",
        acceptedFiles: ".pdf,.doc,.docx,.txt,.zip,.rar",
        maxSize: 50 * 1024 * 1024, // 50MB
        placeholder: "Enter file description...",
        apiType: CONTENT_TYPES.OTHER_FILE,
        allowUrl: false,
        allowFile: true,
        requiresFile: true
      },
      pptx: {
        icon: Presentation,
        title: "PowerPoint Presentation",
        description: "Upload PowerPoint presentations",
        color: "orange",
        acceptedFiles: ".ppt,.pptx",
        maxSize: 100 * 1024 * 1024, // 100MB
        placeholder: "Enter presentation description...",
        apiType: CONTENT_TYPES.PPTX,
        allowUrl: false,
        allowFile: true,
        requiresFile: true
      }
    };
    return configs[type] || configs.page;
  }, [CONTENT_TYPES]);

  const currentConfig = useMemo(() => getContentTypeConfig(contentModalType), [contentModalType, getContentTypeConfig]);

  // Initialize form data
  useEffect(() => {
    const hasModalStateChanged = prevIsOpen.current !== isOpen || prevIsEditing.current !== isEditing;
    const hasEditingContentChanged = prevEditingContentId.current !== editingContent?.id;
    
    if (!hasModalStateChanged && !hasEditingContentChanged) {
      return;
    }
    
    prevIsOpen.current = isOpen;
    prevIsEditing.current = isEditing;
    prevEditingContentId.current = editingContent?.id;
    
    if (!isOpen) {
      isInitialized.current = false;
      setShowUploadProgress(false);
      setUploadedContentId(null);
      return;
    }

    if (isInitialized.current && !hasEditingContentChanged) {
      return;
    }

    console.log('Initializing ContentModal form data');
    
    if (isEditing && editingContent) {
      console.log('Editing content:', editingContent);
      
      let detectedType = currentConfig.apiType;
      if (editingContent.type !== undefined && editingContent.type !== null) {
        detectedType = parseInt(editingContent.type);
      }
      
      let contentString = "";
      if (editingContent.contentString) {
        contentString = editingContent.contentString;
      } else if (editingContent.data) {
        contentString = editingContent.data;
      } else if (editingContent.description && detectedType === CONTENT_TYPES.QUIZ) {
        contentString = editingContent.description;
      }
      
      setFormState({
        sectionId: editingContent.courseSectionId || editingContent.sectionId || sectionId,
        description: editingContent.description || "",
        hideContent: Boolean(editingContent.hideContent),
        type: detectedType,
        isDiscussionEnabled: Boolean(editingContent.isDiscussionEnabled),
        isMeetingAllowed: Boolean(editingContent.isMeetingAllowed),
        contentString: contentString,
        contentFile: null,
        order: editingContent.order || editingContent.orderNumber || 1,
        // Quiz specific
        duration: editingContent.duration || 20,
        canSkip: editingContent.canSkip !== undefined ? Boolean(editingContent.canSkip) : true
      });
    } else {
      console.log('Creating new content for section:', sectionId);
      setFormState({
        sectionId: sectionId,
        description: "",
        hideContent: false,
        type: currentConfig.apiType,
        isDiscussionEnabled: false,
        isMeetingAllowed: false,
        contentString: "",
        contentFile: null,
        order: 1,
        // Quiz specific
        duration: 20,
        canSkip: true
      });
    }
    
    setErrors({});
    setFilePreview(null);
    setDragActive(false);
    isInitialized.current = true;
    
  }, [isOpen, isEditing, editingContent?.id, sectionId, currentConfig.apiType, CONTENT_TYPES.QUIZ]);

  // Update sectionId when it changes
  useEffect(() => {
    if (isOpen && isInitialized.current && !isEditing && sectionId !== formState.sectionId) {
      console.log('Updating section ID in form:', sectionId);
      setFormState(prev => ({
        ...prev,
        sectionId: sectionId
      }));
    }
  }, [isOpen, isEditing, sectionId, formState.sectionId]);

  // Enhanced validation
  const validateForm = useCallback(() => {
    const newErrors = {};
    
    // Description is required
    if (!formState.description?.trim()) {
      newErrors.description = "Description is required";
    } else if (formState.description.length > 500) {
      newErrors.description = "Description must be less than 500 characters";
    }

    // Section ID is required
    if (!sectionId) {
      newErrors.sectionId = "Section ID is required. Please create a section first.";
    }

    // Order validation
    if (!formState.order || formState.order < 1 || formState.order > 999) {
      newErrors.order = "Order must be between 1 and 999";
    }
    
    // Type-specific validation
    const config = currentConfig;
    
    // Text-based content types (PAGE) - skip for QUIZ
    if (config.requiresText && config.apiType !== CONTENT_TYPES.QUIZ) {
      if (!formState.contentString?.trim()) {
        newErrors.contentString = "Content text is required";
      } else {
        // For page content with rich text, check the actual text length (without HTML tags)
        if (contentModalType === 'page') {
          const textContent = stripHtmlTags(formState.contentString);
          if (!textContent.trim()) {
            newErrors.contentString = "Content text is required";
          }
          // Optional: Add max length validation for text content
          if (textContent.length > 50000) {
            newErrors.contentString = "Content text must be less than 50,000 characters";
          }
        }
      }
    }
    
    // URL content type (WEB_URL)
    if (config.requiresUrl) {
      if (!formState.contentString?.trim()) {
        newErrors.contentString = "URL is required";
      } else if (!isValidUrl(formState.contentString)) {
        newErrors.contentString = "Please enter a valid URL";
      }
    }
    
    // File-required content types (VIDEO, OTHER_FILE, PPTX) - Allow editing without file
    if (config.requiresFile && !formState.contentFile && !isEditing) {
      newErrors.contentFile = "Please select a file to upload";
    }
    
    // Quiz specific validation
    if (config.apiType === CONTENT_TYPES.QUIZ) {
      if (!formState.duration || formState.duration < 1 || formState.duration > 300) {
        newErrors.duration = "Duration must be between 1 and 300 minutes";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formState, sectionId, currentConfig, isEditing, CONTENT_TYPES.QUIZ, contentModalType, stripHtmlTags]);

  const isValidUrl = useCallback((string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }, []);

  const handleInputChange = useCallback((field, value) => {
    setFormState(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  }, [errors]);

  // File handlers
  const handleFileUpload = useCallback((file) => {
    if (!file) return;

    const config = currentConfig;
    
    // Enhanced file type validation
    if (config.acceptedFiles) {
      const extensions = config.acceptedFiles.split(',').map(ext => ext.trim());
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
      const fileMimeType = file.type;
      
      const isValidExtension = extensions.some(ext => 
        ext === fileExtension || 
        ext === fileMimeType ||
        (ext.includes('*') && fileMimeType.startsWith(ext.replace('*', '')))
      );
      
      if (!isValidExtension) {
        setErrors(prev => ({ 
          ...prev, 
          contentFile: `Invalid file type. Accepted: ${config.acceptedFiles}` 
        }));
        return;
      }
    }

    if (config.maxSize && file.size > config.maxSize) {
      const sizeMB = Math.round(config.maxSize / (1024 * 1024));
      setErrors(prev => ({ 
        ...prev, 
        contentFile: `File size must be less than ${sizeMB}MB` 
      }));
      return;
    }

    // Clear errors if file is valid
    setErrors(prev => ({ ...prev, contentFile: null, content: null }));
    setFormState(prev => ({ ...prev, contentFile: file }));

    // Generate preview for supported files
    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  }, [currentConfig]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleFileInput = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  const removeFile = useCallback(() => {
    setFormState(prev => ({ ...prev, contentFile: null }));
    setFilePreview(null);
    setErrors(prev => ({ ...prev, contentFile: null }));
  }, []);

  // Submit handler
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    if (!sectionId) {
      setErrors({ submit: "Section ID is missing. Please create a section first." });
      return;
    }

    if (!courseId) {
      setErrors({ submit: "Course ID is missing. Please create the course first." });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const contentData = {
        sectionId: sectionId,
        courseSectionId: sectionId,
        description: formState.description?.trim() || "",
        hideContent: Boolean(formState.hideContent),
        type: parseInt(formState.type),
        isDiscussionEnabled: Boolean(formState.isDiscussionEnabled),
        isMeetingAllowed: Boolean(formState.isMeetingAllowed),
        order: parseInt(formState.order) || 1,
        contentString: formState.contentString?.trim() || (
          formState.type === CONTENT_TYPES.QUIZ && !formState.contentString?.trim() 
            ? formState.description?.trim() || ""
            : ""
        ),
        contentFile: formState.contentFile || null,
        // Quiz specific data
        duration: formState.type === CONTENT_TYPES.QUIZ ? parseInt(formState.duration) || 20 : undefined,
        canSkip: formState.type === CONTENT_TYPES.QUIZ ? Boolean(formState.canSkip) : undefined
      };

      console.log('Submitting content data:', {
        ...contentData,
        contentFile: contentData.contentFile ? `File: ${contentData.contentFile.name}` : null
      });

      // Check if this is a video upload that needs progress tracking
      if (currentConfig.apiType === CONTENT_TYPES.VIDEO && formState.contentFile) {
        console.log('Video upload detected, switching to progress view immediately...');
        
        // Switch to progress view immediately
        setShowUploadProgress(true);
        setIsSubmitting(false);
        
        // Start the actual upload process
        try {
          const result = await dispatch(addContentAsync(contentData)).unwrap();
          console.log('Video upload result:', result);
          
          // Set the content ID for progress tracking
          setUploadedContentId(result.id || result.contentId);
          
        } catch (error) {
          console.error("Video upload failed:", error);
          // If upload fails, show error in progress view
          setShowUploadProgress(false);
          setErrors({ submit: error.message || "Failed to upload video" });
          setIsSubmitting(false);
        }
        
        return; // Exit early to prevent closing modal
      } else {
        // For non-video content, proceed normally
        let result;
        if (isEditing && editingContent) {
          const updateData = {
            contentId: parseInt(editingContent.id),
            ...contentData
          };
          result = await dispatch(updateContentAsync(updateData)).unwrap();
        } else {
          result = await dispatch(addContentAsync(contentData)).unwrap();
        }

        console.log('Content operation result:', result);

        // Check if this is quiz content creation - open quiz modal
        if (result && currentConfig.apiType === CONTENT_TYPES.QUIZ && !isEditing) {
          console.log('Quiz content created, opening quiz modal...');
          
          // Close current modal first
          handleClose();
          
          // Wait a bit then open quiz modal with the created content
          setTimeout(() => {
            // Store quiz data in localStorage for quiz modal
            const quizData = {
              contentId: result.contentId || result.id,
              duration: formState.duration,
              canSkip: formState.canSkip,
              title: formState.description,
              description: formState.contentString || formState.description
            };
            
            localStorage.setItem('pendingQuizData', JSON.stringify(quizData));
            
            // Dispatch action to open quiz modal
            dispatch(setModalOpen({ modal: 'addQuiz', isOpen: true }));
          }, 500);
          
          return;
        }

        // Reload section data and close modal for other content types
        if (result && sectionId) {
          console.log('Content operation successful, reloading section data...');
          const { getSectionsByCourseIdAsync } = await import('@/redux/course/courseSlice');
          await dispatch(getSectionsByCourseIdAsync(courseId));
        }
        handleClose();
      }
      
    } catch (error) {
      console.error("Error saving content:", error);
      setErrors({ submit: error.message || "Failed to save content" });
    } finally {
      setIsSubmitting(false);
    }
  }, [validateForm, sectionId, courseId, formState, isEditing, editingContent, dispatch, CONTENT_TYPES.QUIZ, CONTENT_TYPES.VIDEO, currentConfig.apiType]);

  // Handle upload progress completion
  const handleUploadComplete = useCallback(async (uploadStatus) => {
    console.log('Upload completed:', uploadStatus);
    
    // Reload section data
    if (sectionId && courseId) {
      try {
        const { getSectionsByCourseIdAsync } = await import('@/redux/course/courseSlice');
        await dispatch(getSectionsByCourseIdAsync(courseId));
      } catch (error) {
        console.error('Error reloading sections:', error);
      }
    }
    
    // Close modal
    handleClose();
  }, [sectionId, courseId, dispatch]);

  // Handle upload error
  const handleUploadError = useCallback((error) => {
    console.error('Upload error:', error);
    setShowUploadProgress(false);
    setErrors({ submit: `Video upload failed: ${error}` });
  }, []);

  // Handle back from progress view
  const handleBackToForm = useCallback(() => {
    setShowUploadProgress(false);
    setUploadedContentId(null);
  }, []);

  const handleClose = useCallback(() => {
    dispatch(closeAllModals());
    
    setFormState(initialFormState);
    setErrors({});
    setFilePreview(null);
    setIsSubmitting(false);
    setDragActive(false);
    setShowUploadProgress(false);
    setUploadedContentId(null);
    isInitialized.current = false;
    
    prevIsOpen.current = false;
    prevIsEditing.current = false;
    prevEditingContentId.current = null;
  }, [dispatch, initialFormState]);

  const getSectionName = useCallback(() => {
    if (sections && sectionId) {
      const section = sections.find(s => s.id === sectionId);
      return section?.description || `Section ${sectionId}`;
    }
    return 'Unknown Section';
  }, [sections, sectionId]);

  // Render file upload area
  const renderFileUpload = () => {
    if (!currentConfig.allowFile) return null;

    const fileTypeText = {
      video: 'MP4, MOV, AVI, MKV, WebM up to 500MB',
      file: 'PDF, DOC, DOCX, TXT, ZIP up to 50MB',
      pptx: 'PPT, PPTX up to 100MB'
    };

    return (
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1.5">
          {currentConfig.title.includes("Video") ? "Video File" : 
           currentConfig.title.includes("PowerPoint") ? "PowerPoint File" : 
           "File Upload"} 
          {currentConfig.requiresFile && !isEditing && <span className="text-red-500"> *</span>}
        </label>
        
        {formState.contentFile ? (
          <div className="p-3 border border-gray-300 rounded-lg bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                {filePreview && (formState.contentFile.type.startsWith('image/') || formState.contentFile.type.startsWith('video/')) ? (
                  <div className="relative w-10 h-10 rounded overflow-hidden">
                    {formState.contentFile.type.startsWith('video/') ? (
                      <video 
                        src={filePreview} 
                        className="w-full h-full object-cover"
                        muted
                      />
                    ) : (
                      <img 
                        src={filePreview} 
                        alt="Preview" 
                        className="w-full h-full object-cover" 
                      />
                    )}
                  </div>
                ) : (
                  <currentConfig.icon className={`w-6 h-6 text-${currentConfig.color}-600`} />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900">{formState.contentFile.name}</p>
                  <p className="text-xs text-gray-500">
                    {(formState.contentFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={removeFile}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div
            className={`relative border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
              dragActive 
                ? 'border-[#0AAC9E] bg-[#0AAC9E]/5' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <input
              type="file"
              accept={currentConfig.acceptedFiles}
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <currentConfig.icon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-xs font-medium text-gray-900 mb-1">
              Drop {contentModalType} here or click to browse
            </p>
            <p className="text-xs text-gray-500">
              {fileTypeText[contentModalType] || 'Select a file to upload'}
            </p>
          </div>
        )}
        
        {errors.contentFile && (
          <p className="mt-1 text-xs text-red-600 flex items-center">
            <AlertCircle className="w-3 h-3 mr-1" />
            {errors.contentFile}
          </p>
        )}
      </div>
    );
  };

  // Render URL input
  const renderUrlInput = () => {
    if (!currentConfig.allowUrl) return null;

    return (
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1.5">
          URL
          {currentConfig.requiresUrl && <span className="text-red-500"> *</span>}
        </label>
        <div className="relative">
          <input
            type="url"
            value={formState.contentString}
            onChange={(e) => handleInputChange('contentString', e.target.value)}
            placeholder="https://example.com"
            className={`w-full px-3 py-2.5 pl-9 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
              errors.contentString
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-300 focus:ring-[#0AAC9E]'
            }`}
          />
          <Link className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-400" />
          {formState.contentString && !errors.contentString && isValidUrl(formState.contentString) && (
            <CheckCircle className="absolute right-2.5 top-2.5 w-4 h-4 text-green-500" />
          )}
        </div>
        {errors.contentString && (
          <p className="mt-1 text-xs text-red-600 flex items-center">
            <AlertCircle className="w-3 h-3 mr-1" />
            {errors.contentString}
          </p>
        )}
        {formState.contentString && isValidUrl(formState.contentString) && (
          <div className="mt-2 p-2.5 bg-gray-50 rounded-lg">
            <a 
              href={formState.contentString} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-[#0AAC9E] hover:underline flex items-center"
            >
              <Eye className="w-3 h-3 mr-1" />
              Preview link
            </a>
          </div>
        )}
      </div>
    );
  };

  // Text input renderer - Updated to use SimpleRichTextEditor for page content
  const renderTextInput = () => {
    if (!currentConfig.requiresText || currentConfig.apiType === CONTENT_TYPES.QUIZ) return null;

    const labelText = contentModalType === 'page' ? 'Page Content' : "Content";
    const placeholderText = contentModalType === 'page' ? 'Enter your page content here...' : 'Enter your text content here...';

    // Use rich text editor for page content, regular textarea for others
    if (contentModalType === 'page') {
      return (
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-2">
            {labelText} <span className="text-red-500">*</span>
          </label>
          <div className={`${errors.contentString ? 'ring-2 ring-red-300 rounded-lg' : ''}`}>
            <SimpleRichTextEditor
              value={formState.contentString}
              onChange={(content) => handleInputChange('contentString', content)}
              placeholder={placeholderText}
              minHeight={200}
              readOnly={false}
            />
          </div>
          {errors.contentString && (
            <p className="mt-2 text-xs text-red-600 flex items-center">
              <AlertCircle className="w-3 h-3 mr-1" />
              {errors.contentString}
            </p>
          )}
          <div className="mt-2 flex justify-between text-xs text-gray-500">
            <span>Use the toolbar above to format your content with headings, lists, links, and more.</span>
            <span>{stripHtmlTags(formState.contentString).length} characters</span>
          </div>
        </div>
      );
    }

    // Regular textarea for non-page content
    return (
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1.5">
          {labelText} <span className="text-red-500"> *</span>
        </label>
        <textarea
          value={formState.contentString}
          onChange={(e) => handleInputChange('contentString', e.target.value)}
          placeholder={placeholderText}
          rows={6}
          className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-colors resize-none ${
            errors.contentString
              ? 'border-red-300 focus:ring-red-500'
              : 'border-gray-300 focus:ring-[#0AAC9E]'
          }`}
        />
        {errors.contentString && (
          <p className="mt-1 text-xs text-red-600 flex items-center">
            <AlertCircle className="w-3 h-3 mr-1" />
            {errors.contentString}
          </p>
        )}
      </div>
    );
  };

  // Quiz specific fields renderer
  const renderQuizFields = () => {
    if (currentConfig.apiType !== CONTENT_TYPES.QUIZ) return null;

    return (
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            <Timer className="w-4 h-4 inline mr-1" />
            Duration (minutes)
          </label>
          <input
            type="number"
            min="1"
            max="300"
            value={formState.duration}
            onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 20)}
            className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
              errors.duration
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-300 focus:ring-[#0AAC9E]'
            }`}
          />
          {errors.duration && (
            <p className="mt-1 text-xs text-red-600 flex items-center">
              <AlertCircle className="w-3 h-3 mr-1" />
              {errors.duration}
            </p>
          )}
        </div>
        <div className="flex items-end">
          <label className="flex items-center text-sm">
            <input
              type="checkbox"
              checked={formState.canSkip}
              onChange={(e) => handleInputChange('canSkip', e.target.checked)}
              className="w-4 h-4 text-[#0AAC9E] border-gray-300 rounded mr-2"
            />
            Allow Skip
          </label>
        </div>
      </div>
    );
  };

  if (!isOpen || !contentModalType) return null;

  const Icon = currentConfig.icon;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden border border-gray-100">
        
        {/* Enhanced Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-br from-[#0AAC9E]/8 via-white to-[#0AAC9E]/5">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 bg-${currentConfig.color}-100 rounded-xl flex items-center justify-center ring-2 ring-${currentConfig.color}-50`}>
              <Icon className={`w-4 h-5 text-${currentConfig.color}-600`} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {showUploadProgress ? 'Video Upload Progress' : 
                 isEditing ? `Edit ${currentConfig.title}` : `Add ${currentConfig.title}`}
              </h2>
              <p className="text-xs text-gray-600">
                {showUploadProgress ? 'Video is being processed for streaming' :
                 currentConfig.description}
                {!showUploadProgress && currentConfig.apiType === CONTENT_TYPES.QUIZ && (
                  <span className="text-blue-600 ml-2">(Questions configured separately)</span>
                )}
              </p>
            </div>
          </div>
          
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error/Success Messages */}
        {errors.submit && (
          <div className="p-3 bg-red-50 border-b border-red-200">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span className="text-sm text-red-700 flex-1">{errors.submit}</span>
              <button
                onClick={() => setErrors(prev => ({ ...prev, submit: null }))}
                className="p-1 text-red-500 hover:text-red-700 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Conditional Content - Show Progress or Form */}
        {showUploadProgress ? (
          <VideoUploadProgress 
            contentId={uploadedContentId}
            onComplete={handleUploadComplete}
            onError={handleUploadError}
            onBack={handleBackToForm}
          />
        ) : (
          <form onSubmit={handleSubmit} className="max-h-[calc(90vh-140px)] overflow-y-auto">
            <div className="p-5 space-y-5">
              
              {/* Section Info Display */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl px-4 py-3 border border-gray-200">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center text-xs space-x-3">
                    <div>
                      <span className="font-semibold text-gray-700">Section:</span>
                      <span className="text-gray-900 ml-2">{getSectionName()}</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Type: {currentConfig.title} | Section ID: {sectionId || 'No ID'}
                    {isEditing && editingContent && (
                      <span className="ml-2 text-blue-600">Content ID: {editingContent.id}</span>
                    )}
                  </div>
                </div>
                
                {/* ID Status Display */}
                {(!sectionId || !courseId) && (
                  <div className="mt-3">
                    {!courseId && (
                      <div className="text-xs text-red-600 flex items-center mb-2">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Course not created yet. Please complete Step 1 first.
                      </div>
                    )}
                    
                    {!sectionId && (
                      <div className="text-xs text-red-600 flex items-center mb-2">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        No section selected. Please create a section first.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Description Field */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formState.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder={currentConfig.placeholder}
                    className={`w-full px-4 py-3 text-xs border-1 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0AAC9E]/20 transition-all duration-200 ${
                      errors.description
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-gray-200 focus:border-[#0AAC9E] hover:border-gray-300'
                    }`}
                  />
                  {formState.description && !errors.description && (
                    <CheckCircle className="absolute right-3 top-3 w-4 h-5 text-green-500" />
                  )}
                </div>
                {errors.description && (
                  <p className="mt-2 text-xs text-red-600 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.description}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {formState.description?.length || 0}/500 characters
                </p>
              </div>

              {/* Order Field */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  <Hash className="w-4 h-4 inline mr-1" />
                  Display Order
                </label>
                <input
                  type="number"
                  min="1"
                  max="999"
                  value={formState.order || 1}
                  onChange={(e) => handleInputChange('order', parseInt(e.target.value) || 1)}
                  className={`w-full px-4 py-3 text-xs border-1 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0AAC9E]/20 transition-all duration-200 ${
                    errors.order
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-gray-200 focus:border-[#0AAC9E] hover:border-gray-300'
                  }`}
                  placeholder="1"
                />
                {errors.order && (
                  <p className="mt-2 text-xs text-red-600 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.order}
                  </p>
                )}
              </div>

              {/* Content Type Specific Fields */}
              {renderTextInput()}
              {renderUrlInput()}
              {renderFileUpload()}
              {renderQuizFields()}

              {/* Hide Content Setting */}
              <div className="border-t border-gray-200 pt-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-xl border border-gray-200">
                    <div>
                      <label htmlFor="hideContent" className="text-xs font-medium text-gray-900">
                        Hide Content
                      </label>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        id="hideContent"
                        checked={formState.hideContent}
                        onChange={(e) => handleInputChange('hideContent', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#0AAC9E]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0AAC9E]"></div>
                    </label>
                  </div>

                  {/* Only show discussion and meeting options for VIDEO content */}
                  {currentConfig.apiType === CONTENT_TYPES.VIDEO && (
                    <>
                      <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-xl border border-gray-200">
                        <div>
                          <label htmlFor="isDiscussionEnabled" className="text-xs font-medium text-gray-900">
                            Enable Discussions
                          </label>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            id="isDiscussionEnabled"
                            checked={formState.isDiscussionEnabled}
                            onChange={(e) => handleInputChange('isDiscussionEnabled', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#0AAC9E]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0AAC9E]"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-xl border border-gray-200">
                        <div>
                          <label htmlFor="isMeetingAllowed" className="text-xs font-medium text-gray-900">
                            Allow Meetings
                          </label>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            id="isMeetingAllowed"
                            checked={formState.isMeetingAllowed}
                            onChange={(e) => handleInputChange('isMeetingAllowed', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#0AAC9E]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0AAC9E]"></div>
                        </label>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Enhanced File Upload Progress - Show different states */}
              {isSubmitting && formState.contentFile && (
                <div className="space-y-3">
                  {/* Uploading State */}
                  <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Loader2 className="w-5 h-5 text-yellow-600 animate-spin" />
                        <div>
                          <h4 className="text-sm font-semibold text-yellow-900">
                            {currentConfig.apiType === CONTENT_TYPES.VIDEO ? 'Video Uploading' : 'File Uploading'}
                          </h4>
                          <p className="text-xs text-yellow-700">
                            {currentConfig.apiType === CONTENT_TYPES.VIDEO 
                              ? 'Video is being uploaded to server for processing...'
                              : 'File is being uploaded...'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-yellow-600">{formState.contentFile.name}</div>
                        <div className="text-xs text-yellow-500">{(formState.contentFile.size / (1024 * 1024)).toFixed(2)} MB</div>
                      </div>
                    </div>
                    
                    {/* Progress bar for upload */}
                    <div className="mt-3">
                      <div className="w-full bg-yellow-200 rounded-full h-2">
                        <div className="h-full bg-yellow-500 rounded-full transition-all duration-1000 animate-pulse" style={{width: '60%'}} />
                      </div>
                      <div className="flex justify-between text-xs text-yellow-600 mt-1">
                        <span>Uploading...</span>
                        <span>~60%</span>
                      </div>
                    </div>
                  </div>

                  {/* Next Steps Info for Video */}
                  {currentConfig.apiType === CONTENT_TYPES.VIDEO && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-start space-x-2">
                        <FileVideo className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h5 className="text-xs font-semibold text-blue-900">Next Steps</h5>
                          <div className="text-xs text-blue-700 mt-1 space-y-1">
                            <div className="flex items-center">
                              <div className="w-1 h-1 bg-blue-400 rounded-full mr-2"></div>
                              Video will be uploaded and formatted
                            </div>
                            <div className="flex items-center">
                              <div className="w-1 h-1 bg-blue-400 rounded-full mr-2"></div>
                              HLS segments will be created
                            </div>
                            <div className="flex items-center">
                              <div className="w-1 h-1 bg-blue-400 rounded-full mr-2"></div>
                              Ready for streaming
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Content Preview (if URL) */}
              {formState.contentString && isValidUrl(formState.contentString) && currentConfig.allowUrl && (
                <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <Globe className="w-5 h-5 text-gray-600 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Content Preview</h4>
                      <div className="text-xs text-gray-600 break-all bg-white p-2 rounded border">
                        {formState.contentString}
                      </div>
                      <a 
                        href={formState.contentString} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center mt-2 text-xs text-[#0AAC9E] hover:underline"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Open in new tab
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Content Preview for Rich Text (Page Content) */}
              {formState.contentString && contentModalType === 'page' && (
                <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <Monitor className="w-5 h-5 text-gray-600 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Page Content Preview</h4>
                      <div 
                        className="text-xs text-gray-700 bg-white p-3 rounded border max-h-40 overflow-y-auto prose prose-sm"
                        dangerouslySetInnerHTML={{ __html: formState.contentString }}
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Character count: {stripHtmlTags(formState.contentString).length} characters
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Success Message - Enhanced for different content types */}
              {formState.contentFile && !errors.contentFile && !isSubmitting && (
                <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-green-600 font-medium">
                        {currentConfig.apiType === CONTENT_TYPES.VIDEO ? 'Video Ready' : 'File Ready'}
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        {formState.contentFile.name} ({(formState.contentFile.size / (1024 * 1024)).toFixed(2)} MB)
                      </p>
                      {currentConfig.apiType === CONTENT_TYPES.VIDEO && (
                        <p className="text-xs text-green-600 mt-1">
                          Video will be processed automatically after upload
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Action Buttons */}
            <div className="flex space-x-3 px-5 py-4 bg-gray-50 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 text-xs font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !sectionId}
                className="flex-1 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-[#0AAC9E] to-[#0AAC9E]/90 rounded-xl hover:from-[#0AAC9E]/90 hover:to-[#0AAC9E] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isEditing ? 'Updating...' : 'Adding...'}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {currentConfig.apiType === CONTENT_TYPES.QUIZ && !isEditing ? 'Create Quiz' : 
                     isEditing ? 'Update Content' : 'Add Content'}
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Loading Overlay for Quiz Creation */}
        {isSubmitting && currentConfig.apiType === CONTENT_TYPES.QUIZ && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center space-y-3">
              <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                <HelpCircle className="w-6 h-6 text-white" />
              </div>
              <div className="text-center">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">Creating Quiz...</h3>
                <p className="text-xs text-gray-600">Quiz modal will open next</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentModal;