"use client";

import React, { useState } from "react";
import { Upload, X } from "lucide-react";
import CropModal from "./CropModal";

const ImageUpload = ({ imagePreview, defaultImageUrl, onImageChange, onImageRemove }) => {
  const [showCropModal, setShowCropModal] = useState(false);
  const [tempImage, setTempImage] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempImage(reader.result);
        setShowCropModal(true);
      };
      reader.readAsDataURL(file);
    } else {
      console.warn("No file selected");
    }
  };

  const handleCropComplete = (croppedFile, preview) => {
    onImageChange(croppedFile, preview);
    setShowCropModal(false);
    setTempImage(null);
  };

  const handleCancel = () => {
    setShowCropModal(false);
    setTempImage(null);
  };

  return (
    <>
      {showCropModal && (
        <CropModal
          image={tempImage}
          onCancel={handleCancel}
          onCrop={handleCropComplete}
        />
      )}

      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Cover Image (9:16)
        </label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
          <div className="space-y-4 text-center w-full">
            <div className="relative w-full max-w-xs mx-auto">
              <div className="h-64 flex items-center justify-center">
                <img
                  src={imagePreview || defaultImageUrl }
                  alt="Preview"
                  className="h-full object-contain rounded-lg"
                  onError={(e) => {
                    console.error("Image failed to load:", e.target.src);
                    e.target.src = "/placeholder-image.jpg"; // Fallback image
                  }}
                />
              </div>
              {imagePreview && (
                <button
                  type="button"
                  onClick={onImageRemove}
                  className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-lg text-gray-600 hover:text-gray-800"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <label
              htmlFor="image-upload"
              className="flex flex-col items-center cursor-pointer"
            >
              <div className="flex flex-col items-center justify-center">
                <Upload className="w-8 h-8 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">
                  {imagePreview ? "Replace image" : "Upload a new image"}
                </p>
                <p className="text-xs text-gray-500">
                  Image will be cropped to 9:16 ratio
                </p>
              </div>
            </label>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ImageUpload;