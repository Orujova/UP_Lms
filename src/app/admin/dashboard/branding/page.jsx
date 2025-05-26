// src/pages/BrandingPage.jsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Upload,
  Trash2,
  Save,
  RotateCcw,
  Plus,
  X,
  AlertTriangle,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import brandingService from "@/api/branding";
import EventCropModal from "@/components/event/CropModal";
import AnnouncementCropModal from "@/components/announcement/CropModal";
import NewsCropModal from "../news/CropModal";

// Component for single image uploads with preview
const ImageUploadSection = ({
  title,
  description,
  previewUrl,
  onFileChange,
  onRemove,
  isDeleteEntireBranding,
  showDeleteButton = true, // New prop to control delete button visibility
}) => {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 bg-white">
      <div className="px-3 py-2 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <p className="mt-1 text-xs text-gray-600">{description}</p>
      </div>
      <div className="p-3">
        {previewUrl ? (
          <div className="relative group">
            <div className="h-48 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 shadow-inner">
              <img
                src={previewUrl}
                alt={title}
                className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <label className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-lg hover:bg-blue-600 text-blue-600 hover:text-white cursor-pointer transition-all duration-200">
                <Upload size={16} />
                <input
                  type="file"
                  className="hidden"
                  onChange={onFileChange}
                  accept="image/*"
                />
              </label>
              {showDeleteButton && (
                <button
                  onClick={onRemove}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-lg hover:bg-red-600 text-red-600 hover:text-white transition-all duration-200"
                  aria-label="Remove image"
                  title={
                    isDeleteEntireBranding
                      ? "Delete entire branding setting"
                      : "Remove image"
                  }
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center h-48 group hover:border-teal-600 hover:bg-teal-50 transition-all duration-300">
            <div className="p-2 bg-teal-100 rounded-full mb-2 group-hover:bg-teal-200 transition-all duration-300">
              <Upload size={24} className="text-teal-700" />
            </div>
            <p className="text-xs text-gray-700 mb-2 text-center group-hover:text-teal-800 transition-all duration-300">
              Drag and drop or click to upload
            </p>
            <label className="inline-flex items-center px-3 py-1 text-xs font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 cursor-pointer transition-all duration-200 shadow-md hover:shadow-lg">
              <Upload size={12} className="mr-1" />
              Select File
              <input
                type="file"
                className="hidden"
                onChange={onFileChange}
                accept="image/*"
              />
            </label>
          </div>
        )}
      </div>
    </div>
  );
};

// Component for multiple image uploads (OTP login)
const MultipleImagesSection = ({
  title,
  images,
  onFileChange,
  onRemoveImage,
}) => {
  const isImageUrl = (img) => typeof img === "string";

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        <label className="inline-flex items-center px-3 py-1 bg-teal-600 text-white rounded-lg hover:bg-teal-700 cursor-pointer transition-all duration-200 shadow-md">
          <Plus className="mr-1" size={16} />
          Add Image
          <input
            type="file"
            className="hidden"
            onChange={onFileChange}
            accept="image/*"
          />
        </label>
      </div>
      {images.length === 0 ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Upload className="mx-auto mb-2 text-gray-400" size={40} />
          <p className="text-sm text-gray-700">No images uploaded</p>
          <p className="text-xs text-gray-600 mt-1">
            Add images to customize your screens
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div
              key={index}
              className="relative group rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
            >
              <img
                src={isImageUrl(image) ? image : URL.createObjectURL(image)}
                alt={`Image ${index + 1}`}
                className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <button
                onClick={() => onRemoveImage(index)}
                className="absolute top-2 right-2 bg-white/90 p-1 rounded-full hover:bg-red-600 hover:text-white transition-all duration-200 shadow-md"
                aria-label="Remove image"
                title="Remove image"
              >
                <X size={20} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function BrandingPage() {
  const BRANDING_TABS = Object.values(brandingService.getBrandingTypes()).map(
    (type) => ({
      key: type.key,
      label:
        type.key.charAt(0).toUpperCase() +
        type.key
          .slice(1)
          .replace(/([A-Z])/g, " $1")
          .trim(),
      imageFields: type.imageFields.map((field) => field.key),
      apiFlag: type.apiFlag,
      hasNameField: !!type.hasNameField,
    })
  );

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("appUser");
  const [fileUploads, setFileUploads] = useState({});
  const [previews, setPreviews] = useState({});
  const [tabData, setTabData] = useState({
    id: null,
    enabled: true,
    images: {},
    name: "",
    otpAndLoginIds: [],
  });
  const [apiError, setApiError] = useState(null);
  const [deletedOtpImages, setDeletedOtpImages] = useState([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [cropModal, setCropModal] = useState({
    isOpen: false,
    type: null, // 'event', 'announcement', 'news', or 'profile'
    imageUrl: null,
    fieldKey: null,
  });

  useEffect(() => {
    const fetchBrandingData = async () => {
      setLoading(true);
      setApiError(null);
      setHasUnsavedChanges(false);
      setDeletedOtpImages([]);
      setFileUploads({});

      try {
        const data = await brandingService.fetchBrandingByType(activeTab);
        setTabData(data);
        const newPreviews = {};
        const currentBrandingType = Object.values(
          brandingService.getBrandingTypes()
        ).find((t) => t.key === activeTab);

        if (currentBrandingType) {
          currentBrandingType.imageFields.forEach((field) => {
            const key = field.key;
            if (field.isMultiple) {
              newPreviews[key] = data.images[key] || [];
            } else {
              newPreviews[key] = data.images[key] || null;
            }
          });
        }
        setPreviews(newPreviews);
      } catch (error) {
        console.error("Error loading branding data:", error);
        setApiError("Failed to load branding settings. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchBrandingData();
  }, [activeTab]);

  const getFormNameForType = (type) => {
    const brandingType = Object.values(brandingService.getBrandingTypes()).find(
      (t) => t.key === activeTab
    );
    if (!brandingType) return "";
    const imageField = brandingType.imageFields.find(
      (field) => field.key === type
    );
    return imageField ? imageField.formName : "";
  };

  const handleImageDelete = async (type, index = null) => {
    if (["appUser", "otpLogin"].includes(activeTab)) {
      if (
        activeTab === "otpLogin" &&
        type === "uploadedImages" &&
        previews[type].length <= 1
      ) {
        toast.error("At least one OTP image is required.");
        return;
      }

      if (!tabData.id) {
        // Handle deletion for unsaved data
        setFileUploads((prev) => {
          const newUploads = { ...prev };
          if (newUploads[type] && Array.isArray(newUploads[type])) {
            newUploads[type] = newUploads[type].filter((_, i) => i !== index);
          } else {
            newUploads[type] = null;
          }
          return newUploads;
        });
        setPreviews((prev) => {
          const newPreviews = { ...prev };
          if (newPreviews[type] && Array.isArray(newPreviews[type])) {
            newPreviews[type] = newPreviews[type].filter((_, i) => i !== index);
          } else {
            newPreviews[type] = null;
          }
          return newPreviews;
        });
        setHasUnsavedChanges(true);
        return;
      }

      setLoading(true);
      try {
        const formData = new FormData();
        formData.append("Id", tabData.id.toString());

        Object.values(brandingService.getBrandingTypes()).forEach(
          (brandingType) => {
            formData.append(
              brandingType.apiFlag,
              (activeTab === brandingType.key).toString()
            );
          }
        );

        if (
          activeTab === "otpLogin" &&
          type === "uploadedImages" &&
          index !== null
        ) {
          // Use the correct OTP ID from otpAndLoginIds array
          if (tabData.otpAndLoginIds && tabData.otpAndLoginIds[index]) {
            const imageId = tabData.otpAndLoginIds[index].toString();
            formData.append("OTPAndLoginImageIdsToDelete", imageId);
            console.log("Deleting OTP image with ID:", imageId);
            setDeletedOtpImages((prev) => [...prev, imageId]);
          } else {
            // Fallback to URL-based ID extraction if no otpAndLoginIds
            const imageUrl = previews[type][index];
            if (typeof imageUrl === "string") {
              const imageId = brandingService.extractImageId(imageUrl);
              if (imageId) {
                formData.append("OTPAndLoginImageIdsToDelete", imageId);
                setDeletedOtpImages((prev) => [...prev, imageId]);
              }
            }
          }
        } else if (activeTab === "appUser") {
          // For app user, we need to send empty file to clear the image
          const formFieldName = getFormNameForType(type);
          if (formFieldName) {
            const emptyBlob = new Blob([""], {
              type: "application/octet-stream",
            });
            const emptyFile = new File([emptyBlob], "empty.txt", {
              type: "application/octet-stream",
            });
            formData.append(formFieldName, emptyFile);
          }
        }

     
        await brandingService.updateBrandingSetting(formData, activeTab);

        const refreshedData = await brandingService.fetchBrandingByType(
          activeTab
        );
        setTabData(refreshedData);

        // Update previews after successful deletion
        setPreviews((prev) => {
          const newPreviews = { ...prev };
          if (activeTab === "otpLogin" && Array.isArray(newPreviews[type])) {
            newPreviews[type] = newPreviews[type].filter((_, i) => i !== index);
          } else {
            newPreviews[type] = null;
          }
          return newPreviews;
        });

        toast.success("Image deleted successfully");
      } catch (error) {
        console.error("Error deleting image:", error);
        toast.error("Failed to delete image");
      } finally {
        setLoading(false);
      }
    } else {
      // For other branding types, delete the entire branding setting
      if (!tabData.id) {
        toast.error("No branding setting exists to delete.");
        return;
      }

      if (
        !window.confirm(
          `Are you sure you want to delete the ${
            activeTab.charAt(0).toUpperCase() + activeTab.slice(1)
          } branding setting? This will remove all associated data.`
        )
      ) {
        return;
      }

      setLoading(true);
      try {
        await brandingService.deleteBrandingSetting(tabData.id);
        setTabData({
          id: null,
          enabled: true,
          images: {},
          name: "",
          otpAndLoginIds: [],
        });
        setPreviews(activeTab === "otpLogin" ? { uploadedImages: [] } : {});
        setFileUploads({});
        setDeletedOtpImages([]);
        setHasUnsavedChanges(false);
        toast.success(
          `${
            activeTab.charAt(0).toUpperCase() + activeTab.slice(1)
          } branding deleted successfully`
        );
      } catch (error) {
        console.error("Error deleting branding:", error);
        toast.error("Failed to delete branding setting");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFileChange = (type, e) => {
    const file = e.target.files[0];
    if (!file) return;

    const brandingType = Object.values(brandingService.getBrandingTypes()).find(
      (t) => t.key === activeTab
    );
    if (!brandingType) return;

    const imageField = brandingType.imageFields.find(
      (field) => field.key === type
    );
    const isMultiUpload = imageField?.isMultiple || false;

    // Determine if cropping is needed
    let cropType = null;
    if (activeTab === "event" && type === "coverPhoto") {
      cropType = "event"; // 1:1
    } else if (activeTab === "announcement" && type === "bgImage") {
      cropType = "announcement"; // 9:16
    } else if (activeTab === "news" && type === "image") {
      cropType = "news"; // 16:9
    } else if (activeTab === "appUser" && type === "image") {
      cropType = "profile"; // 1:1
    }

    if (cropType) {
      // Open crop modal
      setCropModal({
        isOpen: true,
        type: cropType,
        imageUrl: URL.createObjectURL(file),
        fieldKey: type,
      });
    } else {
      // No cropping needed, proceed with upload
      if (isMultiUpload) {
        setFileUploads((prev) => {
          const currentFiles = prev[type] || [];
          return { ...prev, [type]: [...currentFiles, file] };
        });
        setPreviews((prev) => {
          const currentPreviews = prev[type] || [];
          return {
            ...prev,
            [type]: [...currentPreviews, URL.createObjectURL(file)],
          };
        });
      } else {
        setFileUploads((prev) => ({ ...prev, [type]: file }));
        setPreviews((prev) => ({ ...prev, [type]: URL.createObjectURL(file) }));
      }
      setHasUnsavedChanges(true);
    }
  };

  const handleCropComplete = (croppedFile, previewUrl, fieldKey) => {
    const brandingType = Object.values(brandingService.getBrandingTypes()).find(
      (t) => t.key === activeTab
    );
    if (!brandingType) return;

    const imageField = brandingType.imageFields.find(
      (field) => field.key === fieldKey
    );
    const isMultiUpload = imageField?.isMultiple || false;

    if (isMultiUpload) {
      setFileUploads((prev) => {
        const currentFiles = prev[fieldKey] || [];
        return { ...prev, [fieldKey]: [...currentFiles, croppedFile] };
      });
      setPreviews((prev) => {
        const currentPreviews = prev[fieldKey] || [];
        return { ...prev, [fieldKey]: [...currentPreviews, previewUrl] };
      });
    } else {
      setFileUploads((prev) => ({ ...prev, [fieldKey]: croppedFile }));
      setPreviews((prev) => ({ ...prev, [fieldKey]: previewUrl }));
    }
    setHasUnsavedChanges(true);
    setCropModal({ isOpen: false, type: null, imageUrl: null, fieldKey: null });
  };

  const handleCropCancel = () => {
    setCropModal({ isOpen: false, type: null, imageUrl: null, fieldKey: null });
  };

  const handleRemoveFile = (type, index = null) => {
    const brandingType = Object.values(brandingService.getBrandingTypes()).find(
      (t) => t.key === activeTab
    );
    if (!brandingType) return;

    const imageField = brandingType.imageFields.find(
      (field) => field.key === type
    );
    const isMultiUpload = imageField?.isMultiple || false;

    if (
      activeTab === "otpLogin" &&
      type === "uploadedImages" &&
      isMultiUpload
    ) {
      if (previews[type] && previews[type].length <= 1) {
        toast.error("At least one OTP image is required.");
        return;
      }
    }

    handleImageDelete(type, index);
  };

  const handleNameChange = (name) => {
    setTabData((prev) => ({ ...prev, name: name || "" }));
    setHasUnsavedChanges(true);
  };

  const handleTabChange = (tabKey) => {
    if (hasUnsavedChanges) {
      if (
        !window.confirm(
          "You have unsaved changes. Are you sure you want to switch tabs without saving?"
        )
      ) {
        return;
      }
    }
    setActiveTab(tabKey);
  };

  const prepareFormData = () => {
    const formData = new FormData();
    const brandingType = Object.values(brandingService.getBrandingTypes()).find(
      (t) => t.key === activeTab
    );
    if (!brandingType) {
      throw new Error(`Invalid branding type: ${activeTab}`);
    }

    if (tabData.id) {
      formData.append("Id", tabData.id);
    }

    if (brandingType.hasNameField && brandingType.formNameField) {
      formData.append(brandingType.formNameField, tabData.name || "");
    }

    brandingType.imageFields.forEach((field) => {
      if (field.isMultiple) {
        if (activeTab === "otpLogin" && field.key === "uploadedImages") {
          const newFiles = fileUploads[field.key] || [];
          newFiles.forEach((file) => {
            formData.append(field.formName, file);
          });

          // Add deleted OTP image IDs
          if (deletedOtpImages.length > 0) {
            deletedOtpImages.forEach((imageId) => {
              formData.append("OTPAndLoginImageIdsToDelete", imageId);
            });
          }
        } else {
          const files = fileUploads[field.key] || [];
          files.forEach((file, index) => {
            formData.append(`${field.formName}[${index}]`, file);
          });
        }
      } else {
        const file = fileUploads[field.key];
        if (file) {
          formData.append(field.formName, file);
        }
      }
    });

    Object.values(brandingService.getBrandingTypes()).forEach((type) => {
      formData.append(type.apiFlag, (activeTab === type.key).toString());
    });

    return formData;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setApiError(null);

    try {
      const formData = prepareFormData();
      if (tabData.id) {
        await brandingService.updateBrandingSetting(formData, activeTab);
      } else {
        await brandingService.createBrandingSetting(formData, activeTab);
      }

      setDeletedOtpImages([]);
      const refreshedData = await brandingService.fetchBrandingByType(
        activeTab
      );
      setTabData(refreshedData);
      setFileUploads({});

      const newPreviews = {};
      const currentBrandingType = Object.values(
        brandingService.getBrandingTypes()
      ).find((t) => t.key === activeTab);
      if (currentBrandingType) {
        currentBrandingType.imageFields.forEach((field) => {
          const key = field.key;
          if (field.isMultiple) {
            newPreviews[key] = refreshedData.images[key] || [];
          } else {
            newPreviews[key] = refreshedData.images[key] || null;
          }
        });
      }
      setPreviews(newPreviews);
      setHasUnsavedChanges(false);
      toast.success(
        `${
          activeTab.charAt(0).toUpperCase() + activeTab.slice(1)
        } branding settings saved successfully`
      );
    } catch (error) {
      console.error("Error saving branding settings:", error);
      setApiError("Failed to save settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (!hasUnsavedChanges) {
      toast.info("No changes to reset");
      return;
    }

    const fetchBrandingData = async () => {
      try {
        const data = await brandingService.fetchBrandingByType(activeTab);
        setTabData(data);
        const newPreviews = {};
        const currentBrandingType = Object.values(
          brandingService.getBrandingTypes()
        ).find((t) => t.key === activeTab);
        if (currentBrandingType) {
          currentBrandingType.imageFields.forEach((field) => {
            const key = field.key;
            if (field.isMultiple) {
              newPreviews[key] = data.images[key] || [];
            } else {
              newPreviews[key] = data.images[key] || null;
            }
          });
        }
        setPreviews(newPreviews);
        setFileUploads({});
        setDeletedOtpImages([]);
        setHasUnsavedChanges(false);
        toast.info("Changes have been reset");
      } catch (error) {
        console.error("Error reloading branding data:", error);
        setApiError("Failed to reset changes. Please try again.");
      }
    };

    fetchBrandingData();
  };

  const handleDeleteBranding = async () => {
    if (!tabData.id) return;

    if (
      !window.confirm(
        `Are you sure you want to delete the ${
          activeTab.charAt(0).toUpperCase() + activeTab.slice(1)
        } branding setting?`
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      await brandingService.deleteBrandingSetting(tabData.id);
      setTabData({
        id: null,
        enabled: true,
        images: {},
        name: "",
        otpAndLoginIds: [],
      });
      setPreviews(activeTab === "otpLogin" ? { uploadedImages: [] } : {});
      setFileUploads({});
      setDeletedOtpImages([]);
      setHasUnsavedChanges(false);
      toast.success(
        `${
          activeTab.charAt(0).toUpperCase() + activeTab.slice(1)
        } branding deleted successfully`
      );
    } catch (error) {
      console.error("Error deleting branding:", error);
      toast.error("Failed to delete branding setting");
    } finally {
      setLoading(false);
    }
  };

  const currentTab = BRANDING_TABS.find((t) => t.key === activeTab);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pt-14 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4">
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Branding Settings
          </h1>
          <p className="text-sm text-gray-600">
            Customize and manage your application's branding assets
          </p>
        </div>

        {apiError && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
            <AlertTriangle className="mr-2 mt-0.5 flex-shrink-0" size={16} />
            <div>
              <p className="font-medium">Error</p>
              <p className="text-sm">{apiError}</p>
              <button
                onClick={() => setApiError(null)}
                className="text-xs text-red-600 hover:text-red-800 underline mt-1"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        <div className="mb-4">
          <nav className="flex flex-wrap gap-2 bg-white rounded-lg p-2 shadow-md">
            {BRANDING_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`
                  px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300
                  ${
                    activeTab === tab.key
                      ? "bg-teal-600 text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-100 hover:text-teal-700"
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 capitalize">
              {currentTab.label} Branding
            </h2>
            {tabData.id && ["appUser", "otpLogin"].includes(activeTab) && (
              <button
                onClick={handleDeleteBranding}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md"
              >
                <Trash2 className="mr-1" size={16} />
                Delete Branding
              </button>
            )}
          </div>

          {activeTab === "otpLogin" && (
            <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg flex items-start">
              <Info className="mr-2 mt-0.5 flex-shrink-0" size={16} />
              <div>
                <p className="text-sm">
                  <span className="font-medium">Multiple Image Upload:</span>{" "}
                  For OTP & Login screens, you can upload multiple images that
                  will be used in rotation. At least one image is required.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {(() => {
              switch (activeTab) {
                case "appUser":
                  return (
                    <div className="grid md:grid-cols-2 gap-4">
                      <ImageUploadSection
                        title="Profile Image"
                        description="User's profile picture across the app"
                        previewUrl={previews.image}
                        onFileChange={(e) => handleFileChange("image", e)}
                        onRemove={() => handleRemoveFile("image")}
                        isDeleteEntireBranding={false}
                        showDeleteButton={false} // Hide delete button for app user images
                      />
                      <ImageUploadSection
                        title="Cover Photo"
                        description="Header background for user profiles"
                        previewUrl={previews.coverPhoto}
                        onFileChange={(e) => handleFileChange("coverPhoto", e)}
                        onRemove={() => handleRemoveFile("coverPhoto")}
                        isDeleteEntireBranding={false}
                        showDeleteButton={false} // Hide delete button for app user images
                      />
                    </div>
                  );
                case "otpLogin":
                  return (
                    <MultipleImagesSection
                      title="Login Screen Images"
                      images={previews.uploadedImages || []}
                      onFileChange={(e) =>
                        handleFileChange("uploadedImages", e)
                      }
                      onRemoveImage={(index) =>
                        handleRemoveFile("uploadedImages", index)
                      }
                    />
                  );
                case "announcement":
                  return (
                    <ImageUploadSection
                      title="Announcement Background"
                      description="Background for announcement displays"
                      previewUrl={previews.bgImage}
                      onFileChange={(e) => handleFileChange("bgImage", e)}
                      onRemove={() => handleRemoveFile("bgImage")}
                      isDeleteEntireBranding={true}
                    />
                  );
                case "event":
                  return (
                    <ImageUploadSection
                      title="Event Cover Photo"
                      description="Header image for event pages"
                      previewUrl={previews.coverPhoto}
                      onFileChange={(e) => handleFileChange("coverPhoto", e)}
                      onRemove={() => handleRemoveFile("coverPhoto")}
                      isDeleteEntireBranding={true}
                    />
                  );
                case "news":
                  return (
                    <ImageUploadSection
                      title="News Image"
                      description="Default image for news articles"
                      previewUrl={previews.image}
                      onFileChange={(e) => handleFileChange("image", e)}
                      onRemove={() => handleRemoveFile("image")}
                      isDeleteEntireBranding={true}
                    />
                  );
                case "course":
                  return (
                    <ImageUploadSection
                      title="Course Cover Photo"
                      description="Header image for course pages"
                      previewUrl={previews.coverPhoto}
                      onFileChange={(e) => handleFileChange("coverPhoto", e)}
                      onRemove={() => handleRemoveFile("coverPhoto")}
                      isDeleteEntireBranding={true}
                    />
                  );
                case "company":
                  return (
                    <>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Company Name
                        </label>
                        <input
                          type="text"
                          value={tabData.name || ""}
                          onChange={(e) => handleNameChange(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 transition-all duration-200"
                          placeholder="Enter company name"
                        />
                      </div>
                      <ImageUploadSection
                        title="Company Logo"
                        description="Logo displayed across company branding"
                        previewUrl={previews.logo}
                        onFileChange={(e) => handleFileChange("logo", e)}
                        onRemove={() => handleRemoveFile("logo")}
                        isDeleteEntireBranding={true}
                      />
                    </>
                  );
                case "customer":
                  return (
                    <>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Customer Name
                        </label>
                        <input
                          type="text"
                          value={tabData.name || ""}
                          onChange={(e) => handleNameChange(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 transition-all duration-200"
                          placeholder="Enter customer name"
                        />
                      </div>
                      <ImageUploadSection
                        title="Customer Logo"
                        description="Logo for customer-specific branding"
                        previewUrl={previews.logo}
                        onFileChange={(e) => handleFileChange("logo", e)}
                        onRemove={() => handleRemoveFile("logo")}
                        isDeleteEntireBranding={true}
                      />
                    </>
                  );
                case "cluster":
                  return (
                    <ImageUploadSection
                      title="Cluster Cover Photo"
                      description="Header image for cluster pages"
                      previewUrl={previews.coverPhoto}
                      onFileChange={(e) => handleFileChange("coverPhoto", e)}
                      onRemove={() => handleRemoveFile("coverPhoto")}
                      isDeleteEntireBranding={true}
                    />
                  );
                default:
                  return null;
              }
            })()}
          </div>

          <div className="mt-6 flex justify-between">
            <button
              onClick={handleReset}
              disabled={loading || !hasUnsavedChanges}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCcw className="mr-1" size={16} />
              Reset Changes
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-1" size={16} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>

        {/* Crop Modals */}
        {cropModal.isOpen && cropModal.type === "event" && (
          <EventCropModal // Reuse EventCropModal for 1:1 profile photo
            image={cropModal.imageUrl}
            onCancel={handleCropCancel}
            onCrop={(file, previewUrl) =>
              handleCropComplete(file, previewUrl, cropModal.fieldKey)
            }
          />
        )}
        {cropModal.isOpen && cropModal.type === "announcement" && (
          <AnnouncementCropModal
            image={cropModal.imageUrl}
            onCancel={handleCropCancel}
            onCrop={(file, previewUrl) =>
              handleCropComplete(file, previewUrl, cropModal.fieldKey)
            }
          />
        )}
        {cropModal.isOpen && cropModal.type === "news" && (
          <NewsCropModal
            image={cropModal.imageUrl}
            onCancel={handleCropCancel}
            onCrop={(file, previewUrl) =>
              handleCropComplete(file, previewUrl, cropModal.fieldKey)
            }
          />
        )}
        {cropModal.isOpen && cropModal.type === "profile" && (
          <EventCropModal // Reuse EventCropModal for 1:1 profile photo
            image={cropModal.imageUrl}
            onCancel={handleCropCancel}
            onCrop={(file, previewUrl) =>
              handleCropComplete(file, previewUrl, cropModal.fieldKey)
            }
          />
        )}
      </div>
    </div>
  );
}