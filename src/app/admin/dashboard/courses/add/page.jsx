'use client'
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import CourseCreateLayout from "@/components/course/CourseLayout";
import BasicInfoForm from "@/components/course/BasicInfoForm";
import CourseContentBuilder from "@/components/course/CourseContentForm";
import TargetGroupsForm from "@/components/course/TargetGroupsForm";

// Import all modals for course creation
import ContentModal from "@/components/course/ContentModal";
import QuizModal from "@/components/course/QuizModal";
import SectionModal from "@/components/course/SectionModal";
import AssignUsersModal from "@/components/course/AssignUsersModal";
import PublishConfirmModal from "@/components/course/PublishConfirmModal";
import CoursePreviewModal from "@/components/course/CoursePreviewModal";
import DeleteConfirmModal from "@/components/course/DeleteConfirmModal";

import { resetFormData, setCurrentStep } from "@/redux/course/courseSlice";

const CourseAddPage = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { currentStep, currentCourse } = useSelector((state) => state.course || { currentStep: 1 });

  // Reset form data when component mounts (for new course creation)
  useEffect(() => {
    dispatch(resetFormData());
    dispatch(setCurrentStep(1));
  }, [dispatch]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      // Only show warning if user has made changes (basic check)
      if (currentCourse || currentStep > 1) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentCourse, currentStep]);

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <BasicInfoForm isEditing={false} />;
      case 2:
        return <CourseContentBuilder isEditing={false} />;
      case 3:
        return <TargetGroupsForm isEditing={false} />;
      default:
        return <BasicInfoForm isEditing={false} />;
    }
  };

  return (
    <>
      <CourseCreateLayout isEditing={false}>
        {renderStepContent()}
      </CourseCreateLayout>

      {/* All Modals - These are conditionally rendered based on Redux state */}
      <ContentModal />
      <QuizModal />
      <SectionModal />
      <AssignUsersModal />
      <PublishConfirmModal />
      <CoursePreviewModal />
      <DeleteConfirmModal />
    </>
  );
};

export default CourseAddPage;