// components/course/create/StepProgress.jsx
"use client";

import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { CheckCircle, BookOpen, Target, Layers } from "lucide-react";
import { setCurrentStep } from "@/redux/course/courseSlice";

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
          circle: "bg-teal-500 text-white border-teal-500",
          title: "text-teal-600 font-medium",
          description: "text-teal-500",
          connector: "bg-teal-500",
        };
      case "current":
        return {
          container: "cursor-pointer",
          circle: "bg-teal-50 text-teal-600 border-teal-500 border-2 ring-2 ring-teal-100",
          title: "text-teal-600 font-medium",
          description: "text-teal-500",
          connector: "bg-gray-200",
        };
      case "available":
        return {
          container: "cursor-pointer hover:bg-gray-50 rounded-lg transition-colors",
          circle: "bg-white text-gray-400 border-gray-300 hover:border-teal-300 hover:text-teal-500",
          title: "text-gray-600 hover:text-teal-600",
          description: "text-gray-400 hover:text-teal-400",
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
      <div className="flex items-center space-x-8">
        {steps.map((step, index) => {
          const status = getStepStatus(step);
          const styles = getStepStyles(status);
          const Icon = step.icon;

          return (
            <div key={step.id} className="flex items-center">
              {/* Step */}
              <div
                onClick={() => handleStepClick(step.id)}
                className={`flex items-center space-x-3 p-2 transition-all ${styles.container}`}
              >
                {/* Circle with icon/number */}
                <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${styles.circle}`}>
                  {status === "completed" ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : status === "current" ? (
                    <Icon className="w-4 h-4" />
                  ) : (
                    <span className="text-xs font-semibold">{step.id}</span>
                  )}
                </div>

                {/* Text */}
                <div className="text-left">
                  <div className={`text-xs font-medium transition-all ${styles.title}`}>
                    {step.title}
                  </div>
                  <div className={`text-xs transition-all ${styles.description}`}>
                    {step.description}
                  </div>
                </div>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className={`w-12 h-0.5 mx-4 transition-all ${styles.connector}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepProgress;