//news crop modal
"use client";
import React, { useState, useCallback } from "react";
import { X } from "lucide-react";
import Cropper from "react-easy-crop";

const CropModal = ({ image, onCancel, onCrop }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixelsTemp) => {
    setCroppedAreaPixels(croppedAreaPixelsTemp);
  }, []);

  const createCroppedImage = async () => {
    try {
      if (!croppedAreaPixels) {
        console.error("No cropped area available");
        return;
      }

      const canvas = document.createElement("canvas");
      const img = new Image();

      // Create a new promise to ensure image is loaded before proceeding
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = image;
      });

      // Set dimensions for 16:9 ratio
      canvas.width = 1600;
      canvas.height = 900;

      const ctx = canvas.getContext("2d");

      // Clear the canvas first
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw the cropped image
      ctx.drawImage(
        img,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        canvas.width,
        canvas.height
      );

      // Convert to blob with a unique filename
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            console.error("Failed to create blob");
            return;
          }

          // Create unique filename with timestamp
          const filename = `cropped_news_image_${Date.now()}.jpg`;

          // Create file from blob
          const file = new File([blob], filename, {
            type: "image/jpeg",
            lastModified: Date.now(),
          });

          // Generate preview URL
          const previewUrl = URL.createObjectURL(blob);

          // Pass both the file and the preview URL to parent component
          onCrop(file, previewUrl);
        },
        "image/jpeg",
        0.9 // Higher quality
      );
    } catch (error) {
      console.error("Error creating cropped image:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-semibold">Crop Image (16:9 ratio)</h3>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative h-96 bg-gray-900 rounded-lg mb-4">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={16 / 9}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            objectFit="contain"
            showGrid={true}
          />
        </div>

        <div className="flex items-center gap-4 mb-4">
          <span className="text-xs text-gray-600">Zoom:</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            type="button"
          >
            Cancel
          </button>
          <button
            onClick={createCroppedImage}
            className="px-3 text-sm py-2 bg-[#0AAC9E] text-white rounded-lg hover:bg-[#127D74]"
            type="button"
          >
            Apply Crop
          </button>
        </div>
      </div>
    </div>
  );
};

export default CropModal;
