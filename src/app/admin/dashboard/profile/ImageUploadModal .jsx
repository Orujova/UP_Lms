"use client";
import React, { useState, useRef } from "react";
import { XCircle, Upload, Image as ImageIcon, Camera } from "lucide-react";

const ImageUploadModal = ({ isOpen, onClose, onUpload }) => {
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

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size should not exceed 5MB");
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
      console.error("Error in image upload:", error);
      setError(error.message || "Failed to upload image");
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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <ImageIcon className="w-6 h-6 mr-2 text-blue-500" />
            Upload Profile Image
          </h3>
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
          >
            <XCircle className="w-5 h-5" />
            <span className="sr-only">Close modal</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 md:p-5">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
              <p className="font-medium">Error</p>
              <p>{error}</p>
            </div>
          )}

          {/* Image Upload Area */}
          <div
            className={`mb-4 border-2 border-dashed rounded-lg p-6 text-center ${
              previewUrl
                ? "border-green-300 bg-green-50"
                : "border-gray-300 bg-gray-50"
            } hover:bg-gray-100 cursor-pointer transition-colors`}
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
                <div className="w-48 h-48 mb-4 rounded-full overflow-hidden border-4 border-white shadow-lg">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-green-600 font-medium">Image selected!</p>
                <p className="text-sm text-gray-500 mt-1">
                  Click or drag to change selection
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Camera className="w-16 h-16 text-gray-400 mb-4" />
                <p className="mb-2 text-lg font-medium text-gray-700">
                  Click to upload or drag and drop
                </p>
                <p className="text-sm text-gray-500">
                  JPEG, PNG, GIF or WEBP (MAX. 5MB)
                </p>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
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
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center"
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
                  Upload Image
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ImageUploadModal;
