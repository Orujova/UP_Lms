'use client'
import React from "react";
import { useSelector } from "react-redux";
import CourseCreateLayout from "@/components/course/CourseLayout";
import BasicInfoForm from "@/components/course/BasicInfoForm";
import CourseContentForm from "@/components/course/CourseContentForm";
import TargetGroupsStep from "@/components/course/TargetGroupsForm";

const CourseCreatePage = () => {
  const { currentStep } = useSelector((state) => state.course || { currentStep: 1 });

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <BasicInfoForm />;
      case 2:
        return <CourseContentForm />;
      case 3:
        return <TargetGroupsStep isEditing={false} />;
      default:
        return <BasicInfoForm />;
    }
  };

  return (
    <CourseCreateLayout isEditing={false}>
      {renderStepContent()}
    </CourseCreateLayout>
  );
};

export default CourseCreatePage;