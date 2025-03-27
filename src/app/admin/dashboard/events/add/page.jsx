"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Upload,
  X,
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Edit2,
  Check,
} from "lucide-react";
import { toast } from "sonner";

import TargetGroupSelector from "@/components/targetSelect";
import PollUnitSelector from "@/components/polUnits";
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
    requirements: [],
  });

  const [errors, setErrors] = useState({});
  const [dragActive, setDragActive] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [tempImage, setTempImage] = useState(null);
  const [newRequirement, setNewRequirement] = useState("");
  const [editingIndex, setEditingIndex] = useState(-1);
  const [editValue, setEditValue] = useState("");

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
      requirements: [],
    });
    setImagePreview(null);
    setSearchTargetGroup("");
    setSearchPollUnit("");
    setSelectedTargetGroups([]);
    setNewRequirement("");
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Handle adding a new requirement
  const handleAddRequirement = () => {
    if (newRequirement.trim()) {
      setFormData({
        ...formData,
        requirements: [...formData.requirements, newRequirement.trim()],
      });
      setNewRequirement(""); // Clear the input field
    }
  };

  // Handle removing a requirement
  const handleRemoveRequirement = (index) => {
    const updatedRequirements = [...formData.requirements];
    updatedRequirements.splice(index, 1);
    setFormData({
      ...formData,
      requirements: updatedRequirements,
    });
  };

  // Start editing a requirement
  const handleStartEdit = (index) => {
    setEditingIndex(index);
    setEditValue(formData.requirements[index]);
  };

  // Save edited requirement
  const handleSaveEdit = () => {
    if (editValue.trim() && editingIndex >= 0) {
      const updatedRequirements = [...formData.requirements];
      updatedRequirements[editingIndex] = editValue.trim();
      setFormData({
        ...formData,
        requirements: updatedRequirements,
      });
      setEditingIndex(-1);
      setEditValue("");
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingIndex(-1);
    setEditValue("");
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
    console.log("Form data being submitted:", formData);
    dispatch(createEvent(formData));
  };

  const handleCancel = () => {
    router.back();
  };

  // Handle "Enter" key press in requirement input
  const handleRequirementKeyPress = (e) => {
    if (e.key === "Enter" && newRequirement.trim()) {
      e.preventDefault();
      handleAddRequirement();
    }
  };

  // Handle "Enter" key press in edit input
  const handleEditKeyPress = (e) => {
    if (e.key === "Enter" && editValue.trim()) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pt-12">
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

      <div className="max-w-7xl mx-auto px-4 md:px-6 mb-12">
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-3">
          <div className="flex items-center gap-2">
            <div className="bg-[#f9f9f9] p-2 rounded-md">
              <Calendar className="w-4 h-4 text-[#0AAC9E]" />
            </div>
            <h1 className="text-xl font-semibold text-gray-800">
              Create Event
            </h1>
          </div>
          <button
            onClick={() => router.push("/admin/dashboard/events")}
            className="flex items-center gap-1 text-gray-600 hover:text-gray-900 text-xs"
          >
            <ArrowLeft size={14} />
            <span>Back to events</span>
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-12 gap-5"
        >
          {/* Main content area - 8/12 width */}
          <div className="md:col-span-8 space-y-5">
            {/* Basic Info */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h2 className="text-sm font-medium mb-3">Event Details</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-[#202939] mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#01DBC8]"
                    required
                    placeholder="Enter event subject"
                  />
                  {errors.Subject && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.Subject[0]}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#202939] mb-1">
                    Event Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    name="eventDateTime"
                    value={formData.eventDateTime}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#01DBC8]"
                    required
                  />
                  {errors.EventDateTime && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.EventDateTime[0]}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h2 className="text-sm font-medium mb-3">Description</h2>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#01DBC8]"
                rows="4"
                placeholder="Describe the event..."
              ></textarea>
              {errors.Description && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.Description[0]}
                </p>
              )}
            </div>

            {/* Event Requirements */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-medium">Requirements</h2>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  {formData.requirements.length} items
                </span>
              </div>

              {/* Add new requirement */}
              <div className="flex gap-2 mb-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newRequirement}
                    onChange={(e) => setNewRequirement(e.target.value)}
                    onKeyPress={handleRequirementKeyPress}
                    placeholder="Add a requirement for participants"
                    className="w-full pl-3 pr-10 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#01DBC8]"
                  />
                  {newRequirement && (
                    <button
                      type="button"
                      onClick={() => setNewRequirement("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleAddRequirement}
                  disabled={!newRequirement.trim()}
                  className="px-3 py-2 bg-[#0AAC9E] text-white rounded-md hover:bg-[#099b8e] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <Plus size={14} />
                  <span className="text-xs">Add</span>
                </button>
              </div>

              {/* Requirements list */}
              {formData.requirements.length > 0 ? (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <ul className="divide-y divide-gray-200">
                    {formData.requirements.map((requirement, index) => (
                      <li
                        key={index}
                        className="p-2 hover:bg-gray-50 transition-colors"
                      >
                        {editingIndex === index ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={handleEditKeyPress}
                              className="flex-1 px-3 py-1 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#01DBC8]"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={handleSaveEdit}
                              className="p-1 text-white bg-[#0AAC9E] rounded-md hover:bg-[#099b8e]"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelEdit}
                              className="p-1 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-3 h-3 text-[#0AAC9E] flex-shrink-0" />
                              <span className="text-xs text-gray-700">
                                {requirement}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleStartEdit(index)}
                                className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                              >
                                <Edit2 size={12} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveRequirement(index)}
                                className="p-1 text-gray-400 hover:text-red-500 rounded-md hover:bg-gray-100"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="border border-dashed border-gray-200 rounded-lg p-4 text-center bg-gray-50">
                  <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">
                    No requirements added yet
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Add requirements that participants should know about
                  </p>
                </div>
              )}
            </div>

            {/* Image Upload */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h2 className="text-sm font-medium mb-3">Event Image</h2>
              <div
                className={`border-2 border-dashed rounded-lg p-4 ${
                  dragActive
                    ? "border-[#0AAC9E] bg-[#f9fefe]"
                    : "border-gray-300"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {!imagePreview ? (
                  <div className="flex flex-col items-center text-center">
                    <div className="p-2 bg-[#f2fdfc] rounded-full mb-2">
                      <Upload className="w-5 h-5 text-[#01DBC8]" />
                    </div>
                    <div className="text-xs">
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
                      JPG or JPEG (max. 10MB)
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="h-56 flex items-center justify-center">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-full object-contain rounded-lg"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setFormData((prev) => ({ ...prev, imageFile: null }));
                      }}
                      className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-lg text-gray-600 hover:text-gray-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - 4/12 width */}
          <div className="md:col-span-4 space-y-5">
            {/* Target Group Selector */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h2 className="text-sm font-medium mb-3">Target Groups</h2>
              <div className="relative">
                {targetGroupsLoading && (
                  <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10 rounded-lg">
                    <div className="flex flex-col items-center">
                      <div className="animate-spin h-6 w-6 border-3 border-[#01DBC8] border-t-transparent rounded-full"></div>
                      <div className="mt-2 text-xs text-gray-600">
                        Loading...
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
            </div>

            {/* Poll Unit Selector */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h2 className="text-sm font-medium mb-3">Poll Unit</h2>
              <div className="relative">
                {pollUnitsLoading && (
                  <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10 rounded-lg">
                    <div className="flex flex-col items-center">
                      <div className="animate-spin h-6 w-6 border-3 border-[#01DBC8] border-t-transparent rounded-full"></div>
                      <div className="mt-2 text-xs text-gray-600">
                        Loading...
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
            </div>

            {/* Count Down */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h2 className="text-sm font-medium mb-3">Countdown Format</h2>
              <select
                name="countDown"
                value={formData.countDown}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#01DBC8]"
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
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h2 className="text-sm font-medium mb-3">Notifications</h2>
              <div className="flex items-center space-x-2">
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
                    className="block h-5 bg-gray-200 rounded-full w-10 peer-checked:bg-[#01DBC8] cursor-pointer"
                  ></div>
                  <div
                    onClick={handlePushNotificationClick}
                    className="absolute left-1 top-0.5 w-4 h-4 bg-white rounded-full transition-all peer-checked:left-5 cursor-pointer"
                  ></div>
                </div>
                <label
                  htmlFor="hasNotification"
                  className="text-xs font-medium text-gray-700 cursor-pointer"
                  onClick={handlePushNotificationClick}
                >
                  Send push notification
                </label>
              </div>
            </div>
          </div>

          {/* Action buttons - full width at the bottom */}
          <div className="md:col-span-12 p-4 bg-white rounded-lg shadow-sm border border-gray-200 mt-3">
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="order-2 sm:order-1 px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition flex items-center justify-center gap-1"
              >
                <X size={14} />
                <span>Cancel</span>
              </button>
              <button
                type="submit"
                disabled={loading}
                className="order-1 sm:order-2 px-6 py-2 text-xs font-medium text-white bg-[#0AAC9E] rounded-md hover:bg-[#099b8e] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
              >
                {loading ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    <span>Create Event</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventForm;
