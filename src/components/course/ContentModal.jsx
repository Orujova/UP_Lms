import React, { useState, useEffect } from "react";
import { 
  X, 
  Upload, 
  Link, 
  FileText, 
  Video, 
  File, 
  AlertCircle, 
  CheckCircle,
  Globe,
  BookOpen,
  Info,
  Eye,
  Loader
} from "lucide-react";

const ContentModal = () => {
  // Mock Redux state - replace with actual Redux hooks
  const [modals, setModals] = useState({ addContent: true, editContent: false });
  const [contentModalType] = useState("page"); // page, text, url, file, video
  const [editingContent] = useState(null);
  const [activeSection] = useState("section-1");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    url: "",
    file: null,
    textContent: "",
    htmlContent: "",
  });

  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const isOpen = modals.addContent || modals.editContent;
  const isEditing = modals.editContent && editingContent;

  const handleClose = () => {
    // Reset form data
    setFormData({
      title: "",
      description: "",
      content: "",
      url: "",
      file: null,
      textContent: "",
      htmlContent: "",
    });
    setErrors({});
    setIsSubmitting(false);
    setUploadProgress(0);
    
    // Close the modal by updating the state
    setModals({ addContent: false, editContent: false });
    
    // In a real Redux app, you would dispatch an action like:
    // dispatch(closeContentModal());
  };

  const validateForm = () => {
    const newErrors = {};

    switch (contentModalType) {
      case "page":
        if (!formData.title.trim()) {
          newErrors.title = "Page title is required";
        }
        if (!formData.description.trim()) {
          newErrors.description = "Page description is required";
        }
        break;

      case "text":
        if (!formData.textContent.trim()) {
          newErrors.textContent = "Text content is required";
        }
        break;

      case "url":
        if (!formData.url.trim()) {
          newErrors.url = "URL is required";
        } else if (!isValidUrl(formData.url)) {
          newErrors.url = "Please enter a valid URL starting with http:// or https://";
        }
        break;

      case "file":
      case "video":
        if (!formData.file && !isEditing) {
          newErrors.file = `${contentModalType === "video" ? "Video" : "File"} is required`;
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!activeSection || !validateForm()) return;

    setIsSubmitting(true);
    setUploadProgress(10);

    try {
      // Simulate upload progress
      const intervals = [30, 60, 80, 100];
      for (let i = 0; i < intervals.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 300));
        setUploadProgress(intervals[i]);
      }

      await new Promise(resolve => setTimeout(resolve, 500));
      handleClose();
    } catch (error) {
      setErrors({ submit: "Failed to save content. Please try again." });
      setUploadProgress(0);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (file) => {
    if (file) {
      const maxSize = contentModalType === "video" ? 500 * 1024 * 1024 : 100 * 1024 * 1024;
      
      if (file.size > maxSize) {
        setErrors({ file: `File size must be less than ${maxSize / (1024 * 1024)}MB` });
        return;
      }

      if (contentModalType === "video" && !file.type.startsWith("video/")) {
        setErrors({ file: "Please select a valid video file" });
        return;
      }

      setFormData((prev) => ({ ...prev, file }));
      setErrors({ ...errors, file: "" });
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  };

  const getModalConfig = () => {
    const configs = {
      page: {
        title: "Page Content",
        icon: FileText,
        description: "Create rich, engaging learning content"
      },
      text: {
        title: "Text Block",
        icon: BookOpen,
        description: "Add clear, concise text information"
      },
      url: {
        title: "Web Link",
        icon: Globe,
        description: "Link to valuable external resources"
      },
      file: {
        title: "File Upload",
        icon: File,
        description: "Share important documents and resources"
      },
      video: {
        title: "Video Upload",
        icon: Video,
        description: "Add engaging video content"
      }
    };
    return configs[contentModalType] || configs.page;
  };

  const config = getModalConfig();
  const Icon = config.icon;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-hidden border border-gray-200">
        
        {/* Compact Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-[#0AAC9E]/5 to-[#0AAC9E]/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#0AAC9E]/20 rounded-lg flex items-center justify-center">
              <Icon className="w-4 h-4 text-[#0AAC9E]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">
                {isEditing ? "Edit" : "Add"} {config.title}
              </h2>
              <p className="text-xs text-gray-600">{config.description}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isSubmitting && uploadProgress > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-12 bg-gray-200 rounded-full h-1">
                  <div 
                    className="bg-[#0AAC9E] h-1 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-[#0AAC9E]">{uploadProgress}%</span>
              </div>
            )}
            
            <button
              onClick={handleClose}
              className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
              disabled={isSubmitting}
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Compact Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(85vh-140px)]">
          {errors.submit && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span className="text-red-700 text-xs font-medium">{errors.submit}</span>
              </div>
            </div>
          )}

          {contentModalType === "page" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-2">
                  Page Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter page title"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0AAC9E]/20 focus:border-[#0AAC9E] text-xs transition-all duration-200 ${
                    errors.title 
                      ? "border-red-300 bg-red-25" 
                      : "border-gray-200 hover:border-[#0AAC9E]/50 bg-gray-50 focus:bg-white"
                  }`}
                />
                {errors.title && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.title}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description"
                  rows={2}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0AAC9E]/20 focus:border-[#0AAC9E] resize-none text-xs transition-all duration-200 ${
                    errors.description 
                      ? "border-red-300 bg-red-25" 
                      : "border-gray-200 hover:border-[#0AAC9E]/50 bg-gray-50 focus:bg-white"
                  }`}
                />
                {errors.description && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.description}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-2">
                  Content
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                  placeholder="Enter content..."
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0AAC9E]/20 focus:border-[#0AAC9E] resize-none text-xs hover:border-[#0AAC9E]/50 bg-gray-50 focus:bg-white transition-all duration-200"
                />
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Info className="w-3 h-3" />
                    <span>Markdown supported</span>
                  </div>
                  <span className="text-xs text-gray-400">{formData.content.length}/5000</span>
                </div>
              </div>
            </div>
          )}

          {contentModalType === "text" && (
            <div>
              <label className="block text-xs font-semibold text-gray-900 mb-2">
                Text Content <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.textContent}
                onChange={(e) => setFormData((prev) => ({ ...prev, textContent: e.target.value }))}
                placeholder="Enter text content..."
                rows={8}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0AAC9E]/20 focus:border-[#0AAC9E] resize-none text-xs transition-all duration-200 ${
                  errors.textContent 
                    ? "border-red-300 bg-red-25" 
                    : "border-gray-200 hover:border-[#0AAC9E]/50 bg-gray-50 focus:bg-white"
                }`}
              />
              {errors.textContent && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.textContent}
                </p>
              )}
              <div className="flex justify-between mt-2">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <BookOpen className="w-3 h-3" />
                  <span>Plain text</span>
                </div>
                <span className="text-xs text-gray-400">{formData.textContent.length}/2000</span>
              </div>
            </div>
          )}

          {contentModalType === "url" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-2">
                  Web URL <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData((prev) => ({ ...prev, url: e.target.value }))}
                    placeholder="https://example.com"
                    className={`w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0AAC9E]/20 focus:border-[#0AAC9E] text-xs transition-all duration-200 ${
                      errors.url 
                        ? "border-red-300 bg-red-25" 
                        : "border-gray-200 hover:border-[#0AAC9E]/50 bg-gray-50 focus:bg-white"
                    }`}
                  />
                </div>
                {errors.url && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.url}
                  </p>
                )}
              </div>
              
              {formData.url && isValidUrl(formData.url) && (
                <div className="p-3 bg-[#0AAC9E]/5 border border-[#0AAC9E]/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#0AAC9E]" />
                      <div>
                        <p className="text-[#0AAC9E] font-semibold text-xs">Valid URL</p>
                        <p className="text-gray-600 text-xs">Opens in new tab</p>
                      </div>
                    </div>
                    <a
                      href={formData.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-2 py-1 bg-[#0AAC9E] text-white rounded-md hover:bg-[#0AAC9E]/90 transition-colors text-xs"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Test</span>
                    </a>
                  </div>
                </div>
              )}

              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <h4 className="text-xs font-semibold text-gray-900 mb-2">Guidelines</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li className="flex items-start gap-1">
                    <div className="w-1 h-1 bg-[#0AAC9E] rounded-full mt-1.5 flex-shrink-0" />
                    <span>Ensure URL is accessible</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <div className="w-1 h-1 bg-[#0AAC9E] rounded-full mt-1.5 flex-shrink-0" />
                    <span>Check login requirements</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {(contentModalType === "file" || contentModalType === "video") && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-2">
                  {contentModalType === "video" ? "Video File" : "File Upload"} <span className="text-red-500">*</span>
                </label>

                {formData.file ? (
                  <div className="border border-[#0AAC9E]/20 rounded-lg p-3 bg-[#0AAC9E]/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#0AAC9E]/20 rounded-lg flex items-center justify-center">
                          {contentModalType === "video" ? (
                            <Video className="w-4 h-4 text-[#0AAC9E]" />
                          ) : (
                            <File className="w-4 h-4 text-[#0AAC9E]" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-xs">
                            {formData.file.name}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                            <span>{(formData.file.size / 1024 / 1024).toFixed(1)} MB</span>
                            <span>•</span>
                            <span>{formData.file.type}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setFormData((prev) => ({ ...prev, file: null }))}
                        className="p-1 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`border-2 border-dashed rounded-lg p-4 text-center transition-all duration-200 ${
                      dragActive
                        ? "border-[#0AAC9E] bg-[#0AAC9E]/10"
                        : "border-gray-300 hover:border-[#0AAC9E] hover:bg-[#0AAC9E]/5"
                    } ${errors.file ? "border-red-300 bg-red-50" : ""}`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragActive(true);
                    }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={handleDrop}
                  >
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 transition-all duration-200 ${
                        dragActive ? "bg-[#0AAC9E] text-white" : "bg-[#0AAC9E]/10 text-[#0AAC9E]"
                      }`}>
                        <Upload className="w-5 h-5" />
                      </div>
                      <p className="text-xs text-gray-900 mb-1 font-semibold">
                        {dragActive ? "Drop file here" : `Upload ${contentModalType}`}
                      </p>
                      <p className="text-xs text-gray-600 mb-2">
                        Drag & drop or{" "}
                        <label className="text-[#0AAC9E] hover:text-[#0AAC9E]/80 cursor-pointer font-semibold underline">
                          browse
                          <input
                            type="file"
                            accept={contentModalType === "video" ? "video/*" : "*/*"}
                            onChange={(e) => handleFileUpload(e.target.files[0])}
                            className="hidden"
                          />
                        </label>
                      </p>
                      <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        <Info className="w-3 h-3" />
                        <span>
                          {contentModalType === "video" ? "Video up to 500MB" : "Files up to 100MB"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                {errors.file && (
                  <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.file}
                  </p>
                )}
              </div>

              {(formData.file || isEditing) && (
                <div>
                  <label className="block text-xs font-semibold text-gray-900 mb-2">
                    Description <span className="text-gray-500">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="File description"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0AAC9E]/20 focus:border-[#0AAC9E] text-xs hover:border-[#0AAC9E]/50 bg-gray-50 focus:bg-white transition-all duration-200"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Compact Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleClose}
            className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 hover:border-gray-400 transition-all duration-200 text-xs font-medium"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSubmitting || !Object.keys(errors).every(key => !errors[key])}
            className="px-4 py-1.5 bg-[#0AAC9E] text-white rounded-lg hover:bg-[#0AAC9E]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg text-xs font-medium transform hover:scale-105 disabled:transform-none flex items-center gap-1"
          >
            {isSubmitting ? (
              <>
                <Loader className="w-3 h-3 animate-spin" />
                <span>
                  {uploadProgress < 100 ? `${uploadProgress}%` : "Done"}
                </span>
              </>
            ) : (
              <>
                <CheckCircle className="w-3 h-3" />
                <span>{isEditing ? "Update" : "Add"}</span>
              </>
            )}
          </button>
        </div>

        {/* Compact Success Overlay */}
        {isSubmitting && uploadProgress === 100 && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center rounded-xl">
            <div className="text-center">
              <div className="w-12 h-12 bg-[#0AAC9E]/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="w-6 h-6 text-[#0AAC9E]" />
              </div>
              <p className="text-sm font-semibold text-gray-900 mb-1">Saved!</p>
              <p className="text-xs text-gray-600">Redirecting...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentModal;