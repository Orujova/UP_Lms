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
  Save,
  Calendar,
  Send,
} from "lucide-react";

// Import components
import InputComponent from "@/components/inputComponent";
import SelectComponent from "@/components/selectComponent";
import MultiImageUpload from "../MultiImageUpload";
import MultiAttachmentUpload from "../MultiAttachmentUpload";
import TargetGroupSelector from "@/components/targetSelect";
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
      <div className="border rounded p-4 min-h-[300px] flex items-center justify-center">
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

export default function AddPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [formErrors, setFormErrors] = useState({});

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    newsCategoryId: "",
    targetGroupIds: [],
    newsImages: [],
    attachments: [],
    hasNotification: false,
    hasComment: false,
    hasLike: false,
    priority: "HIGH",
  });

  // Target Group Selector States
  const [searchValue, setSearchValue] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedTargetGroups, setSelectedTargetGroups] = useState([]);

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

  // Update formData when selectedTargetGroups changes
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      targetGroupIds: selectedTargetGroups.map((group) => group.id),
    }));
  }, [selectedTargetGroups]);

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

  // TargetGroupSelector handlers
  const handleSearchChange = (value) => {
    setSearchValue(value);
  };

  const handleToggleDropdown = (value) => {
    setShowDropdown(value);
  };

  const handleSelectTargetGroup = (group) => {
    if (!selectedTargetGroups.some((selected) => selected.id === group.id)) {
      setSelectedTargetGroups([...selectedTargetGroups, group]);
    } else {
      setSelectedTargetGroups(
        selectedTargetGroups.filter((selected) => selected.id !== group.id)
      );
    }

    // Clear error when field is updated
    if (formErrors.targetGroupIds) {
      setFormErrors((prev) => ({ ...prev, targetGroupIds: null }));
    }
  };

  const handleRemoveTargetGroup = (group) => {
    setSelectedTargetGroups(
      selectedTargetGroups.filter((selected) => selected.id !== group.id)
    );
  };

  const handleEditorChange = (value) => {
    // Use the utility function to properly handle the EditorJS data
    handleDescriptionChange(value, setDescription);
    if (formErrors.description) {
      setFormErrors((prev) => ({ ...prev, description: null }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = "Title is required";
    if (!formData.subtitle.trim()) errors.subtitle = "Subtitle is required";
    if (!formData.newsCategoryId)
      errors.newsCategoryId = "Category is required";
    if (formData.targetGroupIds.length === 0)
      errors.targetGroupIds = "At least one target group is required";
    if (!description) errors.description = "Body content is required";
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
    <main className="pt-16 bg-gray-50/50 min-h-screen">
      <div className="max-w-6xl mx-auto px-5 mb-16">
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-semibold text-gray-800">Add News</h1>
          <button
            onClick={handleCancel}
            className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 text-sm"
          >
            <ArrowLeft size={16} />
            <span>Back to list</span>
          </button>
        </div>

        {responseMessage && (
          <Alert
            variant={
              responseMessage.includes("success") ? "success" : "destructive"
            }
            className="mb-6"
          >
            <AlertDescription>{responseMessage}</AlertDescription>
          </Alert>
        )}

        <form className="grid grid-cols-1 gap-8" onSubmit={handleSubmit}>
          {/* Main content area with 2-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column - 2/3 width */}
            <div className="lg:col-span-2 space-y-8">
              {/* Title and subtitle section */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center mb-2 border-b border-gray-100 pb-3">
                  <h2 className="text-lg font-medium text-gray-800">
                    Basic Information
                  </h2>
                </div>

                <div className="space-y-5">
                  <InputComponent
                    text="Title"
                    required
                    type="text"
                    placeholder="Enter news title"
                    value={formData.title}
                    onChange={handleChange}
                    name="title"
                    error={formErrors.title}
                  />

                  <InputComponent
                    text="Subtitle"
                    required
                    type="text"
                    placeholder="Enter news subtitle"
                    value={formData.subtitle}
                    onChange={handleChange}
                    name="subtitle"
                    error={formErrors.subtitle}
                  />
                </div>
              </div>

              {/* Media section */}
              <div className="bg-white rounded-lg shadow-sm px-6 py-5">
                <div className="flex items-center mb-2 border-b border-gray-100 pb-3">
                  <h2 className="text-lg font-medium text-gray-800">Media</h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium mb-3 leading-5 text-gray-800/90">
                      Images
                    </h3>
                    <MultiImageUpload
                      images={formData.newsImages}
                      onChange={(newImages) =>
                        setFormData((prev) => ({
                          ...prev,
                          newsImages: newImages,
                        }))
                      }
                    />
                    {formErrors.images && (
                      <p className="text-red-500 text-sm mt-2">
                        {formErrors.images}
                      </p>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-3 leading-5 text-gray-800/90">
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
                </div>
              </div>
            </div>

            {/* Right sidebar - 1/3 width */}
            <div className="lg:col-span-1 space-y-8">
              {/* Publication settings */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center mb-4 border-b border-gray-100 pb-3">
                  <h2 className="text-lg font-medium text-gray-800">
                    Publication Settings
                  </h2>
                </div>

                <div className="space-y-5">
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

                  {/* Target groups */}
                  <div>
                    <TargetGroupSelector
                      targetGroups={targetGroups}
                      searchValue={searchValue}
                      selectedTargetGroups={selectedTargetGroups}
                      showDropdown={showDropdown}
                      onSearchChange={handleSearchChange}
                      onToggleDropdown={handleToggleDropdown}
                      onSelect={handleSelectTargetGroup}
                      onRemove={handleRemoveTargetGroup}
                    />
                    {formErrors.targetGroupIds && (
                      <p className="text-red-500 text-sm mt-2">
                        {formErrors.targetGroupIds}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Interaction settings */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center mb-4 border-b border-gray-100 pb-3">
                  <h2 className="text-lg font-medium text-gray-800">
                    Interaction Settings
                  </h2>
                </div>

                <div className="space-y-5">
                  <Switch
                    checked={formData.hasNotification}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        hasNotification: checked,
                      }))
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
                </div>
              </div>
            </div>
          </div>

          {/* Editor section - Full Width */}
          <div className="bg-white rounded-lg shadow-sm p-6 w-full">
            <div className="flex items-center mb-5 border-b border-gray-100 pb-3">
              <h2 className="text-lg font-medium text-gray-800">Content</h2>
            </div>

            <div className="descriptionEditor">
              <label className="block text-sm font-medium mb-3 text-gray-800/90">
                Body <span className="text-red-500">*</span>
              </label>
              <div className="mx-0">
                <PageTextComponent onChange={handleEditorChange} desc={null} />
              </div>
              {formErrors.description && (
                <p className="text-red-500 text-sm mt-2">
                  {formErrors.description}
                </p>
              )}
            </div>
          </div>

          {/* Action buttons - At bottom, full width */}
          <div className="bg-white rounded-lg shadow-sm p-6 w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#0AAC9E] text-white text-sm rounded-lg px-4 py-3 font-medium hover:bg-[#099b8e] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Publishing...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Publish
                  </>
                )}
              </button>

              <button
                type="button"
                className="w-full bg-white text-gray-700 rounded-lg text-sm px-4 py-3 border border-gray-200 font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2"
              >
                <Calendar size={16} />
                Schedule
              </button>

              <button
                type="button"
                className="w-full bg-white text-gray-700 rounded-lg px-4 text-sm py-3 border border-gray-200 font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2"
              >
                <Save size={16} />
                Save as draft
              </button>

              <button
                type="button"
                onClick={handleCancel}
                className="w-full bg-white text-gray-700 rounded-lg px-4 text-sm py-3 border border-gray-200 font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
