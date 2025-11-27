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
  MapPin,
  Bell,
  Clock,
  Users,
  FileText,
  Image as ImageIcon,
  Target,
  Info,
} from "lucide-react";
import { toast } from "sonner";

import TargetGroupSelector from "@/components/targetSelect";
import PollUnitSelector from "@/components/polUnits";
import CropModal from "@/components/event/CropModal";
import LocationSelector from "@/components/locationSelector";

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
    location: "", // Location field
    locationCoordinates: null, // New field for coordinates
  });

  const [errors, setErrors] = useState({});
  const [dragActive, setDragActive] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [tempImage, setTempImage] = useState(null);
  const [newRequirement, setNewRequirement] = useState("");
  const [editingIndex, setEditingIndex] = useState(-1);
  const [editValue, setEditValue] = useState("");
  const [formProgress, setFormProgress] = useState(0);
  const [brandingData, setBrandingData] = useState(null);

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

  // Fetch branding data on component mount
  useEffect(() => {
    const fetchBrandingData = async () => {
      try {
        const response = await fetch('https://demoadmin.databyte.app/api/BrendingSetting?IsEvent=true');
        const data = await response.json();
        if (data && data.length > 0) {
          setBrandingData(data[0]);
        }
      } catch (error) {
        console.error('Error fetching branding data:', error);
      }
    };

    fetchBrandingData();
  }, []);

  // Update form progress
  useEffect(() => {
    const calculateProgress = () => {
      let progress = 0;
      const totalFields = 5; // Count of important fields

      if (formData.subject) progress += 1;
      if (formData.eventDateTime) progress += 1;
      if (formData.location) progress += 1;
      if (formData.description) progress += 1;
      if (formData.imageFile || getDefaultEventImage()) progress += 1;

      return Math.round((progress / totalFields) * 100);
    };

    setFormProgress(calculateProgress());
  }, [formData, brandingData]);

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

  // Helper function to format URLs
  const formatImageUrl = (urlStr) => {
    if (!urlStr) return null;

    if (urlStr.includes("100.42.179.27:7298")) {
      const baseDir = urlStr.includes("brending/") ? "" : "brending/";
      const fileName = urlStr.split("/").pop();
      return `https://demoadmin.databyte.app/uploads/brending/${baseDir}${fileName}`;
    }

    // Already correctly formatted URLs
    if (urlStr.startsWith("https://demoadmin.databyte.app/uploads/brending/")) {
      return urlStr;
    }

    // Relative paths with brending prefix
    if (urlStr.startsWith("brending/")) {
      return `https://demoadmin.databyte.app/uploads/${urlStr}`;
    }

    // Other relative paths without protocol
    if (!urlStr.startsWith("http") && !urlStr.startsWith("https")) {
      const baseDir = urlStr.includes("brending/") ? "" : "brending/";
      const cleanPath = urlStr.replace(/^\/+/, "");
      return `https://demoadmin.databyte.app/uploads/brending/${baseDir}${cleanPath}`;
    }

    return urlStr;
  };

  // Get the default event image
  const getDefaultEventImage = () => {
    if (brandingData && brandingData.eventCoverPhotoUrl) {
      return formatImageUrl(brandingData.eventCoverPhotoUrl);
    }
    return null;
  };

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
      location: "",
      locationCoordinates: null,
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

  // Handle location selection from the map component
  const handleLocationSelect = (address, coordinates) => {
    setFormData((prev) => ({
      ...prev,
      location: address,
      locationCoordinates: coordinates,
    }));
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

    // Prepare API data
    const apiEventRequirements = formData.requirements.map((req) => req);

    const apiData = {
      ...formData,
      eventRequirements: apiEventRequirements,
    };

    dispatch(createEvent(apiData));
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

      <div>
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
          {/* Left Column - Main Form Content - 7/12 width */}
          <div className="md:col-span-7 space-y-5">
            {/* Basic Info Card */}
            <div className="bg-white rounded-lg px-5 py-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-4 h-4 text-[#0AAC9E]" />
                <h2 className="text-sm font-medium">Basic Information</h2>
              </div>

              <div className="space-y-4">
                {/* Subject */}
                <div>
                  <label className="block text-xs font-medium text-[#202939] mb-1">
                    Event Title
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-0 focus:border-[#01DBC8]"
                    required
                    placeholder="Enter event title"
                  />
                  {errors.Subject && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.Subject[0]}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-medium text-[#202939] mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-0 focus:border-[#01DBC8]"
                    rows="4"
                    placeholder="Describe the event..."
                  ></textarea>
                  {errors.Description && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.Description[0]}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Date, Time & Location Card */}
            <div className="bg-white rounded-lg px-5 py-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4 text-[#0AAC9E]" />
                <h2 className="text-sm font-medium">Date, Time & Location</h2>
              </div>

              <div className="space-y-4">
                {/* Date & Time */}
                <div>
                  <label className="block text-xs font-medium text-[#202939] mb-1">
                    Event Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    name="eventDateTime"
                    value={formData.eventDateTime}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-0 focus:border-[#01DBC8]"
                    required
                  />
                  {errors.EventDateTime && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.EventDateTime[0]}
                    </p>
                  )}
                </div>

                {/* Location with Map Integration */}
                <div>
                  <label className="block text-xs font-medium text-[#202939] mb-1">
                    Event Location
                  </label>
                  <LocationSelector
                    onLocationSelect={handleLocationSelect}
                    initialLocation={formData.location}
                  />
                  {errors.Location && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.Location[0]}
                    </p>
                  )}
                </div>

                {/* Count Down Format */}
                <div>
                  <label className="block text-xs font-medium text-[#202939] mb-1">
                    Countdown Format
                  </label>
                  <select
                    name="countDown"
                    value={formData.countDown}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-0 focus:border-[#01DBC8]"
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
              </div>
            </div>

            {/* Event Image Card */}
            <div className="bg-white rounded-lg px-5 py-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <ImageIcon className="w-4 h-4 text-[#0AAC9E]" />
                <h2 className="text-sm font-medium">Event Image</h2>
              </div>

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
                {!imagePreview && !getDefaultEventImage() ? (
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
                    <div className="h-32 flex items-center justify-center">
                      <img
                        src={imagePreview || getDefaultEventImage()}
                        alt="Event Preview"
                        className="h-full object-contain rounded-lg"
                      />
                    </div>
                    {imagePreview && (
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
                    )}
                    {!imagePreview && getDefaultEventImage() && (
                      <div className="absolute top-2 left-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          Default
                        </span>
                      </div>
                    )}
                    {!imagePreview && (
                      <div className="absolute bottom-2 right-2">
                        <label className="px-3 py-1 bg-[#0AAC9E] text-white text-xs rounded-md cursor-pointer hover:bg-[#099b8e]">
                          Change Image
                          <input
                            type="file"
                            className="hidden"
                            onChange={handleFileChange}
                            accept="image/jpeg,image/jpg"
                          />
                        </label>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {!imagePreview && getDefaultEventImage() && (
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-xs text-blue-700 flex items-center gap-1">
                    <Info size={12} />
                    Using default event branding image. Upload your own image to customize.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Settings & Requirements - 5/12 width */}
          <div className="md:col-span-5 space-y-5">
            {/* Audience Targeting Card */}
            <div className="bg-white rounded-lg p-5 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-4 h-4 text-[#0AAC9E]" />
                <h2 className="text-sm font-medium">Audience Targeting</h2>
              </div>

              {/* Target Group Selector */}
              <div className="mb-4">
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
              <div>
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

            {/* Notification Settings Card */}
            <div className="bg-white rounded-lg p-5 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <Bell className="w-4 h-4 text-[#0AAC9E]" />
                <h2 className="text-sm font-medium">Notification Settings</h2>
              </div>

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
                  className="text-xs text-gray-700 cursor-pointer"
                >
                  Send push notification to participants
                </label>
              </div>

              {formData.hasNotification && (
                <div className="mt-2 bg-[#f9fefe] p-3 rounded-md border border-[#e0f7f5] text-xs">
                  <div className="flex gap-2">
                    <Info
                      size={14}
                      className="text-[#0AAC9E] flex-shrink-0 mt-0.5"
                    />
                    <p className="text-gray-600">
                      Participants will receive notifications:
                      <ul className="list-disc pl-4 mt-1 space-y-1">
                        <li>When the event is created</li>
                        <li>24 hours before the event</li>
                        <li>1 hour before the event starts</li>
                      </ul>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Requirements Card */}
            <div className="bg-white rounded-lg p-5 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#0AAC9E]" />
                  <h2 className="text-sm font-medium">Event Requirements</h2>
                </div>
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
                    className="w-full pl-3 pr-10 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-0 focus:border-[#01DBC8]"
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
                  <span className="text-xs font-medium">Add</span>
                </button>
              </div>

              {/* Requirements list */}
              {formData.requirements.length > 0 ? (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <ul className="divide-y divide-gray-200 max-h-64 overflow-y-auto">
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
                              className="flex-1 px-3 py-1 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-0 focus:border-[#01DBC8]"
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
                    Add requirements that participants should fulfill
                  </p>
                </div>
              )}
            </div>

        

            {/* Action Buttons */}
            <div className="bg-white rounded-lg p-5 border border-gray-200">
              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={loading || formProgress < 60}
                  className="w-full px-6 py-3 text-sm font-medium text-white bg-[#0AAC9E] rounded-md hover:bg-[#099b8e] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      <span>Creating Event...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      <span>Create Event</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="w-full px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition flex items-center justify-center gap-2"
                >
                  <X size={16} />
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventForm;