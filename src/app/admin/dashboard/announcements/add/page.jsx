"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";
import { Search, Upload, X, ArrowLeft } from "lucide-react";
import { getParsedToken } from "@/authtoken/auth.js";
import Cropper from "react-easy-crop";

export default function NewAnnouncement() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [tempImage, setTempImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Dropdown states
  const [pollUnits, setPollUnits] = useState([]);
  const [targetGroups, setTargetGroups] = useState([]);
  const [searchPollUnit, setSearchPollUnit] = useState("");
  const [searchTargetGroup, setSearchTargetGroup] = useState("");
  const [showPollUnitDropdown, setShowPollUnitDropdown] = useState(false);
  const [showTargetGroupDropdown, setShowTargetGroupDropdown] = useState(false);

  const pollUnitRef = useRef(null);
  const targetGroupRef = useRef(null);

  const [formData, setFormData] = useState({
    Title: "",
    SubTitle: "",
    Description: "",
    ShortDescription: "",
    Priority: "NORMAL",
    ScheduledDate: "",
    ExpiryDate: "",
    PollUnitId: "",
    TargetGroupId: "",
    UserId: "",
    ImageFile: null,
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pollUnitRef.current && !pollUnitRef.current.contains(event.target)) {
        setShowPollUnitDropdown(false);
      }
      if (
        targetGroupRef.current &&
        !targetGroupRef.current.contains(event.target)
      ) {
        setShowTargetGroupDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    // Fetch poll units and target groups
    Promise.all([fetchPollUnits(), fetchTargetGroups()]).catch((error) => {
      toast.error("Error loading data");
      console.error("Error:", error);
    });

    // Get user ID from token
    const parsedToken = getParsedToken();
    if (parsedToken?.UserID) {
      setFormData((prev) => ({ ...prev, UserId: parsedToken.UserID }));
    } else {
      toast.error("Failed to retrieve user ID.");
    }
  }, []);

  const fetchPollUnits = async () => {
    try {
      const response = await fetch(
        "https://bravoadmin.uplms.org/api/PollUnit?Page=1&ShowMore.Take=100"
      );
      const data = await response.json();
      setPollUnits(data[0].pollUnits);
    } catch (error) {
      console.error("Error fetching poll units:", error);
    }
  };

  const fetchTargetGroups = async () => {
    try {
      const response = await fetch(
        "https://bravoadmin.uplms.org/api/TargetGroup/GetAllTargetGroups?Page=1&ShowMore.Take=100"
      );
      const data = await response.json();
      setTargetGroups(data[0].targetGroups);
    } catch (error) {
      console.error("Error fetching target groups:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempImage(reader.result);
        setShowCropModal(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedFile, preview) => {
    setFormData((prev) => ({ ...prev, ImageFile: croppedFile }));
    setImagePreview(preview);
    setShowCropModal(false);
    setTempImage(null);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formDataToSend = new FormData();

      formDataToSend.append("ShortDescription", formData.ShortDescription);
      formDataToSend.append("ExpiryDate", formData.ExpiryDate);
      formDataToSend.append("Priority", formData.Priority);
      formDataToSend.append("TargetGroupId", formData.TargetGroupId);
      formDataToSend.append("PollUnitId", formData.PollUnitId);
      formDataToSend.append("SubTitle", formData.SubTitle);
      formDataToSend.append("Title", formData.Title);
      formDataToSend.append("ScheduledDate", formData.ScheduledDate);
      formDataToSend.append("Description", formData.Description);
      formDataToSend.append("UserId", formData.UserId);

      if (formData.ImageFile) {
        formDataToSend.append(
          "ImageFile",
          formData.ImageFile,
          formData.ImageFile.name
        );
      }

      const response = await fetch(
        "https://bravoadmin.uplms.org/api/Announcement",
        {
          method: "POST",
          body: formDataToSend,
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success("Announcement created successfully");
        router.push("/admin/dashboard/announcements");
      } else {
        throw new Error(data.message || "Failed to create announcement");
      }
    } catch (error) {
      toast.error("Failed to create announcement");
      console.error("Error creating announcement:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="">
      <Toaster position="top-right" />
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
      <div className="min-h-screen bg-gray-50/50 pt-12 ">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex justify-between w-full">
            <button
              onClick={() => router.push("/admin/dashboard/announcements")}
              className="text-gray-500 hover:text-gray-700 flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <h1 className="text-lg font-semibold mt-2">
              Create New Announcement
            </h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Cover Image (9:16)
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
              <div className="space-y-1 text-center">
                {imagePreview ? (
                  <div className="relative w-full max-w-sm mx-auto aspect-[9/16]">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setFormData((prev) => ({ ...prev, ImageFile: null }));
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-lg text-gray-600 hover:text-gray-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="image-upload"
                    className="flex flex-col items-center cursor-pointer"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-12 h-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-500">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        Image will be cropped to 9:16 ratio
                      </p>
                    </div>
                  </label>
                )}
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h2 className="text-base font-medium mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  name="Title"
                  value={formData.Title}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#01DBC8] focus:ring-[#01DBC8]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Subtitle
                </label>
                <input
                  type="text"
                  name="SubTitle"
                  value={formData.SubTitle}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#01DBC8] focus:ring-[#01DBC8]"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h2 className="text-base font-medium mb-4">Description</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Short Description
                </label>
                <input
                  type="text"
                  name="ShortDescription"
                  value={formData.ShortDescription}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#01DBC8] focus:ring-[#01DBC8]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Full Description
                </label>
                <textarea
                  name="Description"
                  value={formData.Description}
                  onChange={handleInputChange}
                  rows={4}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 outline-0 focus:border-[#01DBC8] focus:ring-[#01DBC8]"
                  required
                />
              </div>
            </div>
          </div>

          {/* Poll Unit Dropdown */}
          <div
            className="bg-white rounded-lg p-6 border border-gray-200"
            ref={pollUnitRef}
          >
            <h2 className="text-base font-medium mb-4">
              Poll Unit{" "}
              <span className="text-sm text-gray-500">(Optional)</span>
            </h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Search poll units..."
                value={searchPollUnit}
                onChange={(e) => {
                  setSearchPollUnit(e.target.value);
                  setShowPollUnitDropdown(true);
                }}
                onClick={() => setShowPollUnitDropdown(true)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-[#01DBC8]"
              />
              <Search
                className="absolute right-3 top-2.5 text-gray-400"
                size={20}
              />

              {showPollUnitDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                  {pollUnits
                    .filter((unit) =>
                      unit.title
                        .toLowerCase()
                        .includes(searchPollUnit.toLowerCase())
                    )
                    .map((unit) => (
                      <div
                        key={unit.id}
                        className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            PollUnitId: unit.id.toString(),
                          }));
                          setSearchPollUnit(unit.title);
                          setShowPollUnitDropdown(false);
                        }}
                      >
                        <div className="font-medium">{unit.title}</div>
                        <div className="text-sm text-gray-500">
                          {unit.description}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
            {formData.PollUnitId && (
              <div className="mt-2 bg-[#f9fefe] text-[#127D74] px-3 py-2 rounded-lg flex justify-between items-center">
                <span>Selected Poll Unit ID: {formData.PollUnitId}</span>
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, PollUnitId: "" }));
                    setSearchPollUnit("");
                  }}
                  className="text-[#127D74] hover:text-emerald-800"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Target Group Dropdown */}
          <div
            className="bg-white rounded-lg p-6 border border-gray-200"
            ref={targetGroupRef}
          >
            <h2 className="text-base font-medium mb-4">Target Group</h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Search target groups..."
                value={searchTargetGroup}
                onChange={(e) => {
                  setSearchTargetGroup(e.target.value);
                  setShowTargetGroupDropdown(true);
                }}
                onClick={() => setShowTargetGroupDropdown(true)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-[#01DBC8]"
              />
              <Search
                className="absolute right-3 top-2.5 text-gray-400"
                size={18}
              />

              {showTargetGroupDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                  {targetGroups
                    .filter((group) =>
                      group.name
                        .toLowerCase()
                        .includes(searchTargetGroup.toLowerCase())
                    )
                    .map((group) => (
                      <div
                        key={group.id}
                        className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            TargetGroupId: group.id.toString(),
                          }));
                          setSearchTargetGroup(group.name);
                          setShowTargetGroupDropdown(false);
                        }}
                      >
                        <div className="font-medium">{group.name}</div>
                        <div className="text-xs text-gray-400 flex gap-2 mt-1">
                          <span className="flex items-center gap-1">
                            <span className="inline-block w-4 h-4 bg-gray-200 rounded-full text-center text-xs leading-4">
                              U
                            </span>
                            {group.userCount} Users
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="inline-block w-4 h-4 bg-gray-200 rounded-full text-center text-xs leading-4">
                              F
                            </span>
                            {group.filterGroupCount} Filters
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
            {formData.TargetGroupId && (
              <div className="mt-2 bg-[#f9fefe] text-[#127D74] px-3 py-2 rounded-lg flex justify-between items-center">
                <span>Selected Target Group ID: {formData.TargetGroupId}</span>
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, TargetGroupId: "" }));
                    setSearchTargetGroup("");
                  }}
                  className="text-[#127D74] hover:text-emerald-800"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Settings */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h2 className="text-base font-medium mb-4">Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Priority
                </label>
                <select
                  name="Priority"
                  value={formData.Priority}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#01DBC8] focus:ring-[#01DBC8]"
                  required
                >
                  <option value="LOW">Low</option>
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Schedule Date
                </label>
                <input
                  type="date"
                  name="ScheduledDate"
                  value={formData.ScheduledDate}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#01DBC8] focus:ring-[#01DBC8]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Expiry Date
                </label>
                <input
                  type="date"
                  name="ExpiryDate"
                  value={formData.ExpiryDate}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#01DBC8] focus:ring-[#01DBC8]"
                  required
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.push("/admin/dashboard/announcements")}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-[#127D74] text-white rounded-lg hover:bg-[#0AAC9E]flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-t-white border-r-white border-b-white border-l-transparent rounded-full animate-spin"></div>
                  Creating...
                </>
              ) : (
                <>Create Announcement</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal Dialog Component
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
