import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Upload, 
  AlertCircle, 
  CheckCircle,
  Clock,
  Users,
  BookOpen,
  Target,
  Layers
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
      completed: false,
      canNavigate: true,
    },
    {
      id: 2,
      title: "Content",
      description: "Sections & materials",
      icon: Layers,
      completed: false,
      canNavigate: formData?.name?.trim() && formData?.description?.trim() && formData?.categoryId,
    },
    {
      id: 3,
      title: "Publish",
      description: "Target groups",
      icon: Target,
      completed: false,
      canNavigate: formData?.name?.trim() && formData?.description?.trim() && formData?.categoryId,
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
          circle: "bg-[#0AAC9E] text-white border-[#0AAC9E]",
          title: "text-[#0AAC9E] font-medium",
          description: "text-[#0AAC9E]/70",
          connector: "bg-[#0AAC9E]",
        };
      case "current":
        return {
          container: "cursor-pointer",
          circle: "bg-[#0AAC9E]/10 text-[#0AAC9E] border-[#0AAC9E] border-2 ring-2 ring-[#0AAC9E]/20",
          title: "text-[#0AAC9E] font-medium",
          description: "text-[#0AAC9E]/70",
          connector: "bg-gray-200",
        };
      case "available":
        return {
          container: "cursor-pointer hover:bg-gray-50 rounded-lg transition-colors",
          circle: "bg-white text-gray-400 border-gray-300 hover:border-[#0AAC9E] hover:text-[#0AAC9E]",
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
    <div className="flex items-center justify-center">
      <div className="flex items-center space-x-6">
        {steps.map((step, index) => {
          const status = getStepStatus(step);
          const styles = getStepStyles(status);
          const Icon = step.icon;

          return (
            <div key={step.id} className="flex items-center">
              <div
                onClick={() => handleStepClick(step.id)}
                className={`flex items-center space-x-3 p-2 transition-all ${styles.container}`}
              >
                <div className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all ${styles.circle}`}>
                  {status === "completed" ? (
                    <CheckCircle className="w-3.5 h-3.5" />
                  ) : status === "current" ? (
                    <Icon className="w-3.5 h-3.5" />
                  ) : (
                    <span className="text-xs font-semibold">{step.id}</span>
                  )}
                </div>

                <div className="text-left">
                  <div className={`text-xs font-medium transition-all ${styles.title}`}>
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
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  const {
    currentStep = 1,
    formData = {},
    sections = [],
    loading = false,
    error = null,
  } = useSelector((state) => state.course || {});

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveEnabled && formData.name) {
      const autoSaveInterval = setInterval(() => {
        try {
          localStorage.setItem('course_draft', JSON.stringify({
            formData,
            sections,
            currentStep,
            timestamp: Date.now(),
          }));
        } catch (error) {
          console.warn("Auto-save failed:", error);
        }
      }, 30000);

      return () => clearInterval(autoSaveInterval);
    }
  }, [formData, sections, currentStep, autoSaveEnabled]);

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
      
      localStorage.removeItem('course_draft');
      
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
                  {currentStep === 1 ? "Back to Courses" : "Back"}
                </span>
              </button>

              {/* Status Indicators */}
              <div className="hidden sm:flex items-center space-x-3">
                {error && (
                  <div className="flex items-center space-x-2 text-red-600 bg-red-50 px-2 py-1 rounded-md border border-red-200">
                    <AlertCircle className="w-3 h-3" />
                    <span className="text-xs font-medium">Error</span>
                    <button
                      onClick={() => dispatch(clearError())}
                      className="text-red-400 hover:text-red-600 ml-1 text-sm"
                    >
                      ×
                    </button>
                  </div>
                )}

                {!stepValidation.isValid && stepValidation.errors.length > 0 && (
                  <div className="flex items-center space-x-2 text-amber-600 bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
                    <AlertCircle className="w-3 h-3" />
                    <span className="text-xs font-medium">
                      {stepValidation.errors.length} issue{stepValidation.errors.length > 1 ? 's' : ''}
                    </span>
                  </div>
                )}

                {stepValidation.isValid && (
                  <div className="flex items-center space-x-2 text-[#0AAC9E] bg-[#0AAC9E]/10 px-2 py-1 rounded-md border border-[#0AAC9E]/20">
                    <CheckCircle className="w-3 h-3" />
                    <span className="text-xs font-medium">Step Complete</span>
                  </div>
                )}
              </div>
            </div>

            {/* Center - Course Title */}
            <div className="flex-1 text-center px-4">
              <h1 className="text-base font-semibold text-gray-900">Create New Course</h1>
              {formData?.name && (
                <p className="text-xs text-gray-500 truncate max-w-md mx-auto">
                  {formData.name}
                </p>
              )}
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-3">
              {/* Auto-save indicator */}
              <div className="hidden md:flex items-center space-x-2 text-xs text-gray-500">
                <Upload className="w-3 h-3" />
                <span>Auto-save {autoSaveEnabled ? 'on' : 'off'}</span>
              </div>

              {/* Preview Button */}
              <button
                className="flex items-center space-x-2 px-3 py-1.5 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Preview</span>
              </button>

              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={!canSave() || isSubmitting}
                className="flex items-center space-x-2 px-4 py-1.5 bg-[#0AAC9E] text-white rounded-lg hover:bg-[#0AAC9E]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm text-sm font-medium"
              >
                {isSubmitting ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span className="hidden sm:inline">
                  {isSubmitting ? "Creating..." : "Create Course"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Step Progress */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-3">
          <StepProgress />
        </div>

        {/* Step Validation Errors */}
        {!stepValidation.isValid && stepValidation.errors.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-3">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="text-xs font-medium text-amber-800">
                    Please complete the following to continue:
                  </h4>
                  <ul className="mt-1 space-y-0.5">
                    {stepValidation.errors.map((error, index) => (
                      <li key={index} className="text-xs text-amber-700">
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
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#0AAC9E]"></div>
              <span className="text-gray-700 text-sm">Creating course...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseCreateLayout;