"use client";
import React, { useState, useCallback } from "react";
import { Upload, X, GripVertical, Trash2, Check } from "lucide-react";
import CropModal from "./CropModal";

const MAX_IMAGES = 10;
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const MultiImagesEdit = ({ images = [], onChange, onMarkForDeletion }) => {
  const [showCropModal, setShowCropModal] = useState(false);
  const [tempImage, setTempImage] = useState(null);
  const [error, setError] = useState(null);
  const [markedForDeletion, setMarkedForDeletion] = useState([]);

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
    // Generate a unique ID for the new image
    const newId = `new-${Date.now()}`;
    onChange([...images, { id: newId, file, preview, isExisting: false }]);
    setShowCropModal(false);
    setTempImage(null);
  };

  const handleRemoveImage = (index) => {
    const imageToRemove = images[index];
    const newImages = [...images];
    newImages.splice(index, 1);
    onChange(newImages);

    // If this is an existing image and we have a callback for marking deletion
    if (
      imageToRemove.isExisting &&
      imageToRemove.id !== undefined &&
      onMarkForDeletion
    ) {
      onMarkForDeletion(imageToRemove.id, true);
    }
  };

  const toggleMarkForDeletion = (id) => {
    if (markedForDeletion.includes(id)) {
      setMarkedForDeletion(markedForDeletion.filter((item) => item !== id));
      if (onMarkForDeletion) {
        onMarkForDeletion(id, false);
      }
    } else {
      setMarkedForDeletion([...markedForDeletion, id]);
      if (onMarkForDeletion) {
        onMarkForDeletion(id, true);
      }
    }
  };

  const handleReorder = (dragIndex, hoverIndex) => {
    const newImages = [...images];
    const draggedImage = newImages[dragIndex];
    newImages.splice(dragIndex, 1);
    newImages.splice(hoverIndex, 0, draggedImage);
    onChange(newImages);
  };

  const getImageUrl = (image) => {
    if (!image || !image.preview) return "";

    // If this is a new image (uploaded in this session), just return the preview
    if (!image.isExisting) {
      return image.preview;
    }

    // Handle existing images from the server
    if (typeof image.preview === "string") {
      // Check if it already has the full URL
      if (image.preview.startsWith("http")) {
        // If it's the old server URL, replace it with the new one
        if (image.preview.includes("100.42.179.27:7298")) {
          return `https://demoadmin.databyte.app/uploads/${image.preview.replace(
            "https://100.42.179.27:7298/",
            ""
          )}`;
        }
        // If it's already a full URL but not the old server URL, return as is
        return image.preview;
      }

      // If it's a relative path, prepend the base URL
      if (!image.preview.startsWith("/")) {
        return `https://demoadmin.databyte.app/uploads/${image.preview}`;
      } else {
        // If it has a leading slash, remove it
        return `https://demoadmin.databyte.app/uploads${image.preview}`;
      }
    }

    // Fallback for any other case
    return image.preview;
  };

  return (
    <div className="space-y-4">
      <div className="border-dashed border-2 border-[#0AAC9E] py-4 px-6 bg-white rounded-lg">
        {images.length === 0 ? (
          <div className="flex justify-center items-center py-8 flex-col gap-4">
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
                    onChange={handleImageChange}
                    accept="image/jpeg, image/png"
                  />
                </label>
                or drag and drop
              </div>
              <p className="text-xs font-normal text-gray-500 mt-2">
                Images will be cropped to 16:9 ratio
              </p>
            </div>
          </div>
        ) : (
          <div className="w-full">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <div
                  key={index}
                  className={`relative group ${
                    markedForDeletion.includes(image.id) ? "opacity-50" : ""
                  }`}
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
                    src={getImageUrl(image)}
                    alt={`Preview ${index + 1}`}
                    className="w-full aspect-video object-cover rounded-lg"
                  />

                  {image.isExisting ? (
                    <button
                      type="button"
                      onClick={() => toggleMarkForDeletion(image.id)}
                      className={`absolute top-2 right-2 p-1 ${
                        markedForDeletion.includes(image.id)
                          ? "bg-red-500 text-white"
                          : "bg-white"
                      } rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity`}
                    >
                      {markedForDeletion.includes(image.id) ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Trash2 className="w-4 h-4 text-gray-700" />
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4 text-gray-600 hover:text-gray-800" />
                    </button>
                  )}

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

      {markedForDeletion.length > 0 && (
        <div className="text-xs text-red-500">
          {markedForDeletion.length}{" "}
          {markedForDeletion.length === 1 ? "image" : "images"} marked for
          deletion
        </div>
      )}

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

export default MultiImagesEdit;
