"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import InputComponent from "@/components/inputComponent";
import SelectComponent from "@/components/selectComponent";
import { useDispatch, useSelector } from "react-redux";
import { getAllTargetGroupsAsync } from "@/redux/getAllTargetGroups/getAllTargetGroups";
import { newsCategoryAsync } from "@/redux/newsCategory/newsCategory";
import SuccessComponent from "@/components/successComponent";
import { getToken } from "@/authtoken/auth.js";
import { Bell, BellOff, MessageSquare, MessageSquareOff, Heart, HeartOff } from "lucide-react";

// Import new components
import MultiImageUpload from "../MultiImageUpload";
import TargetGroupSelector from "../TargetGroupSelector";
import Switch from "../Switch";

const PageTextComponent = dynamic(
  () => import("@/components/pageTextComponent"),
  { ssr: false }
);

// Custom Alert Component
const Alert = ({ variant = "default", children }) => {
  const variants = {
    default: "bg-gray-100 text-gray-800",
    success: "bg-green-50 text-green-800",
    destructive: "bg-red-50 text-red-800",
  };

  return (
    <div className={`rounded-lg p-4 ${variants[variant]}`}>{children}</div>
  );
};

const AlertDescription = ({ children }) => {
  return <div className="text-xs">{children}</div>;
};

export default function Page() {
  const dispatch = useDispatch();
  const [formErrors, setFormErrors] = useState({});

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    newsCategoryId: "",
    targetGroupId: "",
    newsImages: [],
    hasNotification: false,
    hasComment: false,
    hasLike: false,
    priority: "HIGH",
  });

  const [description, setDescription] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const targetGroups =
    useSelector((state) => state.getAllTargetGroups.data?.[0]?.targetGroups) ||
    [];
  const newsCategory = useSelector((state) => state.newsCategory.data) || [];

  useEffect(() => {
    dispatch(getAllTargetGroupsAsync());
    dispatch(newsCategoryAsync());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    // Clear error when field is updated
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleDescriptionChange = (value) => {
    setDescription(value);
    if (formErrors.description) {
      setFormErrors((prev) => ({ ...prev, description: null }));
    }
  };

  // Form validation
  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = "Title is required";
    if (!formData.subtitle.trim()) errors.subtitle = "Subtitle is required";
    if (!formData.newsCategoryId)
      errors.newsCategoryId = "Category is required";
    if (!formData.targetGroupId)
      errors.targetGroupId = "Target group is required";
    if (!description.trim()) errors.description = "Body content is required";
    if (formData.newsImages.length === 0) errors.images = "At least one image is required";
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);

    const queryParams = new URLSearchParams({
      Title: formData.title,
      SubTitle: formData.subtitle,
      Description: description,
      Priority: formData.priority,
      TargetGroup: "TargetGroup",
      NewsCategoryId: formData.newsCategoryId,
      TargetGroupId: formData.targetGroupId,
      HasNotification: formData.hasNotification,
      HasComment: formData.hasComment,
      HasLike: formData.hasLike,
    }).toString();

    const formDataToSend = new FormData();
    formData.newsImages.forEach(image => {
      formDataToSend.append("NewsImages", image.file);
    });

    const token = getToken();

    if (!token) {
      setResponseMessage(
        "Authorization token is missing. Please log in again."
      );
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(
        `https://bravoadmin.uplms.org/api/News?${queryParams}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            accept: "application/json",
          },
          body: formDataToSend,
        }
      );

      const result = await response.json();
      if (response.ok && result.isSuccess) {
        setIsSuccess(true);
        setResponseMessage("News created successfully.");
      } else {
        setIsSuccess(false);
        setResponseMessage(result.message || "Failed to create news.");
      }
    } catch (error) {
      console.error("Error creating news:", error);
      setIsSuccess(false);
      setResponseMessage("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Priority options
  const priorityOptions = [
    { id: "HIGH", name: "High" },
    { id: "MEDIUM", name: "Medium" },
    { id: "LOW", name: "Low" },
  ];

  return (
    <main className="pt-14 bg-gray-50/50 min-h-screen">
      <div className="flex flex-col gap-10">
        <h1 className="text-xl font-semibold text-gray-800">Add News</h1>

        {isSuccess ? (
          <SuccessComponent link={"/admin/dashboard/news"} title={"News"} />
        ) : (
          <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
            <MultiImageUpload 
              images={formData.newsImages}
              onChange={(newImages) => setFormData(prev => ({ ...prev, newsImages: newImages }))}
            />

            {/* Form Fields */}
            <div className="space-y-6">
              <InputComponent
                text="Title"
                required
                type="text"
                placeholder="Title"
                value={formData.title}
                onChange={handleChange}
                name="title"
                error={formErrors.title}
              />

              <InputComponent
                text="Subtitle"
                required
                type="text"
                placeholder="Subtitle"
                value={formData.subtitle}
                onChange={handleChange}
                name="subtitle"
                error={formErrors.subtitle}
              />

              <SelectComponent
                text="Category"
                name="newsCategoryId"
                required
                value={formData.newsCategoryId}
                onChange={handleChange}
                options={newsCategory}
                error={formErrors.newsCategoryId}
              />

              <SelectComponent
                text="Priority"
                name="priority"
                required
                value={formData.priority}
                onChange={handleChange}
                options={priorityOptions}
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
                error={formErrors.targetGroupId}
              />

              <div className="descriptionEditor">
                <label className="block text-sm font-medium mb-2 text-gray-800/90">
                  Body
                </label>
                <div>
                  <PageTextComponent
                    onChange={handleDescriptionChange}
                    value={description}
                  />
                </div>
                {formErrors.description && (
                  <p className="text-red-500 text-sm mt-2">
                    {formErrors.description}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 items-center justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#0AAC9E] text-white text-sm rounded-lg px-5 py-2 font-medium hover:bg-[#127D74] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Publishing...
                  </>
                ) : (
                  "Publish"
                )}
              </button>
              <button
                type="button"
                className="bg-white text-gray-700 rounded-lg text-sm px-5 py-2 border border-gray-200 font-medium hover:bg-gray-50 transition"
              >
                Schedule
              </button>
              <button
                type="button"
                className="bg-white text-gray-700 rounded-lg px-5 text-sm py-2 border border-gray-200 font-medium hover:bg-gray-50 transition"
              >
                Save as draft
              </button>
              <button
                type="button"
                className="bg-white text-gray-700 rounded-lg px-5 text-sm py-2 border border-gray-200 font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {responseMessage && (
          <Alert variant={isSuccess ? "success" : "destructive"}>
            <AlertDescription>{responseMessage}</AlertDescription>
          </Alert>
        )}
      </div>
    </main>
  );
}