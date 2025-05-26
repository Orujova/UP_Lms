"use client";
import React, { useState, useRef } from "react";
import { Image as ImageIcon, XCircle, Upload, CheckCircle } from "lucide-react";

const CoverPhotoUploadModal = ({ isOpen, onClose, onUpload }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("Please select a valid image file (JPEG, PNG, GIF, WEBP)");
      return;
    }

    // Validate file size (max 10MB for cover photo)
    if (file.size > 10 * 1024 * 1024) {
      setError("File size should not exceed 10MB");
      return;
    }

    setError("");
    setSelectedFile(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange({ target: { files: e.dataTransfer.files } });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      setError("Please select an image file");
      return;
    }

    setLoading(true);
    try {
      await onUpload(selectedFile);
      resetForm();
      onClose();
    } catch (error) {
      console.error("Error in cover photo upload:", error);
      setError(error.message || "Failed to upload cover photo");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b rounded-t">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#ecfcfb] text-[#0AAC9E] mr-3">
              <ImageIcon className="w-5 h-5" />
            </div>
            Update Cover Photo
          </h3>
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="text-gray-400 bg-transparent hover:bg-gray-100 hover:text-gray-600 rounded-full p-2 transition-colors"
          >
            <XCircle className="w-5 h-5" />
            <span className="sr-only">Close modal</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5">
          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg flex items-start">
              <XCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Upload Failed</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Image Upload Area */}
          <div
            className={`mb-5 border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 ${
              previewUrl
                ? "border-[#0AAC9E] bg-[#f2fdfc]"
                : "border-gray-300 bg-gray-50"
            } hover:bg-gray-100 cursor-pointer`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={triggerFileInput}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpeg, image/png, image/gif, image/webp"
              className="hidden"
            />

            {previewUrl ? (
              <div className="flex flex-col items-center">
                <div className="w-full h-32 mb-4 rounded-lg overflow-hidden border-4 border-white shadow-lg">
                  <img
                    src={previewUrl}
                    alt="Cover Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex items-center text-[#0AAC9E] font-medium">
                  <CheckCircle className="w-4 h-4 mr-1.5" />
                  Cover photo selected
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Click or drag to change selection
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <ImageIcon className="w-16 h-16 text-gray-400 mb-4" />
                <p className="mb-2 text-base font-medium text-gray-700">
                  Click to upload or drag and drop
                </p>
                <p className="text-sm text-gray-500">
                  JPEG, PNG, GIF or WEBP (MAX. 10MB)
                </p>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
              onClick={() => {
                resetForm();
                onClose();
              }}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2.5 bg-[#0AAC9E] hover:bg-[#099b8e] text-white rounded-lg transition-colors flex items-center font-medium ${
                loading || !selectedFile ? "opacity-70 cursor-not-allowed" : ""
              }`}
              disabled={loading || !selectedFile}
            >
              {loading ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Cover Photo
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default CoverPhotoUploadModal;
