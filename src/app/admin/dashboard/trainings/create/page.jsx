"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getToken } from "@/authtoken/auth.js";
import LocationSelector from "@/components/locationSelector";
import TargetGroupSelector from "@/components/targetSelect";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Video,
  MapPin,
  Link as LinkIcon,
  AlertCircle,
  Save,
  Users,
  FileText,
  HelpCircle,
  Loader2,
  X,
  Check,
  PlusCircle,
  LayoutGrid,
} from "lucide-react";
import LoadingSpinner from "@/components/loadingSpinner";

const TrainingCreatePage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    location: "",
    datetime: "",
    duration: "",
    isOnline: false,
    hyperlink: "",
    targetGroupIds: [],
  });
  const [errors, setErrors] = useState({});
  const [targetGroups, setTargetGroups] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [selectedTargetGroups, setSelectedTargetGroups] = useState([]);
  const [showTooltip, setShowTooltip] = useState("");
  const [loadingModal, setLoadingModal] = useState(false);

  useEffect(() => {
    fetchTargetGroups();
  }, []);

  const fetchTargetGroups = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await fetch(
        "https://bravoadmin.uplms.org/api/TargetGroup/GetAllTargetGroups",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data && data[0]?.targetGroups) {
          setTargetGroups(data[0].targetGroups);
        } else {
          console.warn("Target groups data structure is unexpected", data);
          setTargetGroups([]);
        }
      } else {
        console.error("Failed to fetch target groups", await response.text());
        alert("Failed to load target groups. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching target groups:", error);
      alert("An error occurred while loading target groups. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  const handleLocationSelect = (location) => {
    setFormData({
      ...formData,
      location: location || "",
    });

    if (errors.location) {
      setErrors({
        ...errors,
        location: null,
      });
    }
  };

  const handleManualLocationChange = (e) => {
    const { value } = e.target;
    setFormData({
      ...formData,
      location: value,
    });

    if (errors.location) {
      setErrors({
        ...errors,
        location: null,
      });
    }
  };

  const handleTargetGroupSelect = (group) => {
    const isSelected = selectedTargetGroups.some(
      (selected) => selected.id === group.id
    );

    let newSelectedGroups = [];
    let newTargetGroupIds = [];

    if (isSelected) {
      newSelectedGroups = selectedTargetGroups.filter(
        (selected) => selected.id !== group.id
      );
      newTargetGroupIds = formData.targetGroupIds.filter(
        (id) => id !== group.id
      );
    } else {
      newSelectedGroups = [...selectedTargetGroups, group];
      newTargetGroupIds = [...formData.targetGroupIds, group.id];
    }

    setSelectedTargetGroups(newSelectedGroups);
    setFormData({
      ...formData,
      targetGroupIds: newTargetGroupIds,
    });

    if (errors.targetGroupIds) {
      setErrors({
        ...errors,
        targetGroupIds: null,
      });
    }
  };

  const handleTargetGroupRemove = (group) => {
    const newSelectedGroups = selectedTargetGroups.filter(
      (selected) => selected.id !== group.id
    );
    const newTargetGroupIds = formData.targetGroupIds.filter(
      (id) => id !== group.id
    );

    setSelectedTargetGroups(newSelectedGroups);
    setFormData({
      ...formData,
      targetGroupIds: newTargetGroupIds,
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    }

    if (!formData.datetime) {
      newErrors.datetime = "Date and time are required";
    } else {
      const selectedDate = new Date(formData.datetime);
      const now = new Date();

      if (selectedDate < now) {
        newErrors.datetime = "Date and time must be in the future";
      }
    }

    if (!formData.duration.trim()) {
      newErrors.duration = "Duration is required";
    } else if (isNaN(formData.duration) || parseFloat(formData.duration) <= 0) {
      newErrors.duration = "Duration must be a positive number";
    }

    if (!formData.isOnline && !formData.location.trim()) {
      newErrors.location = "Location is required for on-site training";
    }

    if (formData.isOnline && !formData.hyperlink.trim()) {
      newErrors.hyperlink = "Meeting link is required for online training";
    } else if (formData.hyperlink && !isValidUrl(formData.hyperlink)) {
      newErrors.hyperlink = "Please enter a valid URL";
    }

    if (formData.targetGroupIds.length === 0) {
      newErrors.targetGroupIds = "At least one target group is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      const firstError = Object.keys(errors)[0];
      const element =
        document.querySelector(`[name="${firstError}"]`) ||
        document.getElementById(firstError);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    try {
      setSubmitting(true);
      setLoadingModal(true);
      const token = getToken();
      const response = await fetch(
        "https://bravoadmin.uplms.org/api/Training",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        router.push("/admin/dashboard/trainings");
      } else {
        const errorData = await response.json();
        console.error("Failed to create training:", errorData);
        alert("Failed to create training. Please try again.");
      }
    } catch (error) {
      console.error("Error creating training:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
      setLoadingModal(false);
    }
  };

  const renderTooltip = (content) => {
    return (
      <div className="absolute z-10 top-0 left-full ml-2 w-64 p-3 bg-gray-800 text-white text-sm rounded-lg shadow-lg">
        {content}
        <div className="absolute left-0 top-3 transform -translate-x-full border-8 border-transparent border-r-gray-800"></div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-14 ">
      {/* Loading Modal */}
      {loadingModal && <LoadingSpinner />}

      {/* Header */}
      <div className=" mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            Create New Training
          </h1>
          <Link
            href="/admin/dashboard/trainings"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium bg-white py-2 px-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all"
          >
            <ArrowLeft size={18} />
            <span>Back to Trainings</span>
          </Link>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Training Details Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
              <FileText size={18} className="mr-2 text-[#0AAC9E]" />
              Training Details
            </h2>
            <div className="space-y-6">
              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="Enter training subject"
                  className={`w-full px-3 py-2.5 rounded-lg border ${
                    errors.subject
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-[#01DBC8] focus:ring-[#01DBC8]"
                  } focus:outline-none focus:ring-1 focus:ring-opacity-50 bg-white shadow-sm`}
                />
                {errors.subject && (
                  <div className="mt-1 flex items-center text-red-600 text-xs">
                    <AlertCircle size={12} className="mr-1" />
                    <p>{errors.subject}</p>
                  </div>
                )}
              </div>

              {/* Date and Time + Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date and Time <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Calendar size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="datetime-local"
                      name="datetime"
                      value={formData.datetime}
                      onChange={handleInputChange}
                      className={`w-full pl-9 pr-3 py-2.5 rounded-lg border ${
                        errors.datetime
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:border-[#01DBC8] focus:ring-[#01DBC8]"
                      } focus:outline-none focus:ring-1 focus:ring-opacity-50 bg-white shadow-sm`}
                    />
                    {errors.datetime && (
                      <div className="mt-1 flex items-center text-red-600 text-xs">
                        <AlertCircle size={12} className="mr-1" />
                        <p>{errors.datetime}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (hrs) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Clock size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      placeholder="e.g., 2"
                      className={`w-full pl-9 pr-3 py-2.5 rounded-lg border ${
                        errors.duration
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:border-[#01DBC8] focus:ring-[#01DBC8]"
                      } focus:outline-none focus:ring-1 focus:ring-opacity-50 bg-white shadow-sm`}
                    />
                    {errors.duration && (
                      <div className="mt-1 flex items-center text-red-600 text-xs">
                        <AlertCircle size={12} className="mr-1" />
                        <p>{errors.duration}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <MapPin size={18} className="mr-2 text-[#0AAC9E]" />
                Training Location
              </h2>
            </div>

            {/* Location Type Toggle */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex rounded-lg overflow-hidden border border-gray-200">
                <button
                  type="button"
                  onClick={() =>
                    handleInputChange({
                      target: {
                        name: "isOnline",
                        checked: false,
                        type: "checkbox",
                      },
                    })
                  }
                  className={`flex items-center gap-2 px-4 py-2.5 ${
                    !formData.isOnline
                      ? "bg-[#0AAC9E] text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  } transition-colors`}
                >
                  <MapPin size={18} />
                  <span>On-Site</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleInputChange({
                      target: {
                        name: "isOnline",
                        checked: true,
                        type: "checkbox",
                      },
                    })
                  }
                  className={`flex items-center gap-2 px-4 py-2.5 ${
                    formData.isOnline
                      ? "bg-[#0AAC9E] text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  } transition-colors`}
                >
                  <Video size={18} />
                  <span>Online</span>
                </button>
              </div>
            </div>

            {/* Location Content */}
            {formData.isOnline ? (
              <div className="p-4 bg-gradient-to-br from-blue-50 to-transparent rounded-lg border dial border-blue-100">
                <div className="mb-2 flex items-start">
                  <Video size={18} className="text-blue-500 mr-2 mt-1" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-800">
                      Online Training
                    </h3>
                    <p className="text-xs text-gray-500">
                      Provide a meeting link for participants to join
                    </p>
                  </div>
                </div>
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meeting Link <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <LinkIcon size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="hyperlink"
                      value={formData.hyperlink}
                      onChange={handleInputChange}
                      placeholder="https://zoom.us/j/meeting"
                      className={`w-full pl-9 pr-3 py-2.5 rounded-lg border ${
                        errors.hyperlink
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:border-[#01DBC8] focus:ring-[#01DBC8]"
                      } focus:outline-none focus:ring-1 focus:ring-opacity-50 bg-white shadow-sm`}
                    />
                  </div>
                  {errors.hyperlink && (
                    <div className="mt-1 flex items-center text-red-600 text-xs">
                      <AlertCircle size={12} className="mr-1" />
                      <p>{errors.hyperlink}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-gradient-to-br from-amber-50 to-transparent rounded-lg border border-amber-100">
                <div className="mb-2 flex items-start">
                  <MapPin size={18} className="text-amber-500 mr-2 mt-1" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-800">
                      On-Site Training
                    </h3>
                    <p className="text-xs text-gray-500">
                      Select a location from the map or enter it manually
                    </p>
                  </div>
                </div>
                <div className="mt-3 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Location from Map
                    </label>
                    <div
                      className={`rounded-lg ${
                        errors.location ? "ring-1 ring-red-300" : ""
                      }`}
                    >
                      <LocationSelector
                        onLocationSelect={handleLocationSelect}
                        initialLocation={formData.location}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Or Enter Location Manually{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <MapPin size={16} className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleManualLocationChange}
                        placeholder="e.g., 123 Main St, City, Country"
                        className={`w-full pl-9 pr-3 py-2.5 rounded-lg border ${
                          errors.location
                            ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:border-[#01DBC8] focus:ring-[#01DBC8]"
                        } focus:outline-none focus:ring-1 focus:ring-opacity-50 bg-white shadow-sm`}
                      />
                    </div>
                    {errors.location && (
                      <div className="mt-1 flex items-center text-red-600 text-xs">
                        <AlertCircle size={12} className="mr-1" />
                        <p>{errors.location}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Target Groups Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <Users size={18} className="mr-2 text-[#0AAC9E]" />
                Target Groups
              </h2>
            </div>
            <div>
              <div
                className={
                  errors.targetGroupIds
                    ? "border border-red-300 rounded-lg"
                    : ""
                }
              >
                <TargetGroupSelector
                  targetGroups={targetGroups || []}
                  searchValue={searchValue}
                  selectedTargetGroups={selectedTargetGroups}
                  showDropdown={showDropdown}
                  onSearchChange={setSearchValue}
                  onToggleDropdown={setShowDropdown}
                  onSelect={handleTargetGroupSelect}
                  onRemove={handleTargetGroupRemove}
                />
              </div>
              {errors.targetGroupIds && (
                <div className="mt-1 flex items-center text-red-600 text-xs">
                  <AlertCircle size={12} className="mr-1" />
                  <p>{errors.targetGroupIds}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row gap-4 justify-end  mx-auto">
          <Link
            href="/admin/dashboard/trainings"
            className="px-6 py-2.5 bg-white hover:bg-gray-50 text-gray-700 rounded-lg transition-colors font-medium text-sm border border-gray-200 shadow-sm order-2 sm:order-1"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className={`px-8 py-2.5 bg-[#0AAC9E] hover:bg-[#089385] text-white rounded-lg transition-colors font-medium text-sm flex items-center gap-2 shadow-sm order-1 sm:order-2 ${
              submitting ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Create Training</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TrainingCreatePage;
