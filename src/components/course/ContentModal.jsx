import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { 
  X, 
  Upload, 
  Link, 
  FileText, 
  Video, 
  File, 
  AlertCircle, 
  CheckCircle,
  Image as ImageIcon,
  Globe,
  Camera,
  Paperclip
} from "lucide-react";
import {
  setModalOpen,
  addContentToSection,
  updateContentInSection,
  setEditingContent,
  setContentModalType,
  closeAllModals,
} from "@/redux/course/courseSlice";

const ContentModal = () => {
  const dispatch = useDispatch();
  const { modals, contentModalType, editingContent, activeSection } =
    useSelector((state) => state.course);

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
  
  const isOpen = modals.addContent || modals.editContent;
  const isEditing = modals.editContent && editingContent;

  useEffect(() => {
    if (isEditing) {
      // Populate form with existing content data
      switch (contentModalType) {
        case "page":
          try {
            const pageData =
              typeof editingContent.contentString === "string"
                ? JSON.parse(editingContent.contentString)
                : editingContent;
            setFormData({
              title: pageData.title || "",
              description: pageData.description || "",
              content: pageData.content || "",
              url: "",
              file: null,
              textContent: "",
              htmlContent: pageData.htmlContent || "",
            });
          } catch {
            setFormData({
              title: editingContent.title || "",
              description: editingContent.description || "",
              content: "",
              url: "",
              file: null,
              textContent: "",
              htmlContent: "",
            });
          }
          break;
        case "text":
          setFormData({
            title: "",
            description: "",
            content: "",
            url: "",
            file: null,
            textContent: editingContent.contentString || "",
            htmlContent: "",
          });
          break;
        case "url":
          setFormData({
            title: "",
            description: "",
            content: "",
            url: editingContent.contentString || editingContent.url || "",
            file: null,
            textContent: "",
            htmlContent: "",
          });
          break;
        case "file":
        case "video":
          setFormData({
            title: editingContent.fileName || "",
            description: editingContent.description || "",
            content: "",
            url: "",
            file: null, // Don't pre-populate file
            textContent: "",
            htmlContent: "",
          });
          break;
      }
    } else {
      // Reset form for new content
      setFormData({
        title: "",
        description: "",
        content: "",
        url: "",
        file: null,
        textContent: "",
        htmlContent: "",
      });
    }
    setErrors({});
  }, [isEditing, editingContent, contentModalType]);

  const handleClose = () => {
    dispatch(closeAllModals());
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

    try {
      let contentData = {};

      switch (contentModalType) {
        case "page":
          contentData = {
            type: 0, // Page type
            contentString: JSON.stringify({
              title: formData.title,
              description: formData.description,
              content: formData.content,
              htmlContent: formData.htmlContent,
            }),
          };
          break;

        case "text":
          contentData = {
            type: 1, // Text type
            contentString: formData.textContent,
          };
          break;

        case "url":
          contentData = {
            type: 3, // URL type
            contentString: formData.url,
          };
          break;

        case "file":
          contentData = {
            type: 5, // File type
            ...(formData.file && {
              contentFile: formData.file,
              fileName: formData.file.name,
              fileType: formData.file.type,
              fileSize: formData.file.size,
            }),
          };
          break;

        case "video":
          contentData = {
            type: 4, // Video type
            ...(formData.file && {
              contentFile: formData.file,
              fileName: formData.file.name,
            }),
          };
          break;

        default:
          return;
      }

      if (isEditing) {
        dispatch(
          updateContentInSection({
            sectionId: activeSection,
            contentId: editingContent.id,
            updates: contentData,
          })
        );
      } else {
        dispatch(
          addContentToSection({
            sectionId: activeSection,
            content: contentData,
          })
        );
      }

      handleClose();
    } catch (error) {
      setErrors({ submit: "Failed to save content. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (file) => {
    if (file) {
      // Validate file size based on type
      const maxSize = contentModalType === "video" ? 500 * 1024 * 1024 : 100 * 1024 * 1024; // 500MB for video, 100MB for files
      
      if (file.size > maxSize) {
        setErrors({ file: `File size must be less than ${maxSize / (1024 * 1024)}MB` });
        return;
      }

      // Validate file type for video
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

  const getModalTitle = () => {
    const action = isEditing ? "Edit" : "Add";
    const typeMap = {
      page: "Page Content",
      text: "Text Block",
      url: "Web Link",
      file: "File Upload",
      video: "Video Upload",
    };
    return `${action} ${typeMap[contentModalType] || "Content"}`;
  };

  const getModalIcon = () => {
    const iconMap = {
      page: FileText,
      text: FileText,
      url: Globe,
      file: File,
      video: Video,
    };
    const Icon = iconMap[contentModalType] || FileText;
    return <Icon className="w-5 h-5" />;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-[#0AAC9E]/5 to-[#0AAC9E]/10">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#0AAC9E]/10 rounded-lg">
              {getModalIcon()}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {getModalTitle()}
              </h3>
              <p className="text-xs text-gray-500">
                {isEditing ? "Update your content" : "Add new learning material"}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          {errors.submit && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-red-700 text-sm">{errors.submit}</span>
              </div>
            </div>
          )}

          {contentModalType === "page" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Page Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Enter page title"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0AAC9E] focus:border-[#0AAC9E] text-sm ${
                    errors.title ? "border-red-300 bg-red-50" : "border-gray-300"
                  }`}
                />
                {errors.title && (
                  <p className="mt-1 text-xs text-red-600">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Brief description of the page content"
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0AAC9E] focus:border-[#0AAC9E] resize-none text-sm ${
                    errors.description ? "border-red-300 bg-red-50" : "border-gray-300"
                  }`}
                />
                {errors.description && (
                  <p className="mt-1 text-xs text-red-600">{errors.description}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      content: e.target.value,
                    }))
                  }
                  placeholder="Enter the main content for this page..."
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0AAC9E] focus:border-[#0AAC9E] resize-none text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">
                  You can use markdown formatting for rich text
                </p>
              </div>
            </div>
          )}

          {contentModalType === "text" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Text Content *
              </label>
              <textarea
                value={formData.textContent}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    textContent: e.target.value,
                  }))
                }
                placeholder="Enter your text content here..."
                rows={10}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0AAC9E] focus:border-[#0AAC9E] resize-none text-sm ${
                  errors.textContent ? "border-red-300 bg-red-50" : "border-gray-300"
                }`}
              />
              {errors.textContent && (
                <p className="mt-1 text-xs text-red-600">{errors.textContent}</p>
              )}
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>Plain text or markdown supported</span>
                <span>{formData.textContent.length}/2000 characters</span>
              </div>
            </div>
          )}

          {contentModalType === "url" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Web URL *
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, url: e.target.value }))
                  }
                  placeholder="https://example.com"
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0AAC9E] focus:border-[#0AAC9E] text-sm ${
                    errors.url ? "border-red-300 bg-red-50" : "border-gray-300"
                  }`}
                />
              </div>
              {errors.url && (
                <p className="mt-1 text-xs text-red-600">{errors.url}</p>
              )}
              <p className="mt-2 text-xs text-gray-500">
                Link to external websites, documents, or resources
              </p>
              
              {formData.url && isValidUrl(formData.url) && (
                <div className="mt-3 p-3 bg-[#0AAC9E]/5 border border-[#0AAC9E]/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-[#0AAC9E]" />
                    <span className="text-[#0AAC9E] font-medium text-sm">Valid URL</span>
                  </div>
                  <p className="mt-1 text-xs text-[#0AAC9E]">
                    This link will open in a new tab when clicked
                  </p>
                </div>
              )}
            </div>
          )}

          {(contentModalType === "file" || contentModalType === "video") && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {contentModalType === "video" ? "Video File *" : "File Upload *"}
              </label>

              {formData.file ? (
                <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-[#0AAC9E]/10 rounded-lg">
                        {contentModalType === "video" ? (
                          <Video className="w-6 h-6 text-[#0AAC9E]" />
                        ) : (
                          <File className="w-6 h-6 text-[#0AAC9E]" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {formData.file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <p className="text-xs text-gray-400">
                          {formData.file.type}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, file: null }))
                      }
                      className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    dragActive
                      ? "border-[#0AAC9E] bg-[#0AAC9E]/5"
                      : "border-gray-300 hover:border-[#0AAC9E]"
                  } ${errors.file ? "border-red-300 bg-red-50" : ""}`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleDrop}
                >
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-[#0AAC9E]/10 rounded-full flex items-center justify-center mb-3">
                      <Upload className="w-6 h-6 text-[#0AAC9E]" />
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      Drag and drop your {contentModalType} here, or{" "}
                      <label className="text-[#0AAC9E] hover:text-[#0AAC9E]/80 cursor-pointer font-medium">
                        browse files
                        <input
                          type="file"
                          accept={
                            contentModalType === "video" 
                              ? "video/*" 
                              : "*/*"
                          }
                          onChange={(e) => handleFileUpload(e.target.files[0])}
                          className="hidden"
                        />
                      </label>
                    </p>
                    <p className="text-xs text-gray-400">
                      {contentModalType === "video"
                        ? "MP4, WebM, MOV up to 500MB"
                        : "PDF, DOC, PPT, XLS, images up to 100MB"}
                    </p>
                  </div>
                </div>
              )}
              
              {errors.file && (
                <p className="mt-2 text-xs text-red-600 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {errors.file}
                </p>
              )}

              {/* File Description */}
              {(formData.file || isEditing) && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, description: e.target.value }))
                    }
                    placeholder="Add a description for this file"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0AAC9E] focus:border-[#0AAC9E] text-sm"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-500">
            {contentModalType === "page" && "Create rich learning content"}
            {contentModalType === "text" && "Add text-based information"}
            {contentModalType === "url" && "Link to external resources"}
            {contentModalType === "file" && "Upload documents and files"}
            {contentModalType === "video" && "Add video content"}
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSubmitting || !Object.keys(errors).every(key => !errors[key])}
              className="px-4 py-2 bg-[#0AAC9E] text-white rounded-lg hover:bg-[#0AAC9E]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm text-sm"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </div>
              ) : (
                `${isEditing ? "Update" : "Add"} Content`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentModal;