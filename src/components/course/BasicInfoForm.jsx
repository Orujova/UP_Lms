import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Upload, X, Clock, Award, Tag, Camera, AlertCircle, CheckCircle, Info } from "lucide-react";
import {
  setFormData,
  setImagePreview,
  setImageFile,
  nextStep,
} from "@/redux/course/courseSlice";
import { fetchCourseCategoriesAsync } from "@/redux/courseCategory/courseCategorySlice";
import { fetchCourseTagsAsync } from "@/redux/courseTag/courseTagSlice";
import { fetchCertificatesAsync } from "@/redux/certificate/certificateSlice";

const BasicInfoForm = () => {
  const dispatch = useDispatch();
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const { formData = {} } = useSelector((state) => state.course || {});
  const { categories = [], loading: categoriesLoading } = useSelector((state) => state.courseCategory);
  const { tags = [], loading: tagsLoading } = useSelector((state) => state.courseTag);
  const { certificates = [], loading: certificatesLoading } = useSelector((state) => state.certificate);

  useEffect(() => {
    dispatch(fetchCourseCategoriesAsync());
    dispatch(fetchCourseTagsAsync());
    dispatch(fetchCertificatesAsync());
  }, [dispatch]);

  const validateField = (field, value) => {
    switch (field) {
      case 'name':
        if (!value?.trim()) return "Course name is required";
        if (value.length < 3) return "Must be at least 3 characters";
        if (value.length > 100) return "Must be less than 100 characters";
        return "";
      case 'description':
        if (!value?.trim()) return "Description is required";
        if (value.length < 10) return "Must be at least 10 characters";
        if (value.length > 1000) return "Must be less than 1000 characters";
        return "";
      case 'categoryId':
        if (!value) return "Please select a category";
        return "";
      case 'duration':
        if (!value || value < 1) return "Duration must be at least 1 minute";
        if (value > 10080) return "Duration cannot exceed 1 week";
        return "";
      default:
        return "";
    }
  };

  const handleInputChange = (field, value) => {
    dispatch(setFormData({ [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field]);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleImageDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleImageFile(file);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleImageFile(file);
    }
  };

  const handleImageFile = (file) => {
    if (file.size > 10 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, image: "Image size must be less than 10MB" }));
      return;
    }

    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, image: "Please select a valid image file" }));
      return;
    }

    dispatch(setImageFile(file));
    setErrors(prev => ({ ...prev, image: "" }));

    const reader = new FileReader();
    reader.onload = (e) => {
      dispatch(setImagePreview(e.target.result));
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    dispatch(setImageFile(null));
    dispatch(setImagePreview(null));
    setErrors(prev => ({ ...prev, image: "" }));
  };

  const getFieldClassName = (field) => {
    const baseClass = "w-full px-3 py-2 border rounded-lg text-xs transition-all duration-200 focus:outline-none";
    
    if (touched[field] && errors[field]) {
      return `${baseClass} border-red-300 focus:border-red-400 bg-red-50 focus:ring-2 focus:ring-red-100`;
    }
    
    if (touched[field] && !errors[field] && formData[field]) {
      return `${baseClass} border-[#0AAC9E] focus:border-[#0AAC9E] bg-[#0AAC9E]/5 focus:ring-2 focus:ring-[#0AAC9E]/10`;
    }
    
    return `${baseClass} border-gray-300 focus:border-[#0AAC9E] hover:border-gray-400 focus:ring-2 focus:ring-[#0AAC9E]/10`;
  };

  const getCompletionPercentage = () => {
    const requiredFields = ['name', 'description', 'categoryId'];
    const completedFields = requiredFields.filter(field => 
      formData[field] && !errors[field]
    ).length;
    return Math.round((completedFields / requiredFields.length) * 100);
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-lg font-bold text-gray-900 mb-1">Course Information</h1>
        <p className="text-xs text-gray-600">Set up your course details</p>
        
     
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Course Details */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Course Details</h2>
            
            <div className="space-y-3">
              {/* Course Name */}
              <div>
                <label className="block text-xs font-medium text-gray-900 mb-1">
                  Course Title <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.name || ""}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    onBlur={() => handleBlur("name")}
                    placeholder="Enter course title"
                    className={getFieldClassName("name")}
                  />
                  {touched.name && !errors.name && formData.name && (
                    <div>

                      <CheckCircle className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#0AAC9E]" />
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between items-center mt-1">
                  {touched.name && errors.name ? (
                    <div className="flex items-center gap-1 text-xs text-red-600">
                      <div>

                      <AlertCircle className="w-4 h-3" />
                      </div>
                      <span>{errors.name}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-500">Make it clear and engaging</span>
                  )}
                  <span className="text-xs text-gray-400">{formData.name?.length || 0}/100</span>
                </div>
              </div>

              {/* Course Description */}
              <div>
                <label className="block text-xs font-medium text-gray-900 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <textarea
                    value={formData.description || ""}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    onBlur={() => handleBlur("description")}
                    placeholder="Describe what students will learn"
                    rows={3}
                    className={`${getFieldClassName("description")} resize-none`}
                  />
                  {touched.description && !errors.description && formData.description && (
                    <CheckCircle className="absolute right-2 top-2 w-4 h-4 text-[#0AAC9E]" />
                  )}
                </div>
                
                <div className="flex justify-between items-center mt-1">
                  {touched.description && errors.description ? (
                    <div className="flex items-center gap-1 text-xs text-red-600">

                    <div>

                      <AlertCircle className="w-4 h-3" />
                      </div>
                      <span>{errors.description}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-500">Help learners understand the value</span>
                  )}
                  <span className="text-xs text-gray-400">{formData.description?.length || 0}/1000</span>
                </div>
              </div>
            </div>
          </div>

          {/* Course Cover */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Camera className="w-4 h-4 text-[#0AAC9E]" />
              <h2 className="text-sm font-semibold text-gray-900">Course Cover</h2>
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">Optional</span>
            </div>

            {formData?.imagePreview ? (
              <div className="relative group">
                <div className="relative overflow-hidden rounded-lg border border-gray-200">
                  <img
                    src={formData.imagePreview}
                    alt="Course cover"
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center">
                    <button
                      onClick={removeImage}
                      className="opacity-0 group-hover:opacity-100 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-all duration-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {formData.imageFile && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 font-medium truncate">{formData.imageFile.name}</span>
                      <span className="text-gray-500 ml-2">{(formData.imageFile.size / 1024 / 1024).toFixed(1)}MB</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 cursor-pointer ${
                  dragActive
                    ? "border-[#0AAC9E] bg-[#0AAC9E]/5"
                    : "border-gray-300 hover:border-[#0AAC9E] hover:bg-[#0AAC9E]/5"
                } ${errors.image ? "border-red-300 bg-red-50" : ""}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleImageDrop}
              >
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-200 ${
                    dragActive ? "bg-[#0AAC9E] text-white" : "bg-[#0AAC9E]/10 text-[#0AAC9E]"
                  }`}>
                    <Upload className="w-5 h-5" />
                  </div>
                  
                  <h3 className="text-sm font-medium text-gray-900 mb-1">
                    {dragActive ? "Drop image here" : "Upload Cover"}
                  </h3>
                  
                  <p className="text-xs text-gray-600 mb-2">
                    Drag and drop, or{" "}
                    <label className="text-[#0AAC9E] hover:text-[#0AAC9E]/80 cursor-pointer font-medium underline">
                      browse files
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                    </label>
                  </p>
                  
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <div>
                      <Info className="w-4 h-3" />  
                    </div>
                  
                    <span>PNG, JPG up to 10MB</span>
                  </div>
                </div>
              </div>
            )}
            
            {errors.image && (
              <div className="mt-2 flex items-center gap-1 text-xs text-red-600 bg-red-50 p-2 rounded">
                <div>

                      <AlertCircle className="w-4 h-3" />
                      </div>
                <span>{errors.image}</span>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          
          {/* Settings */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Settings</h2>
            
            <div className="space-y-3">
              {/* Category */}
              <div>
                <label className="block text-xs font-medium text-gray-900 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.categoryId || ""}
                    onChange={(e) => handleInputChange("categoryId", parseInt(e.target.value) || "")}
                    onBlur={() => handleBlur("categoryId")}
                    className={getFieldClassName("categoryId")}
                    disabled={categoriesLoading}
                  >
                    <option value="">
                      {categoriesLoading ? "Loading..." : "Select category"}
                    </option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {touched.categoryId && !errors.categoryId && formData.categoryId && (
                    <CheckCircle className="absolute right-6 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#0AAC9E]" />
                  )}
                </div>
                {touched.categoryId && errors.categoryId && (
                  <div className="mt-1 flex items-center gap-1 text-xs text-red-600">
                   <div>

                      <AlertCircle className="w-4 h-3" />
                      </div>
                    <span>{errors.categoryId}</span>
                  </div>
                )}
              </div>

              {/* Duration */}
              <div>
                <div className="text-xs font-medium text-gray-900 mb-1 flex items-center gap-1 ">

         <div>
          <Clock className="w-4 h-3 text-[#0AAC9E]" />
         </div>
                  
                
                 <label>Duration (minutes)</label> 
                </div>
                <input
                  type="number"
                  value={formData.duration || ""}
                  onChange={(e) => handleInputChange("duration", parseInt(e.target.value) || "")}
                  onBlur={() => handleBlur("duration")}
                  placeholder="60"
                  min="1"
                  className={getFieldClassName("duration")}
                />
                {errors.duration && (
                  <div className="mt-1 flex items-center gap-1 text-xs text-red-600">
                   <div><AlertCircle className="w-4 h-3" /></div> 
                    <span>{errors.duration}</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-medium text-gray-900 mb-1">
                  Tags <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">Optional</span>
                </label>
                <select
                  value={formData?.tagIds?.[0] || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "tagIds",
                      e.target.value ? [parseInt(e.target.value)] : []
                    )
                  }
                  className={getFieldClassName("tags")}
                  disabled={tagsLoading}
                >
                  <option value="">
                    {tagsLoading ? "Loading..." : "Select tags"}
                  </option>
                  {tags.map((tag) => (
                    <option key={tag.id} value={tag.id}>
                      {tag.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Certificate */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-4 h-4 text-[#0AAC9E]" />
              <h2 className="text-sm font-semibold text-gray-900">Certificate</h2>
            </div>
            
            <div className="bg-[#0AAC9E]/5 rounded-lg p-3 border border-[#0AAC9E]/20">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData?.verifiedCertificate || false}
                  onChange={(e) =>
                    handleInputChange("verifiedCertificate", e.target.checked)
                  }
                  className="w-4 h-4 rounded border-2 border-gray-300 text-[#0AAC9E] focus:ring-[#0AAC9E] focus:ring-2 focus:ring-offset-0 bg-white checked:bg-[#0AAC9E] checked:border-[#0AAC9E] mt-0.5"
                />
                <div>
                  <div className="text-xs font-medium text-gray-900 mb-1">
                    Provide Certificate
                  </div>
                  <p className="text-xs text-gray-600">
                    Award learners with verified certificate
                  </p>
                </div>
              </label>
            </div>
            
            {formData?.verifiedCertificate && (
              <div className="mt-3 pl-3 border-l-2 border-[#0AAC9E]/30">
                <label className="block text-xs font-medium text-gray-900 mb-1">
                  Certificate Template
                </label>
                <select
                  value={formData.certificateId || ""}
                  onChange={(e) =>
                    handleInputChange("certificateId", parseInt(e.target.value) || null)
                  }
                  className={getFieldClassName("certificate")}
                  disabled={certificatesLoading}
                >
                  <option value="">
                    {certificatesLoading ? "Loading..." : "Select template"}
                  </option>
                  {certificates.map((cert) => (
                    <option key={cert.id} value={cert.id}>
                      {cert.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

      
        </div>
      </div>
    </div>
  );
};

export default BasicInfoForm;