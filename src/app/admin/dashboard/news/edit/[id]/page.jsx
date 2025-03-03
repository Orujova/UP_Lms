"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import InputComponent from "@/components/inputComponent";
import SelectComponent from "@/components/selectComponent";
import { useDispatch, useSelector } from "react-redux";
import { getAllTargetGroupsAsync } from "@/redux/getAllTargetGroups/getAllTargetGroups";
import { newsCategoryAsync } from "@/redux/newsCategory/newsCategory";
import { getToken, getParsedToken } from "@/authtoken/auth.js";
import {
  Upload,
  Bell,
  BellOff,
  MessageSquare,
  MessageSquareOff,
  Heart,
  HeartOff,
  X,
  ArrowLeft,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { useRouter, usePathname } from "next/navigation";
import "./edit.scss";

// Import components
import MultiImagesEdit from "../../MultiImagesEdit";
import MultiAttachmentUploadEdit from "../../MultiAttachmentUploadEdit";
import TargetGroupSelector from "../../TargetGroupSelector";
import Switch from "../../Switch";

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

  // Form states
  const [formData, setFormData] = useState({
    title: "",
    subTitle: "",
    newsCategoryId: "",
    targetGroupId: "",
    newsImages: [],
    attachments: [],
    hasNotification: false,
    hasComment: false,
    hasLike: false,
    priority: "HIGH",
  });

  // Track attachments and images to delete
  const [attachmentsToDelete, setAttachmentsToDelete] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);

  const [description, setDescription] = useState("");
  const [responseMessage, setResponseMessage] = useState("");

  // States to hold the names of current category and target group
  const [currentCategoryName, setCurrentCategoryName] = useState("");
  const [currentTargetGroupName, setCurrentTargetGroupName] = useState("");

  // Store original data for reference
  const [originalData, setOriginalData] = useState(null);

  // Get news ID from URL
  const newsId = pathname?.split("/").pop();

  // Redux selectors
  const targetGroups =
    useSelector((state) => state.getAllTargetGroups.data?.[0]?.targetGroups) ||
    [];
  const newsCategory = useSelector((state) => state.newsCategory.data) || [];

  // Fetch initial data
  useEffect(() => {
    dispatch(getAllTargetGroupsAsync());
    dispatch(newsCategoryAsync());
  }, [dispatch]);

  // Update current category name when needed
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

  // Update current target group name when needed
  useEffect(() => {
    if (formData.targetGroupId && targetGroups.length > 0) {
      const targetGroup = targetGroups.find(
        (group) => group.id.toString() === formData.targetGroupId.toString()
      );
      if (targetGroup) {
        setCurrentTargetGroupName(targetGroup.name);
      } else if (
        originalData?.targetGroups &&
        originalData.targetGroups.length > 0
      ) {
        setCurrentTargetGroupName(originalData.targetGroups[0]);
      }
    } else if (
      originalData?.targetGroups &&
      originalData.targetGroups.length > 0
    ) {
      setCurrentTargetGroupName(originalData.targetGroups[0]);
    }
  }, [formData.targetGroupId, targetGroups, originalData]);

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
        console.log("Fetched news data:", data);

        // Store original data for reference
        setOriginalData(data);

        // Find target group ID from the targetGroupIds array
        const targetGroupId =
          data.targetGroupIds && data.targetGroupIds.length > 0
            ? data.targetGroupIds[0].toString()
            : "";

        // Get newsCategoryId from the API response (might not be explicitly provided)
        let newsCategoryId = "";
        // Find the category ID by looking up the category name in the newsCategory array
        if (data.newsCategoryName && newsCategory.length > 0) {
          const matchingCategory = newsCategory.find(
            (cat) => cat.name === data.newsCategoryName
          );
          if (matchingCategory) {
            newsCategoryId = matchingCategory.id.toString();
          }
        }

        // Prepare attachments from existing data
        const existingAttachments = [];
        if (
          data.newsAttachments &&
          data.newsAttachments.length > 0 &&
          data.fileName &&
          data.fileName.length > 0 &&
          data.fileSize &&
          data.fileSize.length > 0
        ) {
          for (let i = 0; i < data.newsAttachments.length; i++) {
            existingAttachments.push({
              id: i, // Use index as temporary id since we don't have real attachment IDs
              path: data.newsAttachments[i],
              name: data.fileName[i] || `file-${i + 1}`,
              size: data.fileSize[i] || "Unknown size",
              isExisting: true,
            });
          }
        }

        setFormData({
          title: data.title || "",
          subTitle: data.subTitle || "",
          newsCategoryId: newsCategoryId,
          targetGroupId,
          newsImages: data.newsImages
            ? data.newsImages.map((image, index) => ({
                id: index, // Use index as temporary ID
                file: null, // We don't have access to the file object for existing images
                preview: image, // Store image URL
                path: image, // Store original path for reference
                isExisting: true,
              }))
            : [],
          attachments: existingAttachments,
          hasNotification: data.hasNotification || false,
          hasComment: data.newsHasComment || false,
          hasLike: data.newsHasLike || false,
          priority: data.priority || "HIGH",
        });

        // Set category and target group names from original data
        setCurrentCategoryName(data.newsCategoryName || "");
        if (data.targetGroups && data.targetGroups.length > 0) {
          setCurrentTargetGroupName(data.targetGroups[0]);
        }

        if (data.description) {
          try {
            const parsedDescription =
              typeof data.description === "string"
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
  }, [newsId, newsCategory]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Update the current name when selection changes
    if (name === "newsCategoryId") {
      const category = newsCategory.find((cat) => cat.id.toString() === value);
      if (category) {
        setCurrentCategoryName(category.name);
      }
    }
  };

  const handleDescriptionChange = (value) => {
    setDescription(value);
  };

  const handleTargetGroupChange = (value) => {
    setFormData((prev) => ({ ...prev, targetGroupId: value }));
    const targetGroup = targetGroups.find(
      (group) => group.id.toString() === value
    );
    if (targetGroup) {
      setCurrentTargetGroupName(targetGroup.name);
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

  // Replace the handleSubmit function with this fixed version
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
      // Validate required fields
      if (
        !formData.title ||
        !formData.subTitle ||
        !formData.newsCategoryId ||
        !formData.targetGroupId
      ) {
        toast.error("Please fill in all required fields");
        setIsSubmitting(false);
        return;
      }

      console.log("Submitting news update...");

      // Create FormData object for file uploads
      const formDataToSend = new FormData();

      // Add query parameters to the FormData
      formDataToSend.append("Id", newsId);
      formDataToSend.append("Title", formData.title.trim());
      formDataToSend.append("SubTitle", formData.subTitle.trim());
      formDataToSend.append("Description", JSON.stringify(description));

      // Make sure priority is lowercase to match API expectations
      formDataToSend.append("Priority", formData.priority.toLowerCase());

      // Convert boolean values to strings "true" or "false"
      formDataToSend.append(
        "HasNotification",
        formData.hasNotification.toString()
      );
      formDataToSend.append("HasComment", formData.hasComment.toString());
      formDataToSend.append("HasLike", formData.hasLike.toString());

      formDataToSend.append("NewsCategoryId", formData.newsCategoryId);
      formDataToSend.append("TargetGroupId", formData.targetGroupId);

      // Add new images to the form data
      formData.newsImages.forEach((image) => {
        if (image.file) {
          formDataToSend.append("NewsImages", image.file);
        }
      });

      // Add new attachments to form data
      formData.attachments.forEach((attachment) => {
        if (attachment.file && !attachment.isExisting) {
          formDataToSend.append("Attachments", attachment.file);
        }
      });

      // Handle images to delete properly
      // Make sure we're sending actual database IDs, not our local temporary IDs
      imagesToDelete.forEach((imageId) => {
        const imageToDelete = formData.newsImages.find(
          (img) => img.id === imageId
        );
        if (imageToDelete && imageToDelete.isExisting) {
          // Extract actual database ID from image path or use other identifier from originalData
          const pathParts = imageToDelete.path.split("/");
          const actualImageId = pathParts[pathParts.length - 1].split(".")[0];
          if (actualImageId && !isNaN(parseInt(actualImageId))) {
            formDataToSend.append("ImageIdsToDelete", actualImageId);
          }
        }
      });

      // Handle attachments to delete properly
      attachmentsToDelete.forEach((attachmentId) => {
        const attachmentToDelete = formData.attachments.find(
          (att) => att.id === attachmentId
        );
        if (attachmentToDelete && attachmentToDelete.isExisting) {
          // Extract actual database ID from attachment path or use other identifier from originalData
          const pathParts = attachmentToDelete.path.split("/");
          const actualAttachmentId =
            pathParts[pathParts.length - 1].split(".")[0];
          if (actualAttachmentId && !isNaN(parseInt(actualAttachmentId))) {
            formDataToSend.append("AttachmentIdsToDelete", actualAttachmentId);
          }
        }
      });

      // Console log the form data for debugging
      for (let [key, value] of formDataToSend.entries()) {
        console.log(`${key}: ${value}`);
      }

      // Make the API call with all parameters in the URL as query params
      // This matches the curl example provided
      const queryParams = new URLSearchParams();
      queryParams.append("Id", newsId);
      queryParams.append("Title", formData.title.trim());
      queryParams.append("SubTitle", formData.subTitle.trim());
      queryParams.append("Description", JSON.stringify(description));
      queryParams.append("Priority", formData.priority.toLowerCase());
      queryParams.append(
        "HasNotification",
        formData.hasNotification.toString()
      );
      queryParams.append("HasComment", formData.hasComment.toString());
      queryParams.append("HasLike", formData.hasLike.toString());
      queryParams.append("NewsCategoryId", formData.newsCategoryId);
      queryParams.append("TargetGroupId", formData.targetGroupId);

      // Add any ImageIdsToDelete and AttachmentIdsToDelete to query params
      // (Note: This approach handles arrays in query params by repeating the key)
      formDataToSend.getAll("ImageIdsToDelete").forEach((id) => {
        queryParams.append("ImageIdsToDelete", id);
      });

      formDataToSend.getAll("AttachmentIdsToDelete").forEach((id) => {
        queryParams.append("AttachmentIdsToDelete", id);
      });

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
        // Handle non-JSON response
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
      <div className="banner">
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
      </div>{" "}
      {/* Attachments Section */}
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
          />

          <div>
            <SelectComponent
              text="Category"
              name="newsCategoryId"
              required
              value={formData.newsCategoryId}
              onChange={handleChange}
              options={newsCategory}
            />
            {currentCategoryName && (
              <div className="mt-2 bg-[#f9fefe] text-[#0AAC9E] px-3 py-2 rounded-lg flex justify-between items-center">
                <span>Selected: {currentCategoryName}</span>
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, newsCategoryId: "" }));
                    setCurrentCategoryName("");
                  }}
                  className="text-[#0AAC9E] hover:text-emerald-800"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

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

          {/* Target Group with current value display */}
          <div className="mb-4">
            <TargetGroupSelector
              targetGroups={targetGroups}
              value={formData.targetGroupId}
              onChange={handleTargetGroupChange}
              hideLabel={true}
            />
            {currentTargetGroupName && !formData.targetGroupId && (
              <div className="mt-2 bg-[#f9fefe] text-[#0AAC9E] px-3 py-2 rounded-lg flex justify-between items-center">
                <span>Selected: {currentTargetGroupName}</span>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentTargetGroupName("");
                  }}
                  className="text-[#0AAC9E] hover:text-emerald-800"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

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
