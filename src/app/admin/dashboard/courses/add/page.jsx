'use client'
import React from "react";
import { useSelector } from "react-redux";
import CourseCreateLayout from "@/components/course/CourseLayout";
import BasicInfoForm from "@/components/course/BasicInfoForm";
import ContentBuilderStep from "@/components/course/CourseContentForm";
import TargetGroupsStep from "@/components/course/TargetGroupsForm";
import ContentModal from "@/components/course/ContentModal";
import QuizModal from "@/components/course/QuizModal";

const CourseCreatePage = () => {
  const { currentStep } = useSelector((state) => state.course || {});

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <BasicInfoForm />;
      case 2:
        return <ContentBuilderStep />;
      case 3:
        return <TargetGroupsStep />;
      default:
        return <BasicInfoForm />;
    }
  };

  return (
    <CourseCreateLayout>
      {renderStepContent()}
      
      {/* Modals */}
      <ContentModal />
      <QuizModal />
    </CourseCreateLayout>
  );
};

export default CourseCreatePage;