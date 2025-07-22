import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Settings, 
  Users, 
  BookOpen, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  FileText,
  Play,
  Star,
  ChevronRight
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  setCurrentStep,
  prevStep,
  nextStep,
  createCourseAsync,
  updateCourseAsync,
  publishCourseAsync,
  resetFormData
} from "@/redux/course/courseSlice";

const CourseCreateLayout = ({ children, isEditing = false }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  
  const { 
    currentStep, 
    formData, 
    loading, 
    currentCourse,
    sections = []
  } = useSelector((state) => state.course || {});

  const steps = [
    { 
      id: 1, 
      title: "Course Basics", 
      subtitle: "Name, description & category",
      icon: BookOpen
    },
    { 
      id: 2, 
      title: "Build Content", 
      subtitle: "Add sections & materials",
      icon: FileText
    },
    { 
      id: 3, 
      title: "Launch Course", 
      subtitle: "Assign to groups & publish",
      icon: Star
    }
  ];

  const handleSave = async () => {
    try {
      if (isEditing && currentCourse?.id) {
        await dispatch(updateCourseAsync({ 
          ...formData, 
          id: currentCourse.id 
        })).unwrap();
      } else {
        const result = await dispatch(createCourseAsync(formData)).unwrap();
        if (result?.id) {
          router.push(`admin/dashboard/courses/edit/${result.id}`);
        }
      }
    } catch (error) {
      console.error("Save failed:", error);
    }
  };

  const handlePublish = async () => {
    if (currentCourse?.id) {
      try {
        await dispatch(publishCourseAsync(currentCourse.id)).unwrap();
      } catch (error) {
        console.error("Publish failed:", error);
      }
    }
  };

  const handleBack = () => {
    router.push("admin/dashboard/courses");
  };

  const isStepComplete = (stepId) => {
    switch (stepId) {
      case 1:
        return formData?.name && formData?.description && formData?.categoryId;
      case 2:
        return sections && sections.length > 0 && sections.some(s => s.contents && s.contents.length > 0);
      case 3:
        return formData?.targetGroupIds && formData?.targetGroupIds.length > 0;
      default:
        return false;
    }
  };

  const canProceedToNext = () => {
    return isStepComplete(currentStep);
  };

  const getOverallProgress = () => {
    const completedSteps = steps.filter(step => isStepComplete(step.id)).length;
    return Math.round((completedSteps / steps.length) * 100);
  };

  const getCourseStats = () => {
    const totalSections = sections.length;
    const totalContent = sections.reduce((total, section) => total + (section.contents?.length || 0), 0);
    const estimatedDuration = sections.reduce((total, section) => total + (section.duration || 0), 0);
    const targetGroups = formData?.targetGroupIds?.length || 0;
    
    return { totalSections, totalContent, estimatedDuration, targetGroups };
  };

  const stats = getCourseStats();
  const overallProgress = getOverallProgress();

  return (
    <div className="min-h-screen bg-gray-50 pt-14">
      {/* Header */}
      <div className="bg-white border-b rounded-lg border-gray-200">
        <div className=" px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleBack}
                className="p-1.5 text-gray-500 hover:text-[#0AAC9E] hover:bg-gray-50 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              
              <div>
                <h1 className="text-base font-semibold text-gray-900">
                  {isEditing ? "Edit Course" : "Create Course"}
                </h1>
                <p className="text-xs text-gray-500">
                  {formData?.name || " "}
                </p>
              </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-3">
              {/* Progress */}
              <div className="flex items-center gap-2">
                <div className="text-xs text-gray-600">
                  <span className="font-medium">{overallProgress}%</span> complete
                </div>
                <div className="w-16 bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="h-1.5 bg-[#0AAC9E] rounded-full transition-all duration-300"
                    style={{ width: `${overallProgress}%` }}
                  />
                </div>
              </div>

              {/* Actions */}
              {isEditing && currentCourse && (
                <button
                  onClick={() => router.push(`/courses/preview/${currentCourse.id}`)}
                  className="px-2 py-1.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-xs"
                >
                  Preview
                </button>
              )}
              
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-3 py-1.5 bg-[#0AAC9E] hover:bg-[#0AAC9E]/90 text-white rounded-lg transition-colors text-xs font-medium disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Steps Navigation */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = isStepComplete(step.id);
              const isAccessible = step.id <= currentStep || isCompleted;

              return (
                <React.Fragment key={step.id}>
                  <button
                    onClick={() => isAccessible && dispatch(setCurrentStep(step.id))}
                    disabled={!isAccessible}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? "bg-[#0AAC9E]/10 border-2 border-[#0AAC9E]/30"
                        : isCompleted
                        ? "bg-[#0AAC9E]/5 border-2 border-[#0AAC9E]/20 hover:bg-[#0AAC9E]/10"
                        : isAccessible
                        ? "hover:bg-gray-100 border-2 border-transparent"
                        : "opacity-50 cursor-not-allowed border-2 border-transparent"
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg ${
                      isActive
                        ? "bg-[#0AAC9E] text-white"
                        : isCompleted
                        ? "bg-[#0AAC9E] text-white"
                        : isAccessible
                        ? "bg-gray-200 text-gray-600"
                        : "bg-gray-100 text-gray-400"
                    }`}>
                      {isCompleted && !isActive ? (
                        <div>
                          <CheckCircle className="w-4 h-3" /> 
                        </div>
                       
                      ) : (
                        <div>
                          <Icon className="w-4 h-3" />
                        </div>
                        
                      )}
                    </div>
                    
                    <div className="text-left">
                      <div className={`text-xs font-medium ${
                        isActive
                          ? "text-[#0AAC9E]"
                          : isCompleted
                          ? "text-[#0AAC9E]"
                          : isAccessible
                          ? "text-gray-700"
                          : "text-gray-500"
                      }`}>
                        {step.title}
                      </div>
                      <div className="text-xs text-gray-500">
                        {step.subtitle}
                      </div>
                    </div>
                  </button>

                  {index < steps.length - 1 && (
                    <div className="flex-1 flex items-center justify-center px-1">
                      <div className={`h-0.5 w-full rounded-full ${
                        isStepComplete(step.id) ? "bg-[#0AAC9E]/50" : "bg-gray-300"
                      }`}></div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Course Status Banner */}
      {isEditing && currentCourse && (
        <div className={`${
          currentCourse.publishCourse 
            ? "bg-[#0AAC9E]/10 border-[#0AAC9E]/30" 
            : "bg-amber-50 border-amber-200"
        } border-b`}>
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${
                  currentCourse.publishCourse 
                    ? "bg-[#0AAC9E]/20 text-[#0AAC9E]" 
                    : "bg-amber-100 text-amber-600"
                }`}>
                  {currentCourse.publishCourse ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Clock className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <h3 className={`text-sm font-semibold ${
                    currentCourse.publishCourse ? "text-[#0AAC9E]" : "text-amber-800"
                  }`}>
                    {currentCourse.publishCourse ? "Course Published" : "Draft Status"}
                  </h3>
                  <p className="text-xs text-gray-600">
                    {currentCourse.publishCourse 
                      ? "Your course is live and available to learners" 
                      : "Complete all steps to publish your course"
                    }
                  </p>
                </div>
              </div>
              
              {!currentCourse.publishCourse && overallProgress === 100 && (
                <button
                  onClick={handlePublish}
                  className="flex items-center gap-1 px-3 py-2 bg-[#0AAC9E] hover:bg-[#0AAC9E]/90 text-white rounded-lg font-medium transition-all duration-200 text-xs"
                >
                  <div><Play className="w-4 h-3" /></div>
                  
                  <span>Publish Course</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1  py-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {children}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="bg-white border-t rounded-lg border-gray-200 sticky bottom-0 z-40">
        <div className=" mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-xs text-gray-600">
                <span className="font-medium">Step {currentStep} of {steps.length}</span>
                <span className="mx-2 text-gray-400">•</span>
                <span className="text-gray-500">{steps.find(s => s.id === currentStep)?.title}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {currentStep > 1 && (
                <button
                  onClick={() => dispatch(prevStep())}
                  className="px-3 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-all duration-200 text-xs"
                >
                  Previous
                </button>
              )}
              
              {currentStep < steps.length ? (
                <button
                  onClick={() => dispatch(nextStep())}
                  disabled={!canProceedToNext()}
                  className="flex items-center gap-1 px-3 py-2 bg-[#0AAC9E] hover:bg-[#0AAC9E]/90 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                >
                  <span>Continue to {steps.find(s => s.id === currentStep + 1)?.title}</span>
                  <div>
                    <ChevronRight className="w-4 h-3" />
                  </div>
                  
                </button>
              ) : (
                overallProgress === 100 && !currentCourse?.publishCourse && (
                  <button
                    onClick={handlePublish}
                    className="flex items-center gap-1 px-3 py-2 bg-[#0AAC9E] hover:bg-[#0AAC9E]/90 text-white rounded-lg font-medium transition-all duration-200 text-xs"
                  >
                    <div>
                       <Play className="w-4 h-3" />
                    </div>
                   
                    <span>Publish Course</span>
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCreateLayout;