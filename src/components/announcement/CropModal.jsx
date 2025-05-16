// src/components/announcement/CropModal.jsx
"use client";

import React, { useState, useCallback } from "react";
import { X } from "lucide-react";
import Cropper from "react-easy-crop";
import { toast } from "sonner";

const CropModal = ({ image, onCancel, onCrop }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createCroppedImage = async () => {
    try {
      const canvas = document.createElement("canvas");
      const img = new Image();
      img.src = image;

      await new Promise((resolve) => {
        img.onload = resolve;
      });

      // Set fixed dimensions for the output
      canvas.width = 900;
      canvas.height = 1600;

      const ctx = canvas.getContext("2d");
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

      // Convert to blob with quality reduction
      canvas.toBlob(
        (blob) => {
          const file = new File([blob], "cropped_image.jpg", {
            type: "image/jpeg",
            lastModified: Date.now(),
          });
          onCrop(file, URL.createObjectURL(blob));
        },
        "image/jpeg",
        0.8 // 80% quality
      );
    } catch (error) {
      console.error("Error creating cropped image:", error);
      toast.error("Failed to crop image");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Crop Image (9:16 ratio)</h3>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative h-[60vh] bg-gray-900 rounded-lg mb-4">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={9 / 16}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            objectFit="contain"
            showGrid={true}
            cropShape="rect"
            restrictPosition={true}
          />
        </div>

        <div className="flex items-center gap-4 mb-4">
          <span className="text-sm text-gray-600">Zoom:</span>
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
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={createCroppedImage}
            className="px-4 py-2 bg-[#127D74] text-white rounded-lg hover:bg-[#0AAC9E]"
          >
            Apply Crop
          </button>
        </div>
      </div>
    </div>
  );
};

export default CropModal;
