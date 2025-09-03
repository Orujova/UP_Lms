'use client'
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  BookOpen, 
  List,
  Globe,
  CheckCircle,
  ArrowRight,
  Plus,
  Clock,
  Target
} from "lucide-react";
import {
  nextStep,
  prevStep,
  setCurrentStep
} from "@/redux/course/courseSlice";

const CourseCreateLayout = ({ children, isEditing = false }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  
  const { 
    currentStep, 
    formData, 
    sections,
    currentCourse
  } = useSelector((state) => state.course || {});

  const steps = [
    { id: 1, title: "Course Information", icon: BookOpen },
    { id: 2, title: "Content Structure", icon: List },
    { id: 3, title: "Publish & Deploy", icon: Globe }
  ];

  const isStepComplete = (step) => {
    switch (step) {
      case 1:
        return !!(currentCourse?.id && formData?.name?.trim() && formData?.description?.trim() && formData?.categoryId && formData?.duration);
      case 2:
        return !!(currentCourse?.id && sections && sections.length > 0 && sections.some(s => (s.contents || []).length > 0));
      case 3:
        return !!(currentCourse?.id && sections && sections.length > 0);
      default: 
        return false;
    }
  };

  const canAccessStep = (step) => {
    if (step === 1) return true;
    return isStepComplete(1);
  };

  const handleStepClick = (step) => {
    if (canAccessStep(step)) {
      dispatch(setCurrentStep(step));
    }
  };

  const handleNext = () => {
    if (currentStep < 3 && canAccessStep(currentStep + 1)) {
      dispatch(nextStep());
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      dispatch(prevStep());
    }
  };

  const getStepStatus = (stepId) => {
    const isComplete = isStepComplete(stepId);
    const isActive = stepId === currentStep;
    const isAvailable = canAccessStep(stepId);
    
    return { isComplete, isActive, isAvailable };
  };



  return (
    <div className="min-h-screen bg-gray-50/50 pt-14 rounded-lg">
      {/* Header */}
      <div className="bg-white border-b rounded-lg border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push('/admin/dashboard/courses')}
                className="flex items-center text-gray-600 hover:text-gray-900 text-xs"
              >
                <div><ArrowLeft className="w-4 h-3 mr-1" /></div>
               <span>Back to Courses</span> 
              </button>
              
              <div className="h-4 w-px bg-gray-300"></div>
              
              <div className="flex items-center">
                <div className="bg-[#0AAC9E]/10 p-1.5 rounded mr-2">
                  <Plus className="w-4 h-3 text-[#0AAC9E]" />
                </div>
                <div>
                  <h1 className="text-sm font-semibold text-gray-900">
                    {isEditing ? 'Edit Course' : 'Create New Course'}
                  </h1>
                  <p className="text-xs text-gray-600">
                    Step {currentStep} of {steps.length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {currentCourse?.id && (
                <div className="flex items-center px-2 py-1 bg-green-50 border border-green-200 rounded text-xs">
                  <CheckCircle className="w-3 h-3 text-green-600 mr-1" />
                  <span className="text-green-700">Saved #{currentCourse.id}</span>
                </div>
              )}
              
            
            </div>
          </div>
        </div>
      </div>

      {/* Step Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200 -z-10">
              <div 
                className="h-full bg-[#0AAC9E] transition-all duration-500"
                style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
              />
            </div>
            
            {steps.map((step) => {
              const status = getStepStatus(step.id);
              
              return (
                <div key={step.id} className="flex flex-col items-center relative z-10">
                  <button
                    onClick={() => handleStepClick(step.id)}
                    disabled={!status.isAvailable}
                    className={`
                      flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all
                      ${status.isComplete 
                        ? 'bg-[#0AAC9E] border-[#0AAC9E] text-white' 
                        : status.isActive
                        ? 'bg-white border-[#0AAC9E] text-[#0AAC9E]' 
                        : status.isAvailable
                        ? 'bg-white border-gray-300 text-gray-600 hover:border-gray-400'
                        : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                      }
                    `}
                  >
                    {status.isComplete ? (
                      <CheckCircle className="w-4 h-5" />
                    ) : (
                      <step.icon className="w-4 h-5" />
                    )}
                  </button>
                  
                  <div className="mt-2 text-center">
                    <h3 className={`text-xs font-medium ${
                      status.isComplete || status.isActive ? 'text-[#0AAC9E]' : 
                      status.isAvailable ? 'text-gray-700' : 'text-gray-400'
                    }`}>
                      {step.title}
                    </h3>
                    
                    <div className="mt-1">
                      {status.isComplete && (
                        <span className="inline-flex items-center px-1.5 py-0.5 text-xs bg-green-100 text-green-800 rounded">
                          Done
                        </span>
                      )}
                      {status.isActive && !status.isComplete && (
                        <span className="inline-flex items-center px-1.5 py-0.5 text-xs bg-[#0AAC9E]/10 text-[#0AAC9E] rounded">
                          Active
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
         
        </div>
      </div>

      {/* Content Area */}
      <div className=" mx-auto py-4">
        <div className="bg-white rounded border border-gray-200">
          {children}
        </div>

        {/* Navigation Footer */}
        <div className="mt-4 bg-white rounded border border-gray-200">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className={`
                  flex items-center px-3 py-1.5 text-xs font-medium rounded transition-all
                  ${currentStep === 1
                    ? 'text-gray-400 cursor-not-allowed bg-gray-50'
                    : 'text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }
                `}
              >
                <ArrowLeft className="w-3 h-3 mr-1" />
                Previous
              </button>

              {currentStep < 3 ? (
                <button
                  onClick={handleNext}
                  disabled={!isStepComplete(currentStep)}
                  className={`
                    flex items-center px-4 py-1.5 text-xs font-medium rounded transition-all
                    ${isStepComplete(currentStep)
                      ? 'text-white bg-[#0AAC9E] hover:bg-[#0AAC9E]/90'
                      : 'text-gray-400 bg-gray-100 cursor-not-allowed'
                    }
                  `}
                >
                  Continue
                  <ArrowRight className="w-3 h-3 ml-1" />
                </button>
              ) : (
                <button
                  onClick={() => console.log('Publish')}
                  disabled={!currentCourse?.id}
                  className={`
                    flex items-center px-4 py-1.5 text-xs font-medium rounded transition-all
                    ${currentCourse?.id
                      ? 'text-white bg-green-600 hover:bg-green-700'
                      : 'text-gray-400 bg-gray-100 cursor-not-allowed'
                    }
                  `}
                >
                  <Globe className="w-3 h-3 mr-1" />
                  Publish
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCreateLayout;