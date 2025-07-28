'use client'
import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { 
  X, 
  Upload, 
  Video, 
  FileText, 
  Globe, 
  File,
  AlertCircle, 
  CheckCircle,
  Loader2,
  Save,
  Link,
  Eye
} from "lucide-react";
import {
  addContentAsync,
  updateContentAsync,
  setModalOpen
} from "@/redux/course/courseSlice";

const ContentModal = () => {
  const dispatch = useDispatch();
  
  // Redux state
  const { 
    modals, 
    activeSection,
    editingContent,
    contentModalType,
    loading 
  } = useSelector((state) => state.course || {});
  
  const isOpen = modals?.addContent || modals?.editContent || false;
  const isEditing = modals?.editContent || false;
  
  // Local state - matching exact API field structure for CourseContent/AddContent
  const [formData, setFormData] = useState({
    courseSectionId: null,
    description: "",
    hideContent: false,
    isDiscussionEnabled: false,
    isMeetingAllowed: false,
    type: 0, // API content type enum (integer)
    contentString: "",
    contentFile: null
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filePreview, setFilePreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // Content type enum mapping (exact from API documentation)
  const CONTENT_TYPES = {
    PAGE: 0,
    TEXT_BOX: 1,
    QUIZ: 2,
    WEB_URL: 3,
    VIDEO: 4,
    OTHER_FILE: 5,
    PPTX: 6
  };

  // Get content type configuration
  const getContentTypeConfig = (type) => {
    const configs = {
      video: {
        icon: Video,
        title: "Video Content",
        description: "Upload video file or provide YouTube/Vimeo link",
        color: "red",
        acceptedFiles: "video/*,.mp4,.mov,.avi,.mkv,.webm",
        maxSize: 500 * 1024 * 1024, // 500MB
        placeholder: "Enter video description...",
        apiType: CONTENT_TYPES.VIDEO
      },
      text: {
        icon: FileText,
        title: "Text Content",
        description: "Rich text content and documents",
        color: "blue",
        acceptedFiles: null,
        maxSize: null,
        placeholder: "Enter text content description...",
        apiType: CONTENT_TYPES.TEXT_BOX
      },
      url: {
        icon: Globe,
        title: "External Link",
        description: "Link to external websites and resources",
        color: "green",
        acceptedFiles: null,
        maxSize: null,
        placeholder: "Enter link description...",
        apiType: CONTENT_TYPES.WEB_URL
      },
      file: {
        icon: File,
        title: "File Upload",
        description: "Documents, PDFs, presentations and other files",
        color: "purple",
        acceptedFiles: ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt",
        maxSize: 50 * 1024 * 1024, // 50MB
        placeholder: "Enter file description...",
        apiType: CONTENT_TYPES.OTHER_FILE
      }
    };
    return configs[type] || configs.text;
  };

  const currentConfig = getContentTypeConfig(contentModalType);

  // Initialize form data
  useEffect(() => {
    if (isOpen) {
      if (isEditing && editingContent) {
        setFormData({
          courseSectionId: editingContent.courseSectionId || activeSection,
          description: editingContent.description || "",
          hideContent: editingContent.hideContent || false,
          isDiscussionEnabled: editingContent.isDiscussionEnabled || false,
          isMeetingAllowed: editingContent.isMeetingAllowed || false,
          type: currentConfig.apiType,
          contentString: editingContent.contentString || editingContent.data || "",
          contentFile: null // File will be handled separately for editing
        });
      } else {
        // Reset for new content
        setFormData({
          courseSectionId: activeSection,
          description: "",
          hideContent: false,
          isDiscussionEnabled: false,
          isMeetingAllowed: false,
          type: currentConfig.apiType,
          contentString: "",
          contentFile: null
        });
      }
      setErrors({});
      setFilePreview(null);
      setDragActive(false);
    }
  }, [isOpen, isEditing, editingContent, activeSection, currentConfig, contentModalType]);

  // Validation - API requirements
  const validateForm = () => {
    const newErrors = {};
    
    // Description is required
    if (!formData.description?.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.length > 500) {
      newErrors.description = "Description must be less than 500 characters";
    }

    // CourseSectionId is required
    if (!formData.courseSectionId) {
      newErrors.courseSectionId = "Section ID is required";
    }
    
    // Type-specific validation
    switch (contentModalType) {
      case 'video':
        if (!formData.contentString?.trim() && !formData.contentFile) {
          newErrors.content = "Please provide a video URL or upload a video file";
        }
        if (formData.contentString && !isValidUrl(formData.contentString)) {
          newErrors.contentString = "Please enter a valid URL";
        }
        break;
        
      case 'text':
        if (!formData.contentString?.trim()) {
          newErrors.contentString = "Text content is required";
        }
        break;
        
      case 'url':
        if (!formData.contentString?.trim()) {
          newErrors.contentString = "URL is required";
        } else if (!isValidUrl(formData.contentString)) {
          newErrors.contentString = "Please enter a valid URL";
        }
        break;
        
      case 'file':
        if (!formData.contentFile && !isEditing) {
          newErrors.contentFile = "Please select a file to upload";
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // File upload handlers
  const handleFileUpload = useCallback((file) => {
    if (!file) return;

    const config = currentConfig;
    
    // Validate file type
    if (config.acceptedFiles) {
      const extensions = config.acceptedFiles.split(',').map(ext => ext.trim());
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
      
      if (!extensions.includes(fileExtension) && !extensions.includes(file.type)) {
        setErrors(prev => ({ ...prev, contentFile: 'Invalid file type' }));
        return;
      }
    }

    // Validate file size
    if (config.maxSize && file.size > config.maxSize) {
      const sizeMB = Math.round(config.maxSize / (1024 * 1024));
      setErrors(prev => ({ ...prev, contentFile: `File size must be less than ${sizeMB}MB` }));
      return;
    }

    setErrors(prev => ({ ...prev, contentFile: null }));
    setFormData(prev => ({ ...prev, contentFile: file }));

    // Create preview for images
    if (file.type.startsWith('image/')) {
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

  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const removeFile = () => {
    setFormData(prev => ({ ...prev, contentFile: null }));
    setFilePreview(null);
    setErrors(prev => ({ ...prev, contentFile: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Prepare content data exactly as API expects (multipart/form-data structure)
      const contentData = {
        // Required fields
        courseSectionId: parseInt(formData.courseSectionId), // integer($int32)
        type: parseInt(formData.type), // integer($int32) - content type enum
        hideContent: Boolean(formData.hideContent), // boolean
        isDiscussionEnabled: Boolean(formData.isDiscussionEnabled), // boolean
        isMeetingAllowed: Boolean(formData.isMeetingAllowed), // boolean
        
        // Optional fields
        description: formData.description || "", // string
        contentString: formData.contentString || "", // string
        contentFile: formData.contentFile || null // file
      };

      if (isEditing && editingContent) {
        // Update existing content - use CourseContent/update-content endpoint
        const updateData = {
          contentId: parseInt(editingContent.id), // Required for update
          ...contentData
        };
        await dispatch(updateContentAsync(updateData)).unwrap();
      } else {
        // Create new content - use CourseContent/AddContent endpoint
        await dispatch(addContentAsync(contentData)).unwrap();
      }
      
      handleClose();
    } catch (error) {
      console.error("Error saving content:", error);
      setErrors({ submit: error.message || "Failed to save content" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    dispatch(setModalOpen({ modal: 'addContent', isOpen: false }));
    dispatch(setModalOpen({ modal: 'editContent', isOpen: false }));
    setFormData({
      courseSectionId: null,
      description: "",
      hideContent: false,
      isDiscussionEnabled: false,
      isMeetingAllowed: false,
      type: 0,
      contentString: "",
      contentFile: null
    });
    setErrors({});
    setFilePreview(null);
    setIsSubmitting(false);
    setDragActive(false);
  };

  if (!isOpen || !contentModalType) return null;

  const Icon = currentConfig.icon;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-[#0AAC9E]/5 to-[#0AAC9E]/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 bg-${currentConfig.color}-100 rounded-lg flex items-center justify-center`}>
                <Icon className={`w-5 h-5 text-${currentConfig.color}-600`} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {isEditing ? `Edit ${currentConfig.title}` : `Add ${currentConfig.title}`}
                </h2>
                <p className="text-sm text-gray-600">
                  {currentConfig.description}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="max-h-[calc(90vh-120px)] overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Description - Required API field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder={currentConfig.placeholder}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                    errors.description
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-[#0AAC9E]'
                  }`}
                />
                {formData.description && !errors.description && (
                  <CheckCircle className="absolute right-3 top-3.5 w-5 h-5 text-green-500" />
                )}
              </div>
              {errors.description && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.description}
                </p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                {formData.description?.length || 0}/500 characters
              </p>
            </div>

            {/* Content Type Specific Fields */}
            {contentModalType === 'text' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.contentString}
                  onChange={(e) => handleInputChange('contentString', e.target.value)}
                  placeholder="Enter your text content here..."
                  rows={8}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors resize-none ${
                    errors.contentString
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-[#0AAC9E]'
                  }`}
                />
                {errors.contentString && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.contentString}
                  </p>
                )}
              </div>
            )}

            {contentModalType === 'url' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={formData.contentString}
                    onChange={(e) => handleInputChange('contentString', e.target.value)}
                    placeholder="https://example.com"
                    className={`w-full px-4 py-3 pl-10 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                      errors.contentString
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-[#0AAC9E]'
                    }`}
                  />
                  <Link className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                  {formData.contentString && !errors.contentString && isValidUrl(formData.contentString) && (
                    <CheckCircle className="absolute right-3 top-3.5 w-5 h-5 text-green-500" />
                  )}
                </div>
                {errors.contentString && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.contentString}
                  </p>
                )}
                {formData.contentString && isValidUrl(formData.contentString) && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    <a 
                      href={formData.contentString} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-[#0AAC9E] hover:underline flex items-center"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Preview link
                    </a>
                  </div>
                )}
              </div>
            )}

            {contentModalType === 'video' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Video Source <span className="text-red-500">*</span>
                  </label>
                  
                  {/* URL Input */}
                  <div className="mb-4">
                    <label className="text-sm text-gray-600 mb-2 block">Video URL (YouTube, Vimeo, etc.)</label>
                    <div className="relative">
                      <input
                        type="url"
                        value={formData.contentString}
                        onChange={(e) => handleInputChange('contentString', e.target.value)}
                        placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                        className={`w-full px-4 py-3 pl-10 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                          errors.contentString
                            ? 'border-red-300 focus:ring-red-500'
                            : 'border-gray-300 focus:ring-[#0AAC9E]'
                        }`}
                      />
                      <Video className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                  <div className="text-center text-gray-500 text-sm mb-4">OR</div>

                  {/* File Upload */}
                  <div>
                    <label className="text-sm text-gray-600 mb-2 block">Upload Video File</label>
                    {formData.contentFile ? (
                      <div className="p-4 border border-gray-300 rounded-lg bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Video className="w-8 h-8 text-red-600" />
                            <div>
                              <p className="font-medium text-gray-900">{formData.contentFile.name}</p>
                              <p className="text-sm text-gray-500">
                                {(formData.contentFile.size / (1024 * 1024)).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={removeFile}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
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
                        <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          Drop video here, or click to browse
                        </p>
                        <p className="text-xs text-gray-500">
                          MP4, MOV, AVI, MKV, WebM up to 500MB
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                {errors.content && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.content}
                  </p>
                )}
              </div>
            )}

            {contentModalType === 'file' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File Upload <span className="text-red-500">*</span>
                </label>
                
                {formData.contentFile ? (
                  <div className="p-4 border border-gray-300 rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {filePreview ? (
                          <img src={filePreview} alt="Preview" className="w-12 h-12 object-cover rounded" />
                        ) : (
                          <File className="w-8 h-8 text-purple-600" />
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{formData.contentFile.name}</p>
                          <p className="text-sm text-gray-500">
                            {(formData.contentFile.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={removeFile}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
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
                    <File className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      Drop file here, or click to browse
                    </p>
                    <p className="text-xs text-gray-500">
                      PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX up to 50MB
                    </p>
                  </div>
                )}
                
                {errors.contentFile && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.contentFile}
                  </p>
                )}
              </div>
            )}

            {/* Content Settings - API boolean fields */}
            <div className="space-y-4 border-t border-gray-200 pt-6">
              <h3 className="text-sm font-medium text-gray-700">Content Settings</h3>
              
              <div className="grid grid-cols-1 gap-3">
                {/* Hide Content - API field: hideContent (boolean) */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label htmlFor="hideContent" className="text-sm font-medium text-gray-900">
                      Hide Content
                    </label>
                    <p className="text-xs text-gray-500">Content will not be visible to learners</p>
                  </div>
                  <input
                    type="checkbox"
                    id="hideContent"
                    checked={formData.hideContent}
                    onChange={(e) => handleInputChange('hideContent', e.target.checked)}
                    className="w-4 h-4 text-[#0AAC9E] border-gray-300 rounded focus:ring-[#0AAC9E]"
                  />
                </div>

                {/* Discussion Enabled - API field: isDiscussionEnabled (boolean) */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label htmlFor="isDiscussionEnabled" className="text-sm font-medium text-gray-900">
                      Enable Discussions
                    </label>
                    <p className="text-xs text-gray-500">Allow learners to discuss this content</p>
                  </div>
                  <input
                    type="checkbox"
                    id="isDiscussionEnabled"
                    checked={formData.isDiscussionEnabled}
                    onChange={(e) => handleInputChange('isDiscussionEnabled', e.target.checked)}
                    className="w-4 h-4 text-[#0AAC9E] border-gray-300 rounded focus:ring-[#0AAC9E]"
                  />
                </div>

                {/* Meeting Allowed - API field: isMeetingAllowed (boolean) */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label htmlFor="isMeetingAllowed" className="text-sm font-medium text-gray-900">
                      Allow Meetings
                    </label>
                    <p className="text-xs text-gray-500">Enable meeting requests for this content</p>
                  </div>
                  <input
                    type="checkbox"
                    id="isMeetingAllowed"
                    checked={formData.isMeetingAllowed}
                    onChange={(e) => handleInputChange('isMeetingAllowed', e.target.checked)}
                    className="w-4 h-4 text-[#0AAC9E] border-gray-300 rounded focus:ring-[#0AAC9E]"
                  />
                </div>
              </div>
            </div>

            {/* Error Messages */}
            {errors.submit && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {errors.submit}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 p-6 bg-gray-50 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || Object.keys(errors).filter(k => k !== 'submit').length > 0}
              className="flex-1 px-4 py-3 text-sm font-medium text-white bg-[#0AAC9E] rounded-lg hover:bg-[#0AAC9E]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isEditing ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEditing ? 'Update Content' : 'Add Content'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContentModal;