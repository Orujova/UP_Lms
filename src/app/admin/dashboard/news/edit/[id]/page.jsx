"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter, usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { getAllTargetGroupsAsync } from "@/redux/getAllTargetGroups/getAllTargetGroups";
import { newsCategoryAsync } from "@/redux/newsCategory/newsCategory";
import { getToken, getParsedToken } from "@/authtoken/auth.js";
import { toast, Toaster } from "sonner";
import {
  Bell,
  BellOff,
  MessageSquare,
  MessageSquareOff,
  Heart,
  HeartOff,
  ArrowLeft,
} from "lucide-react";

import "./edit.scss";

// Import components
import InputComponent from "@/components/inputComponent";
import SelectComponent from "@/components/selectComponent";
import MultiImagesEdit from "../../MultiImagesEdit";
import MultiAttachmentUploadEdit from "../../MultiAttachmentUploadEdit";
import TargetGroupSelector from "../../TargetGroupSelector";
import CategorySelector from "../../CategorySelector";
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
      <div className="border rounded p-4 min-h-[200px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-t-emerald-500 border-b-emerald-700 rounded-full animate-spin mx-auto"></div>
          <p className="mt-2 text-gray-600 text-sm">Loading editor...</p>
        </div>
      </div>
    ),
  }
);

export default function Page() {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const [formData, setFormData] = useState({
    title: "",
    subTitle: "",
    newsCategoryId: "",
    targetGroupIds: [], // Changed from targetGroupId to targetGroupIds array
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
  const [currentTargetGroupNames, setCurrentTargetGroupNames] = useState([]); // Changed to array
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

  // Updated to handle multiple target groups
  useEffect(() => {
    if (formData.targetGroupIds.length > 0 && targetGroups.length > 0) {
      const selectedGroups = targetGroups.filter((group) =>
        formData.targetGroupIds.includes(group.id.toString())
      );

      if (selectedGroups.length > 0) {
        setCurrentTargetGroupNames(selectedGroups.map((group) => group.name));
      } else if (
        originalData?.targetGroups &&
        originalData.targetGroups.length > 0
      ) {
        setCurrentTargetGroupNames(originalData.targetGroups);
      }
    } else if (
      originalData?.targetGroups &&
      originalData.targetGroups.length > 0
    ) {
      setCurrentTargetGroupNames(originalData.targetGroups);
    }
  }, [formData.targetGroupIds, targetGroups, originalData]);

  // Process description data for editor
  useEffect(() => {
    if (description) {
      try {
        // Normalize the description data for the editor
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
        console.log("Fetched news data:", data);

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

        // Convert targetGroupIds to array of strings
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

        // Update form state
        setFormData({
          title: data.title || "",
          subTitle: data.subTitle || "",
          newsCategoryId: categoryId,
          targetGroupIds: targetGroupIds, // Now using array of IDs
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

        // Process description data - store raw data first, normalization happens in useEffect
        if (data.description) {
          setDescription(data.description);
        }
      } catch (error) {
        console.error("Error fetching news:", error);
        toast.error("Failed to fetch news data");
      } finally {
        setLoading(false);
      }
    };

    fetchNewsById();
  }, [newsId, newsCategory]);

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

    // Clear error when field is updated
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleEditorChange = (value) => {
    // Use utility function to handle editor data
    handleDescriptionChange(value, setDescription);
    if (formErrors.description) {
      setFormErrors((prev) => ({ ...prev, description: null }));
    }
  };

  // Updated to handle multiple target groups
  const handleTargetGroupChange = (value) => {
    setFormData((prev) => ({ ...prev, targetGroupIds: value }));

    if (formErrors.targetGroupIds) {
      setFormErrors((prev) => ({ ...prev, targetGroupIds: null }));
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

  // Form validation
  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = "Title is required";
    if (!formData.subTitle.trim()) errors.subTitle = "Subtitle is required";
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

    // Validate form
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
      // Generate form data
      const formDataToSend = new FormData();

      // Add basic form fields
      formDataToSend.append("Id", newsId);
      formDataToSend.append("Title", formData.title.trim());
      formDataToSend.append("SubTitle", formData.subTitle.trim());
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

      // Create query parameters
      const queryParams = new URLSearchParams();
      queryParams.append("Id", newsId);
      queryParams.append("Title", formData.title.trim());
      queryParams.append("SubTitle", formData.subTitle.trim());
      queryParams.append("Description", description);
      queryParams.append("Priority", formData.priority.toLowerCase());
      queryParams.append(
        "HasNotification",
        formData.hasNotification.toString()
      );
      queryParams.append("HasComment", formData.hasComment.toString());
      queryParams.append("HasLike", formData.hasLike.toString());
      queryParams.append("NewsCategoryId", formData.newsCategoryId);

      // Add all target groups to query params
      formData.targetGroupIds.forEach((groupId) => {
        queryParams.append("TargetGroupIds", groupId);
      });

      imagesToDelete.forEach((imageId) => {
        if (!isNaN(parseInt(imageId))) {
          queryParams.append("ImageIdsToDelete", imageId);
        }
      });

      attachmentsToDelete.forEach((attachmentId) => {
        if (!isNaN(parseInt(attachmentId))) {
          queryParams.append("AttachmentIdsToDelete", attachmentId);
        }
      });

      // Make API request
      const response = await fetch(
        `https://bravoadmin.uplms.org/api/News?${queryParams.toString()}`,
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

  if (loading) {
    return <LoadingSpinner />;
  }
  return (
    <div className="edit ">
      <Toaster position="top-right" />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Edit News</h1>
        <button
          onClick={() => router.push("/admin/dashboard/news")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={16} />
          <span>Back to list</span>
        </button>
      </div>

      <div className="banner ">
        <h3 className="text-sm font-medium mb-4 leading-5 text-gray-800/90">
          Images
        </h3>
        <MultiImagesEdit
          images={formData.newsImages}
          onChange={(newImages) =>
            setFormData((prev) => ({ ...prev, newsImages: newImages }))
          }
          onMarkForDeletion={handleMarkImageForDeletion}
        />
        {formErrors.images && (
          <p className="text-red-500 text-sm mt-2">{formErrors.images}</p>
        )}
      </div>

      <div className="mb-8">
        <h3 className="text-sm font-medium mb-4 leading-5 text-gray-800/90">
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

      <form className="newsEditForm mt-8" onSubmit={handleSubmit}>
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
            error={formErrors.subTitle}
          />

          <CategorySelector
            value={formData.newsCategoryId}
            onChange={handleChange}
            options={newsCategory}
            hideLabel={false}
            error={formErrors.newsCategoryId}
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

          <div className="mb-4">
            {/* Updated to use multiple mode */}
            <TargetGroupSelector
              targetGroups={targetGroups}
              value={formData.targetGroupIds}
              onChange={handleTargetGroupChange}
              hideLabel={false}
              error={formErrors.targetGroupIds}
              multiple={true}
            />
          </div>

          <div className="descriptionEditor">
            <label className="block text-sm font-medium mb-2 text-gray-800/90">
              Body
            </label>
            <div>
              {/* Only render the editor when normalizedEditorData is available */}
              {normalizedEditorData ? (
                <PageTextComponent
                  desc={normalizedEditorData}
                  onChange={handleEditorChange}
                />
              ) : (
                <div className="border rounded p-4 min-h-[200px] flex items-center justify-center">
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
        <div className="formButtons">
          <button type="submit" disabled={isSubmitting} className="button">
            {isSubmitting ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/dashboard/news")}
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
