"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { getAllTargetGroupsAsync } from "@/redux/getAllTargetGroups/getAllTargetGroups";
import { newsCategoryAsync } from "@/redux/newsCategory/newsCategory";
import { getToken } from "@/authtoken/auth.js";
import { toast } from "sonner";
import {
  Bell,
  BellOff,
  MessageSquare,
  MessageSquareOff,
  Heart,
  HeartOff,
  ArrowLeft,
} from "lucide-react";

// Import components
import InputComponent from "@/components/inputComponent";
import SelectComponent from "@/components/selectComponent";
import MultiImageUpload from "../MultiImageUpload";
import MultiAttachmentUpload from "../MultiAttachmentUpload";
import TargetGroupSelector from "../TargetGroupSelector";
import Switch from "../Switch";
import {
  serializeEditorData,
  handleDescriptionChange,
} from "@/utils/newsUtils";

// Dynamic import for EditorJS component
const PageTextComponent = dynamic(
  () => import("@/components/pageTextComponent"),
  {
    ssr: false,
    loading: () => (
      <div className="border rounded p-4 min-h-[200px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-t-emerald-500 border-b-emerald-700 rounded-full animate-spin mx-auto"></div>
          <p className="mt-2 text-gray-600 text-sm">Loading editor...</p>
        </div>
      </div>
    ),
  }
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
  const router = useRouter();
  const dispatch = useDispatch();
  const [formErrors, setFormErrors] = useState({});

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    newsCategoryId: "",
    targetGroupIds: [], // Array for multiple target groups
    newsImages: [],
    attachments: [],
    hasNotification: false,
    hasComment: false,
    hasLike: false,
    priority: "HIGH",
  });

  const [description, setDescription] = useState("");
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

  const handleEditorChange = (value) => {
    // Use the utility function to properly handle the EditorJS data
    handleDescriptionChange(value, setDescription);
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
    if (formData.targetGroupIds.length === 0)
      errors.targetGroupIds = "At least one target group is required";
    if (!description) errors.description = "Body content is required";
    if (formData.newsImages.length === 0)
      errors.images = "At least one image is required";
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    // Ensure description is properly serialized for API
    const serializedDescription = description;

    // Build query parameters object
    const queryParamsObj = new URLSearchParams();

    // Add basic parameters
    queryParamsObj.append("Title", formData.title);
    queryParamsObj.append("SubTitle", formData.subtitle);
    queryParamsObj.append("Description", serializedDescription);
    queryParamsObj.append("Priority", formData.priority);
    queryParamsObj.append("NewsCategoryId", formData.newsCategoryId);
    queryParamsObj.append("HasNotification", formData.hasNotification);
    queryParamsObj.append("HasComment", formData.hasComment);
    queryParamsObj.append("HasLike", formData.hasLike);

    // Add each target group ID as a separate entry with the same parameter name
    // This is the correct way to send array parameters in query strings
    formData.targetGroupIds.forEach((id) => {
      queryParamsObj.append("TargetGroupIds", id);
    });

    const queryParams = queryParamsObj.toString();

    // Prepare FormData for files
    const formDataToSend = new FormData();

    // Add images and attachments
    formData.newsImages.forEach((image) => {
      formDataToSend.append("NewsImages", image.file);
    });

    formData.attachments.forEach((attachment) => {
      formDataToSend.append("Attachments", attachment.file);
    });

    const token = getToken();

    if (!token) {
      toast.error("Authorization token is missing. Please log in again.");
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
        toast.success("News created successfully.");
        router.push("/admin/dashboard/news");
      } else {
        toast.error(result.message || "Failed to create news.");
      }
    } catch (error) {
      console.error("Error creating news:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin/dashboard/news");
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
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-800">Add News</h1>
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={16} />
            <span>Back to list</span>
          </button>
        </div>

        <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
          <div>
            <h3 className="text-sm font-medium mb-4 leading-5 text-gray-800/90">
              Images
            </h3>
            <MultiImageUpload
              images={formData.newsImages}
              onChange={(newImages) =>
                setFormData((prev) => ({ ...prev, newsImages: newImages }))
              }
            />
            {formErrors.images && (
              <p className="text-red-500 text-sm mt-2">{formErrors.images}</p>
            )}
          </div>

          <div>
            <h3 className="text-sm font-medium mb-4 leading-5 text-gray-800/90">
              Attachments
            </h3>
            <MultiAttachmentUpload
              attachments={formData.attachments}
              onChange={(newAttachments) =>
                setFormData((prev) => ({
                  ...prev,
                  attachments: newAttachments,
                }))
              }
            />
          </div>

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
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, hasNotification: checked }))
              }
              icon={Bell}
              offIcon={BellOff}
              label="Push Notification"
              description="Send push notification to users when this news is published"
            />

            <Switch
              checked={formData.hasComment}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, hasComment: checked }))
              }
              icon={MessageSquare}
              offIcon={MessageSquareOff}
              label="Enable Comments"
              description="Allow users to comment on this news"
            />

            <Switch
              checked={formData.hasLike}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, hasLike: checked }))
              }
              icon={Heart}
              offIcon={HeartOff}
              label="Enable Likes"
              description="Allow users to like this news"
            />

            {/* Target Group Selector with multiple selection */}
            <TargetGroupSelector
              targetGroups={targetGroups}
              value={formData.targetGroupIds}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, targetGroupIds: value }))
              }
              error={formErrors.targetGroupIds}
              multiple={true}
            />

            <div className="descriptionEditor">
              <label className="block text-sm font-medium mb-2 text-gray-800/90">
                Body
              </label>
              <div>
                <PageTextComponent
                  onChange={handleEditorChange}
                  desc={null} // Start with empty editor
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
              className="bg-[#0AAC9E] text-white text-sm rounded-lg px-5 py-2 font-medium hover:bg-[#099b8e] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
              onClick={handleCancel}
              className="bg-white text-gray-700 rounded-lg px-5 text-sm py-2 border border-gray-200 font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </form>

        {responseMessage && (
          <Alert
            variant={
              responseMessage.includes("success") ? "success" : "destructive"
            }
          >
            <AlertDescription>{responseMessage}</AlertDescription>
          </Alert>
        )}
      </div>
    </main>
  );
}
