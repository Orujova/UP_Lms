"use client";

import React, { useState, useEffect } from "react";
import {
  Upload,
  Trash2,
  Save,
  RotateCcw,
  Image,
  AlertCircle,
  Plus,
  X,
} from "lucide-react";
import { toast } from "sonner";
import Loading from "@/components/loadingSpinner";
import brandingService from "@/api/branding";

// Configuration for branding tabs
const BRANDING_TABS = [
  {
    key: "appUser",
    label: "App User",
    imageFields: ["image", "coverPhoto"],
    apiFlag: "IsAppUser",
  },
  {
    key: "announcement",
    label: "Announcement",
    imageFields: ["bgImage"],
    apiFlag: "IsAnnouncement",
  },
  {
    key: "event",
    label: "Event",
    imageFields: ["coverPhoto"],
    apiFlag: "IsEvent",
  },
  {
    key: "news",
    label: "News",
    imageFields: ["image"],
    apiFlag: "IsNews",
  },
  {
    key: "course",
    label: "Course",
    imageFields: ["coverPhoto"],
    apiFlag: "IsCourse",
  },
  {
    key: "otpLogin",
    label: "OTP & Login",
    imageFields: ["uploadedImages"],
    apiFlag: "IsOTPAndLogin",
  },
  {
    key: "company",
    label: "Company",
    imageFields: ["logo"],
    apiFlag: "IsCompany",
    hasNameField: true,
  },
  {
    key: "customer",
    label: "Customer",
    imageFields: ["logo"],
    apiFlag: "IsCustomer",
    hasNameField: true,
  },
  {
    key: "cluster",
    label: "Cluster",
    imageFields: ["coverPhoto"],
    apiFlag: "IsCluster",
  },
];

const ImageUploadSection = ({
  title,
  description,
  previewUrl,
  onFileChange,
  onRemove,
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
              <button
                onClick={onRemove}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-lg hover:bg-red-600 text-red-600 hover:text-white transition-all duration-200"
              >
                <Trash2 size={16} />
              </button>
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

export default function BrandingPage() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("appUser");

  const createInitialState = () => {
    const initialState = {};
    BRANDING_TABS.forEach((tab) => {
      initialState[tab.key] = {
        id: null,
        enabled: tab.key === "appUser",
        images: {},
        ...(tab.hasNameField && { name: "" }),
      };
      tab.imageFields.forEach((field) => {
        initialState[tab.key].images[field] =
          field === "uploadedImages" ? [] : null;
      });
    });
    return initialState;
  };

  const [brandingData, setBrandingData] = useState(createInitialState());
  const [fileUploads, setFileUploads] = useState(
    BRANDING_TABS.reduce((acc, tab) => {
      tab.imageFields.forEach((field) => {
        acc[`${tab.key}${field.charAt(0).toUpperCase() + field.slice(1)}`] =
          field === "uploadedImages" ? [] : null;
      });
      return acc;
    }, {})
  );
  const [previews, setPreviews] = useState(
    BRANDING_TABS.reduce((acc, tab) => {
      tab.imageFields.forEach((field) => {
        acc[`${tab.key}${field.charAt(0).toUpperCase() + field.slice(1)}`] =
          field === "uploadedImages" ? [] : null;
      });
      return acc;
    }, {})
  );

  useEffect(() => {
    const fetchAllBrandingSettings = async () => {
      setLoading(true);
      try {
        const settingsPromises = BRANDING_TABS.map(async (tab) => {
          const queryParams = { [tab.apiFlag]: true };
          const settings = await brandingService.fetchBrandingSettings(
            queryParams
          );
          return { tab: tab.key, settings: settings[0] };
        });

        const results = await Promise.all(settingsPromises);
        const newBrandingData = { ...brandingData };
        const newPreviews = { ...previews };

        results.forEach(({ tab, settings }) => {
          if (settings) {
            const currentTab = BRANDING_TABS.find((t) => t.key === tab);
            newBrandingData[tab].id = settings.id;
            newBrandingData[tab].enabled =
              settings[`is${tab.charAt(0).toUpperCase() + tab.slice(1)}`];

            if (currentTab.hasNameField) {
              newBrandingData[tab].name = settings[`${tab}Name`];
            }

            currentTab.imageFields.forEach((field) => {
              const apiFieldMap = {
                image: "imageUrl",
                coverPhoto: "coverPhotoUrl",
                bgImage: "announcBGImageUrl",
                logo: `${tab}Logo`,
                uploadedImages: "otpAndLoginImages",
              };
              const apiField = apiFieldMap[field];

              if (field === "uploadedImages") {
                const images = settings[apiField] || [];
                newBrandingData[tab].images[field] = images.map((img) =>
                  brandingService.fixImageUrl(
                    typeof img === "string" ? img : img.url
                  )
                );
                newPreviews[
                  `${tab}${field.charAt(0).toUpperCase() + field.slice(1)}`
                ] = images.map((img) =>
                  brandingService.fixImageUrl(
                    typeof img === "string" ? img : img.url
                  )
                );
              } else {
                const imageUrl = brandingService.fixImageUrl(
                  settings[apiField]
                );
                newBrandingData[tab].images[field] = imageUrl;
                newPreviews[
                  `${tab}${field.charAt(0).toUpperCase() + field.slice(1)}`
                ] = imageUrl;
              }
            });
          }
        });

        setBrandingData(newBrandingData);
        setPreviews(newPreviews);
      } catch (error) {
        console.error("Error fetching branding settings:", error);
        toast.error("Failed to load branding settings");
      } finally {
        setLoading(false);
      }
    };

    fetchAllBrandingSettings();
  }, []);

  const handleFileChange = (type, e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isMultiUpload = type.includes("otpAndLoginImages");
    setFileUploads((prev) => ({
      ...prev,
      [type]: isMultiUpload ? [...(prev[type] || []), file] : file,
    }));
    setPreviews((prev) => ({
      ...prev,
      [type]: isMultiUpload
        ? [...(prev[type] || []), URL.createObjectURL(file)]
        : URL.createObjectURL(file),
    }));
  };

  const handleRemoveFile = (type, index = null) => {
    const isMultiUpload = type.includes("otpAndLoginImages");
    if (isMultiUpload && index !== null) {
      setFileUploads((prev) => ({
        ...prev,
        [type]: prev[type].filter((_, i) => i !== index),
      }));
      setPreviews((prev) => ({
        ...prev,
        [type]: prev[type].filter((_, i) => i !== index),
      }));
    } else {
      setFileUploads((prev) => ({
        ...prev,
        [type]: isMultiUpload ? [] : null,
      }));
      setPreviews((prev) => ({
        ...prev,
        [type]: isMultiUpload ? [] : null,
      }));
    }
  };

  const handleNameChange = (tab, name) => {
    setBrandingData((prev) => ({
      ...prev,
      [tab]: {
        ...prev[tab],
        name: name || "",
      },
    }));
  };

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    setBrandingData((prev) => ({
      ...prev,
      [tabKey]: {
        ...prev[tabKey],
        enabled: true,
      },
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      const currentTabData = brandingData[activeTab];
      const currentTab = BRANDING_TABS.find((t) => t.key === activeTab);

      if (currentTabData.id) {
        formData.append("Id", currentTabData.id);
      }

      BRANDING_TABS.forEach((tab) => {
        const isEnabled = brandingData[tab.key]?.enabled ?? false;
        formData.append(tab.apiFlag, isEnabled.toString());
      });

      switch (activeTab) {
        case "appUser":
          if (fileUploads.appUserImage)
            formData.append("AppUserImage", fileUploads.appUserImage);
          if (fileUploads.appUserCoverPhoto)
            formData.append("AppUserCoverPhoto", fileUploads.appUserCoverPhoto);
          break;
        case "announcement":
          if (fileUploads.announcBGImage)
            formData.append("AnnouncBGImage", fileUploads.announcBGImage);
          break;
        case "event":
          if (fileUploads.eventCoverPhoto)
            formData.append("EventCoverPhoto", fileUploads.eventCoverPhoto);
          break;
        case "news":
          if (fileUploads.newsImage)
            formData.append("NewsImage", fileUploads.newsImage);
          break;
        case "course":
          if (fileUploads.courseCoverPhoto)
            formData.append("CourseCoverPhoto", fileUploads.courseCoverPhoto);
          break;
        case "otpLogin":
          (fileUploads.otpAndLoginImages || []).forEach((image) =>
            formData.append("OTPAndLoginImages", image)
          );
          break;
        case "company":
          if (fileUploads.companyLogo)
            formData.append("CompanyLogo", fileUploads.companyLogo);
          if (currentTabData.name)
            formData.append("CompanyName", currentTabData.name);
          break;
        case "customer":
          if (fileUploads.customerLogo)
            formData.append("CustomerLogo", fileUploads.customerLogo);
          if (currentTabData.name)
            formData.append("CustomerName", currentTabData.name);
          break;
        case "cluster":
          if (fileUploads.clusterCoverPhoto)
            formData.append("ClusterCoverPhoto", fileUploads.clusterCoverPhoto);
          break;
      }

      const response = currentTabData.id
        ? await brandingService.updateBrandingSetting(formData)
        : await brandingService.createBrandingSetting(formData);

      toast.success("Branding settings saved successfully");
    } catch (error) {
      console.error("Error updating branding settings:", error);
      toast.error(error.message || "Failed to update branding settings");
    } finally {
      setLoading(false);
    }
  };

  if (
    loading &&
    Object.values(brandingData).every((item) => item.id === null)
  ) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pt-14">
      <div className=" mx-auto">
        <div className=" mb-4">
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Branding Settings
          </h1>
          <p className="text-sm text-gray-600">
            Customize and manage your application's branding assets
          </p>
        </div>

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
          <h2 className="text-lg font-semibold text-gray-900 mb-4 capitalize">
            {BRANDING_TABS.find((t) => t.key === activeTab)?.label} Branding
          </h2>

          <div className="space-y-4">
            {(() => {
              const currentTab = BRANDING_TABS.find((t) => t.key === activeTab);

              switch (activeTab) {
                case "appUser":
                  return (
                    <div className="grid md:grid-cols-2 gap-4">
                      {currentTab.imageFields.map((field) => (
                        <ImageUploadSection
                          key={field}
                          title={
                            field === "image" ? "Profile Image" : "Cover Photo"
                          }
                          description={
                            field === "image"
                              ? "User's profile picture across the app"
                              : "Header background for user profiles"
                          }
                          previewUrl={
                            previews[
                              `${activeTab}${
                                field.charAt(0).toUpperCase() + field.slice(1)
                              }`
                            ]
                          }
                          onFileChange={(e) =>
                            handleFileChange(
                              `${activeTab}${
                                field.charAt(0).toUpperCase() + field.slice(1)
                              }`,
                              e
                            )
                          }
                          onRemove={() =>
                            handleRemoveFile(
                              `${activeTab}${
                                field.charAt(0).toUpperCase() + field.slice(1)
                              }`
                            )
                          }
                        />
                      ))}
                    </div>
                  );

                case "announcement":
                case "event":
                case "news":
                case "course":
                case "cluster":
                  return (
                    <ImageUploadSection
                      title={`${currentTab.label} ${
                        currentTab.imageFields[0] === "coverPhoto"
                          ? "Cover Photo"
                          : "Image"
                      }`}
                      description={(() => {
                        switch (activeTab) {
                          case "announcement":
                            return "Background for announcement displays";
                          case "event":
                            return "Header image for event pages";
                          case "news":
                            return "Featured image for news articles";
                          case "course":
                            return "Cover for course listings";
                          case "cluster":
                            return "Main image for cluster section";
                          default:
                            return "";
                        }
                      })()}
                      previewUrl={
                        previews[
                          `${activeTab}${
                            currentTab.imageFields[0].charAt(0).toUpperCase() +
                            currentTab.imageFields[0].slice(1)
                          }`
                        ]
                      }
                      onFileChange={(e) =>
                        handleFileChange(
                          `${activeTab}${
                            currentTab.imageFields[0].charAt(0).toUpperCase() +
                            currentTab.imageFields[0].slice(1)
                          }`,
                          e
                        )
                      }
                      onRemove={() =>
                        handleRemoveFile(
                          `${activeTab}${
                            currentTab.imageFields[0].charAt(0).toUpperCase() +
                            currentTab.imageFields[0].slice(1)
                          }`
                        )
                      }
                    />
                  );

                case "otpLogin":
                  return (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-base font-semibold text-gray-900">
                          Login Screen Images
                        </h3>
                        <label className="inline-flex items-center px-3 py-1 bg-teal-600 text-white rounded-lg hover:bg-teal-700 cursor-pointer transition-all duration-200 shadow-md">
                          <Plus className="mr-1" size={16} />
                          Add Image
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) =>
                              handleFileChange("otpAndLoginImages", e)
                            }
                            accept="image/*"
                          />
                        </label>
                      </div>

                      {(previews.otpAndLoginImages || []).length === 0 ? (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                          <Upload
                            className="mx-auto mb-2 text-gray-400"
                            size={40}
                          />
                          <p className="text-sm text-gray-700">
                            No login screen images uploaded
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            Add images to customize your login screens
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {(previews.otpAndLoginImages || []).map(
                            (url, index) => (
                              <div
                                key={index}
                                className="relative group rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
                              >
                                <img
                                  src={url}
                                  alt={`Login Image ${index + 1}`}
                                  className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                <button
                                  onClick={() =>
                                    handleRemoveFile("otpAndLoginImages", index)
                                  }
                                  className="absolute top-2 right-2 bg-white/90 p-1 rounded-full hover:bg-red-600 hover:text-white transition-all duration-200 shadow-md"
                                >
                                  <X size={20} />
                                </button>
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  );

                case "company":
                case "customer":
                  return (
                    <div className="space-y-4">
                      <ImageUploadSection
                        title={`${currentTab.label} Logo`}
                        description={`Primary logo for ${activeTab} branding`}
                        previewUrl={previews[`${activeTab}Logo`]}
                        onFileChange={(e) =>
                          handleFileChange(`${activeTab}Logo`, e)
                        }
                        onRemove={() => handleRemoveFile(`${activeTab}Logo`)}
                      />
                      <div>
                        <label
                          htmlFor={`${activeTab}Name`}
                          className="block text-sm font-medium text-gray-900 mb-1"
                        >
                          {currentTab.label} Name
                        </label>
                        <input
                          type="text"
                          id={`${activeTab}Name`}
                          value={brandingData[activeTab].name}
                          onChange={(e) =>
                            handleNameChange(activeTab, e.target.value)
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition-all duration-200"
                          placeholder={`Enter ${activeTab} name`}
                        />
                      </div>
                    </div>
                  );

                default:
                  return null;
              }
            })()}
          </div>

          <div className="mt-6 flex justify-between">
            <button
              onClick={() => {
                const currentTab = BRANDING_TABS.find(
                  (t) => t.key === activeTab
                );
                const currentTabData = brandingData[activeTab];
                const resetUploads = { ...fileUploads };
                const resetPreviews = { ...previews };

                currentTab.imageFields.forEach((field) => {
                  const uploadKey = `${activeTab}${
                    field.charAt(0).toUpperCase() + field.slice(1)
                  }`;
                  if (field === "uploadedImages") {
                    resetUploads[uploadKey] = [];
                    resetPreviews[uploadKey] = currentTabData.images[field];
                  } else {
                    resetUploads[uploadKey] = null;
                    resetPreviews[uploadKey] = currentTabData.images[field];
                  }
                });

                setFileUploads(resetUploads);
                setPreviews(resetPreviews);
              }}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-all duration-200 shadow-md"
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
                  <svg
                    className="animate-spin -ml-1 mr-1 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
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
      </div>
    </div>
  );
}
