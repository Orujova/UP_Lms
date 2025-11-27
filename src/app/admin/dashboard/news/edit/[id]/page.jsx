"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { useRouter, usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { getAllTargetGroupsAsync } from "@/redux/getAllTargetGroups/getAllTargetGroups";
import { newsCategoryAsync } from "@/redux/newsCategory/newsCategory";
import { getToken, getParsedToken } from "@/authtoken/auth.js";
import { toast } from "sonner";
import {
  Bell,
  BellOff,
  MessageSquare,
  MessageSquareOff,
  Heart,
  HeartOff,
  ArrowLeft,
  Send,
} from "lucide-react";

// Import components
import InputComponent from "@/components/inputComponent";
import SelectComponent from "@/components/selectComponent";
import MultiImagesEdit from "../../MultiImagesEdit";
import MultiAttachmentUploadEdit from "../../MultiAttachmentUploadEdit";
import TargetGroupSelector from "@/components/targetSelect";
import Switch from "../../Switch";
import LoadingSpinner from "@/components/loadingSpinner";

// Import utility functions
import {
  normalizeEditorData,
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

export default function EditPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Flag to prevent circular updates
  const isInitialLoad = useRef(true);
  const skipTargetGroupsUpdate = useRef(false);

  // Target Group Selector States
  const [searchValue, setSearchValue] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedTargetGroups, setSelectedTargetGroups] = useState([]);

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

  const [attachmentsToDelete, setAttachmentsToDelete] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [description, setDescription] = useState("");
  const [normalizedEditorData, setNormalizedEditorData] = useState(null);
  const [responseMessage, setResponseMessage] = useState("");
  const [currentCategoryName, setCurrentCategoryName] = useState("");
  const [currentTargetGroupNames, setCurrentTargetGroupNames] = useState([]);
  const [originalData, setOriginalData] = useState(null);

  const newsId = pathname?.split("/").pop();

  const targetGroups =
    useSelector((state) => state.getAllTargetGroups.data?.[0]?.targetGroups) ||
    [];
  const newsCategory = useSelector((state) => state.newsCategory.data) || [];

  useEffect(() => {
    dispatch(getAllTargetGroupsAsync());
    dispatch(newsCategoryAsync());
  }, [dispatch]);

  useEffect(() => {
    if (skipTargetGroupsUpdate.current) {
      return;
    }

    const newTargetGroupIds = selectedTargetGroups.map((group) =>
      group.id.toString()
    );

    if (
      JSON.stringify(newTargetGroupIds) !==
      JSON.stringify(formData.targetGroupIds)
    ) {
      setFormData((prev) => ({
        ...prev,
        targetGroupIds: newTargetGroupIds,
      }));

      if (formErrors.targetGroupIds) {
        setFormErrors((prev) => ({ ...prev, targetGroupIds: null }));
      }
    }
  }, [selectedTargetGroups, formErrors]);

  // Target Group Selector handlers
  const handleSearchChange = (value) => {
    setSearchValue(value);
  };

  const handleToggleDropdown = (value) => {
    setShowDropdown(value);
  };

  const handleSelectTargetGroup = (group) => {
    skipTargetGroupsUpdate.current = false;

    if (!selectedTargetGroups.some((selected) => selected.id === group.id)) {
      setSelectedTargetGroups([...selectedTargetGroups, group]);
    } else {
      setSelectedTargetGroups(
        selectedTargetGroups.filter((selected) => selected.id !== group.id)
      );
    }
  };

  const handleRemoveTargetGroup = (group) => {
    skipTargetGroupsUpdate.current = false;
    setSelectedTargetGroups(
      selectedTargetGroups.filter((selected) => selected.id !== group.id)
    );
  };

  useEffect(() => {
    if (formData.newsCategoryId && newsCategory.length > 0) {
      const category = newsCategory.find(
        (cat) => cat.id.toString() === formData.newsCategoryId.toString()
      );
      if (category) {
        setCurrentCategoryName(category.name);
      } else if (originalData?.newsCategoryName) {
        setCurrentCategoryName(originalData.newsCategoryName);
      }
    } else if (originalData?.newsCategoryName) {
      setCurrentCategoryName(originalData.newsCategoryName);
    }
  }, [formData.newsCategoryId, newsCategory, originalData]);

  // Process description data for editor
  useEffect(() => {
    if (description) {
      try {
        const normalized = normalizeEditorData(description);
        setNormalizedEditorData(normalized);
      } catch (error) {
        console.error("Error normalizing editor data:", error);
        setNormalizedEditorData({
          time: Date.now(),
          blocks: [],
          version: "2.30.5",
        });
      }
    }
  }, [description]);

  useEffect(() => {
    const fetchNewsById = async () => {
      if (!newsId) return;

      try {
        setLoading(true);
        const token = getToken();
        const parsedToken = getParsedToken();

        // Updated API endpoint: GET /api/News/id with query parameters
        const queryParams = new URLSearchParams({
          Id: newsId,
          UserId: parsedToken.UserID,
          Device: '1', // 1 for web, 2 for mobile
          Language: 'az',
        });

        const response = await fetch(
          `https://demoadmin.databyte.app/api/News/id?${queryParams.toString()}`,
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
        setOriginalData(data);

        let categoryId = "";
        if (data.newsCategoryName && newsCategory.length > 0) {
          const matchingCategory = newsCategory.find(
            (cat) =>
              cat.name === data.newsCategoryName ||
              cat.categoryName === data.newsCategoryName
          );
          if (matchingCategory) {
            categoryId = matchingCategory.id.toString();
          }
        }

        const targetGroupIds =
          data.targetGroupIds && data.targetGroupIds.length > 0
            ? data.targetGroupIds.map((id) => id.toString())
            : [];

        const priority = data.priority ? data.priority.toUpperCase() : "HIGH";

        // Process existing attachments
        const existingAttachments = [];
        if (
          data.newsAttachments &&
          data.newsAttachments.length > 0 &&
          data.attachmentIds &&
          data.attachmentIds.length > 0
        ) {
          for (let i = 0; i < data.newsAttachments.length; i++) {
            existingAttachments.push({
              id: data.attachmentIds[i],
              path: data.newsAttachments[i],
              name:
                data.fileName && data.fileName[i]
                  ? data.fileName[i]
                  : `file-${i + 1}`,
              size:
                data.fileSize && data.fileSize[i]
                  ? data.fileSize[i]
                  : "Unknown size",
              isExisting: true,
            });
          }
        }

        // Process existing images
        const existingImages = data.newsImages
          ? data.newsImages.map((image, index) => ({
              id:
                data.newsImageIds && data.newsImageIds[index]
                  ? data.newsImageIds[index]
                  : index,
              file: null,
              preview: image,
              path: image,
              isExisting: true,
            }))
          : [];

        skipTargetGroupsUpdate.current = true;

        setFormData({
          title: data.title || "",
          subtitle: data.subTitle || "",
          newsCategoryId: categoryId,
          targetGroupIds: targetGroupIds,
          newsImages: existingImages,
          attachments: existingAttachments,
          hasNotification: data.hasNotification || false,
          hasComment: data.newsHasComment || false,
          hasLike: data.newsHasLike || false,
          priority: priority,
        });

        setCurrentCategoryName(data.newsCategoryName || "");
        if (data.targetGroups && data.targetGroups.length > 0) {
          setCurrentTargetGroupNames(data.targetGroups);
        }

        // Set selectedTargetGroups from API data
        if (targetGroupIds.length > 0 && targetGroups.length > 0) {
          const matchingGroups = targetGroups.filter((group) =>
            targetGroupIds.includes(group.id.toString())
          );

          if (matchingGroups.length > 0) {
            setSelectedTargetGroups(matchingGroups);
          } else if (data.targetGroups && data.targetGroups.length > 0) {
            const tempGroups = targetGroupIds.map((id, index) => ({
              id: id,
              name: data.targetGroups[index] || `Group ${id}`,
              userCount: 0,
              filterGroupCount: 0,
            }));
            setSelectedTargetGroups(tempGroups);
          }
        } else if (
          data.targetGroups &&
          data.targetGroups.length > 0 &&
          data.targetGroupIds &&
          data.targetGroupIds.length > 0
        ) {
          const tempGroups = data.targetGroupIds.map((id, index) => ({
            id: id.toString(),
            name: data.targetGroups[index] || `Group ${id}`,
            userCount: 0,
            filterGroupCount: 0,
          }));
          setSelectedTargetGroups(tempGroups);
        }

        if (data.description) {
          setDescription(data.description);
        }
      } catch (error) {
        console.error("Error fetching news:", error);
        toast.error("Failed to fetch news data");
      } finally {
        setLoading(false);
        setTimeout(() => {
          skipTargetGroupsUpdate.current = false;
          isInitialLoad.current = false;
        }, 500);
      }
    };

    fetchNewsById();
  }, [newsId, newsCategory, targetGroups]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "newsCategoryId") {
      const category = newsCategory.find((cat) => cat.id.toString() === value);
      if (category) {
        setCurrentCategoryName(category.name);
      }
    }

    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleEditorChange = (value) => {
    handleDescriptionChange(value, setDescription);
    if (formErrors.description) {
      setFormErrors((prev) => ({ ...prev, description: null }));
    }
  };

  const handleMarkAttachmentForDeletion = (id, isMarked) => {
    if (isMarked) {
      setAttachmentsToDelete((prev) => [...prev, id]);
    } else {
      setAttachmentsToDelete((prev) => prev.filter((item) => item !== id));
    }
  };

  const handleMarkImageForDeletion = (id, isMarked) => {
    if (isMarked) {
      setImagesToDelete((prev) => [...prev, id]);
    } else {
      setImagesToDelete((prev) => prev.filter((item) => item !== id));
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
    if (isSubmitting) return;

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    const token = getToken();

    if (!token) {
      toast.error("Authorization token is missing. Please login again.");
      setIsSubmitting(false);
      return;
    }

    try {
      const formDataToSend = new FormData();

      // Add basic form fields
      formDataToSend.append("Id", newsId);
      formDataToSend.append("Title", formData.title.trim());
      formDataToSend.append("SubTitle", formData.subtitle.trim());
      formDataToSend.append("Description", description);
      formDataToSend.append("Priority", formData.priority.toLowerCase());
      formDataToSend.append(
        "HasNotification",
        formData.hasNotification.toString()
      );
      formDataToSend.append("HasComment", formData.hasComment.toString());
      formDataToSend.append("HasLike", formData.hasLike.toString());
      formDataToSend.append("NewsCategoryId", formData.newsCategoryId);

      // Add all target group IDs
      formData.targetGroupIds.forEach((groupId) => {
        formDataToSend.append("TargetGroupIds", groupId);
      });

      // Add new images
      formData.newsImages.forEach((image) => {
        if (image.file) {
          formDataToSend.append("NewsImages", image.file);
        }
      });

      // Add new attachments
      formData.attachments.forEach((attachment) => {
        if (attachment.file && !attachment.isExisting) {
          formDataToSend.append("Attachments", attachment.file);
        }
      });

      // Add items to delete
      imagesToDelete.forEach((imageId) => {
        if (!isNaN(parseInt(imageId))) {
          formDataToSend.append("ImageIdsToDelete", imageId);
        }
      });

      attachmentsToDelete.forEach((attachmentId) => {
        if (!isNaN(parseInt(attachmentId))) {
          formDataToSend.append("AttachmentIdsToDelete", attachmentId);
        }
      });

      // Updated API call: PUT /api/News with Language parameter
      const response = await fetch(
        `https://demoadmin.databyte.app/api/News?Language=az`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            accept: "*/*",
          },
          body: formDataToSend,
        }
      );

      if (!response.ok) {
        let errorMsg = `Server responded with status: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData && errorData.message) {
            errorMsg = errorData.message;
          }
        } catch (e) {
          errorMsg = response.statusText || errorMsg;
        }
        throw new Error(errorMsg);
      }

      let result;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        result = await response.json();
      } else {
        const text = await response.text();
        result = { isSuccess: response.ok, message: text };
      }

      if (result.isSuccess || response.ok) {
        toast.success("News updated successfully");
        setTimeout(() => {
          router.push("/admin/dashboard/news");
        }, 1000);
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

  const handleCancel = () => {
    router.push("/admin/dashboard/news");
  };

  const priorityOptions = [
    { id: "HIGH", name: "High" },
    { id: "MEDIUM", name: "Medium" },
    { id: "LOW", name: "Low" },
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <main className="pt-16 bg-gray-50/50 min-h-screen">
      <div className="max-w-6xl mx-auto px-5 mb-16">
        <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-semibold text-gray-800">Edit News</h1>
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
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

              <div className="bg-white rounded-lg shadow-sm px-6 py-5">
                <div className="flex items-center mb-4 border-b border-gray-100 pb-3">
                  <h2 className="text-lg font-medium text-gray-800">Media</h2>
                </div>

                <div className="space-y-8">
                  <div>
                    <h3 className="text-sm font-medium mb-3 leading-5 text-gray-800">
                      Images <span className="text-red-500">*</span>
                    </h3>
                    <MultiImagesEdit
                      images={formData.newsImages}
                      onChange={(newImages) =>
                        setFormData((prev) => ({
                          ...prev,
                          newsImages: newImages,
                        }))
                      }
                      onMarkForDeletion={handleMarkImageForDeletion}
                    />
                    {formErrors.images && (
                      <p className="text-red-500 text-sm mt-2">
                        {formErrors.images}
                      </p>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-3 leading-5 text-gray-800">
                      Attachments
                    </h3>
                    <MultiAttachmentUploadEdit
                      attachments={formData.attachments}
                      onChange={(newAttachments) =>
                        setFormData((prev) => ({
                          ...prev,
                          attachments: newAttachments,
                        }))
                      }
                      onMarkForDeletion={handleMarkAttachmentForDeletion}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1 space-y-8">
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

          <div className="bg-white rounded-lg shadow-sm p-6 w-full">
            <div className="flex items-center mb-5 border-b border-gray-100 pb-3">
              <h2 className="text-lg font-medium text-gray-800">Content</h2>
            </div>

            <div className="descriptionEditor">
              <label className="block text-sm font-medium mb-3 text-gray-800/90">
                Body <span className="text-red-500">*</span>
              </label>
              <div className="mx-0">
                {normalizedEditorData ? (
                  <PageTextComponent
                    desc={normalizedEditorData}
                    onChange={handleEditorChange}
                  />
                ) : (
                  <div className="border rounded p-4 min-h-[300px] flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-6 h-6 border-2 border-t-emerald-500 border-b-emerald-700 rounded-full animate-spin mx-auto"></div>
                      <p className="mt-2 text-gray-600 text-sm">
                        Preparing editor...
                      </p>
                    </div>
                  </div>
                )}
              </div>
              {formErrors.description && (
                <p className="text-red-500 text-sm mt-2">
                  {formErrors.description}
                </p>
              )}
            </div>
          </div>

          <div>
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-2"></div>

              <div className="col-span-1">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="w-full bg-white text-gray-700 rounded-lg px-4 text-sm py-3 border border-gray-200 font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>

              <div className="col-span-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#0AAC9E] text-white text-sm rounded-lg px-4 py-3 font-medium hover:bg-[#099b8e] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Update
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}