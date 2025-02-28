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
} from "lucide-react";
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
    hasNotification: false,
    hasComment: false,
    hasLike: false,
    priority: "HIGH",
  });

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

        setFormData({
          title: data.title || "",
          subTitle: data.subTitle || "",
          newsCategoryId: newsCategoryId,
          targetGroupId,
          newsImages: data.newsImages
            ? data.newsImages.map((image) => ({
                file: null, // We don't have access to the file object for existing images
                preview: image.startsWith("http")
                  ? image
                  : `https://bravoadmin.uplms.org/uploads/${image}`,
                path: image, // Store original path for reference
              }))
            : [],
          hasNotification: data.newsHasComment || false, // Fixed property names based on API response
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    const token = getToken();
    const parsedToken = getParsedToken();

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

      // Create FormData object to handle both text fields and file uploads
      const formDataToSend = new FormData();

      // Append basic form fields
      formDataToSend.append("Id", newsId);
      formDataToSend.append("Title", formData.title.trim());
      formDataToSend.append("SubTitle", formData.subTitle.trim());
      formDataToSend.append("Description", JSON.stringify(description));
      formDataToSend.append("Priority", formData.priority);
      formDataToSend.append("NewsCategoryId", formData.newsCategoryId);
      formDataToSend.append("TargetGroupId", formData.targetGroupId);
      formDataToSend.append("HasNotification", formData.hasNotification);
      formDataToSend.append("HasComment", formData.hasComment);
      formDataToSend.append("HasLike", formData.hasLike);
      formDataToSend.append("UserId", parsedToken.UserID);

      // Track which images are new and which existing ones to keep
      const existingImagePaths = [];

      // Add new images to the form data
      formData.newsImages.forEach((image, index) => {
        if (image.file) {
          // New image to upload
          formDataToSend.append("NewsImages", image.file);
        } else if (image.path) {
          // Existing image to keep - add full path without manipulation
          existingImagePaths.push(image.path);
        }
      });

      // Append existing images to keep as a JSON string
      if (existingImagePaths.length > 0) {
        formDataToSend.append(
          "ExistingImagePaths",
          JSON.stringify(existingImagePaths)
        );
      }

      console.log("Submitting news update with form data");

      // Try with different endpoint format
      const response = await fetch(
        `https://bravoadmin.uplms.org/api/News/${newsId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            accept: "application/json",
            // Don't set Content-Type here - it will be set automatically with the boundary for FormData
          },
          body: formDataToSend,
        }
      );

      // Check if we got a response
      if (!response.ok) {
        // Try to get error details if possible
        let errorMsg = `Server responded with status: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData && errorData.message) {
            errorMsg = errorData.message;
          }
        } catch (e) {
          // If can't parse JSON, use status text
          errorMsg = response.statusText || errorMsg;
        }
        throw new Error(errorMsg);
      }

      // Parse the response
      const result = await response.json();

      if (result.isSuccess) {
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

      <div className="banner">
        <MultiImageUpload
          images={formData.newsImages}
          onChange={(newImages) =>
            setFormData((prev) => ({ ...prev, newsImages: newImages }))
          }
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
