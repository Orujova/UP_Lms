"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

// Import modular components
import BasicInfo from "@/components/announcement/BasicInfo";
import Description from "@/components/announcement/Description";
import ImageUpload from "@/components/announcement/ImageUpload";
import PollUnitSelector from "@/components/announcement/PollUnitSelector";
import TargetGroupSelector from "@/components/announcement/TargetGroupSelector";
import Settings from "@/components/announcement/Settings";
import FormActions from "@/components/announcement/FormActions";
import LoadingSpinner from "@/components/loadingSpinner";

// Import auth functions for API access
import { getToken, getUserId } from "@/authtoken/auth.js";

export default function EditAnnouncement({ params }) {
  const router = useRouter();
  const { id } = params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Poll Unit state
  const [pollUnits, setPollUnits] = useState([]);
  const [searchPollUnit, setSearchPollUnit] = useState("");
  const [showPollUnitDropdown, setShowPollUnitDropdown] = useState(false);

  // Target Group state
  const [targetGroups, setTargetGroups] = useState([]);
  const [searchTargetGroup, setSearchTargetGroup] = useState("");
  const [showTargetGroupDropdown, setShowTargetGroupDropdown] = useState(false);
  const [selectedTargetGroups, setSelectedTargetGroups] = useState([]);

  const [formData, setFormData] = useState({
    id: "",
    Title: "",
    SubTitle: "",
    Description: "",
    ShortDescription: "",
    Priority: "NORMAL",
    ScheduledDate: "",
    ExpiryDate: "",
    PollUnitId: "",
    TargetGroupId: "",
    ImageFile: null,
    HasNotification: false,
  });

  // Initialize component - fetch announcement and supporting data
  useEffect(() => {
    // Load all required data in parallel
    Promise.all([
      fetchAnnouncementData(),
      fetchPollUnits(),
      fetchTargetGroups(),
    ]).catch((error) => {
      console.error("Error loading initial data:", error);
      setError("Failed to load required data. Please try again.");
      setLoading(false);
    });

    // Set a timeout to exit loading state if taking too long
    const loadingTimeout = setTimeout(() => {
      if (loading) {
        console.log("Forcing exit from loading state after timeout");
        setLoading(false);
      }
    }, 10000);

    return () => clearTimeout(loadingTimeout);
  }, [id]);

  // Direct API call to fetch announcement data
  const fetchAnnouncementData = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const userId = getUserId() || 0;

      const response = await fetch(
        `https://bravoadmin.uplms.org/api/Announcement/${id}?userid=${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error (${response.status}):`, errorText);
        throw new Error(`Failed to fetch announcement: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Announcement data received:", data);

      // Update form data from the API response
      setFormData({
        id: data.id || 0,
        Title: data.title || "",
        SubTitle: data.subTitle || "",
        Description: data.description || "",
        ShortDescription: data.shortDescription || "",
        Priority: data.priority || "NORMAL",
        ScheduledDate: data.scheduledDate?.split("T")[0] || "",
        ExpiryDate: data.expiryDate?.split("T")[0] || "",
        PollUnitId:
          data.pollUnitId === 0 ? "" : data.pollUnitId?.toString() || "",
        TargetGroupId: data.targetGroupId?.toString() || "",
        HasNotification: data.hasNotification || false,
      });

      // Process target groups
      if (data.targetGroupIds && data.targetGroups) {
        const selectedGroups = data.targetGroupIds.map((id, index) => ({
          id: id,
          name: data.targetGroups[index],
        }));
        setSelectedTargetGroups(selectedGroups);
      }

      // Set image preview
      if (data.imageUrl) {
        setImagePreview(
          `https://bravoadmin.uplms.org/uploads/${data.imageUrl.replace(
            "https://100.42.179.27:7198/",
            ""
          )}`
        );
      }
    } catch (error) {
      console.error("Error fetching announcement:", error);
      setError(error.message || "Failed to load announcement data");
      toast.error("Failed to load announcement data");
    } finally {
      setLoading(false);
    }
  };

  const fetchPollUnits = async () => {
    try {
      const token = getToken();
      const response = await fetch(
        "https://bravoadmin.uplms.org/api/PollUnit?Page=1&ShowMore.Take=100",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch poll units: ${response.statusText}`);
      }

      const data = await response.json();
      setPollUnits(data[0].pollUnits);
    } catch (error) {
      console.error("Error fetching poll units:", error);
      toast.error("Failed to load poll units");
    }
  };

  const fetchTargetGroups = async () => {
    try {
      const token = getToken();
      const response = await fetch(
        "https://bravoadmin.uplms.org/api/TargetGroup/GetAllTargetGroups?Page=1&ShowMore.Take=100",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch target groups: ${response.statusText}`
        );
      }

      const data = await response.json();
      setTargetGroups(data[0].targetGroups);
    } catch (error) {
      console.error("Error fetching target groups:", error);
      toast.error("Failed to load target groups");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (file, preview) => {
    setFormData((prev) => ({ ...prev, ImageFile: file }));
    setImagePreview(preview);
  };

  const handleImageRemove = () => {
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, ImageFile: null }));
  };

  const handleSelectPollUnit = (unit) => {
    setFormData((prev) => ({ ...prev, PollUnitId: unit.id.toString() }));
    setSearchPollUnit(unit.title);
    setShowPollUnitDropdown(false);
  };

  const handleClearPollUnit = () => {
    setFormData((prev) => ({ ...prev, PollUnitId: "" }));
    setSearchPollUnit("");
  };

  const handleSelectTargetGroup = (group) => {
    // Check if already selected
    if (!selectedTargetGroups.some((item) => item.id === group.id)) {
      const updatedGroups = [...selectedTargetGroups, group];
      setSelectedTargetGroups(updatedGroups);

      // Update the TargetGroupId in formData (using the first group's ID for compatibility)
      setFormData((prev) => ({
        ...prev,
        TargetGroupId: updatedGroups[0].id.toString(),
      }));
    }
    setSearchTargetGroup("");
  };

  const handleRemoveTargetGroup = (group) => {
    const updatedGroups = selectedTargetGroups.filter(
      (item) => item.id !== group.id
    );
    setSelectedTargetGroups(updatedGroups);

    // Update the TargetGroupId in formData
    setFormData((prev) => ({
      ...prev,
      TargetGroupId:
        updatedGroups.length > 0 ? updatedGroups[0].id.toString() : "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = getToken();
      const userId = getUserId();
      const formDataToSend = new FormData();

      // Add all form fields to FormData with exactly the right casing
      // Use the exact field names from the API documentation
      formDataToSend.append("AnnouncementId", formData.id);
      formDataToSend.append("Title", formData.Title);
      formDataToSend.append("SubTitle", formData.SubTitle);
      formDataToSend.append("Description", formData.Description);
      formDataToSend.append("ShortDescription", formData.ShortDescription);
      formDataToSend.append("Priority", formData.Priority);

      // Format dates properly (API expects YYYY-MM-DD)
      formDataToSend.append("ScheduledDate", formData.ScheduledDate);
      formDataToSend.append("ExpiryDate", formData.ExpiryDate);

      // Add Poll Unit ID (ensure it's a proper integer)
      if (formData.PollUnitId) {
        formDataToSend.append("PollUnitId", parseInt(formData.PollUnitId, 10));
      } else {
        formDataToSend.append("PollUnitId", 0); // Send 0 for no poll unit
      }

      // Add Target Group IDs as an array
      if (selectedTargetGroups.length > 0) {
        selectedTargetGroups.forEach((group) => {
          formDataToSend.append("TargetGroupIds", group.id);
        });
      } else if (formData.TargetGroupId) {
        // Fallback to single TargetGroupId if needed
        formDataToSend.append(
          "TargetGroupIds",
          parseInt(formData.TargetGroupId, 10)
        );
      }

      // Add notification flag
      formDataToSend.append("HasNotification", formData.HasNotification);

      // Add UserId to FormData
      if (userId) {
        formDataToSend.append("UserId", userId);
      }

      // Handle ImageFile
      if (formData.ImageFile) {
        formDataToSend.append(
          "ImageFile",
          formData.ImageFile,
          formData.ImageFile.name
        );
      }

      for (let pair of formDataToSend.entries()) {
        console.log(pair[0] + ": " + pair[1]);
      }

      // Make direct API call to update announcement
      const response = await fetch(
        "https://bravoadmin.uplms.org/api/Announcement",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formDataToSend,
        }
      );

      // Handle response
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", errorText);
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(
            errorData?.message || "Failed to update announcement"
          );
        } catch (jsonError) {
          throw new Error(
            `Server error: ${response.status} ${response.statusText}`
          );
        }
      }

      const result = await response.json();
      console.log("Update result:", result);

      toast.success("Announcement updated successfully");
      setTimeout(() => {
        router.push("/admin/dashboard/announcements");
      }, 1500);
    } catch (error) {
      toast.error("Failed to update announcement: " + error.message);
      console.error("Error updating announcement:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pt-10">
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0 text-red-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading data
              </h3>
              <div className="mt-1 text-sm text-red-700">{error}</div>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={fetchAnnouncementData}
                className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-xs"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gray-50/50">
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
            <h1 className="text-lg font-semibold mt-2">Edit Announcement</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <ImageUpload
            imagePreview={imagePreview}
            onImageChange={handleImageChange}
            onImageRemove={handleImageRemove}
          />

          {/* Basic Information */}
          <BasicInfo
            title={formData.Title}
            subtitle={formData.SubTitle}
            onInputChange={handleInputChange}
          />

          {/* Description */}
          <Description
            shortDescription={formData.ShortDescription}
            fullDescription={formData.Description}
            onInputChange={handleInputChange}
          />

          {/* Poll Unit Selector */}
          <PollUnitSelector
            pollUnits={pollUnits}
            searchValue={searchPollUnit}
            selectedPollUnitId={formData.PollUnitId}
            showDropdown={showPollUnitDropdown}
            onSearchChange={setSearchPollUnit}
            onToggleDropdown={setShowPollUnitDropdown}
            onSelect={handleSelectPollUnit}
            onClear={handleClearPollUnit}
          />

          {/* Target Group Selector */}
          <TargetGroupSelector
            targetGroups={targetGroups}
            searchValue={searchTargetGroup}
            selectedTargetGroups={selectedTargetGroups}
            showDropdown={showTargetGroupDropdown}
            onSearchChange={setSearchTargetGroup}
            onToggleDropdown={setShowTargetGroupDropdown}
            onSelect={handleSelectTargetGroup}
            onRemove={handleRemoveTargetGroup}
          />

          {/* Settings */}
          <Settings
            priority={formData.Priority}
            scheduledDate={formData.ScheduledDate}
            expiryDate={formData.ExpiryDate}
            hasNotification={formData.HasNotification}
            onInputChange={handleInputChange}
          />

          {/* Action Buttons */}
          <FormActions
            isSubmitting={saving}
            onCancel={() => router.push("/admin/dashboard/announcements")}
            submitButtonText="Save Changes"
            loadingText="Saving..."
          />
        </form>
      </div>
    </div>
  );
}
