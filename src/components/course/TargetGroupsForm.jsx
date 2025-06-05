import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Users, Search, Check, X, ChevronRight, Award, Calendar, Clock, Settings, Target, CheckCircle } from "lucide-react";
import {
  setFormData,
  prevStep,
  createCourseAsync,
} from "@/redux/course/courseSlice";
import { getAllTargetGroupsAsync } from "@/redux/getAllTargetGroups/getAllTargetGroups";
import { fetchCertificatesAsync } from "@/redux/certificate/certificateSlice";
import { toast } from "sonner";

const TargetGroupsStep = () => {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { formData, successionRates } = useSelector((state) => state.course);
  const targetGroups =
    useSelector((state) => state.getAllTargetGroups.data?.[0]?.targetGroups) ||
    [];
  const { certificates = [] } = useSelector((state) => state.certificate || {});

  useEffect(() => {
    dispatch(getAllTargetGroupsAsync());
    dispatch(fetchCertificatesAsync());

    if (formData.targetGroupIds) {
      setSelectedGroups(formData.targetGroupIds);
    }
  }, [dispatch, formData.targetGroupIds]);

  const filteredGroups = targetGroups.filter((group) =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGroupToggle = (groupId) => {
    setSelectedGroups((prev) => {
      const newSelection = prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId];

      dispatch(setFormData({ targetGroupIds: newSelection }));
      return newSelection;
    });
  };

  const handleSelectAll = () => {
    const allGroupIds = filteredGroups.map((group) => group.id);
    setSelectedGroups(allGroupIds);
    dispatch(setFormData({ targetGroupIds: allGroupIds }));
  };

  const handleDeselectAll = () => {
    setSelectedGroups([]);
    dispatch(setFormData({ targetGroupIds: [] }));
  };

  const getSelectedGroupsData = () => {
    return targetGroups.filter((group) => selectedGroups.includes(group.id));
  };

  const getTotalUsers = () => {
    return getSelectedGroupsData().reduce(
      (total, group) => total + (group.filterGroupCount || 0),
      0
    );
  };

  const handleBack = () => {
    dispatch(prevStep());
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const courseData = {
        name: formData.name,
        description: formData.description,
        categoryId: formData.categoryId,
        duration: formData.duration || 60,
        verifiedCertificate: formData.verifiedCertificate || false,
        imageFile: formData.imageFile || null,
        targetGroupIds: selectedGroups,
        certificateId: formData.certificateId || null,
        tagIds: formData.tagIds || [],
        startDuration: formData.startDuration || null,
        deadline: formData.deadline || null,
        autoReassign: formData.autoReassign || false,
      };

      await dispatch(createCourseAsync(courseData)).unwrap();
      toast.success("Course created successfully!");
      
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to create course: " + (error.message || "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-900 mb-1">
          Target Groups & Publishing
        </h2>
        <p className="text-sm text-gray-600">
          Select user groups and configure course settings before publishing
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Target Groups Selection */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            {/* Header */}
            <div className="p-3 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center">
                  <Target className="w-3 h-3 mr-1 text-[#0AAC9E]" />
                  Available Target Groups
                </h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleSelectAll}
                    className="text-xs text-[#0AAC9E] hover:text-[#0AAC9E]/80"
                  >
                    Select All
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={handleDeselectAll}
                    className="text-xs text-gray-600 hover:text-gray-700"
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search target groups..."
                  className="w-full pl-7 pr-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0AAC9E] focus:border-[#0AAC9E] text-xs"
                />
              </div>
            </div>

            {/* Groups List */}
            <div className="p-3 max-h-64 overflow-y-auto">
              {filteredGroups.length === 0 ? (
                <div className="text-center py-4">
                  <Users className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">No target groups found</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredGroups.map((group) => {
                    const isSelected = selectedGroups.includes(group.id);

                    return (
                      <div
                        key={group.id}
                        onClick={() => handleGroupToggle(group.id)}
                        className={`flex items-center justify-between p-2 border rounded-lg cursor-pointer transition-all ${
                          isSelected
                            ? "border-[#0AAC9E] bg-[#0AAC9E]/5"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <div
                            className={`w-3 h-3 rounded border flex items-center justify-center ${
                              isSelected
                                ? "border-[#0AAC9E] bg-[#0AAC9E]"
                                : "border-gray-300"
                            }`}
                          >
                            {isSelected && (
                              <Check className="w-2 h-2 text-white" />
                            )}
                          </div>

                          <div>
                            <h4 className="text-xs font-medium text-gray-900">
                              {group.name}
                            </h4>
                            <p className="text-xs text-gray-500">
                              {group.filterGroupCount || 0} users
                            </p>
                          </div>
                        </div>

                        <ChevronRight className="w-3 h-3 text-gray-400" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary & Settings */}
        <div className="space-y-3">
          {/* Selection Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
            <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
              <Users className="w-3 h-3 mr-1 text-[#0AAC9E]" />
              Assignment Summary
            </h3>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-[#0AAC9E]/5 rounded-lg">
                <span className="text-xs font-medium text-[#0AAC9E]">
                  Selected Groups
                </span>
                <span className="text-sm font-bold text-[#0AAC9E]">
                  {selectedGroups.length}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                <span className="text-xs font-medium text-blue-700">
                  Total Users
                </span>
                <span className="text-sm font-bold text-blue-600">
                  {getTotalUsers()}
                </span>
              </div>
            </div>

            {/* Selected Groups List */}
            {selectedGroups.length > 0 && (
              <div className="mt-3">
                <h4 className="text-xs font-medium text-gray-700 mb-1">
                  Selected Groups:
                </h4>
                <div className="space-y-0.5 max-h-20 overflow-y-auto">
                  {getSelectedGroupsData().map((group) => (
                    <div
                      key={group.id}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="text-gray-600">{group.name}</span>
                      <span className="text-gray-500">
                        {group.filterGroupCount || 0}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Certificate Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
            <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
              <Award className="w-3 h-3 mr-1 text-[#0AAC9E]" />
              Certificate Settings
            </h3>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="certificate-checkbox"
                  checked={formData.verifiedCertificate || false}
                  onChange={(e) =>
                    dispatch(
                      setFormData({ verifiedCertificate: e.target.checked })
                    )
                  }
                  className="w-3 h-3 text-[#0AAC9E] border-gray-300 rounded focus:ring-[#0AAC9E]"
                />
                <label 
                  htmlFor="certificate-checkbox"
                  className="text-xs text-gray-700 cursor-pointer"
                >
                  Issue completion certificate
                </label>
              </div>

              {formData.verifiedCertificate && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Certificate Template
                  </label>
                  <select
                    value={formData.certificateId || ""}
                    onChange={(e) =>
                      dispatch(
                        setFormData({
                          certificateId: parseInt(e.target.value) || null,
                        })
                      )
                    }
                    className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0AAC9E] focus:border-[#0AAC9E] text-xs"
                  >
                    <option value="">Select template</option>
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

          {/* Advanced Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
            <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
              <Settings className="w-3 h-3 mr-1 text-[#0AAC9E]" />
              Advanced Settings
            </h3>

            <div className="space-y-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Start Duration (days)
                </label>
                <div className="relative">
                  <Calendar className="absolute left-1.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                  <input
                    type="number"
                    value={formData.startDuration || ""}
                    onChange={(e) =>
                      dispatch(
                        setFormData({
                          startDuration: parseInt(e.target.value) || null,
                        })
                      )
                    }
                    placeholder="Optional"
                    min="1"
                    className="w-full pl-6 pr-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0AAC9E] focus:border-[#0AAC9E] text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Deadline (days)
                </label>
                <div className="relative">
                  <Clock className="absolute left-1.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                  <input
                    type="number"
                    value={formData.deadline || ""}
                    onChange={(e) =>
                      dispatch(
                        setFormData({
                          deadline: parseInt(e.target.value) || null,
                        })
                      )
                    }
                    placeholder="Optional"
                    min="1"
                    className="w-full pl-6 pr-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0AAC9E] focus:border-[#0AAC9E] text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.autoReassign || false}
                    onChange={(e) =>
                      dispatch(setFormData({ autoReassign: e.target.checked }))
                    }
                    className="w-3 h-3 text-[#0AAC9E] border-gray-300 rounded focus:ring-[#0AAC9E]"
                  />
                  <span className="text-xs text-gray-700">
                    Auto reassign on completion
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Course Summary */}
          <div className="bg-[#0AAC9E]/5 rounded-xl border border-[#0AAC9E]/20 p-3">
            <h3 className="text-sm font-semibold text-[#0AAC9E] mb-2">
              Course Summary
            </h3>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Course Name:</span>
                <span className="font-medium text-gray-900">{formData.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium text-gray-900">{formData.duration || 60}min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Certificate:</span>
                <span className="font-medium text-gray-900">
                  {formData.verifiedCertificate ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Target Groups:</span>
                <span className="font-medium text-gray-900">{selectedGroups.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
        <button
          onClick={handleBack}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
        >
          Back: Course Content
        </button>

        <div className="flex items-center space-x-3">
          <div className="text-xs text-gray-600">
            {selectedGroups.length > 0 ? (
              <span>
                Course will be assigned to <strong>{getTotalUsers()}</strong>{" "}
                users
              </span>
            ) : (
              <span>No groups selected - course will be private</span>
            )}
          </div>

          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="px-4 py-2 bg-[#0AAC9E] text-white rounded-lg hover:bg-[#0AAC9E]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Creating...</span>
              </div>
            ) : (
              "Create Course"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TargetGroupsStep;