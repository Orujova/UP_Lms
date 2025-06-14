// src/components/course/CourseLayout.jsx - Clean, modern layout
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  AlertCircle, 
  CheckCircle,
  Clock,
  Users,
  BookOpen,
  Target,
  Layers,
  Settings,
  Share2,
  Zap
} from "lucide-react";
import {
  createCourseAsync,
  setCurrentStep,
  clearError,
  resetFormData,
} from "@/redux/course/courseSlice";
import { toast } from "sonner";

// Step Progress Component
const StepProgress = () => {
  const dispatch = useDispatch();
  const { currentStep = 1, formData = {}, sections = [] } = useSelector(
    (state) => state.course || {}
  );

  const steps = [
    {
      id: 1,
      title: "Basic Info",
      description: "Course details",
      icon: BookOpen,
      completed: formData?.name?.trim() && formData?.description?.trim() && formData?.categoryId,
      canNavigate: true,
    },
    {
      id: 2,
      title: "Content",
      description: "Sections & materials", 
      icon: Layers,
      completed: sections.length > 0,
      canNavigate: formData?.name?.trim() && formData?.description?.trim() && formData?.categoryId,
    },
    {
      id: 3,
      title: "Publish",
      description: "Settings & publish",
      icon: Target,
      completed: false,
      canNavigate: formData?.name?.trim() && formData?.description?.trim() && formData?.categoryId && sections.length > 0,
    },
  ];

  const handleStepClick = (stepId) => {
    const step = steps.find((s) => s.id === stepId);
    if (step?.canNavigate) {
      dispatch(setCurrentStep(stepId));
    }
  };

  const getStepStatus = (step) => {
    if (step.completed) return "completed";
    if (currentStep === step.id) return "current";
    if (step.canNavigate) return "available";
    return "disabled";
  };

  const getStepStyles = (status) => {
    switch (status) {
      case "completed":
        return {
          container: "cursor-pointer",
          circle: "bg-[#0AAC9E] text-white border-[#0AAC9E] shadow-sm",
          title: "text-[#0AAC9E] font-semibold",
          description: "text-[#0AAC9E]/70",
          connector: "bg-[#0AAC9E]",
        };
      case "current":
        return {
          container: "cursor-pointer",
          circle: "bg-white text-[#0AAC9E] border-[#0AAC9E] border-2 ring-4 ring-[#0AAC9E]/10 shadow-sm",
          title: "text-[#0AAC9E] font-bold",
          description: "text-[#0AAC9E]/80",
          connector: "bg-gray-200",
        };
      case "available":
        return {
          container: "cursor-pointer hover:bg-gray-50 rounded-lg transition-colors p-2 -m-2",
          circle: "bg-white text-gray-400 border-gray-300 hover:border-[#0AAC9E] hover:text-[#0AAC9E] shadow-sm",
          title: "text-gray-600 hover:text-[#0AAC9E]",
          description: "text-gray-400 hover:text-[#0AAC9E]/70",
          connector: "bg-gray-200",
        };
      default:
        return {
          container: "cursor-not-allowed opacity-50",
          circle: "bg-gray-100 text-gray-300 border-gray-200",
          title: "text-gray-400",
          description: "text-gray-300",
          connector: "bg-gray-200",
        };
    }
  };

  return (
    <div className="flex items-center justify-center py-4 bg-white border-b border-gray-100">
      <div className="flex items-center space-x-6">
        {steps.map((step, index) => {
          const status = getStepStatus(step);
          const styles = getStepStyles(status);
          const Icon = step.icon;

          return (
            <div key={step.id} className="flex items-center">
              <div
                onClick={() => handleStepClick(step.id)}
                className={`flex items-center space-x-3 transition-all ${styles.container}`}
              >
                <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${styles.circle}`}>
                  {status === "completed" ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : status === "current" ? (
                    <Icon className="w-3.5 h-3.5" />
                  ) : (
                    <span className="text-xs font-bold">{step.id}</span>
                  )}
                </div>

                <div className="text-left">
                  <div className={`text-sm font-medium transition-all ${styles.title}`}>
                    {step.title}
                  </div>
                  <div className={`text-xs transition-all ${styles.description}`}>
                    {step.description}
                  </div>
                </div>
              </div>

              {index < steps.length - 1 && (
                <div className={`w-8 h-0.5 mx-3 transition-all ${styles.connector}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Main Layout Component
const CourseCreateLayout = ({ children }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    currentStep = 1,
    formData = {},
    sections = [],
    loading = false,
    error = null,
  } = useSelector((state) => state.course || {});

  const handleBack = () => {
    if (currentStep === 1) {
      router.push("/admin/dashboard/courses");
    } else {
      dispatch(setCurrentStep(currentStep - 1));
    }
  };

  const handleSave = async () => {
    if (!canSave()) return;

    setIsSubmitting(true);
    try {
      const courseData = {
        name: formData.name,
        description: formData.description,
        categoryId: formData.categoryId,
        duration: formData.duration || 60,
        verifiedCertificate: formData.verifiedCertificate || false,
        imageFile: formData.imageFile || null,
        targetGroupIds: formData.targetGroupIds || [],
        certificateId: formData.certificateId || null,
        tagIds: formData.tagIds || [],
        startDuration: formData.startDuration || null,
        deadline: formData.deadline || null,
        autoReassign: formData.autoReassign || false,
      };

      await dispatch(createCourseAsync(courseData)).unwrap();
      
      toast.success("Course created successfully!");
      router.push("/admin/dashboard/courses");
      
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to create course: " + (error.message || "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSave = () => {
    return (
      formData?.name?.trim() &&
      formData?.description?.trim() &&
      formData?.categoryId
    );
  };

  const getStepValidation = () => {
    switch (currentStep) {
      case 1:
        return {
          isValid: formData?.name?.trim() && formData?.description?.trim() && formData?.categoryId,
          errors: [
            !formData?.name?.trim() && "Course name is required",
            !formData?.description?.trim() && "Course description is required",
            !formData?.categoryId && "Course category is required"
          ].filter(Boolean)
        };
      case 2:
        return {
          isValid: sections.length > 0,
          errors: sections.length === 0 ? ["At least one section is required"] : []
        };
      case 3:
        return { isValid: true, errors: [] };
      default:
        return { isValid: true, errors: [] };
    }
  };

  const stepValidation = getStepValidation();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Left side */}
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:translate-x-[-2px] transition-transform" />
                <span className="text-sm font-medium">
                  {currentStep === 1 ? "Back to Courses" : "Previous"}
                </span>
              </button>

              {/* Status Indicators */}
              <div className="hidden sm:flex items-center space-x-2">
                {error && (
                  <div className="flex items-center space-x-1 text-red-600 bg-red-50 px-2 py-1 rounded-full border border-red-200">
                    <AlertCircle className="w-3 h-3" />
                    <span className="text-xs font-medium">Error</span>
                    <button
                      onClick={() => dispatch(clearError())}
                      className="text-red-400 hover:text-red-600 ml-1 text-xs"
                    >
                      ×
                    </button>
                  </div>
                )}

                {!stepValidation.isValid && stepValidation.errors.length > 0 && (
                  <div className="flex items-center space-x-1 text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-200">
                    <AlertCircle className="w-3 h-3" />
                    <span className="text-xs font-medium">
                      {stepValidation.errors.length} issue{stepValidation.errors.length > 1 ? 's' : ''}
                    </span>
                  </div>
                )}

                {stepValidation.isValid && (
                  <div className="flex items-center space-x-1 text-[#0AAC9E] bg-[#0AAC9E]/10 px-2 py-1 rounded-full border border-[#0AAC9E]/20">
                    <CheckCircle className="w-3 h-3" />
                    <span className="text-xs font-medium">Complete</span>
                  </div>
                )}
              </div>
            </div>

            {/* Center - Course Title */}
            <div className="flex-1 text-center px-4">
              <h1 className="text-lg font-bold text-gray-900">Create New Course</h1>
              {formData?.name && (
                <p className="text-xs text-gray-500 truncate max-w-md mx-auto mt-1">
                  {formData.name}
                </p>
              )}
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-3">
              {/* Preview Button */}
              <button className="flex items-center space-x-2 px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline">Preview</span>
              </button>

              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={!canSave() || isSubmitting}
                className="flex items-center space-x-2 px-4 py-2 bg-[#0AAC9E] text-white rounded-lg hover:bg-[#0AAC9E]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm text-sm font-medium"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">
                  {isSubmitting ? "Creating..." : "Create Course"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Step Progress */}
        <StepProgress />

        {/* Step Validation Errors */}
        {!stepValidation.isValid && stepValidation.errors.length > 0 && (
          <div className="border-t border-gray-100 bg-amber-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-amber-800">
                    Please complete the following:
                  </h4>
                  <ul className="mt-1 space-y-1">
                    {stepValidation.errors.map((error, index) => (
                      <li key={index} className="text-sm text-amber-700">
                        • {error}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-2xl">
            <div className="flex items-center space-x-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#0AAC9E]"></div>
              <span className="text-gray-700 font-medium">Creating course...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseCreateLayout;