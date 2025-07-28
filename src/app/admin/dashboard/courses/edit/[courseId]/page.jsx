'use client'
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "next/navigation";
import { 
  fetchCourseByIdAsync, 
  setFormData,
  getSectionsByCourseIdAsync,
  fetchCourseLearnersAsync
} from "@/redux/course/courseSlice";

import CourseCreateLayout from "@/components/course/CourseLayout";
import BasicInfoForm from "@/components/course/BasicInfoForm";
import CourseContentBuilder from "@/components/course/CourseContentForm";
import TargetGroupsForm from "@/components/course/TargetGroupsForm";

// Import all modals for course editing
import ContentModal from "@/components/course/ContentModal";
import QuizModal from "@/components/course/QuizModal";
import SectionModal from "@/components/course/SectionModal";
import AssignUsersModal from "@/components/course/AssignUsersModal";
import PublishConfirmModal from "@/components/course/PublishConfirmModal";
import CoursePreviewModal from "@/components/course/CoursePreviewModal";
import DeleteConfirmModal from "@/components/course/DeleteConfirmModal";

import LoadingSpinner from "@/components/loadingSpinner";

const CourseEditPage = () => {
  const dispatch = useDispatch();
  const { courseId } = useParams();
  
  const { 
    currentStep,
    currentCourse, 
    courseLoading, 
    courseError
  } = useSelector((state) => state.course || {});

  // Fetch course data on mount
  useEffect(() => {
    if (courseId) {
      // Fetch course details with user ID for progress tracking
      dispatch(fetchCourseByIdAsync({ courseId, userId: null }));
      // Fetch course sections
      dispatch(getSectionsByCourseIdAsync(courseId));
      // Fetch course learners for assignment modal
      dispatch(fetchCourseLearnersAsync({ courseId, page: 1, take: 10 }));
    }
  }, [dispatch, courseId]);

  // Populate form data when course is loaded
  useEffect(() => {
    if (currentCourse && !courseLoading) {
      dispatch(setFormData({
        name: currentCourse.name || "",
        description: currentCourse.description || "",
        categoryId: currentCourse.courseCategoryId || "",
        duration: currentCourse.duration || 60,
        verifiedCertificate: currentCourse.verifiedCertificate || false,
        targetGroupIds: currentCourse.targetGroupIds || [],
        certificateId: currentCourse.courseCertificateId || null,
        tagIds: currentCourse.courseTags?.map(tag => tag.id) || [],
        startDuration: currentCourse.startDuration || null,
        deadline: currentCourse.deadLine || null,
        autoReassign: currentCourse.autoReassign || false,
        publishCourse: currentCourse.publishCourse || false,
        hasEvaluation: currentCourse.hasEvaluation || false,
      }));
    }
  }, [currentCourse, courseLoading, dispatch]);

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <BasicInfoForm isEditing={true} />;
      case 2:
        return <CourseContentBuilder isEditing={true} />;
      case 3:
        return <TargetGroupsForm isEditing={true} />;
      default:
        return <BasicInfoForm isEditing={true} />;
    }
  };

  // Loading state
  if (courseLoading) {
    return <LoadingSpinner />;
  }

  // Error state
  if (courseError || !currentCourse) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Course Not Found</h2>
          <p className="text-gray-600 mb-6">
            {courseError || "The course you're looking for doesn't exist or has been deleted."}
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2 bg-[#0AAC9E] text-white rounded-lg hover:bg-[#0AAC9E]/90 transition-colors font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <CourseCreateLayout isEditing={true}>
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

export default CourseEditPage;