"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import InputComponent from "@/components/inputComponent";
import SelectComponent from "@/components/selectComponent";
import { useDispatch, useSelector } from "react-redux";
import { getAllTargetGroupsAsync } from "@/redux/getAllTargetGroups/getAllTargetGroups";
import { newsCategoryAsync } from "@/redux/newsCategory/newsCategory";
import { getToken, getParsedToken } from "@/authtoken/auth.js";
import { Upload, Bell, BellOff, MessageSquare, MessageSquareOff, Heart, HeartOff } from "lucide-react";
import { toast, Toaster } from "sonner";
import { useRouter, usePathname } from "next/navigation";
import "./edit.scss";

// Import new components
import MultiImageUpload from "../../MultiImageUpload";
import TargetGroupSelector from "../../TargetGroupSelector";
import Switch from "../../Switch";
import CropModal from "../../CropModal";

const PageTextComponent = dynamic(
  () => import("@/components/pageTextComponent"),
  { ssr: false }
);

export default function Page() {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    title: "",
    subTitle: "",
    newsCategoryId: "",
    targetGroupId: "",
    newsImages: [],
    hasNotification: false,
    hasComment: false,
    hasLike: false,
    priority: "HIGH",
  });
  
  const [description, setDescription] = useState("");
  const [responseMessage, setResponseMessage] = useState("");

  // Get news ID from URL
  const newsId = pathname?.split("/").pop();

  // Redux selectors
  const targetGroups = useSelector((state) => state.getAllTargetGroups.data?.[0]?.targetGroups) || [];
  const newsCategory = useSelector((state) => state.newsCategory.data) || [];

  // Fetch initial data
  useEffect(() => {
    dispatch(getAllTargetGroupsAsync());
    dispatch(newsCategoryAsync());
  }, [dispatch]);

  // Fetch news data by ID
  useEffect(() => {
    const fetchNewsById = async () => {
      if (!newsId) return;

      try {
        setLoading(true);
        const token = getToken();
        const parsedToken = getParsedToken();

        const response = await fetch(
          `https://bravoadmin.uplms.org/api/News/${newsId}?userid=${parsedToken.UserID}`,
          {
            headers: {
              accept: "*/*",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch news data");
        }

        const data = await response.json();

        setFormData({
          title: data.title || "",
          subTitle: data.subTitle || "",
          newsCategoryId: data.newsCategoryId?.toString() || "",
          targetGroupId: data.targetGroupId?.toString() || "",
          newsImages: data.newsImages ? data.newsImages.map(image => ({
            file: null, // We don't have access to the file object for existing images
            preview: `https://bravoadmin.uplms.org/uploads/${image.replace("https://100.42.179.27:7198/", "")}`
          })) : [],
          hasNotification: data.hasNotification || false,
          hasComment: data.hasComment || false,
          hasLike: data.hasLike || false,
          priority: data.priority || "HIGH"
        });

        if (data.description) {
          try {
            const parsedDescription = typeof data.description === "string"
              ? JSON.parse(data.description)
              : data.description;
            setDescription(parsedDescription);
          } catch (error) {
            console.error("Error parsing description:", error);
            setDescription("");
          }
        }
      } catch (error) {
        console.error("Error fetching news:", error);
        toast.error("Failed to fetch news data");
      } finally {
        setLoading(false);
      }
    };

    fetchNewsById();
  }, [newsId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDescriptionChange = (value) => {
    setDescription(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    const token = getToken();

    if (!token) {
      toast.error("Authorization token is missing. Please login again.");
      setIsSubmitting(false);
      return;
    }

    try {
      const queryParams = new URLSearchParams({
        Id: newsId,
        Title: formData.title.trim(),
        subTitle: formData.subTitle.trim(),
        Description: description,
        Priority: formData.priority,
        TargetGroup: "TargetGroup",
        NewsCategoryId: formData.newsCategoryId,
        TargetGroupId: formData.targetGroupId,
        HasNotification: formData.hasNotification,
        HasComment: formData.hasComment,
        HasLike: formData.hasLike,
      });

      const formDataToSend = new FormData();
      formData.newsImages.forEach(image => {
        if (image.file) { // Only append new images that have file objects
          formDataToSend.append("NewsImages", image.file);
        }
      });

      const response = await fetch(
        `https://bravoadmin.uplms.org/api/News?${queryParams}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            accept: "application/json",
          },
          body: formDataToSend,
        }
      );

      const result = await response.json();

      if (response.ok && result.isSuccess) {
        toast.success("News updated successfully");
        router.push("/admin/dashboard/news");
      } else {
        throw new Error(result.message || "Failed to update news");
      }
    } catch (error) {
      console.error("Error updating news:", error);
      toast.error(error.message || "Failed to update news");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-t-emerald-500 border-b-emerald-700 rounded-full animate-spin"></div>
          <p className="mt-2 text-gray-600">Loading news data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="edit">
      <Toaster position="top-right" />

      <div className="banner">
        <MultiImageUpload 
          images={formData.newsImages}
          onChange={(newImages) => setFormData(prev => ({ ...prev, newsImages: newImages }))}
        />
      </div>

      <form className="newsEditForm" onSubmit={handleSubmit}>
        <div className="inputs">
          <InputComponent
            text="Title"
            required
            className="w-full"
            type="text"
            placeholder="Enter news title"
            value={formData.title}
            onChange={handleChange}
            name="title"
          />
          
          <InputComponent
            text="Subtitle"
            required
            className="w-full"
            type="text"
            placeholder="Enter subTitle"
            value={formData.subTitle}
            onChange={handleChange}
            name="subTitle"
          />
          
          <SelectComponent
            text="Category"
            name="newsCategoryId"
            required
            value={formData.newsCategoryId}
            onChange={handleChange}
            options={newsCategory}
          />

          <SelectComponent
            text="Priority"
            name="priority"
            required
            value={formData.priority}
            onChange={handleChange}
            options={[
              { id: "HIGH", name: "High" },
              { id: "MEDIUM", name: "Medium" },
              { id: "LOW", name: "Low" },
            ]}
          />

          {/* Switches */}
          <Switch
            checked={formData.hasNotification}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasNotification: checked }))}
            icon={Bell}
            offIcon={BellOff}
            label="Push Notification"
            description="Send push notification to users when this news is published"
          />

          <Switch
            checked={formData.hasComment}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasComment: checked }))}
            icon={MessageSquare}
            offIcon={MessageSquareOff}
            label="Enable Comments"
            description="Allow users to comment on this news"
          />

          <Switch
            checked={formData.hasLike}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasLike: checked }))}
            icon={Heart}
            offIcon={HeartOff}
            label="Enable Likes"
            description="Allow users to like this news"
          />

          <TargetGroupSelector
            targetGroups={targetGroups}
            value={formData.targetGroupId}
            onChange={(value) => setFormData(prev => ({ ...prev, targetGroupId: value }))}
          />

          <div className="descriptionEditor">
            <label>Body</label>
            <div>
              <PageTextComponent
                desc={description}
                onChange={handleDescriptionChange}
              />
            </div>
          </div>
        </div>

        <div className="formButtons">
          <button type="submit" disabled={isSubmitting} className="button">
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="backButton"
          >
            Cancel
          </button>
        </div>
      </form>

      {responseMessage && (
        <div className="mt-4 text-center text-lg font-medium text-emerald-600">
          {responseMessage}
        </div>
      )}
    </div>
  );
}