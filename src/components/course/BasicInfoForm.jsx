import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Upload, X, Clock, Award, Tag, Users, Camera, AlertCircle, CheckCircle } from "lucide-react";
import {
  setFormData,
  setImagePreview,
  setImageFile,
  nextStep,
} from "@/redux/course/courseSlice";
import { fetchCourseCategoriesAsync } from "@/redux/courseCategory/courseCategorySlice";
import { fetchCourseTagsAsync } from "@/redux/courseTag/courseTagSlice";
import { getAllTargetGroupsAsync } from "@/redux/getAllTargetGroups/getAllTargetGroups";
import { fetchCertificatesAsync } from "@/redux/certificate/certificateSlice";
import TargetGroupSelector from "@/components/targetSelect";

const BasicInfoForm = () => {
  const dispatch = useDispatch();
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showTargetGroupDropdown, setShowTargetGroupDropdown] = useState(false);
  const [targetGroupSearch, setTargetGroupSearch] = useState("");

  const { formData = {} } = useSelector((state) => state.course || {});
  const { categories = [], loading: categoriesLoading } = useSelector((state) => state.courseCategory);
  const { tags = [], loading: tagsLoading } = useSelector((state) => state.courseTag);
  const { certificates = [], loading: certificatesLoading } = useSelector((state) => state.certificate);
  const targetGroups = useSelector((state) => state.getAllTargetGroups.data?.[0]?.targetGroups) || [];

  useEffect(() => {
    dispatch(fetchCourseCategoriesAsync());
    dispatch(fetchCourseTagsAsync());
    dispatch(getAllTargetGroupsAsync());
    dispatch(fetchCertificatesAsync());
  }, [dispatch]);

  // Get selected target groups data
  const selectedTargetGroups = React.useMemo(() => {
    return targetGroups.filter(group => 
      (formData.targetGroupIds || []).includes(group.id)
    );
  }, [targetGroups, formData.targetGroupIds]);

  // Validation logic
  const validateField = (field, value) => {
    switch (field) {
      case 'name':
        if (!value?.trim()) return "Course name is required";
        if (value.length < 3) return "Course name must be at least 3 characters";
        if (value.length > 100) return "Course name must be less than 100 characters";
        return "";
      case 'description':
        if (!value?.trim()) return "Course description is required";
        if (value.length < 10) return "Description must be at least 10 characters";
        if (value.length > 1000) return "Description must be less than 1000 characters";
        return "";
      case 'categoryId':
        if (!value) return "Course category is required";
        return "";
      case 'duration':
        if (!value || value < 1) return "Duration must be at least 1 minute";
        if (value > 10080) return "Duration cannot exceed 1 week (10080 minutes)";
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

  // Target Group handlers
  const handleTargetGroupSelect = (group) => {
    const currentIds = formData.targetGroupIds || [];
    if (!currentIds.includes(group.id)) {
      handleInputChange('targetGroupIds', [...currentIds, group.id]);
    }
    setShowTargetGroupDropdown(false);
    setTargetGroupSearch("");
  };

  const handleTargetGroupRemove = (group) => {
    const currentIds = formData.targetGroupIds || [];
    handleInputChange('targetGroupIds', currentIds.filter(id => id !== group.id));
  };

  const handleNext = () => {
    const requiredFields = ['name', 'description', 'categoryId'];
    const newErrors = {};
    
    requiredFields.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });

    const newTouched = {};
    requiredFields.forEach(field => {
      newTouched[field] = true;
    });
    setTouched(prev => ({ ...prev, ...newTouched }));
    setErrors(prev => ({ ...prev, ...newErrors }));

    if (Object.keys(newErrors).length === 0) {
      dispatch(nextStep());
    }
  };

  const isFormValid = () => {
    return formData?.name?.trim() && 
           formData?.description?.trim() && 
           formData?.categoryId &&
           Object.values(errors).every(error => !error);
  };

  const getFieldClassName = (field) => {
    const baseClass = "w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#0AAC9E] transition-colors text-sm";
    
    if (touched[field] && errors[field]) {
      return `${baseClass} border-red-300 focus:border-red-500 bg-red-50`;
    }
    
    if (touched[field] && !errors[field] && formData[field]) {
      return `${baseClass} border-[#0AAC9E] focus:border-[#0AAC9E] bg-[#0AAC9E]/5`;
    }
    
    return `${baseClass} border-gray-300 focus:border-[#0AAC9E]`;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Basic Information
        </h2>
        <p className="text-gray-600">
          Set up the fundamental details of your course to get started
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-8">
          {/* Course Cover Image */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Course Cover Image
              <span className="text-gray-500 font-normal ml-1">(Optional)</span>
            </label>

            {formData?.imagePreview ? (
              <div className="relative group">
                <img
                  src={formData.imagePreview}
                  alt="Course cover"
                  className="w-full h-48 object-cover rounded-xl border-2 border-gray-200"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                  <button
                    onClick={removeImage}
                    className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 backdrop-blur-sm px-3 py-2 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">
                    {formData.imageFile?.name}
                  </span>
                </div>
              </div>
            ) : (
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
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
                  <div className="w-12 h-12 bg-[#0AAC9E]/10 rounded-full flex items-center justify-center mb-4">
                    {dragActive ? (
                      <Upload className="w-6 h-6 text-[#0AAC9E]" />
                    ) : (
                      <Camera className="w-6 h-6 text-[#0AAC9E]" />
                    )}
                  </div>
                  <p className="text-base text-gray-600 mb-2">
                    Drag and drop your course cover image here, or{" "}
                    <label className="text-[#0AAC9E] hover:text-[#0AAC9E]/80 cursor-pointer font-semibold">
                      browse files
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                    </label>
                  </p>
                  <p className="text-sm text-gray-400">
                    PNG, JPG, GIF up to 10MB (1280x720 recommended)
                  </p>
                </div>
              </div>
            )}
            {errors.image && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.image}
              </p>
            )}
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Course Name */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Course Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.name || ""}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  onBlur={() => handleBlur("name")}
                  placeholder="Enter an engaging course title"
                  className={getFieldClassName("name")}
                />
                {touched.name && !errors.name && formData.name && (
                  <CheckCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#0AAC9E]" />
                )}
              </div>
              {touched.name && errors.name && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.name}
                </p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                {formData.name?.length || 0}/100 characters
              </p>
            </div>

            {/* Course Description */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Course Description *
              </label>
              <div className="relative">
                <textarea
                  value={formData.description || ""}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  onBlur={() => handleBlur("description")}
                  placeholder="Describe what students will learn in this course"
                  rows={4}
                  className={`${getFieldClassName("description")} resize-none`}
                />
                {touched.description && !errors.description && formData.description && (
                  <CheckCircle className="absolute right-4 top-4 w-5 h-5 text-[#0AAC9E]" />
                )}
              </div>
              {touched.description && errors.description && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.description}
                </p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                {formData.description?.length || 0}/1000 characters
              </p>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Course Category *
              </label>
              <div className="relative">
                <select
                  value={formData.categoryId || ""}
                  onChange={(e) =>
                    handleInputChange("categoryId", parseInt(e.target.value) || "")
                  }
                  onBlur={() => handleBlur("categoryId")}
                  className={getFieldClassName("categoryId")}
                  disabled={categoriesLoading}
                >
                  <option value="">
                    {categoriesLoading ? "Loading categories..." : "Select a category"}
                  </option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {touched.categoryId && !errors.categoryId && formData.categoryId && (
                  <CheckCircle className="absolute right-10 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#0AAC9E]" />
                )}
              </div>
              {touched.categoryId && errors.categoryId && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.categoryId}
                </p>
              )}
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Estimated Duration (minutes)
              </label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="number"
                  value={formData.duration || ""}
                  onChange={(e) =>
                    handleInputChange("duration", parseInt(e.target.value) || "")
                  }
                  onBlur={() => handleBlur("duration")}
                  placeholder="60"
                  min="1"
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0AAC9E] focus:border-[#0AAC9E] text-sm"
                />
              </div>
              {errors.duration && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.duration}
                </p>
              )}
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Tags
                <span className="text-gray-500 font-normal ml-1">(Optional)</span>
              </label>
              <div className="relative">
                <Tag className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={formData?.tagIds?.[0] || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "tagIds",
                      e.target.value ? [parseInt(e.target.value)] : []
                    )
                  }
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0AAC9E] focus:border-[#0AAC9E] text-sm"
                  disabled={tagsLoading}
                >
                  <option value="">
                    {tagsLoading ? "Loading tags..." : "Select tags (optional)"}
                  </option>
                  {tags.map((tag) => (
                    <option key={tag.id} value={tag.id}>
                      {tag.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Certificate */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Certificate Options
              </label>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <Award className="text-[#0AAC9E] w-5 h-5 flex-shrink-0" />
                  <label className="flex items-center cursor-pointer flex-1">
                    <input
                      type="checkbox"
                      checked={formData?.verifiedCertificate || false}
                      onChange={(e) =>
                        handleInputChange("verifiedCertificate", e.target.checked)
                      }
                      className="w-4 h-4 text-[#0AAC9E] border-gray-300 rounded focus:ring-[#0AAC9E]"
                    />
                    <span className="ml-3 text-sm text-gray-700 font-medium">
                      Provide verified certificate upon completion
                    </span>
                  </label>
                </div>
                
                {formData?.verifiedCertificate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Certificate Template
                    </label>
                    <select
                      value={formData.certificateId || ""}
                      onChange={(e) =>
                        handleInputChange("certificateId", parseInt(e.target.value) || null)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0AAC9E] focus:border-[#0AAC9E] text-sm"
                      disabled={certificatesLoading}
                    >
                      <option value="">
                        {certificatesLoading ? "Loading certificates..." : "Select a certificate template"}
                      </option>
                      {certificates.map((cert) => (
                        <option key={cert.id} value={cert.id}>
                          {cert.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                <p className="text-xs text-gray-500">
                  Learners will receive a certificate when they complete this course
                </p>
              </div>
            </div>

            {/* Target Groups */}
            <div className="lg:col-span-2">
              <TargetGroupSelector
                targetGroups={targetGroups}
                searchValue={targetGroupSearch}
                selectedTargetGroups={selectedTargetGroups}
                showDropdown={showTargetGroupDropdown}
                onSearchChange={setTargetGroupSearch}
                onToggleDropdown={setShowTargetGroupDropdown}
                onSelect={handleTargetGroupSelect}
                onRemove={handleTargetGroupRemove}
              />
            </div>

            {/* Advanced Settings */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Advanced Settings
                <span className="text-gray-500 font-normal ml-1">(Optional)</span>
              </label>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">
                    Start Duration (days)
                  </label>
                  <input
                    type="number"
                    value={formData.startDuration || ""}
                    onChange={(e) =>
                      handleInputChange("startDuration", parseInt(e.target.value) || null)
                    }
                    placeholder="Optional"
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0AAC9E] focus:border-[#0AAC9E] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">
                    Deadline (days)
                  </label>
                  <input
                    type="number"
                    value={formData.deadline || ""}
                    onChange={(e) =>
                      handleInputChange("deadline", parseInt(e.target.value) || null)
                    }
                    placeholder="Optional"
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0AAC9E] focus:border-[#0AAC9E] text-sm"
                  />
                </div>

                <div className="flex items-end">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData?.autoReassign || false}
                      onChange={(e) =>
                        handleInputChange("autoReassign", e.target.checked)
                      }
                      className="w-4 h-4 text-[#0AAC9E] border-gray-300 rounded focus:ring-[#0AAC9E]"
                    />
                    <span className="text-xs text-gray-700">
                      Auto reassign on completion
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${isFormValid() ? 'bg-[#0AAC9E]' : 'bg-gray-300'}`}></div>
                <span className="text-gray-600 font-medium">
                  Step 1 of 3: Basic Information
                </span>
              </div>
              <div className="text-gray-500">
                {Object.keys(touched).length > 0 && `${Object.keys(touched).length} fields completed`}
              </div>
            </div>
            <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-[#0AAC9E] h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (Object.keys(touched).length / 6) * 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-6 flex justify-between items-center border-t border-gray-200">
          <div className="text-sm text-gray-500">
            Fill out the required fields to continue to course content
          </div>
          <button
            onClick={handleNext}
            disabled={!isFormValid()}
            className="px-6 py-3 bg-[#0AAC9E] text-white rounded-xl hover:bg-[#0AAC9E]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold shadow-sm"
          >
            Next: Course Content
          </button>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {showTargetGroupDropdown && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowTargetGroupDropdown(false)}
        />
      )}
    </div>
  );
};

export default BasicInfoForm;