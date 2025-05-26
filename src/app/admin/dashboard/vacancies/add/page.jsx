"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  X,
  Briefcase,
  Calendar,
  DollarSign,
  Users,
  FileText,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Info,
  Lightbulb,
} from "lucide-react";
import {
  createVacancyAsync,
  fetchDepartmentsAsync,
  fetchLineManagersAsync,
  fetchTargetGroupsAsync,
  resetVacancyState,
} from "@/redux/vacancy/vacancy";
import { toast } from "sonner";

// Components
import LoadingSpinner from "@/components/loadingSpinner";
import SearchableDropdown from "@/components/vacancy/SearchableDropdown";
import TargetGroupSelector from "@/components/targetSelect";
import { getUserId } from "@/authtoken/auth.js";

const AddVacancyPage = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const { departments, lineManagers, targetGroups, loading, error, success } =
    useSelector((state) => state.vacancy);

  const userId = getUserId();

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    departmentId: "",
    lineManagerId: "",
    jobDescription: "",
    jobResponsibilities: "",
    jobRequirements: "",
    minSalary: "",
    maxSalary: "",
    lastSubmissionDate: "",
    targetGroupIds: [],
  });

  // Target group selection state
  const [selectedTargetGroups, setSelectedTargetGroups] = useState([]);
  const [targetGroupSearch, setTargetGroupSearch] = useState("");
  const [showTargetGroupDropdown, setShowTargetGroupDropdown] = useState(false);

  // Form validation errors
  const [errors, setErrors] = useState({});

  // Form steps
  const [activeStep, setActiveStep] = useState(1);
  const totalSteps = 3;

  // Reset success state on component mount
  useEffect(() => {
    dispatch(resetVacancyState());
  }, [dispatch]);

  // Fetch required data for dropdowns
  useEffect(() => {
    dispatch(fetchDepartmentsAsync());
    dispatch(fetchLineManagersAsync());
    dispatch(fetchTargetGroupsAsync());
  }, [dispatch]);

  // Update selected target groups when targetGroups is loaded
  useEffect(() => {
    if (targetGroups && targetGroups.length > 0) {
      const selected = formData.targetGroupIds
        .map((id) => targetGroups.find((group) => group.id === id))
        .filter(Boolean);

      setSelectedTargetGroups(selected);
    }
  }, [targetGroups, formData.targetGroupIds]);

  // Navigate on successful creation
  useEffect(() => {
    if (success) {
      router.push("/admin/dashboard/vacancies");
    }
  }, [success, router]);

  // Handle toast notifications for errors
  useEffect(() => {
    if (error) {
      // Only show toast if not already shown in handleSubmit
      if (!error.includes("already shown")) {
        toast.error(error || "An error occurred");
      }
    }
  }, [error]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    // Clear error when field is changed
    if (errors[name]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: "",
      }));
    }
  };

  // Handle dropdown change
  const handleDropdownChange = (name, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    // Clear error when field is changed
    if (errors[name]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: "",
      }));
    }
  };

  // Target group handlers
  const handleTargetGroupSelect = (group) => {
    if (!formData.targetGroupIds.includes(group.id)) {
      const newIds = [...formData.targetGroupIds, group.id];
      setFormData((prev) => ({
        ...prev,
        targetGroupIds: newIds,
      }));
      setSelectedTargetGroups([...selectedTargetGroups, group]);

      // Clear error if it exists
      if (errors.targetGroupIds) {
        setErrors({ ...errors, targetGroupIds: "" });
      }
    } else {
      // Remove from selection if already selected
      handleTargetGroupRemove(group);
    }
  };

  const handleTargetGroupRemove = (group) => {
    const newIds = formData.targetGroupIds.filter((id) => id !== group.id);
    setFormData((prev) => ({
      ...prev,
      targetGroupIds: newIds,
    }));
    setSelectedTargetGroups(
      selectedTargetGroups.filter((item) => item.id !== group.id)
    );
  };

  // Form validation by step
  const validateStepOne = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.departmentId) {
      newErrors.departmentId = "Department is required";
    }

    if (!formData.lineManagerId) {
      newErrors.lineManagerId = "Line Manager is required";
    }

    if (!formData.minSalary && formData.minSalary !== "0") {
      newErrors.minSalary = "Minimum Salary is required";
    }

    if (!formData.maxSalary && formData.maxSalary !== "0") {
      newErrors.maxSalary = "Maximum Salary is required";
    } else if (
      parseFloat(formData.maxSalary) <= parseFloat(formData.minSalary)
    ) {
      newErrors.maxSalary =
        "Maximum Salary must be greater than Minimum Salary";
    }

    if (!formData.lastSubmissionDate) {
      newErrors.lastSubmissionDate = "Last Submission Date is required";
    } else {
      const submissionDate = new Date(formData.lastSubmissionDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time part for comparison

      if (submissionDate <= today) {
        newErrors.lastSubmissionDate =
          "Last Submission Date must be in the future";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStepTwo = () => {
    const newErrors = {};

    if (formData.targetGroupIds.length === 0) {
      newErrors.targetGroupIds = "At least one Target Group must be selected";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStepThree = () => {
    const newErrors = {};

    if (!formData.jobDescription.trim()) {
      newErrors.jobDescription = "Job Description is required";
    }

    if (!formData.jobResponsibilities.trim()) {
      newErrors.jobResponsibilities = "Job Responsibilities are required";
    }

    if (!formData.jobRequirements.trim()) {
      newErrors.jobRequirements = "Job Requirements are required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle next step
  const handleNextStep = () => {
    let isValid = false;

    switch (activeStep) {
      case 1:
        isValid = validateStepOne();
        break;
      case 2:
        isValid = validateStepTwo();
        break;
      case 3:
        isValid = validateStepThree();
        break;
      default:
        isValid = false;
    }

    if (isValid) {
      setActiveStep((prev) => prev + 1);
      window.scrollTo(0, 0);
    } else {
      toast.error("Please fix the errors before proceeding");
    }
  };

  // Handle previous step
  const handlePrevStep = () => {
    setActiveStep((prev) => prev - 1);
    window.scrollTo(0, 0);
  };

  // Validate form
  const validateForm = () => {
    const basicInfoValid = validateStepOne();
    const targetGroupsValid = validateStepTwo();
    const jobDetailsValid = validateStepThree();

    return basicInfoValid && targetGroupsValid && jobDetailsValid;
  };

  // Handle form submission with improved error handling
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    // Show loading state
    toast.loading("Creating vacancy...", { id: "vacancy-create" });

    try {
      // Format data according to API specification
      const vacancyData = {
        userId: parseFloat(userId) || 0, // Include userId as per API spec
        title: formData.title,
        departmentId: parseInt(formData.departmentId),
        lineManagerId: parseInt(formData.lineManagerId),
        jobDescription: formData.jobDescription,
        jobResponsibilities: formData.jobResponsibilities,
        jobRequirements: formData.jobRequirements,
        minSalary: parseFloat(formData.minSalary),
        maxSalary: parseFloat(formData.maxSalary),
        lastSubmissionDate: formData.lastSubmissionDate,
        targetGroupIds: formData.targetGroupIds.map((id) => parseInt(id)),
      };

      // Log the data we're about to send
      console.log("Submitting vacancy data:", JSON.stringify(vacancyData));

      // Dispatch the action and capture the result
      const resultAction = await dispatch(createVacancyAsync(vacancyData));

      // Check if the action was fulfilled or rejected
      if (createVacancyAsync.fulfilled.match(resultAction)) {
        // Success case
        toast.success("Vacancy created successfully!", {
          id: "vacancy-create",
        });
        router.push("/admin/dashboard/vacancies");
      } else if (createVacancyAsync.rejected.match(resultAction)) {
        // Error case - display the error message
        const errorMessage = resultAction.payload || "Failed to create vacancy";
        toast.error(`Error: ${errorMessage}`, { id: "vacancy-create" });
      }
    } catch (error) {
      // Catch any unexpected errors
      console.error("Unexpected error during vacancy creation:", error);
      toast.error("An unexpected error occurred", { id: "vacancy-create" });
    }
  };

  // Cancel form submission
  const handleCancel = () => {
    router.push("/admin/dashboard/vacancies");
  };

  if (loading && !departments.length && !lineManagers.length) {
    return <LoadingSpinner />;
  }

  // Progress bar calculation
  const progressPercentage = ((activeStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="min-h-screen bg-gray-50/50 pt-14">
      <div>
        {/* Header with back button */}
        <div className="mb-6">
          <Link href="/admin/dashboard/vacancies">
            <button className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#0AAC9E] transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Vacancies
            </button>
          </Link>
        </div>

        {/* Form Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Add New Vacancy
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Fill in the details to create a new internal job vacancy
              </p>
            </div>

            <div className="flex items-center gap-2 sm:ml-auto">
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <X className="w-5 h-5" />
                Cancel
              </button>

              {activeStep === totalSteps ? (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#0AAC9E] rounded-lg hover:bg-[#127D74] transition-colors"
                >
                  {loading ? (
                    <span>Processing...</span>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save Vacancy
                    </>
                  )}
                </button>
              ) : null}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-8">
            <div className="relative">
              <div className="w-full h-2 bg-gray-200 rounded-full">
                <div
                  className="h-2 bg-[#0AAC9E] rounded-full transition-all duration-300 ease-in-out"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>

              <div className="flex justify-between mt-2">
                <div
                  className={`flex flex-col items-center ${
                    activeStep >= 1 ? "text-[#0AAC9E]" : "text-gray-400"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activeStep >= 1
                        ? "bg-[#0AAC9E] text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    <Briefcase size={16} />
                  </div>
                  <span className="text-xs mt-1 font-medium">Basic Info</span>
                </div>

                <div
                  className={`flex flex-col items-center ${
                    activeStep >= 2 ? "text-[#0AAC9E]" : "text-gray-400"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activeStep >= 2
                        ? "bg-[#0AAC9E] text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    <Users size={16} />
                  </div>
                  <span className="text-xs mt-1 font-medium">
                    Target Groups
                  </span>
                </div>

                <div
                  className={`flex flex-col items-center ${
                    activeStep >= 3 ? "text-[#0AAC9E]" : "text-gray-400"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activeStep >= 3
                        ? "bg-[#0AAC9E] text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    <FileText size={16} />
                  </div>
                  <span className="text-xs mt-1 font-medium">Job Details</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={(e) => e.preventDefault()}>
          {/* Step 1 - Basic Information */}
          {activeStep === 1 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center">
                <Briefcase className="w-5 h-5 text-[#0AAC9E] mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Basic Information
                </h2>
              </div>

              <div className="p-6 space-y-6">
                <div className="relative">
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Vacancy Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={`w-full px-3 py-2.5 text-sm border ${
                      errors.title ? "border-red-300" : "border-gray-200"
                    } rounded-lg focus:ring-1 focus:ring-[#01DBC8]/20 focus:border-[#01DBC8] focus:outline-none transition-colors`}
                    placeholder="e.g. Senior HR Specialist"
                  />
                  {errors.title && (
                    <p className="text-xs text-red-500 mt-1">{errors.title}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SearchableDropdown
                    options={departments}
                    value={formData.departmentId}
                    onChange={(value) =>
                      handleDropdownChange("departmentId", value)
                    }
                    placeholder="Select Department"
                    label="Department"
                    error={errors.departmentId}
                    required={true}
                  />

                  <SearchableDropdown
                    options={lineManagers}
                    value={formData.lineManagerId}
                    onChange={(value) =>
                      handleDropdownChange("lineManagerId", value)
                    }
                    placeholder="Select Line Manager"
                    label="Line Manager"
                    displayKey="firstName"
                    valueKey="id"
                    error={errors.lineManagerId}
                    required={true}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label
                      htmlFor="minSalary"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Minimum Salary <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="number"
                        id="minSalary"
                        name="minSalary"
                        value={formData.minSalary}
                        onChange={handleChange}
                        className={`w-full pl-9 pr-3 py-2.5 text-sm border ${
                          errors.minSalary
                            ? "border-red-300"
                            : "border-gray-200"
                        } rounded-lg focus:ring-1 focus:ring-[#01DBC8]/20 focus:border-[#01DBC8] focus:outline-none transition-colors`}
                        placeholder="e.g. 2000"
                      />
                    </div>
                    {errors.minSalary && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.minSalary}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="maxSalary"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Maximum Salary <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="number"
                        id="maxSalary"
                        name="maxSalary"
                        value={formData.maxSalary}
                        onChange={handleChange}
                        className={`w-full pl-9 pr-3 py-2.5 text-sm border ${
                          errors.maxSalary
                            ? "border-red-300"
                            : "border-gray-200"
                        } rounded-lg focus:ring-1 focus:ring-[#01DBC8]/20 focus:border-[#01DBC8] focus:outline-none transition-colors`}
                        placeholder="e.g. 3000"
                      />
                    </div>
                    {errors.maxSalary && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.maxSalary}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="lastSubmissionDate"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Last Submission Date{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="date"
                        id="lastSubmissionDate"
                        name="lastSubmissionDate"
                        value={formData.lastSubmissionDate}
                        onChange={handleChange}
                        className={`w-full pl-9 pr-3 py-2.5 text-sm border ${
                          errors.lastSubmissionDate
                            ? "border-red-300"
                            : "border-gray-200"
                        } rounded-lg focus:ring-1 focus:ring-[#01DBC8]/20 focus:border-[#01DBC8] focus:outline-none transition-colors`}
                      />
                    </div>
                    {errors.lastSubmissionDate && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.lastSubmissionDate}
                      </p>
                    )}
                  </div>
                </div>

                {/* Tip Section */}
                <div className="bg-blue-50 rounded-lg p-4 flex gap-3 mt-4">
                  <div className="flex-shrink-0">
                    <Lightbulb className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-blue-800">
                      Quick tip
                    </h4>
                    <p className="text-xs text-blue-700 mt-1">
                      Be specific and accurate with the basic information. A
                      clear title and appropriate salary range will attract the
                      right candidates.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2 - Target Groups */}
          {activeStep === 2 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center">
                <Users className="w-5 h-5 text-[#0AAC9E] mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Target Groups
                </h2>
              </div>

              <div className="p-6">
                <div className="bg-[#f0fbfa] rounded-lg p-4 mb-6">
                  <p className="text-sm text-[#0AAC9E]">
                    Select the employee groups eligible to apply for this
                    vacancy. You can select multiple groups.
                  </p>
                </div>

                <TargetGroupSelector
                  targetGroups={targetGroups || []}
                  searchValue={targetGroupSearch}
                  selectedTargetGroups={selectedTargetGroups}
                  showDropdown={showTargetGroupDropdown}
                  onSearchChange={setTargetGroupSearch}
                  onToggleDropdown={setShowTargetGroupDropdown}
                  onSelect={handleTargetGroupSelect}
                  onRemove={handleTargetGroupRemove}
                />

                {errors.targetGroupIds && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.targetGroupIds}
                  </p>
                )}

                {/* Selected Count Display */}
                {selectedTargetGroups.length > 0 && (
                  <div className="mt-6 flex items-center gap-2">
                    <CheckCircle className="text-[#0AAC9E] w-5 h-5" />
                    <span className="text-sm text-gray-700">
                      {selectedTargetGroups.length}{" "}
                      {selectedTargetGroups.length === 1 ? "group" : "groups"}{" "}
                      selected
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3 - Job Details */}
          {activeStep === 3 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center">
                <FileText className="w-5 h-5 text-[#0AAC9E] mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Job Details
                </h2>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label
                      htmlFor="jobDescription"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Job Description <span className="text-red-500">*</span>
                    </label>
                    <span className="text-xs text-gray-500">
                      {formData.jobDescription.length} characters
                    </span>
                  </div>
                  <textarea
                    id="jobDescription"
                    name="jobDescription"
                    value={formData.jobDescription}
                    onChange={handleChange}
                    rows={5}
                    className={`w-full px-3 py-2.5 text-sm border ${
                      errors.jobDescription
                        ? "border-red-300"
                        : "border-gray-200"
                    } rounded-lg focus:ring-1 focus:ring-[#01DBC8]/20 focus:border-[#01DBC8] focus:outline-none transition-colors`}
                    placeholder="Provide a detailed description of the job position, including the purpose and main objectives..."
                  ></textarea>
                  {errors.jobDescription && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.jobDescription}
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label
                      htmlFor="jobResponsibilities"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Job Responsibilities{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <span className="text-xs text-gray-500">
                      {formData.jobResponsibilities.length} characters
                    </span>
                  </div>
                  <textarea
                    id="jobResponsibilities"
                    name="jobResponsibilities"
                    value={formData.jobResponsibilities}
                    onChange={handleChange}
                    rows={5}
                    className={`w-full px-3 py-2.5 text-sm border ${
                      errors.jobResponsibilities
                        ? "border-red-300"
                        : "border-gray-200"
                    } rounded-lg focus:ring-1 focus:ring-[#01DBC8]/20 focus:border-[#01DBC8] focus:outline-none transition-colors`}
                    placeholder="List the main responsibilities and duties of this position..."
                  ></textarea>
                  {errors.jobResponsibilities && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.jobResponsibilities}
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label
                      htmlFor="jobRequirements"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Job Requirements <span className="text-red-500">*</span>
                    </label>
                    <span className="text-xs text-gray-500">
                      {formData.jobRequirements.length} characters
                    </span>
                  </div>
                  <textarea
                    id="jobRequirements"
                    name="jobRequirements"
                    value={formData.jobRequirements}
                    onChange={handleChange}
                    rows={5}
                    className={`w-full px-3 py-2.5 text-sm border ${
                      errors.jobRequirements
                        ? "border-red-300"
                        : "border-gray-200"
                    } rounded-lg focus:ring-1 focus:ring-[#01DBC8]/20 focus:border-[#01DBC8] focus:outline-none transition-colors`}
                    placeholder="Specify skills, qualifications, experience, and other requirements for this position..."
                  ></textarea>
                  {errors.jobRequirements && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.jobRequirements}
                    </p>
                  )}
                </div>

                {/* Tips for Writing Job Details */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                    <Info className="w-4 h-4 text-gray-600 mr-1" />
                    Tips for Writing Effective Job Details
                  </h4>
                  <ul className="text-xs text-gray-600 space-y-1.5">
                    <li className="flex items-start">
                      <div className="w-4 h-4 rounded-full bg-[#0AAC9E] text-white flex items-center justify-center text-[10px] font-bold mt-0.5 mr-2">
                        1
                      </div>
                      <span>
                        Be specific about the day-to-day responsibilities
                      </span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-4 h-4 rounded-full bg-[#0AAC9E] text-white flex items-center justify-center text-[10px] font-bold mt-0.5 mr-2">
                        2
                      </div>
                      <span>
                        Clearly differentiate between required and preferred
                        qualifications
                      </span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-4 h-4 rounded-full bg-[#0AAC9E] text-white flex items-center justify-center text-[10px] font-bold mt-0.5 mr-2">
                        3
                      </div>
                      <span>
                        Use bullet points when listing responsibilities and
                        requirements
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            {activeStep > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                Previous Step
              </button>
            ) : (
              <div></div> // Empty div to maintain spacing with justify-between
            )}

            {activeStep < totalSteps && (
              <button
                type="button"
                onClick={handleNextStep}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#0AAC9E] rounded-lg hover:bg-[#127D74] transition-colors"
              >
                Next Step
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Review Summary */}
          {activeStep === totalSteps && (
            <div className="bg-blue-50 rounded-lg p-4 mt-6">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 bg-blue-100 rounded-full p-1">
                  <Info className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-blue-800">
                    Final Review
                  </h3>
                  <p className="text-xs text-blue-700 mt-1">
                    Please review all the information before submitting. Once
                    submitted, the vacancy will be visible to eligible employees
                    in the selected target groups.
                  </p>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AddVacancyPage;
