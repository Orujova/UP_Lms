'use client';

import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from 'next/dynamic';
import InputComponent from "@/components/inputComponent";
import SelectComponent from "@/components/selectComponent";
import { useDispatch, useSelector } from "react-redux";
import { getAllTargetGroupsAsync } from "@/redux/getAllTargetGroups/getAllTargetGroups";
import { newsCategoryAsync } from "@/redux/newsCategory/newsCategory";
import SuccessComponent from "@/components/successComponent";
import { getToken } from "@/authtoken/auth.js";
import { Upload, X, Search, Users } from "lucide-react";
import Cropper from 'react-easy-crop';

const PageTextComponent = dynamic(() => import('@/components/pageTextComponent'), { ssr: false });

//style
import './newsAdd.scss'

export default function Page() {
  const dispatch = useDispatch();
  const [imagePreview, setImagePreview] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [tempImage, setTempImage] = useState(null);
  const targetGroupRef = useRef(null);
  const [showTargetGroupDropdown, setShowTargetGroupDropdown] = useState(false);
  const [searchTargetGroup, setSearchTargetGroup] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    newsCategoryId: "",
    targetGroupId: "",
    newsImages: null,
  });

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const validFormats = ["image/jpeg", "image/png"];
      if (!validFormats.includes(file.type)) {
        alert("Please select a valid image format (JPG, JPEG, PNG)");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should not exceed 5MB.");
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
    setFormData(prev => ({ ...prev, newsImages: croppedFile }));
    setImagePreview(preview);
    setShowCropModal(false);
    setTempImage(null);
  };

  const [description, setDescription] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");

  const targetGroups = useSelector((state) => state.getAllTargetGroups.data?.[0]?.targetGroups) || [];
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
  };

  const handleDescriptionChange = (value) => {
    setDescription(value);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const queryParams = new URLSearchParams({
      Title: formData.title,
      SubTitle: formData.subtitle,
      Description: description,
      Priority: 'HIGH',
      TargetGroup: 'TargetGroup',
      NewsCategoryId: formData.newsCategoryId,
      TargetGroupId: formData.targetGroupId,
    }).toString();
  
    const formDataToSend = new FormData();
    if (formData.newsImages) {
      formDataToSend.append('NewsImages', formData.newsImages); // Attach the image file
    }
  
    const token = getToken();
  
    if (!token) {
      setResponseMessage("Authorization token is missing. Please log in again.");
      return;
    }
  
    try {
      const response = await fetch(`https://bravoadmin.uplms.org/api/News?${queryParams}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'accept': 'application/json',
        },
        body: formDataToSend,
      });
  
      const result = await response.json();
      if (response.ok && result.isSuccess) {
        setIsSuccess(true); // Show SuccessComponent
        setResponseMessage("News created successfully.");
      } else {
        setIsSuccess(false); // Show the form again
        setResponseMessage(result.message || "Failed to create news.");
      }
    } catch (error) {
      console.error("Error creating news:", error);
      setIsSuccess(false); // Show the form again
      setResponseMessage("An error occurred. Please try again.");
    }
  };
  

  return (
    <main className="px-10 py-10 min-h-screen">
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

      <div className="flex flex-col gap-10">
        <h1 className="text-3xl font-semibold text-gray-800">Add News</h1>

        {isSuccess ? (
          <SuccessComponent link={'/admin/dashboard/news'} title={"News"} />
        ) : (
          <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
            {/* Image Upload Section */}
            <div className="border-dashed border-2 border-emerald-600 flex justify-center items-center py-16 flex-col gap-4 bg-white rounded-lg">
              {imagePreview ? (
                <div className="flex flex-col items-center">
                  <div className="relative w-full max-w-2xl aspect-video">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-lg"
                      onClick={() => {
                        setImagePreview(null);
                        setFormData(prev => ({ ...prev, newsImages: null }));
                      }}
                    >
                      <X className="w-5 h-5 text-gray-600 hover:text-gray-800" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-16 h-16 flex items-center justify-center bg-emerald-600 rounded-full mx-auto mb-4">
                    <Upload className="w-8 h-8 text-white" />
                  </div>
                  <div className="font-medium text-gray-700">
                    <label className="text-emerald-600 hover:text-emerald-700 cursor-pointer">
                      Click to upload
                      <input
                        className="hidden"
                        type="file"
                        onChange={handleImageChange}
                        accept="image/jpeg, image/png"
                      />
                    </label>
                    {' '}or drag and drop
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Image will be cropped to 16:9 ratio
                  </p>
                </div>
              )}
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
              />
              <InputComponent
                text="Subtitle"
                required
                type="text"
                placeholder="Subtitle"
                value={formData.subtitle}
                onChange={handleChange}
                name="subtitle"
              />
              <SelectComponent
                text="Category"
                name="newsCategoryId"
                required
                value={formData.newsCategoryId}
                onChange={handleChange}
                options={newsCategory}
              />

              {/* Target Group Selection */}
              <div className="bg-white rounded-lg p-6 border border-gray-200" ref={targetGroupRef}>
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
                  <Search className="absolute right-3 top-2.5 text-gray-400" size={20} />

                  {showTargetGroupDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                      {targetGroups
                        .filter(group => group.name.toLowerCase().includes(searchTargetGroup.toLowerCase()))
                        .map(group => (
                          <div
                            key={group.id}
                            className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, targetGroupId: group.id.toString() }));
                              setSearchTargetGroup(group.name);
                              setShowTargetGroupDropdown(false);
                            }}
                          >
                            <div className="font-medium">{group.name}</div>
                            <div className="text-xs text-gray-400 flex gap-2 mt-1">
                              <span className="flex items-center gap-1">
                                <span className="inline-block w-4 h-4 bg-gray-200 rounded-full text-center text-xs leading-4">U</span>
                                {group.userCount} Users
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="inline-block w-4 h-4 bg-gray-200 rounded-full text-center text-xs leading-4">F</span>
                                {group.filterGroupCount} Filters
                              </span>
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  )}
                </div>
                {formData.targetGroupId && (
                  <div className="mt-2 bg-emerald-50 text-emerald-700 px-3 py-2 rounded-lg flex justify-between items-center">
                    <span>Selected Target Group ID: {formData.targetGroupId}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, targetGroupId: '' }));
                        setSearchTargetGroup('');
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
                  <PageTextComponent onChange={handleDescriptionChange} />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 items-center justify-end mt-10">
              <button
                type="submit"
                className="bg-emerald-600 text-white rounded-lg px-6 py-2 font-medium hover:bg-emerald-700 transition"
              >
                Publish
              </button>
              <button
                type="button"
                className="bg-white text-gray-700 rounded-lg px-6 py-2 border border-gray-200 font-medium hover:bg-gray-50 transition"
              >
                Schedule
              </button>
              <button
                type="button"
                className="bg-white text-gray-700 rounded-lg px-6 py-2 border border-gray-200 font-medium hover:bg-gray-50 transition"
              >
                Save as draft
              </button>
              <button
                type="button"
                className="bg-white text-gray-700 rounded-lg px-6 py-2 border border-gray-200 font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {responseMessage && (
          <div className={`mt-4 text-center text-lg font-medium ${isSuccess ? 'text-emerald-600' : 'text-red-600'}`}>
            {responseMessage}
          </div>
        )}
      </div>
    </main>
  );
}
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
      const canvas = document.createElement('canvas');
      const img = new Image();
      img.src = image;
      
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      // Set dimensions for 16:9 ratio
      canvas.width = 1600;
      canvas.height = 900;

      const ctx = canvas.getContext('2d');
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
          const file = new File([blob], 'cropped_news_image.jpg', {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          onCrop(file, URL.createObjectURL(blob));
        },
        'image/jpeg',
        0.8
      );
    } catch (error) {
      console.error('Error creating cropped image:', error);
      toast.error('Failed to crop image');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Crop Image (16:9 ratio)</h3>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative h-[60vh] bg-gray-900 rounded-lg mb-4">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={16/9}
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