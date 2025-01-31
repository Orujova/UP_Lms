"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import InputComponent from "@/components/inputComponent";
import SelectComponent from "@/components/selectComponent";
import { useDispatch, useSelector } from "react-redux";
import { getAllTargetGroupsAsync } from "@/redux/getAllTargetGroups/getAllTargetGroups";
import { newsCategoryAsync } from "@/redux/newsCategory/newsCategory";
import SuccessComponent from "@/components/successComponent";
import { getToken, getParsedToken } from "@/authtoken/auth.js";
import { Upload, X, Search, Users } from "lucide-react";
import Cropper from "react-easy-crop";
import { toast, Toaster } from "sonner";
import { useRouter, usePathname } from "next/navigation";
import "./edit.scss";

const PageTextComponent = dynamic(() => import('@/components/pageTextComponent'), { ssr: false });

// Crop Modal Component
const CropModal = ({ image, onCancel, onCrop }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createCroppedImage = async () => {
    try {
      const canvas = document.createElement("canvas");
      const img = new Image();
      img.src = image;

      await new Promise((resolve) => {
        img.onload = resolve;
      });

      canvas.width = 1600;
      canvas.height = 900;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(
        img,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        canvas.width,
        canvas.height
      );

      canvas.toBlob(
        (blob) => {
          const file = new File([blob], "cropped_news_image.jpg", {
            type: "image/jpeg",
            lastModified: Date.now(),
          });
          onCrop(file, URL.createObjectURL(blob));
        },
        "image/jpeg",
        0.8
      );
    } catch (error) {
      console.error("Error creating cropped image:", error);
      toast.error("Failed to crop image");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Crop Image (16:9 ratio)</h3>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative h-[60vh] bg-gray-900 rounded-lg mb-4">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={16 / 9}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            objectFit="contain"
            showGrid={true}
          />
        </div>

        <div className="flex items-center gap-4 mb-4">
          <span className="text-sm text-gray-600">Zoom:</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={createCroppedImage}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Apply Crop
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Page() {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Image states
  const [imagePreview, setImagePreview] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [tempImage, setTempImage] = useState(null);

  // Target Group states
  const targetGroupRef = useRef(null);
  const [showTargetGroupDropdown, setShowTargetGroupDropdown] = useState(false);
  const [searchTargetGroup, setSearchTargetGroup] = useState("");

  // Form states
  const [formData, setFormData] = useState({
    title: "",
    subTitle: "",
    newsCategoryId: "",
    targetGroupId: "",
    newsImages: null,
  });
  const [description, setDescription] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");

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
          newsImages: null,
        });

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

        if (data.targetGroupId) {
          const targetGroup = targetGroups.find(
            (g) => g.id.toString() === data.targetGroupId.toString()
          );
          if (targetGroup) {
            setSearchTargetGroup(targetGroup.name);
          }
        }

        if (data.newsImages && data.newsImages[0]) {
          const imageUrl = `https://bravoadmin.uplms.org/uploads/${data.newsImages[0].replace(
            "https://100.42.179.27:7198/",
            ""
          )}`;
          setImagePreview(imageUrl);
        }
      } catch (error) {
        console.error("Error fetching news:", error);
        toast.error("Failed to fetch news data");
      } finally {
        setLoading(false);
      }
    };

    fetchNewsById();
  }, [newsId, targetGroups]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDescriptionChange = (value) => {
    setDescription(value);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const validFormats = ["image/jpeg", "image/png"];
      if (!validFormats.includes(file.type)) {
        toast.error("Please select a valid image format (JPG, JPEG, PNG)");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should not exceed 5MB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setTempImage(reader.result);
        setShowCropModal(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedFile, preview) => {
    setFormData((prev) => ({ ...prev, newsImages: croppedFile }));
    setImagePreview(preview);
    setShowCropModal(false);
    setTempImage(null);
    toast.success("Image updated successfully");
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
        Priority: "HIGH",
        TargetGroup: "TargetGroup",
        NewsCategoryId: formData.newsCategoryId,
        TargetGroupId: formData.targetGroupId,
      });

      const formDataToSend = new FormData();
      if (formData.newsImages) {
        formDataToSend.append("NewsImages", formData.newsImages);
      }

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

      {showCropModal && (
        <CropModal
          image={tempImage}
          onCancel={() => {
            setShowCropModal(false);
            setTempImage(null);
          }}
          onCrop={handleCropComplete}
        />
      )}

      <div className="banner">
        <div className="image">
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="News Banner"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <Upload className="w-10 h-10 text-gray-400" />
              <p className="text-gray-500 mt-2">No Image Available</p>
            </div>
          )}

          {imagePreview && (
            <button
              type="button"
              className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md text-red-500 flex items-center z-10"
              onClick={() => {
                setImagePreview(null);
                setFormData((prev) => ({ ...prev, newsImages: null }));
                toast.info("Image removed");
              }}
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <input
          type="file"
          id="image-upload"
          onChange={handleImageChange}
          accept="image/jpeg, image/png"
          className="hidden"
        />

        <label htmlFor="image-upload" className="button">
          Change photo
        </label>
      </div>

      <form className="newsEditForm" onSubmit={handleSubmit}>
        <div className="inputs">
          <InputComponent
            text="Title"
            required
            className="col6"
            type="text"
            placeholder="Enter news title"
            value={formData.title}
            onChange={handleChange}
            name="title"
          />
          <InputComponent
            text="subTitle"
            required
            className="col6"
            type="text"
            placeholder="Enter subTitle"
            value={formData.subTitle}
            onChange={handleChange}
            name="subTitle"
          />
          <SelectComponent
            text="newsCategoryName"
            name="newsCategoryId"
            required
            value={formData.newsCategoryId}
            onChange={handleChange}
            options={newsCategory}
          />

          {/* Target Group Selection */}
          <div
            className="bg-white rounded-lg p-6 border border-gray-200"
            ref={targetGroupRef}
          >
            <h2 className="text-lg font-medium mb-4">Target Group</h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Search target groups..."
                value={searchTargetGroup}
                onChange={(e) => {
                  setSearchTargetGroup(e.target.value);
                  setShowTargetGroupDropdown(true);
                }}
                onClick={() => setShowTargetGroupDropdown(true)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-emerald-500"
              />
              <Search
                className="absolute right-3 top-2.5 text-gray-400"
                size={20}
              />

              {showTargetGroupDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                  {targetGroups
                    .filter((group) =>
                      group.name
                        .toLowerCase()
                        .includes(searchTargetGroup.toLowerCase())
                    )
                    .map((group) => (
                      <div
                        key={group.id}
                        className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            targetGroupId: group.id.toString(),
                          }));
                          setSearchTargetGroup(group.name);
                          setShowTargetGroupDropdown(false);
                        }}
                      >
                        <div className="font-medium">{group.name}</div>
                        <div className="text-xs text-gray-400 flex gap-2 mt-1">
                          <span className="flex items-center gap-1">
                            <span className="inline-block w-4 h-4 bg-gray-200 rounded-full text-center text-xs leading-4">
                              U
                            </span>
                            {group.userCount} Users
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="inline-block w-4 h-4 bg-gray-200 rounded-full text-center text-xs leading-4">
                              F
                            </span>
                            {group.filterGroupCount} Filters
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
            {formData.targetGroupId && (
              <div className="mt-2 bg-emerald-50 text-emerald-700 px-3 py-2 rounded-lg flex justify-between items-center">
                <span>Selected Target Group ID: {formData.targetGroupId}</span>
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, targetGroupId: "" }));
                    setSearchTargetGroup("");
                  }}
                  className="text-emerald-700 hover:text-emerald-800"
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
        <div
          className={`mt-4 text-center text-lg font-medium ${
            isSuccess ? "text-emerald-600" : "text-red-600"
          }`}
        >
          {responseMessage}
        </div>
      )}
    </div>
  );
}
