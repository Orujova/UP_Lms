"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { Calendar, Upload, X } from "lucide-react";
import { toast } from "sonner";

import TargetGroupSelector from "@/components/targetSelect";
import PollUnitSelector from "@/components/polUnits";
import FormActions from "@/components/announcement/FormActions";
import CropModal from "@/components/event/CropModal";

import {
  fetchTargetGroups,
  fetchPollUnits,
  createEvent,
  resetEventState,
} from "@/redux/event/event";

import { getUserId } from "@/authtoken/auth.js";

const EventForm = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  // Redux selectors
  const {
    targetGroups,
    pollUnits,
    loading,
    targetGroupsLoading,
    pollUnitsLoading,
    error,
    success,
  } = useSelector((state) => state.event);

  // Local state
  const [formData, setFormData] = useState({
    userId: "",
    subject: "",
    description: "",
    eventDateTime: "",
    imageFile: null,
    countDown: "",
    targetGroupIds: [],
    pollUnitId: "",
    hasNotification: false,
  });

  const [errors, setErrors] = useState({});
  const [dragActive, setDragActive] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [tempImage, setTempImage] = useState(null);

  // Target Group state
  const [searchTargetGroup, setSearchTargetGroup] = useState("");
  const [showTargetGroupDropdown, setShowTargetGroupDropdown] = useState(false);
  const [selectedTargetGroups, setSelectedTargetGroups] = useState([]);

  // Poll Unit state
  const [searchPollUnit, setSearchPollUnit] = useState("");
  const [showPollUnitDropdown, setShowPollUnitDropdown] = useState(false);

  // Get current user ID from token on mount
  useEffect(() => {
    const userId = getUserId();
    if (userId) {
      setFormData((prev) => ({ ...prev, userId }));
    }
  }, []);

  // Fetch target groups and poll units on mount
  useEffect(() => {
    dispatch(fetchTargetGroups());
    dispatch(fetchPollUnits());
  }, [dispatch]);

  // Handle form submission success
  useEffect(() => {
    if (success) {
      toast.success("Event successfully created!");
      resetForm();
      dispatch(resetEventState());
      // Redirect to events page
      router.push("/admin/dashboard/events");
    }
  }, [success, dispatch, router]);

  // Handle errors
  useEffect(() => {
    if (error) {
      if (error.errors) {
        setErrors(error.errors);
      }
      toast.error("Failed to create event. Please check the form.");
    }
  }, [error]);

  const resetForm = () => {
    setFormData({
      userId: formData.userId, // Keep the user ID
      subject: "",
      description: "",
      eventDateTime: "",
      imageFile: null,
      countDown: "",
      targetGroupIds: [],
      pollUnitId: "",
      hasNotification: false,
    });
    setImagePreview(null);
    setSearchTargetGroup("");
    setSearchPollUnit("");
    setSelectedTargetGroups([]);
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
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

  // Target Group handlers
  const handleTargetGroupSearchChange = (value) => {
    setSearchTargetGroup(value);
  };

  const handleTargetGroupToggleDropdown = (value) => {
    setShowTargetGroupDropdown(value);
  };

  const handleTargetGroupSelect = (group) => {
    if (!selectedTargetGroups.some((g) => g.id === group.id)) {
      const updatedGroups = [...selectedTargetGroups, group];
      setSelectedTargetGroups(updatedGroups);
      setFormData((prev) => ({
        ...prev,
        targetGroupIds: updatedGroups.map((g) => g.id),
      }));
    } else {
      handleTargetGroupRemove(group);
    }
  };

  const handleTargetGroupRemove = (group) => {
    const updatedGroups = selectedTargetGroups.filter((g) => g.id !== group.id);
    setSelectedTargetGroups(updatedGroups);
    setFormData((prev) => ({
      ...prev,
      targetGroupIds: updatedGroups.map((g) => g.id),
    }));
  };

  // Poll Unit handlers
  const handlePollUnitSearchChange = (value) => {
    setSearchPollUnit(value);
  };

  const handlePollUnitToggleDropdown = (value) => {
    setShowPollUnitDropdown(value);
  };

  const handlePollUnitSelect = (unit) => {
    setFormData((prev) => ({ ...prev, pollUnitId: unit.id }));
    setSearchPollUnit(unit.title || unit.name || `Poll Unit ${unit.id}`);
    setShowPollUnitDropdown(false);
  };

  const handlePollUnitClear = () => {
    setFormData((prev) => ({ ...prev, pollUnitId: "" }));
    setSearchPollUnit("");
  };

  const handlePushNotificationClick = () => {
    setFormData((prev) => ({
      ...prev,
      hasNotification: !prev.hasNotification,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form data being submitted:", formData); // Add logging to verify data
    dispatch(createEvent(formData));
  };

  const handleCancel = () => {
    router.back();
  };

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
              <Calendar className="w-4 h-4 text-[#0AAC9E]" />
            </div>
            <h1 className="text-lg font-semibold text-gray-900">
              Create Event
            </h1>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm  font-medium text-[#202939] mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-md focus:outline-none focus:ring-0 focus:border-[#01DBC8]"
                  required
                  placeholder="Subject"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#202939] mb-2">
                  Event Date & Time
                </label>
                <input
                  type="datetime-local"
                  name="eventDateTime"
                  value={formData.eventDateTime}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-md focus:outline-none focus:ring-0 focus:border-[#01DBC8]"
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
              <label className="block text-sm font-medium text-[#202939] mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-0 focus:border-[#01DBC8]"
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
                dragActive ? "border-[#0AAC9E] bg-[#f9fefe]" : "border-gray-300"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {!imagePreview ? (
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 bg-[#f2fdfc] rounded-full mb-3">
                    <Upload className="w-6 h-6 text-[#01DBC8]" />
                  </div>
                  <div className="text-sm">
                    <label className="text-[#01DBC8] hover:text-[#127D74] cursor-pointer font-medium">
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

            {/* Target Group Selector */}
            <div className="relative">
              {targetGroupsLoading && (
                <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10 rounded-lg">
                  <div className="flex flex-col items-center">
                    <div className="animate-spin h-8 w-8 border-4 border-[#01DBC8] border-t-transparent rounded-full"></div>
                    <div className="mt-2 text-sm text-gray-600">
                      Loading target groups...
                    </div>
                  </div>
                </div>
              )}
              <TargetGroupSelector
                targetGroups={targetGroups || []}
                searchValue={searchTargetGroup}
                selectedTargetGroups={selectedTargetGroups}
                showDropdown={showTargetGroupDropdown}
                onSearchChange={handleTargetGroupSearchChange}
                onToggleDropdown={handleTargetGroupToggleDropdown}
                onSelect={handleTargetGroupSelect}
                onRemove={handleTargetGroupRemove}
              />
            </div>

            {/* Poll Unit Selector */}
            <div className="relative">
              {pollUnitsLoading && (
                <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10 rounded-lg">
                  <div className="flex flex-col items-center">
                    <div className="animate-spin h-8 w-8 border-4 border-[#01DBC8] border-t-transparent rounded-full"></div>
                    <div className="mt-2 text-sm text-gray-600">
                      Loading poll units...
                    </div>
                  </div>
                </div>
              )}
              <PollUnitSelector
                pollUnits={pollUnits || []}
                searchValue={searchPollUnit}
                selectedPollUnitId={formData.pollUnitId}
                showDropdown={showPollUnitDropdown}
                onSearchChange={handlePollUnitSearchChange}
                onToggleDropdown={handlePollUnitToggleDropdown}
                onSelect={handlePollUnitSelect}
                onClear={handlePollUnitClear}
              />
            </div>

            {/* Countdown */}
            <div>
              <label className="block text-sm font-medium text-[#202939] mb-2">
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

            {/* Fixed Notification Toggle */}
            <div className="flex items-center space-x-2 p-4 border border-gray-200 rounded-lg">
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input
                  type="checkbox"
                  id="hasNotification"
                  name="hasNotification"
                  checked={formData.hasNotification}
                  onChange={handlePushNotificationClick}
                  className="sr-only peer"
                />
                <div
                  onClick={handlePushNotificationClick}
                  className="block h-6 bg-gray-200 rounded-full w-12 peer-checked:bg-[#01DBC8] cursor-pointer"
                ></div>
                <div
                  onClick={handlePushNotificationClick}
                  className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:left-7 cursor-pointer"
                ></div>
              </div>
              <label
                htmlFor="hasNotification"
                className="text-sm font-medium text-gray-700 cursor-pointer"
                onClick={handlePushNotificationClick}
              >
                Send push notification
              </label>
            </div>

            {/* Form Actions */}
            <FormActions
              isSubmitting={loading}
              onCancel={handleCancel}
              submitButtonText="Create Event"
              loadingText="Creating..."
            />
          </form>
        </div>
      </div>
    </div>
  );
};

export default EventForm;
