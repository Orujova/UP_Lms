"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import InputComponent from "@/components/inputComponent";
import { getToken, getParsedToken, getUserId } from "@/authtoken/auth";
import { Calendar, Upload, X, Search } from "lucide-react";
import { toast } from "sonner";
import Cropper from "react-easy-crop";
import { useRouter } from "next/navigation";

const token = getToken();
const userId = getUserId();

// Crop Modal Component
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

      // Set fixed dimensions for 1:1 ratio
      canvas.width = 800; // Can be adjusted as needed
      canvas.height = 800; // Maintaining 1:1 ratio

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

      canvas.toBlob(
        (blob) => {
          const file = new File([blob], "cropped_event_image.jpg", {
            type: "image/jpeg",
            lastModified: Date.now(),
          });
          onCrop(file, URL.createObjectURL(blob));
        },
        "image/jpeg",
        0.8
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
          <h3 className="text-lg font-semibold">Crop Image (1:1 ratio)</h3>
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
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            objectFit="contain"
            showGrid={true}
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
            className="px-4 py-2 bg-[#127D74] text-white rounded-md hover:bg-[#2a8a82]"
          >
            Apply Crop
          </button>
        </div>
      </div>
    </div>
  );
};

const EditEventForm = ({ params }) => {
  const { id } = params;
  const [formData, setFormData] = useState({
    userId: "",
    subject: "",
    description: "",
    eventDateTime: "",
    imageFile: null,
    targetGroupId: "",
    countDown: "",
  });

  const router = useRouter();
  const [errors, setErrors] = useState({});
  const [dragActive, setDragActive] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showCropModal, setShowCropModal] = useState(false);
  const [tempImage, setTempImage] = useState(null);

  // Target Group states
  const [targetGroups, setTargetGroups] = useState([]);
  const [loadingTargetGroups, setLoadingTargetGroups] = useState(true);
  const [searchTargetGroup, setSearchTargetGroup] = useState("");
  const [showTargetGroupDropdown, setShowTargetGroupDropdown] = useState(false);
  const targetGroupRef = useRef(null);

  // Fetch event data
  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const response = await fetch(
          `https://bravoadmin.uplms.org/api/Event/${id}?userid=${userId}`
        );
        const data = await response.json();

        // Format the date for datetime-local input
        const formattedDate = new Date(data.eventDateTime)
          .toISOString()
          .slice(0, 16);

        setFormData({
          ...data,
          eventDateTime: formattedDate,
          imageFile: null, // We'll handle the image separately
        });

        if (data.imageUrl) {
          setImagePreview(
            `https://bravoadmin.uplms.org/uploads/${data.imageUrl.replace(
              "https://100.42.179.27:7198/",
              ""
            )}`
          );
        }

        // Set target group search if exists
        if (data.targetGroupId) {
          const targetGroup = targetGroups.find(
            (g) => g.id === data.targetGroupId
          );
          if (targetGroup) {
            setSearchTargetGroup(targetGroup.name);
          }
        }
      } catch (error) {
        console.error("Error fetching event:", error);
        toast.error("Failed to load event data");
      } finally {
        setInitialLoading(false);
      }
    };

    if (id) {
      fetchEventData();
    }
  }, [id, targetGroups]);

  // Rest of the useEffects and handlers remain similar to Add component
  useEffect(() => {
    const handleClickOutside = (event) => {
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
    const parsedToken = getParsedToken();
    if (parsedToken?.UserID) {
      setFormData((prev) => ({ ...prev, userId: parsedToken.UserID }));
    }
  }, []);

  const fetchTargetGroups = async () => {
    try {
      const response = await fetch(
        "https://bravoadmin.uplms.org/api/TargetGroup/GetAllTargetGroups?Page=1&ShowMore.Take=100"
      );
      const data = await response.json();
      setTargetGroups(data[0].targetGroups);
    } catch (error) {
      console.error("Error fetching target groups:", error);
      toast.error("Failed to fetch target groups.");
    } finally {
      setLoadingTargetGroups(false);
    }
  };

  useEffect(() => {
    fetchTargetGroups();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
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
    setFormData((prev) => ({ ...prev, imageFile: croppedFile }));
    setImagePreview(preview);
    setShowCropModal(false);
    setTempImage(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempImage(reader.result);
        setShowCropModal(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = getToken();
    if (!token) {
      toast.error("Authorization token is missing. Please log in again.");
      return;
    }

    const form = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null && formData[key] !== undefined) {
        form.append(key, formData[key]);
      }
    });
    form.append("EventId", id);

    try {
      const response = await fetch(`https://bravoadmin.uplms.org/api/Event`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      });

      if (!response.ok) {
        const errorData = await response.json();
        setErrors(errorData.errors || {});
        toast.error("Failed to update event. Please check the form.");
      } else {
        toast.success("Event successfully updated!");
      }
    } catch (error) {
      console.error("Error updating the event:", error);
      toast.error("Error updating event.");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-t-[#0AAC9E] border-b-[#0AAC9E] rounded-full animate-spin"></div>
          <p className="mt-2 text-gray-600">Loading event data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
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

      <div className="min-h-screen bg-gray-50/50 pt-10">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#f9f9f9] p-2 rounded-md">
              <Calendar className="w-5 h-5 text-[#0AAC9E]" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Edit Event</h1>
          </div>
        </div>

        {/* Form - Rest of the form structure remains the same as Add component */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <InputComponent
                  placeholder="Subject"
                  type="text"
                  text="Subject"
                  required
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                />
                {errors.Subject && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.Subject[0]}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-[0.8rem] font-medium text-gray-700 mb-1">
                  Event Date & Time
                </label>
                <input
                  type="datetime-local"
                  name="eventDateTime"
                  value={formData.eventDateTime}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-0 focus:border-[#01DBC8]"
                  required
                />
                {errors.EventDateTime && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.EventDateTime[0]}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-[0.8rem] font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-0  focus:border-[#01DBC8]"
                rows="4"
              ></textarea>
              {errors.Description && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.Description[0]}
                </p>
              )}
            </div>

            {/* Image Upload */}
            <div
              className={`border-2 border-dashed rounded-lg p-6 ${
                dragActive ? "border-[#01DBC8] bg-[#f9f9f9]" : "border-gray-300"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {!imagePreview ? (
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 bg-emerald-100 rounded-full mb-3">
                    <Upload className="w-6 h-6 text-[#0AAC9E]" />
                  </div>
                  <div className="text-sm">
                    <label className="text-[#0AAC9E] hover:text-[#127D74] cursor-pointer font-medium">
                      Click to upload
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                        accept="image/jpeg,image/jpg"
                      />
                    </label>{" "}
                    or drag and drop
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    JPG or JPEG (max. 10 photos)
                  </p>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-48 mx-auto rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setFormData((prev) => ({ ...prev, imageFile: null }));
                    }}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            {/* Target Group Dropdown */}
            <div
              className="bg-white rounded-lg p-5 border border-gray-200"
              ref={targetGroupRef}
            >
              <h2 className="text-sm font-medium mb-4">Target Group</h2>
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
                <div className="mt-2 bg-[#f9fefe] text-[#1B4E4A] px-3 py-2 rounded-lg flex justify-between items-center">
                  <span>
                    Selected Target Group ID: {formData.TargetGroupId}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, TargetGroupId: "" }));
                      setSearchTargetGroup("");
                    }}
                    className="text-[#1B4E4A] hover:text-emerald-800"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* Countdown */}
            <div>
              <label className="block text-[0.8rem] font-medium text-gray-700 mb-1">
                Count Down Format
              </label>
              <select
                name="countDown"
                value={formData.countDown}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-0 focus:border-[#01DBC8]"
              >
                <option value="">Select format</option>
                <option value="1">Days only</option>
                <option value="2">Days + Hours + Minutes</option>
                <option value="3">Days + Hours + Minutes + Seconds</option>
              </select>
              {errors.CountDown && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.CountDown[0]}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                onClick={() => router.back()}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#127D74] text-white rounded-md hover:bg-[#2a8a82] transition-colors"
                disabled={loading}
              >
                {loading ? "Updating..." : "Update Event"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditEventForm;
