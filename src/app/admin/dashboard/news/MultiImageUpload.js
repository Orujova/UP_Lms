"use client";
import React, { useState, useCallback } from "react";
import { Upload, X, GripVertical } from "lucide-react";
import CropModal from "./CropModal";

const MAX_IMAGES = 10;
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const MultiImageUpload = ({ images, onChange }) => {
  const [showCropModal, setShowCropModal] = useState(false);
  const [tempImage, setTempImage] = useState(null);
  const [error, setError] = useState(null);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);

    if (images.length + files.length > MAX_IMAGES) {
      setError(`You can only upload up to ${MAX_IMAGES} images`);
      return;
    }

    const file = files[0];
    if (file) {
      const validFormats = ["image/jpeg", "image/png"];
      if (!validFormats.includes(file.type)) {
        setError("Please select a valid image format (JPG, JPEG, PNG)");
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setError(
          `Image size should not exceed ${MAX_FILE_SIZE / (1024 * 1024)}MB`
        );
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setTempImage(reader.result);
        setShowCropModal(true);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (file, preview) => {
    onChange([...images, { file, preview }]);
    setShowCropModal(false);
    setTempImage(null);
  };

  const handleRemoveImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onChange(newImages);
  };

  const handleReorder = (dragIndex, hoverIndex) => {
    const newImages = [...images];
    const draggedImage = newImages[dragIndex];
    newImages.splice(dragIndex, 1);
    newImages.splice(hoverIndex, 0, draggedImage);
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      <div className="border-dashed border-2 border-[#0AAC9E] flex justify-center items-center py-8 flex-col gap-4 bg-white rounded-lg">
        {images.length === 0 ? (
          <div className="text-center">
            <div className="w-14 h-14 flex items-center justify-center bg-[#0AAC9E] rounded-full mx-auto mb-4">
              <Upload className="w-7 h-7 text-white" />
            </div>
            <div className="font-medium text-gray-700">
              <label className="text-[#0AAC9E] hover:text-[#127D74] cursor-pointer">
                Click to upload
                <input
                  className="hidden"
                  type="file"
                  onChange={handleImageChange}
                  accept="image/jpeg, image/png"
                />
              </label>
              or drag and drop
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Images will be cropped to 16:9 ratio
            </p>
          </div>
        ) : (
          <div className="w-full px-4">
            <div className="grid grid-cols-4 gap-4">
              {images.map((image, index) => (
                <div
                  key={index}
                  className="relative group"
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("index", index)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const dragIndex = parseInt(e.dataTransfer.getData("index"));
                    handleReorder(dragIndex, index);
                  }}
                >
                  <img
                    src={image.preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full aspect-video object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4 text-gray-600 hover:text-gray-800" />
                  </button>
                  <div className="absolute top-2 left-2 p-1 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-move">
                    <GripVertical className="w-4 h-4 text-gray-600" />
                  </div>
                </div>
              ))}
              {images.length < MAX_IMAGES && (
                <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg aspect-video">
                  <label className="cursor-pointer p-4 text-center">
                    <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                    <span className="text-sm text-gray-500">Add more</span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleImageChange}
                      accept="image/jpeg, image/png"
                    />
                  </label>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      {showCropModal && (
        <CropModal
          image={tempImage}
          onCancel={() => {
            setShowCropModal(false);
            setTempImage(null);
          }}
          onCrop={handleCropComplete}
        />
      )}

      <div className="text-xs text-gray-500">
        Max {MAX_IMAGES} images, up to {MAX_FILE_SIZE / (1024 * 1024)}MB each
      </div>
    </div>
  );
};

export default MultiImageUpload;
