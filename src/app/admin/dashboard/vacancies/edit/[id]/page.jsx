// @/app/admin/dashboard/vacancies/edit/[id]/page.jsx
"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, X, Briefcase } from "lucide-react";
import {
  fetchVacancyByIdAsync,
  updateVacancyAsync,
  fetchDepartmentsAsync,
  fetchLineManagersAsync,
  fetchTargetGroupsAsync,
  resetVacancyState,
} from "@/redux/vacancy/vacancy";
import { toast } from "sonner";

// Components
import LoadingSpinner from "@/components/loadingSpinner";

const EditVacancyPage = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { id } = useParams();

  const {
    currentVacancy,
    departments,
    lineManagers,
    targetGroups,
    loading,
    error,
    success,
  } = useSelector((state) => state.vacancy);

  // Form state
  const [formData, setFormData] = useState({
    id: "",
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

  // Form validation errors
  const [errors, setErrors] = useState({});

  // Reset success state on component mount
  useEffect(() => {
    dispatch(resetVacancyState());
  }, [dispatch]);

  // Fetch required data
  useEffect(() => {
    if (id) {
      dispatch(fetchVacancyByIdAsync(parseInt(id)));
      dispatch(fetchDepartmentsAsync());
      dispatch(fetchLineManagersAsync());
      dispatch(fetchTargetGroupsAsync());
    }
  }, [dispatch, id]);

  // Fill form with vacancy data when available
  useEffect(() => {
    if (currentVacancy) {
      // Extract min and max salary from salary range
      const salaryRange = currentVacancy.salaryRange || "";
      const [minSalary, maxSalary] = salaryRange.split(" - ");

      // Format date for the input
      const formatDateForInput = (dateString) => {
        if (!dateString) return "";

        const date = new Date(dateString);
        return date.toISOString().split("T")[0];
      };

      setFormData({
        id: currentVacancy.id,
        title: currentVacancy.title || "",
        departmentId: currentVacancy.department?.id || "",
        lineManagerId: currentVacancy.lineManager?.id || "",
        jobDescription: currentVacancy.jobDescription || "",
        jobResponsibilities: currentVacancy.jobResponsibilities || "",
        jobRequirements: currentVacancy.jobRequirements || "",
        minSalary: minSalary || "",
        maxSalary: maxSalary || "",
        lastSubmissionDate: formatDateForInput(
          currentVacancy.lastSubmissionDate
        ),
        targetGroupIds: currentVacancy.targetGroupIds || [],
      });
    }
  }, [currentVacancy]);

  // Navigate on successful update
  useEffect(() => {
    if (success) {
      toast.success("Vacancy updated successfully!");
      router.push(`/admin/dashboard/vacancies/${id}`);
    }
  }, [success, router, id]);

  // Handle toast notifications for errors
  useEffect(() => {
    if (error) {
      toast.error(error || "An error occurred");
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

  // Handle checkbox change for target groups
  const handleTargetGroupChange = (e) => {
    const { value, checked } = e.target;
    const groupId = parseInt(value);

    setFormData((prevData) => {
      if (checked) {
        return {
          ...prevData,
          targetGroupIds: [...prevData.targetGroupIds, groupId],
        };
      } else {
        return {
          ...prevData,
          targetGroupIds: prevData.targetGroupIds.filter(
            (id) => id !== groupId
          ),
        };
      }
    });
  };

  // Validate form
  const validateForm = () => {
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

    if (!formData.jobDescription.trim()) {
      newErrors.jobDescription = "Job Description is required";
    }

    if (!formData.jobResponsibilities.trim()) {
      newErrors.jobResponsibilities = "Job Responsibilities are required";
    }

    if (!formData.jobRequirements.trim()) {
      newErrors.jobRequirements = "Job Requirements are required";
    }

    if (!formData.minSalary) {
      newErrors.minSalary = "Minimum Salary is required";
    }

    if (!formData.maxSalary) {
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

      if (submissionDate <= today) {
        newErrors.lastSubmissionDate =
          "Last Submission Date must be in the future";
      }
    }

    if (formData.targetGroupIds.length === 0) {
      newErrors.targetGroupIds = "At least one Target Group must be selected";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    const salaryRange = `${formData.minSalary} - ${formData.maxSalary}`;

    const vacancyData = {
      id: parseInt(id),
      title: formData.title,
      departmentId: parseInt(formData.departmentId),
      lineManagerId: parseInt(formData.lineManagerId),
      jobDescription: formData.jobDescription,
      jobResponsibilities: formData.jobResponsibilities,
      jobRequirements: formData.jobRequirements,
      salaryRange: salaryRange,
      lastSubmissionDate: formData.lastSubmissionDate,
      targetGroupIds: formData.targetGroupIds,
    };

    dispatch(updateVacancyAsync(vacancyData));
  };

  // Cancel form submission
  const handleCancel = () => {
    router.push(`/admin/dashboard/vacancies/${id}`);
  };

  if (loading || !currentVacancy) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pt-14 px-4 sm:px-6 lg:px-8 pb-10">
      <div className="max-w-5xl mx-auto">
        {/* Header with back button */}
        <div className="mb-6">
          <Link href={`/admin/dashboard/vacancies/${id}`}>
            <button className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#0AAC9E]">
              <ArrowLeft className="w-4 h-4" />
              Back to Vacancy
            </button>
          </Link>
        </div>

        {/* Form Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Vacancy</h1>
              <p className="text-sm text-gray-500 mt-1">
                Update the details of this job vacancy
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <X className="w-5 h-5" />
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#0AAC9E] rounded-lg hover:bg-[#127D74]"
              >
                <Save className="w-5 h-5" />
                Update Vacancy
              </button>
            </div>
          </div>
        </div>

        {/* Vacancy Form */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                Basic Information
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
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
                  className={`w-full px-3 py-2 text-sm border ${
                    errors.title ? "border-red-300" : "border-gray-200"
                  } rounded-lg focus:ring-0 focus:border-[#01DBC8]`}
                  placeholder="e.g. Senior HR Specialist"
                />
                {errors.title && (
                  <p className="text-xs text-red-500 mt-1">{errors.title}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="departmentId"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="departmentId"
                    name="departmentId"
                    value={formData.departmentId}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 text-sm border ${
                      errors.departmentId ? "border-red-300" : "border-gray-200"
                    } rounded-lg focus:ring-0 focus:border-[#01DBC8]`}
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                  {errors.departmentId && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.departmentId}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="lineManagerId"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Line Manager <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="lineManagerId"
                    name="lineManagerId"
                    value={formData.lineManagerId}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 text-sm border ${
                      errors.lineManagerId
                        ? "border-red-300"
                        : "border-gray-200"
                    } rounded-lg focus:ring-0 focus:border-[#01DBC8]`}
                  >
                    <option value="">Select Line Manager</option>
                    {lineManagers.map((manager) => (
                      <option key={manager.id} value={manager.id}>
                        {manager.firstName} {manager.lastName}
                      </option>
                    ))}
                  </select>
                  {errors.lineManagerId && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.lineManagerId}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="minSalary"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Minimum Salary <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="minSalary"
                    name="minSalary"
                    value={formData.minSalary}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 text-sm border ${
                      errors.minSalary ? "border-red-300" : "border-gray-200"
                    } rounded-lg focus:ring-0 focus:border-[#01DBC8]`}
                    placeholder="e.g. 2000"
                  />
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
                  <input
                    type="number"
                    id="maxSalary"
                    name="maxSalary"
                    value={formData.maxSalary}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 text-sm border ${
                      errors.maxSalary ? "border-red-300" : "border-gray-200"
                    } rounded-lg focus:ring-0 focus:border-[#01DBC8]`}
                    placeholder="e.g. 3000"
                  />
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
                    Last Submission Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="lastSubmissionDate"
                    name="lastSubmissionDate"
                    value={formData.lastSubmissionDate}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 text-sm border ${
                      errors.lastSubmissionDate
                        ? "border-red-300"
                        : "border-gray-200"
                    } rounded-lg focus:ring-0 focus:border-[#01DBC8]`}
                  />
                  {errors.lastSubmissionDate && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.lastSubmissionDate}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                Job Details
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label
                  htmlFor="jobDescription"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Job Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="jobDescription"
                  name="jobDescription"
                  value={formData.jobDescription}
                  onChange={handleChange}
                  rows={4}
                  className={`w-full px-3 py-2 text-sm border ${
                    errors.jobDescription ? "border-red-300" : "border-gray-200"
                  } rounded-lg focus:ring-0 focus:border-[#01DBC8]`}
                  placeholder="Provide a detailed description of the job..."
                ></textarea>
                {errors.jobDescription && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.jobDescription}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="jobResponsibilities"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Job Responsibilities <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="jobResponsibilities"
                  name="jobResponsibilities"
                  value={formData.jobResponsibilities}
                  onChange={handleChange}
                  rows={4}
                  className={`w-full px-3 py-2 text-sm border ${
                    errors.jobResponsibilities
                      ? "border-red-300"
                      : "border-gray-200"
                  } rounded-lg focus:ring-0 focus:border-[#01DBC8]`}
                  placeholder="List the main responsibilities of the position..."
                ></textarea>
                {errors.jobResponsibilities && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.jobResponsibilities}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="jobRequirements"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Job Requirements <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="jobRequirements"
                  name="jobRequirements"
                  value={formData.jobRequirements}
                  onChange={handleChange}
                  rows={4}
                  className={`w-full px-3 py-2 text-sm border ${
                    errors.jobRequirements
                      ? "border-red-300"
                      : "border-gray-200"
                  } rounded-lg focus:ring-0 focus:border-[#01DBC8]`}
                  placeholder="Specify skills, qualifications, and experience required..."
                ></textarea>
                {errors.jobRequirements && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.jobRequirements}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                Target Groups
              </h2>
            </div>

            <div className="p-6">
              <p className="text-sm text-gray-500 mb-4">
                Select the employee groups eligible to apply for this vacancy:
              </p>

              {errors.targetGroupIds && (
                <p className="text-xs text-red-500 mb-3">
                  {errors.targetGroupIds}
                </p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {targetGroups.map((group) => (
                  <div key={group.id} className="flex items-start">
                    <input
                      type="checkbox"
                      id={`targetGroup-${group.id}`}
                      name="targetGroupIds"
                      value={group.id}
                      checked={formData.targetGroupIds.includes(group.id)}
                      onChange={handleTargetGroupChange}
                      className="mt-1 mr-2"
                    />
                    <label
                      htmlFor={`targetGroup-${group.id}`}
                      className="text-sm text-gray-700"
                    >
                      {group.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-8">
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <X className="w-5 h-5" />
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#0AAC9E] rounded-lg hover:bg-[#127D74]"
            >
              {loading ? (
                <span>Processing...</span>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Update Vacancy
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditVacancyPage;
