"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  createAnnouncementAsync,
  resetCreateStatus,
} from "@/redux/announcement/announcement";
import { getParsedToken } from "@/authtoken/auth.js";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

// Import components
import ImageUpload from "@/components/announcement/ImageUpload";
import BasicInfo from "@/components/announcement/BasicInfo";
import Description from "@/components/announcement/Description";
import PollUnitSelector from "@/components/announcement/PollUnitSelector";
import TargetGroupSelector from "@/components/announcement/TargetGroupSelector";
import Settings from "@/components/announcement/Settings";
import FormActions from "@/components/announcement/FormActions";

const NewAnnouncementPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const loadingTimeoutRef = useRef(null); // Ref for safety timeout

  // Redux state
  const error = useSelector((state) => state.announcement?.error);
  const createSuccess = useSelector(
    (state) => state.announcement?.createSuccess
  );

  // Component state for form data
  const [formData, setFormData] = useState({
    Title: "",
    SubTitle: "",
    Description: "",
    ShortDescription: "",
    Priority: "NORMAL",
    ScheduledDate: "",
    ExpiryDate: "",
    PollUnitId: "",
    TargetGroupIds: [],
    UserId: "",
    ImageFile: null,
    HasNotification: false,
  });

  // Image state
  const [imagePreview, setImagePreview] = useState(null);

  // Dropdown states
  const [pollUnits, setPollUnits] = useState([]);
  const [targetGroups, setTargetGroups] = useState([]);

  // Search state
  const [searchPollUnit, setSearchPollUnit] = useState("");
  const [searchTargetGroup, setSearchTargetGroup] = useState("");

  // Dropdown visibility state
  const [showPollUnitDropdown, setShowPollUnitDropdown] = useState(false);
  const [showTargetGroupDropdown, setShowTargetGroupDropdown] = useState(false);

  const [selectedTargetGroups, setSelectedTargetGroups] = useState([]);

  // Safety function to ensure loading state is reset
  const safelySetLoading = (isLoading) => {
    // Clear any existing timeout
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }

    setLoading(isLoading);

    // If setting to true, set a safety timeout to force it back to false
    if (isLoading) {
      loadingTimeoutRef.current = setTimeout(() => {
        setLoading(false);
        console.log("⚠️ Safety timeout triggered to reset loading state");
      }, 10000); // 10-second safety timeout
    }
  };

  useEffect(() => {
    Promise.all([fetchPollUnits(), fetchTargetGroups()]).catch((error) => {
      toast.error("Error loading data");
      console.error("Error:", error);
    });

    const parsedToken = getParsedToken();
    if (parsedToken?.UserID) {
      setFormData((prev) => ({ ...prev, UserId: parsedToken.UserID }));
    } else {
      toast.error("Failed to retrieve user ID.");
    }

    return () => {
      dispatch(resetCreateStatus());
      // Clean up safety timeout on unmount
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [dispatch]);

  useEffect(() => {
    if (createSuccess) {
      toast.success("Announcement created successfully");
      safelySetLoading(false);

      setTimeout(() => {
        router.push("/admin/dashboard/announcements");
      }, 1500);
    }

    if (error) {
      toast.error(error || "Failed to create announcement");
      safelySetLoading(false);
    }
  }, [createSuccess, error, router]);

  // Fetch poll units
  const fetchPollUnits = async () => {
    try {
      const response = await fetch(
        "https://bravoadmin.uplms.org/api/PollUnit?Page=1&ShowMore.Take=100"
      );
      const data = await response.json();
      setPollUnits(data[0].pollUnits);
    } catch (error) {
      console.error("Error fetching poll units:", error);
      toast.error("Failed to load poll units");
    }
  };

  // Fetch target groups
  const fetchTargetGroups = async () => {
    try {
      const response = await fetch(
        "https://bravoadmin.uplms.org/api/TargetGroup/GetAllTargetGroups?Page=1&ShowMore.Take=100"
      );
      const data = await response.json();
      setTargetGroups(data[0].targetGroups);
    } catch (error) {
      console.error("Error fetching target groups:", error);
      toast.error("Failed to load target groups");
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle image change
  const handleImageChange = (file, preview) => {
    setFormData((prev) => ({ ...prev, ImageFile: file }));
    setImagePreview(preview);
  };

  // Handle image removal
  const handleImageRemove = () => {
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, ImageFile: null }));
  };

  // Handle poll unit selection
  const handlePollUnitSelect = (unit) => {
    setFormData((prev) => ({
      ...prev,
      PollUnitId: unit.id.toString(),
    }));
    setSearchPollUnit(unit.title);
    setShowPollUnitDropdown(false);
  };

  // Clear selected poll unit
  const handleClearPollUnit = () => {
    setFormData((prev) => ({ ...prev, PollUnitId: "" }));
    setSearchPollUnit("");
  };

  // Handle target group selection
  const handleTargetGroupSelect = (group) => {
    // Check if already selected
    const isSelected = selectedTargetGroups.some(
      (item) => item.id === group.id
    );

    if (isSelected) {
      // Remove from selection
      setSelectedTargetGroups((prev) =>
        prev.filter((item) => item.id !== group.id)
      );
      setFormData((prev) => ({
        ...prev,
        TargetGroupIds: prev.TargetGroupIds.filter(
          (id) => id !== group.id.toString()
        ),
      }));
    } else {
      // Add to selection
      setSelectedTargetGroups((prev) => [...prev, group]);
      setFormData((prev) => ({
        ...prev,
        TargetGroupIds: [...prev.TargetGroupIds, group.id.toString()],
      }));
    }
  };

  // Handle target group removal
  const handleTargetGroupRemove = (group) => {
    handleTargetGroupSelect(group);
  };

  // Handle form submission - completely revamped
  const handleSubmit = async (e) => {
    e.preventDefault();
    safelySetLoading(true);
    console.log("Starting form submission, loading state set to true");

    // Basic validation
    if (!formData.Title.trim()) {
      toast.error("Title is required");
      safelySetLoading(false);
      return;
    }

    if (formData.TargetGroupIds.length === 0) {
      toast.error("Please select at least one target group");
      safelySetLoading(false);
      return;
    }

    if (!formData.ScheduledDate) {
      toast.error("Schedule date is required");
      safelySetLoading(false);
      return;
    }

    if (!formData.ExpiryDate) {
      toast.error("Expiry date is required");
      safelySetLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();

      // Add basic form fields
      formDataToSend.append("Title", formData.Title.trim());
      formDataToSend.append("SubTitle", formData.SubTitle.trim());
      formDataToSend.append("Description", formData.Description.trim());
      formDataToSend.append(
        "ShortDescription",
        formData.ShortDescription.trim()
      );
      formDataToSend.append("Priority", formData.Priority);
      formDataToSend.append("ScheduledDate", formData.ScheduledDate);
      formDataToSend.append("ExpiryDate", formData.ExpiryDate);
      formDataToSend.append("UserId", formData.UserId);

      formDataToSend.append(
        "HasNotification",
        formData.HasNotification ? "true" : "false"
      );

      // Optional poll unit
      if (formData.PollUnitId) {
        formDataToSend.append("PollUnitId", formData.PollUnitId);
      }

      // Add target group IDs (multiple)
      formData.TargetGroupIds.forEach((groupId) => {
        formDataToSend.append("TargetGroupIds", groupId);
      });

      // Add image if available
      if (formData.ImageFile) {
        formDataToSend.append(
          "ImageFile",
          formData.ImageFile,
          formData.ImageFile.name
        );
      }

      console.log("Form data prepared, dispatching action");

      // APPROACH 1: Use dispatch with explicit promise handling
      const resultAction = await dispatch(
        createAnnouncementAsync(formDataToSend)
      );
      console.log("Action dispatch completed, result:", resultAction);

      if (createAnnouncementAsync.fulfilled.match(resultAction)) {
        console.log("✅ Announcement created successfully via Redux");
        toast.success("Announcement created successfully");

        // Force navigation directly here as well as in useEffect
        setTimeout(() => {
          console.log("Navigating to announcements page");
          router.push("/admin/dashboard/announcements");
        }, 1500);
      } else if (createAnnouncementAsync.rejected.match(resultAction)) {
        console.error(
          "❌ Failed to create announcement:",
          resultAction.payload
        );
        toast.error(resultAction.payload || "Failed to create announcement");
      }

      // APPROACH 2: Bypass Redux completely and make direct API call as fallback
      // This is a last resort if Redux is causing issues
      if (!createAnnouncementAsync.fulfilled.match(resultAction)) {
        console.log("Attempting direct API call as fallback...");
        try {
          const token = localStorage.getItem("token");
          const response = await fetch(
            "https://bravoadmin.uplms.org/api/Announcement",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
              },
              body: formDataToSend,
            }
          );

          if (response.ok) {
            console.log(
              "✅ Announcement created successfully via direct API call"
            );
            toast.success("Announcement created successfully");
            setTimeout(() => {
              router.push("/admin/dashboard/announcements");
            }, 1500);
          } else {
            const errorData = await response.json().catch(() => null);
            console.error("❌ Direct API call failed:", errorData);
            toast.error(errorData?.message || "Failed to create announcement");
          }
        } catch (directApiError) {
          console.error("❌ Error in direct API call:", directApiError);
          toast.error("Failed to create announcement");
        }
      }

      // Always reset loading state after all attempts, regardless of success/failure
      safelySetLoading(false);
    } catch (error) {
      console.error("❌ Unexpected error in form submission:", error);
      toast.error("An unexpected error occurred");
      safelySetLoading(false);
    } finally {
      // Triple check that loading state is reset
      console.log("Form submission completed, ensuring loading state is reset");
      setTimeout(() => safelySetLoading(false), 100);
    }
  };

  // Handle cancel and go back to announcements page
  const handleCancel = () => {
    safelySetLoading(false); // Reset loading state when cancelling
    setTimeout(() => {
      router.push("/admin/dashboard/announcements");
    }, 500);
  };

  // Additional safety measure: force loading to false if navigation happens
  useEffect(() => {
    const handleRouteChange = () => {
      safelySetLoading(false);
    };

    window.addEventListener("beforeunload", handleRouteChange);
    return () => {
      window.removeEventListener("beforeunload", handleRouteChange);
    };
  }, []);

  console.log("Current loading state:", loading);

  return (
    <div className="min-h-screen bg-gray-50/50 pt-12">
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
          onSelect={handlePollUnitSelect}
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
          onSelect={handleTargetGroupSelect}
          onRemove={handleTargetGroupRemove}
        />

        {/* Settings */}
        <Settings
          priority={formData.Priority}
          scheduledDate={formData.ScheduledDate}
          expiryDate={formData.ExpiryDate}
          hasNotification={formData.HasNotification}
          onInputChange={handleInputChange}
        />

        {/* Form Actions */}
        <FormActions
          isSubmitting={loading}
          onCancel={handleCancel}
          submitButtonText="Create Announcement"
          loadingText="Creating..."
        />
      </form>
    </div>
  );
};

export default NewAnnouncementPage;
