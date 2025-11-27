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
import { ArrowLeft, Save, X } from "lucide-react";

// Import components
import ImageUpload from "@/components/announcement/ImageUpload";
import BasicInfo from "@/components/announcement/BasicInfo";
import Description from "@/components/announcement/Description";
import PollUnitSelector from "@/components/polUnits";
import TargetGroupSelector from "@/components/targetSelect";
import Settings from "@/components/announcement/Settings";

const NewAnnouncementPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [defaultImageUrl, setDefaultImageUrl] = useState(null);
  const loadingTimeoutRef = useRef(null);

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
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }

    setLoading(isLoading);

    if (isLoading) {
      loadingTimeoutRef.current = setTimeout(() => {
        setLoading(false);
        console.log("⚠️ Safety timeout triggered to reset loading state");
      }, 10000);
    }
  };

  // URL normalization function
  const normalizeImageUrl = (urlStr) => {
    if (!urlStr) return null;

    if (urlStr.includes("100.42.179.27:7298")) {
      const baseDir = urlStr.includes("brending/") ? "" : "brending/";
      const fileName = urlStr.split("/").pop();
      return `https://demoadmin.databyte.app/uploads/brending/${baseDir}${fileName}`;
    }

    if (urlStr.startsWith("https://demoadmin.databyte.app/uploads/brending/")) {
      return urlStr;
    }

    if (urlStr.startsWith("brending/")) {
      return `https://demoadmin.databyte.app/uploads/${urlStr}`;
    }

    if (!urlStr.startsWith("http") && !urlStr.startsWith("https")) {
      const baseDir = urlStr.includes("brending/") ? "" : "brending/";
      const cleanPath = urlStr.replace(/^\/+/, "");
      return `https://demoadmin.databyte.app/uploads/brending/${baseDir}${cleanPath}`;
    }

    return urlStr;
  };

  useEffect(() => {
    Promise.all([
      fetchPollUnits(),
      fetchTargetGroups(),
      fetchBrandingSettings(),
    ]).catch((error) => {
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
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [dispatch]);

  // Fetch branding settings
  const fetchBrandingSettings = async () => {
    try {
      const response = await fetch(
        "https://demoadmin.databyte.app/api/BrendingSetting?IsAnnouncement=true",
        {
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data[0]?.announcBGImageUrl) {
        const normalizedUrl = normalizeImageUrl(data[0].announcBGImageUrl);
        setDefaultImageUrl(normalizedUrl);
        console.log("Normalized default image URL:", normalizedUrl);
      } else {
        console.warn("No default announcement image found in branding settings");
        setDefaultImageUrl(); // Fallback placeholder
      }
    } catch (error) {
      console.error("Error fetching branding settings:", error);
      toast.error("Failed to load branding settings");
      setDefaultImageUrl(); // Fallback placeholder
    }
  };

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
        "https://demoadmin.databyte.app/api/PollUnit?Page=1&ShowMore.Take=100",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
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
        "https://demoadmin.databyte.app/api/TargetGroup/GetAllTargetGroups?Page=1&ShowMore.Take=100",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
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
    console.log("New image selected, preview:", preview);
  };

  // Handle image removal
  const handleImageRemove = () => {
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, ImageFile: null }));
    console.log("Image removed, reverting to default image");
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
    const isSelected = selectedTargetGroups.some(
      (item) => item.id === group.id
    );

    if (isSelected) {
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

  // Handle form submission
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

      // Add target group IDs
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
      } else if (defaultImageUrl) {
        formDataToSend.append("ImageUrl", defaultImageUrl);
      }

      console.log("Form data prepared, dispatching action");

      const resultAction = await dispatch(
        createAnnouncementAsync(formDataToSend)
      );
      console.log("Action dispatch completed, result:", resultAction);

      if (createAnnouncementAsync.fulfilled.match(resultAction)) {
        console.log("✅ Announcement created successfully via Redux");
        toast.success("Announcement created successfully");
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

      // Fallback direct API call
      if (!createAnnouncementAsync.fulfilled.match(resultAction)) {
        console.log("Attempting direct API call as fallback...");
        try {
          const token = localStorage.getItem("token");
          const response = await fetch(
            "https://demoadmin.databyte.app/api/Announcement",
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

      safelySetLoading(false);
    } catch (error) {
      console.error("❌ Unexpected error in form submission:", error);
      toast.error("An unexpected error occurred");
      safelySetLoading(false);
    } finally {
      console.log("Form submission completed, ensuring loading state is reset");
      setTimeout(() => safelySetLoading(false), 100);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    safelySetLoading(false);
    setTimeout(() => {
      router.push("/admin/dashboard/announcements");
    }, 500);
  };

  // Safety measure for navigation
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
    <div className="min-h-screen bg-gray-50/50 pt-14">
      <div className="max-w-7xl mx-auto px-4 md:px-6 mb-12">
        <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-semibold text-gray-800">
            Create New Announcement
          </h1>
          <button
            onClick={() => router.push("/admin/dashboard/announcements")}
            className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 text-sm"
          >
            <ArrowLeft size={16} />
            <span>Back to announcements</span>
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          <div className="lg:col-span-2 space-y-6">
            <ImageUpload
              imagePreview={imagePreview}
              defaultImageUrl={defaultImageUrl}
              onImageChange={handleImageChange}
              onImageRemove={handleImageRemove}
            />
            <BasicInfo
              title={formData.Title}
              subtitle={formData.SubTitle}
              onInputChange={handleInputChange}
            />
            <Description
              shortDescription={formData.ShortDescription}
              fullDescription={formData.Description}
              onInputChange={handleInputChange}
            />
          </div>
          <div className="lg:col-span-1 space-y-6">
            <Settings
              priority={formData.Priority}
              scheduledDate={formData.ScheduledDate}
              expiryDate={formData.ExpiryDate}
              hasNotification={formData.HasNotification}
              onInputChange={handleInputChange}
            />
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
            <div className="bg-white rounded-lg p-4 border border-gray-200">
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
            </div>
            <div className="bg-white rounded-lg p-5 border border-gray-200">
              <h2 className="text-base font-medium mb-4">Actions</h2>
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#0AAC9E] text-white text-sm rounded-lg px-4 py-2.5 font-medium hover:bg-[#099b8e] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      <span>Create Announcement</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="w-full bg-white text-gray-700 rounded-lg px-4 text-sm py-2.5 border border-gray-200 font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2"
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

export default NewAnnouncementPage;