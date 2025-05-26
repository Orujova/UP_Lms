"use client";
import React, { useState } from "react";
import { Upload, X, GripVertical, File } from "lucide-react";

// Debugging the issue by using a manual approach for file icons
const MAX_ATTACHMENTS = 10;
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const MultiAttachmentUpload = ({ attachments = [], onChange }) => {
  const [error, setError] = useState(null);

  const getFileIcon = (fileType, fileName) => {
    // Check if fileName is defined before attempting to split
    let extension = "";
    if (fileName && typeof fileName === "string") {
      extension = fileName.split(".").pop().toLowerCase();
    }

    // Instead of using possibly undefined icon components, let's use simple SVGs
    // PDF Icon (red)
    if (extension === "pdf" || (fileType && fileType.includes("pdf"))) {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-6 h-6 text-red-500"
        >
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
          <path d="M9 15v-1h6v1" />
          <path d="M11 13v6" />
          <path d="M9 19h4" />
        </svg>
      );
    }

    // Image Icon (blue)
    if (
      ["jpg", "jpeg", "png", "gif", "bmp"].includes(extension) ||
      (fileType && fileType.includes("image"))
    ) {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-6 h-6 text-cyan-600"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      );
    }

    // Document Icon (text files, blue)
    if (
      ["doc", "docx", "rtf", "txt"].includes(extension) ||
      (fileType &&
        (fileType.includes("document") ||
          fileType.includes("msword") ||
          fileType.includes("wordprocessing")))
    ) {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-6 h-6 text-cyan-600"
        >
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <line x1="10" y1="9" x2="8" y2="9" />
        </svg>
      );
    }

    // Spreadsheet Icon (green)
    if (["xls", "xlsx", "csv"].includes(extension)) {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-6 h-6 text-teal-600"
        >
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="8" y1="13" x2="16" y2="13" />
          <line x1="8" y1="17" x2="16" y2="17" />
          <line x1="8" y1="9" x2="10" y2="9" />
        </svg>
      );
    }

    // Presentation Icon (orange)
    if (["ppt", "pptx"].includes(extension)) {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-6 h-6 text-orange-500"
        >
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
          <rect x="8" y="12" width="8" height="6" />
        </svg>
      );
    }

    // Default icon as fallback
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-6 h-6 text-gray-600"
      >
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    );
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  const handleAttachmentChange = (e) => {
    const files = Array.from(e.target.files || []);

    if (attachments.length + files.length > MAX_ATTACHMENTS) {
      setError(`You can only upload up to ${MAX_ATTACHMENTS} files`);
      return;
    }

    const newAttachments = [];

    files.forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        setError(
          `File size should not exceed ${MAX_FILE_SIZE / (1024 * 1024)}MB`
        );
        return;
      }

      // Get file extension
      const fileExtension = file.name.split(".").pop().toLowerCase();
      const validExtensions = [
        "pdf",
        "doc",
        "docx",
        "xls",
        "xlsx",
        "ppt",
        "pptx",
        "txt",
        "jpg",
        "jpeg",
        "png",
      ];

      if (!validExtensions.includes(fileExtension)) {
        setError(
          "Please select a valid file format (DOC, DOCX, PDF, XLS, XLSX, PPT, PPTX, TXT, JPG, PNG)"
        );
        return;
      }

      newAttachments.push({
        file,
        name: file.name,
        type: file.type || `application/${fileExtension}`, // Fallback type based on extension
        size: file.size,
      });
    });

    if (newAttachments.length > 0) {
      onChange([...attachments, ...newAttachments]);
      setError(null);
    }
  };

  const handleRemoveAttachment = (index) => {
    const newAttachments = [...attachments];
    newAttachments.splice(index, 1);
    onChange(newAttachments);
  };

  const handleReorder = (dragIndex, hoverIndex) => {
    const newAttachments = [...attachments];
    const draggedAttachment = newAttachments[dragIndex];
    newAttachments.splice(dragIndex, 1);
    newAttachments.splice(hoverIndex, 0, draggedAttachment);
    onChange(newAttachments);
  };

  return (
    <div className="space-y-4">
      <div className="border-dashed border-2 border-[#0AAC9E] py-2 px-6 bg-white rounded-lg">
        {attachments.length === 0 ? (
          <div className="flex justify-center items-center py-3 flex-col gap-4">
            <div className="text-center">
              <div className="w-12 h-12 flex items-center justify-center bg-[#0AAC9E] rounded-full mx-auto mb-4">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <div className="font-medium text-gray-700">
                <label className="text-[#0AAC9E] hover:text-[#127D74] cursor-pointer">
                  Click to upload
                  <input
                    className="hidden"
                    type="file"
                    onChange={handleAttachmentChange}
                    multiple
                    accept=".doc,.docx,.pdf,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png"
                  />
                </label>
                or drag and drop
              </div>
              <p className="text-xs font-normal text-gray-500 mt-2">
                Supported formats: DOC, DOCX, PDF, XLS, XLSX, PPT, PPTX, TXT,
                JPG, PNG
              </p>
            </div>
          </div>
        ) : (
          <div className="w-full">
            <div className="grid grid-cols-1 gap-3">
              {attachments.map((attachment, index) => (
                <div
                  key={index}
                  className="relative group flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200"
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("index", index)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const dragIndex = parseInt(e.dataTransfer.getData("index"));
                    handleReorder(dragIndex, index);
                  }}
                >
                  <div className="mr-3 cursor-move text-gray-400 hover:text-gray-600">
                    <GripVertical className="w-5 h-5" />
                  </div>
                  <div className="p-2 bg-white rounded-md border border-gray-200 mr-4">
                    {getFileIcon(attachment.type, attachment.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">
                      {attachment.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(attachment.size)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveAttachment(index)}
                    className="p-1 ml-2 rounded-full hover:bg-gray-200"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              ))}
            </div>

            {attachments.length < MAX_ATTACHMENTS && (
              <div className="mt-4">
                <label className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
                  <Upload className="w-4 h-4 mr-2" />
                  Add more files
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleAttachmentChange}
                    multiple
                    accept=".doc,.docx,.pdf,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png"
                  />
                </label>
              </div>
            )}
          </div>
        )}
      </div>

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      <div className="text-xs text-gray-500">
        Max {MAX_ATTACHMENTS} files, up to {MAX_FILE_SIZE / (1024 * 1024)}MB
        each
      </div>
    </div>
  );
};

export default MultiAttachmentUpload;
