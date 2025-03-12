"use client";

import { useState, useEffect } from "react";
import {
  Upload,
  Trash2,
  Save,
  RotateCcw,
  Image,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import Loading from "@/components/loadingSpinner";

const fixImageUrl = (url) => {
  if (!url) return null;

  // Handle direct string URLs (as in the otpAndLoginImages array)
  if (typeof url === "string" && url.includes("100.42.179.27:7198")) {
    return `https://bravoadmin.uplms.org/uploads/${url.replace(
      "https://100.42.179.27:7198/",
      ""
    )}`;
  }

  // If it's already in the correct format
  if (
    typeof url === "string" &&
    url.startsWith("https://bravoadmin.uplms.org/uploads/")
  ) {
    return url;
  }

  // For relative URLs, prepend the admin URL
  if (typeof url === "string" && url.startsWith("brending/")) {
    return `https://bravoadmin.uplms.org/uploads/${url}`;
  }

  return url;
};

const API_URL = "https://bravoadmin.uplms.org/api/BrendingSetting";

export default function BrandingPage() {
  // Main states
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("appUser");
  const [brandingData, setBrandingData] = useState({
    appUser: {
      id: null,
      images: { image: null, coverPhoto: null },
      enabled: true,
    },
    announcement: { id: null, images: { bgImage: null }, enabled: false },
    event: { id: null, images: { coverPhoto: null }, enabled: false },
    news: { id: null, images: { image: null }, enabled: false },
    course: { id: null, images: { coverPhoto: null }, enabled: false },
    otpLogin: { id: null, images: { uploadedImages: [] }, enabled: false },
  });

  // File upload states
  const [fileUploads, setFileUploads] = useState({
    appUserImage: null,
    appUserCoverPhoto: null,
    announcBGImage: null,
    eventCoverPhoto: null,
    newsImage: null,
    courseCoverPhoto: null,
    otpAndLoginImages: [],
  });

  // Preview URLs
  const [previews, setPreviews] = useState({
    appUserImage: null,
    appUserCoverPhoto: null,
    announcBGImage: null,
    eventCoverPhoto: null,
    newsImage: null,
    courseCoverPhoto: null,
    otpAndLoginImages: [],
  });

  // Fetch branding settings on component mount
  useEffect(() => {
    const fetchAllBrandingSettings = async () => {
      setLoading(true);
      try {
        // Fetch AppUser settings
        const appUserResponse = await fetch(`${API_URL}?IsAppUser=true`);
        const appUserData = await appUserResponse.json();

        // Fetch Announcement settings
        const announcementResponse = await fetch(
          `${API_URL}?IsAnnouncement=true`
        );
        const announcementData = await announcementResponse.json();

        // Fetch Event settings
        const eventResponse = await fetch(`${API_URL}?IsEvent=true`);
        const eventData = await eventResponse.json();

        // Fetch News settings
        const newsResponse = await fetch(`${API_URL}?IsNews=true`);
        const newsData = await newsResponse.json();

        // Fetch Course settings
        const courseResponse = await fetch(`${API_URL}?IsCourse=true`);
        const courseData = await courseResponse.json();

        // Fetch OTP & Login settings
        const otpLoginResponse = await fetch(`${API_URL}?IsOTPAndLogin=true`);
        const otpLoginData = await otpLoginResponse.json();
        console.log(otpLoginData);

        // Update state with fetched data
        const newBrandingData = { ...brandingData };

        if (appUserData.length > 0) {
          newBrandingData.appUser = {
            id: appUserData[0].id,
            images: {
              image: fixImageUrl(appUserData[0].imageUrl),
              coverPhoto: fixImageUrl(appUserData[0].coverPhotoUrl),
            },
            enabled: true,
          };
          setPreviews((prev) => ({
            ...prev,
            appUserImage: fixImageUrl(appUserData[0].imageUrl),
            appUserCoverPhoto: fixImageUrl(appUserData[0].coverPhotoUrl),
          }));
        }

        if (announcementData.length > 0) {
          newBrandingData.announcement = {
            id: announcementData[0].id,
            images: {
              bgImage: fixImageUrl(announcementData[0].announcBGImageUrl),
            },
            enabled: true,
          };
          setPreviews((prev) => ({
            ...prev,
            announcBGImage: fixImageUrl(announcementData[0].announcBGImageUrl),
          }));
        }

        if (eventData.length > 0) {
          newBrandingData.event = {
            id: eventData[0].id,
            images: {
              coverPhoto: fixImageUrl(eventData[0].eventCoverPhotoUrl),
            },
            enabled: true,
          };
          setPreviews((prev) => ({
            ...prev,
            eventCoverPhoto: fixImageUrl(eventData[0].eventCoverPhotoUrl),
          }));
        }

        if (newsData.length > 0) {
          newBrandingData.news = {
            id: newsData[0].id,
            images: {
              image: fixImageUrl(newsData[0].newsImageUrl),
            },
            enabled: true,
          };
          setPreviews((prev) => ({
            ...prev,
            newsImage: fixImageUrl(newsData[0].newsImageUrl),
          }));
        }

        if (courseData.length > 0) {
          newBrandingData.course = {
            id: courseData[0].id,
            images: {
              coverPhoto: fixImageUrl(courseData[0].courseCoverPhotoUrl),
            },
            enabled: true,
          };
          setPreviews((prev) => ({
            ...prev,
            courseCoverPhoto: fixImageUrl(courseData[0].courseCoverPhotoUrl),
          }));
        }

        if (otpLoginData.length > 0) {
          const otpImages = otpLoginData[0].otpAndLoginImages || [];

          // Handle both array of strings and array of objects with url property
          const fixedOtpImages = otpImages.map((img) =>
            typeof img === "string" ? fixImageUrl(img) : fixImageUrl(img.url)
          );

          newBrandingData.otpLogin = {
            id: otpLoginData[0].id,
            images: {
              uploadedImages: fixedOtpImages,
            },
            enabled: Boolean(otpLoginData[0].isOTPAndLogin),
          };

          setPreviews((prev) => ({
            ...prev,
            otpAndLoginImages: fixedOtpImages,
          }));
        }

        setBrandingData(newBrandingData);
      } catch (error) {
        console.error("Error fetching branding settings:", error);
        toast.error("Failed to load branding settings");
      } finally {
        setLoading(false);
      }
    };

    fetchAllBrandingSettings();
  }, []);

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
  };

  const handleEnableToggle = (tab) => {
    setBrandingData((prev) => ({
      ...prev,
      [tab]: {
        ...prev[tab],
        enabled: !prev[tab].enabled,
      },
    }));
  };

  const handleFileChange = (type, e) => {
    const file = e.target.files[0];
    if (!file) return;

    switch (type) {
      case "appUserImage":
        setFileUploads((prev) => ({ ...prev, appUserImage: file }));
        setPreviews((prev) => ({
          ...prev,
          appUserImage: URL.createObjectURL(file),
        }));
        break;
      case "appUserCoverPhoto":
        setFileUploads((prev) => ({ ...prev, appUserCoverPhoto: file }));
        setPreviews((prev) => ({
          ...prev,
          appUserCoverPhoto: URL.createObjectURL(file),
        }));
        break;
      case "announcBGImage":
        setFileUploads((prev) => ({ ...prev, announcBGImage: file }));
        setPreviews((prev) => ({
          ...prev,
          announcBGImage: URL.createObjectURL(file),
        }));
        break;
      case "eventCoverPhoto":
        setFileUploads((prev) => ({ ...prev, eventCoverPhoto: file }));
        setPreviews((prev) => ({
          ...prev,
          eventCoverPhoto: URL.createObjectURL(file),
        }));
        break;
      case "newsImage":
        setFileUploads((prev) => ({ ...prev, newsImage: file }));
        setPreviews((prev) => ({
          ...prev,
          newsImage: URL.createObjectURL(file),
        }));
        break;
      case "courseCoverPhoto":
        setFileUploads((prev) => ({ ...prev, courseCoverPhoto: file }));
        setPreviews((prev) => ({
          ...prev,
          courseCoverPhoto: URL.createObjectURL(file),
        }));
        break;
      case "otpAndLoginImages":
        setFileUploads((prev) => ({
          ...prev,
          otpAndLoginImages: [...prev.otpAndLoginImages, file],
        }));
        setPreviews((prev) => ({
          ...prev,
          otpAndLoginImages: [
            ...prev.otpAndLoginImages,
            URL.createObjectURL(file),
          ],
        }));
        break;
    }
  };

  const handleRemoveFile = (type, index = 0) => {
    switch (type) {
      case "appUserImage":
        setFileUploads((prev) => ({ ...prev, appUserImage: null }));
        setPreviews((prev) => ({ ...prev, appUserImage: null }));
        break;
      case "appUserCoverPhoto":
        setFileUploads((prev) => ({ ...prev, appUserCoverPhoto: null }));
        setPreviews((prev) => ({ ...prev, appUserCoverPhoto: null }));
        break;
      case "announcBGImage":
        setFileUploads((prev) => ({ ...prev, announcBGImage: null }));
        setPreviews((prev) => ({ ...prev, announcBGImage: null }));
        break;
      case "eventCoverPhoto":
        setFileUploads((prev) => ({ ...prev, eventCoverPhoto: null }));
        setPreviews((prev) => ({ ...prev, eventCoverPhoto: null }));
        break;
      case "newsImage":
        setFileUploads((prev) => ({ ...prev, newsImage: null }));
        setPreviews((prev) => ({ ...prev, newsImage: null }));
        break;
      case "courseCoverPhoto":
        setFileUploads((prev) => ({ ...prev, courseCoverPhoto: null }));
        setPreviews((prev) => ({ ...prev, courseCoverPhoto: null }));
        break;
      case "otpAndLoginImages":
        const newImages = [...fileUploads.otpAndLoginImages];
        newImages.splice(index, 1);
        setFileUploads((prev) => ({ ...prev, otpAndLoginImages: newImages }));

        const newPreviews = [...previews.otpAndLoginImages];
        newPreviews.splice(index, 1);
        setPreviews((prev) => ({ ...prev, otpAndLoginImages: newPreviews }));
        break;
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const formData = new FormData();

      // Determine if update or create based on current tab
      const currentTabData = brandingData[activeTab];
      const isUpdate = !!currentTabData.id;

      if (isUpdate) {
        formData.append("Id", currentTabData.id);
      }

      // Add flags based on enabled settings
      formData.append("IsAppUser", brandingData.appUser.enabled.toString());
      formData.append(
        "IsAnnouncement",
        brandingData.announcement.enabled.toString()
      );
      formData.append("IsEvent", brandingData.event.enabled.toString());
      formData.append("IsNews", brandingData.news.enabled.toString());
      formData.append("IsCourse", brandingData.course.enabled.toString());
      formData.append(
        "IsOTPAndLogin",
        brandingData.otpLogin.enabled.toString()
      );

      // Add files based on current tab
      switch (activeTab) {
        case "appUser":
          if (fileUploads.appUserImage) {
            formData.append("AppUserImage", fileUploads.appUserImage);
          }
          if (fileUploads.appUserCoverPhoto) {
            formData.append("AppUserCoverPhoto", fileUploads.appUserCoverPhoto);
          }
          break;
        case "announcement":
          if (fileUploads.announcBGImage) {
            formData.append("AnnouncBGImage", fileUploads.announcBGImage);
          }
          break;
        case "event":
          if (fileUploads.eventCoverPhoto) {
            formData.append("EventCoverPhoto", fileUploads.eventCoverPhoto);
          }
          break;
        case "news":
          if (fileUploads.newsImage) {
            formData.append("NewsImage", fileUploads.newsImage);
          }
          break;
        case "course":
          if (fileUploads.courseCoverPhoto) {
            formData.append("CourseCoverPhoto", fileUploads.courseCoverPhoto);
          }
          break;
        case "otpLogin":
          fileUploads.otpAndLoginImages.forEach((image) => {
            formData.append("OTPAndLoginImages", image);
          });
          break;
      }

      // Submit request
      const response = await fetch(API_URL, {
        method: isUpdate ? "PUT" : "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.isSuccess === false) {
        throw new Error(result.message || "Failed to update branding settings");
      }

      toast.success(
        `Branding settings ${isUpdate ? "updated" : "created"} successfully`
      );

      // Reset file uploads for current tab
      const resetUploads = { ...fileUploads };
      switch (activeTab) {
        case "appUser":
          resetUploads.appUserImage = null;
          resetUploads.appUserCoverPhoto = null;
          break;
        case "announcement":
          resetUploads.announcBGImage = null;
          break;
        case "event":
          resetUploads.eventCoverPhoto = null;
          break;
        case "news":
          resetUploads.newsImage = null;
          break;
        case "course":
          resetUploads.courseCoverPhoto = null;
          break;
        case "otpLogin":
          resetUploads.otpAndLoginImages = [];
          break;
      }
      setFileUploads(resetUploads);

      // Refetch settings for current tab
      const tabQueryParam = `Is${
        activeTab === "appUser"
          ? "AppUser"
          : activeTab === "otpLogin"
          ? "OTPAndLogin"
          : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)
      }=true`;

      const refreshResponse = await fetch(`${API_URL}?${tabQueryParam}`);
      const refreshData = await refreshResponse.json();

      if (refreshData.length > 0) {
        // Update branding data for current tab
        const updatedBrandingData = { ...brandingData };

        switch (activeTab) {
          case "appUser":
            updatedBrandingData.appUser = {
              id: refreshData[0].id,
              images: {
                image: fixImageUrl(refreshData[0].imageUrl),
                coverPhoto: fixImageUrl(refreshData[0].coverPhotoUrl),
              },
              enabled: brandingData.appUser.enabled,
            };
            setPreviews((prev) => ({
              ...prev,
              appUserImage: fixImageUrl(refreshData[0].imageUrl),
              appUserCoverPhoto: fixImageUrl(refreshData[0].coverPhotoUrl),
            }));
            break;
          case "announcement":
            updatedBrandingData.announcement = {
              id: refreshData[0].id,
              images: {
                bgImage: fixImageUrl(refreshData[0].announcBGImageUrl),
              },
              enabled: brandingData.announcement.enabled,
            };
            setPreviews((prev) => ({
              ...prev,
              announcBGImage: fixImageUrl(refreshData[0].announcBGImageUrl),
            }));
            break;
          case "event":
            updatedBrandingData.event = {
              id: refreshData[0].id,
              images: {
                coverPhoto: fixImageUrl(refreshData[0].eventCoverPhotoUrl),
              },
              enabled: brandingData.event.enabled,
            };
            setPreviews((prev) => ({
              ...prev,
              eventCoverPhoto: fixImageUrl(refreshData[0].eventCoverPhotoUrl),
            }));
            break;
          case "news":
            updatedBrandingData.news = {
              id: refreshData[0].id,
              images: {
                image: fixImageUrl(refreshData[0].newsImageUrl),
              },
              enabled: brandingData.news.enabled,
            };
            setPreviews((prev) => ({
              ...prev,
              newsImage: fixImageUrl(refreshData[0].newsImageUrl),
            }));
            break;
          case "course":
            updatedBrandingData.course = {
              id: refreshData[0].id,
              images: {
                coverPhoto: fixImageUrl(refreshData[0].courseCoverPhotoUrl),
              },
              enabled: brandingData.course.enabled,
            };
            setPreviews((prev) => ({
              ...prev,
              courseCoverPhoto: fixImageUrl(refreshData[0].courseCoverPhotoUrl),
            }));
            break;
          case "otpLogin":
            const otpImages = refreshData[0].otpAndLoginImages || [];
            updatedBrandingData.otpLogin = {
              id: refreshData[0].id,
              images: {
                uploadedImages: otpImages.map((img) => fixImageUrl(img.url)),
              },
              enabled: brandingData.otpLogin.enabled,
            };
            setPreviews((prev) => ({
              ...prev,
              otpAndLoginImages: otpImages.map((img) => fixImageUrl(img.url)),
            }));
            break;
        }

        setBrandingData(updatedBrandingData);
      }
    } catch (error) {
      console.error("Error updating branding settings:", error);
      toast.error(error.message || "Failed to update branding settings");
    } finally {
      setLoading(false);
    }
  };

  const resetCurrentTab = () => {
    // Reset file uploads for current tab
    const resetUploads = { ...fileUploads };
    switch (activeTab) {
      case "appUser":
        resetUploads.appUserImage = null;
        resetUploads.appUserCoverPhoto = null;
        break;
      case "announcement":
        resetUploads.announcBGImage = null;
        break;
      case "event":
        resetUploads.eventCoverPhoto = null;
        break;
      case "news":
        resetUploads.newsImage = null;
        break;
      case "course":
        resetUploads.courseCoverPhoto = null;
        break;
      case "otpLogin":
        resetUploads.otpAndLoginImages = [];
        break;
    }
    setFileUploads(resetUploads);

    // Reset previews to original server images
    const resetPreviews = { ...previews };
    switch (activeTab) {
      case "appUser":
        resetPreviews.appUserImage = brandingData.appUser.images.image;
        resetPreviews.appUserCoverPhoto =
          brandingData.appUser.images.coverPhoto;
        break;
      case "announcement":
        resetPreviews.announcBGImage = brandingData.announcement.images.bgImage;
        break;
      case "event":
        resetPreviews.eventCoverPhoto = brandingData.event.images.coverPhoto;
        break;
      case "news":
        resetPreviews.newsImage = brandingData.news.images.image;
        break;
      case "course":
        resetPreviews.courseCoverPhoto = brandingData.course.images.coverPhoto;
        break;
      case "otpLogin":
        resetPreviews.otpAndLoginImages =
          brandingData.otpLogin.images.uploadedImages;
        break;
    }
    setPreviews(resetPreviews);
  };

  if (
    loading &&
    Object.values(brandingData).every((item) => item.id === null)
  ) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pt-14">
      <h1 className="text-2xl font-bold text-gray-900">Branding Settings</h1>
      <p className="mt-1 text-sm text-gray-500">
        Customize branding assets across different sections of your application
      </p>

      <div className="  py-8">
        {/* Tab Navigation */}
        <div className="mb-6 border-b border-gray-200">
          <nav
            className="-mb-px flex space-x-5 overflow-x-auto"
            aria-label="Tabs"
          >
            <TabButton
              active={activeTab === "appUser"}
              onClick={() => handleTabChange("appUser")}
              label="App User"
              icon={<Image size={16} />}
            />
            <TabButton
              active={activeTab === "announcement"}
              onClick={() => handleTabChange("announcement")}
              label="Announcement"
              icon={<Image size={16} />}
            />
            <TabButton
              active={activeTab === "event"}
              onClick={() => handleTabChange("event")}
              label="Event"
              icon={<Image size={16} />}
            />
            <TabButton
              active={activeTab === "news"}
              onClick={() => handleTabChange("news")}
              label="News"
              icon={<Image size={16} />}
            />
            <TabButton
              active={activeTab === "course"}
              onClick={() => handleTabChange("course")}
              label="Course"
              icon={<Image size={16} />}
            />
            <TabButton
              active={activeTab === "otpLogin"}
              onClick={() => handleTabChange("otpLogin")}
              label="OTP & Login"
              icon={<Image size={16} />}
            />
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Header with Toggle */}
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <h2 className="text-lg font-medium text-gray-900 capitalize">
              {activeTab === "appUser"
                ? "App User"
                : activeTab === "otpLogin"
                ? "OTP & Login"
                : activeTab}{" "}
              Branding
            </h2>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">Enable</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={brandingData[activeTab].enabled}
                  onChange={() => handleEnableToggle(activeTab)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0AAC9E]"></div>
              </label>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === "appUser" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ImageUploadCard
                    title="Profile Image"
                    description="Used as the user's profile picture"
                    onChange={(e) => handleFileChange("appUserImage", e)}
                    onRemove={() => handleRemoveFile("appUserImage")}
                    previewUrl={previews.appUserImage}
                  />

                  <ImageUploadCard
                    title="Cover Photo"
                    description="Displayed as header background on profiles"
                    onChange={(e) => handleFileChange("appUserCoverPhoto", e)}
                    onRemove={() => handleRemoveFile("appUserCoverPhoto")}
                    previewUrl={previews.appUserCoverPhoto}
                  />
                </div>
              </>
            )}

            {activeTab === "announcement" && (
              <>
                <ImageUploadCard
                  title="Background Image"
                  description="Used as the background for announcements"
                  onChange={(e) => handleFileChange("announcBGImage", e)}
                  onRemove={() => handleRemoveFile("announcBGImage")}
                  previewUrl={previews.announcBGImage}
                />
              </>
            )}

            {activeTab === "event" && (
              <>
                <ImageUploadCard
                  title="Cover Photo"
                  description="Displayed at the top of event pages"
                  onChange={(e) => handleFileChange("eventCoverPhoto", e)}
                  onRemove={() => handleRemoveFile("eventCoverPhoto")}
                  previewUrl={previews.eventCoverPhoto}
                />
              </>
            )}

            {activeTab === "news" && (
              <>
                <ImageUploadCard
                  title="News Image"
                  description="Featured image for news articles"
                  onChange={(e) => handleFileChange("newsImage", e)}
                  onRemove={() => handleRemoveFile("newsImage")}
                  previewUrl={previews.newsImage}
                />
              </>
            )}

            {activeTab === "course" && (
              <>
                <ImageUploadCard
                  title="Course Cover Photo"
                  description="Displayed on course cards and headers"
                  onChange={(e) => handleFileChange("courseCoverPhoto", e)}
                  onRemove={() => handleRemoveFile("courseCoverPhoto")}
                  previewUrl={previews.courseCoverPhoto}
                />
              </>
            )}

            {activeTab === "otpLogin" && (
              <>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-md font-medium text-gray-700">
                      OTP & Login Images
                    </h3>

                    <label className="flex items-center px-3 py-2 text-sm font-medium text-white bg-[#0AAC9E] rounded-md hover:bg-[#099b8e] cursor-pointer transition-colors">
                      <Upload size={16} className="mr-2" />
                      Add New Image
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

                  {previews.otpAndLoginImages.length === 0 ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-md p-8 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-500">
                        No images uploaded yet
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Click the "Add New Image" button to upload images for
                        login screens
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {previews.otpAndLoginImages.map((url, index) => (
                        <div
                          key={index}
                          className="relative group rounded-lg overflow-hidden shadow-sm border border-gray-200"
                        >
                          <img
                            src={url}
                            alt={`OTP/Login Image ${index + 1}`}
                            className="w-full h-48 object-cover"
                          />
                          <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <button
                              onClick={() =>
                                handleRemoveFile("otpAndLoginImages", index)
                              }
                              className="w-9 h-9 flex items-center justify-center rounded-full bg-white shadow-lg hover:bg-red-500 text-red-500 hover:text-white transition-all duration-200"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
            <button
              onClick={resetCurrentTab}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md  focus:outline-none focus:ring-0 hover:bg-gray-50 transition-colors"
            >
              <RotateCcw size={16} className="mr-2" />
              Reset Changes
            </button>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#0AAC9E] border border-transparent rounded-md hover:bg-[#099b8e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0AAC9E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Tab Button Component
const TabButton = ({ active, onClick, label, icon }) => {
  return (
    <button
      onClick={onClick}
      className={`group inline-flex items-center px-1 py-4 text-sm font-medium ${
        active
          ? "border-b-2 border-[#0AAC9E] text-[#0AAC9E]"
          : "border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
      } focus:outline-none whitespace-nowrap`}
    >
      {icon && (
        <span
          className={`mr-2 ${
            active
              ? "text-[#0AAC9E]"
              : "text-gray-400 group-hover:text-gray-500"
          }`}
        >
          {icon}
        </span>
      )}
      {label}
    </button>
  );
};

// Image Upload Card Component with Modern Design and Improved Buttons
const ImageUploadCard = ({
  title,
  description,
  onChange,
  onRemove,
  previewUrl,
}) => {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 bg-white">
      <div className="px-5 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
        <p className="mt-1 text-xs text-gray-500">{description}</p>
      </div>

      <div className="p-5">
        {previewUrl ? (
          <div className="relative group">
            <div className="h-56 rounded-lg overflow-hidden bg-gray-50 border border-gray-100">
              <img
                src={previewUrl}
                alt={title}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
              {/* Change Button */}
              <label className="w-9 h-9 flex items-center justify-center rounded-full bg-white shadow-lg hover:bg-blue-500 text-blue-500 hover:text-white cursor-pointer transition-all duration-200">
                <Upload size={18} />
                <input
                  type="file"
                  className="hidden"
                  onChange={onChange}
                  accept="image/*"
                />
              </label>

              {/* Delete Button */}
              <button
                onClick={onRemove}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white shadow-lg hover:bg-red-500 text-red-500 hover:text-white transition-all duration-200"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center h-56 group hover:border-[#0AAC9E] hover:bg-[#0AAC9E]/5 transition-all duration-300">
            <div className="p-4 bg-[#0AAC9E]/10 rounded-full mb-3 group-hover:bg-[#0AAC9E]/20 transition-all duration-300">
              <Upload size={28} className="text-[#0AAC9E]" />
            </div>
            <p className="text-sm text-gray-600 mb-3 text-center group-hover:text-[#0AAC9E] transition-all duration-300">
              Drag and drop or click to upload
            </p>
            <label className="inline-flex items-center px-5 py-2.5 text-xs font-medium text-white bg-[#0AAC9E] rounded-lg hover:bg-[#099b8e] cursor-pointer transition-all duration-200 shadow-md">
              <Upload size={14} className="mr-2" />
              Select File
              <input
                type="file"
                className="hidden"
                onChange={onChange}
                accept="image/*"
              />
            </label>
          </div>
        )}
      </div>
    </div>
  );
};
