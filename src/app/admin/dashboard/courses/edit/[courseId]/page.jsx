'use client'
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "next/navigation";
import { fetchCourseByIdAsync, setFormData } from "@/redux/course/courseSlice";

import CourseCreateLayout from "@/components/course/CourseLayout";
import BasicInfoForm from "@/components/course/BasicInfoForm";
import ContentBuilderStep from "@/components/course/CourseContentForm";
import TargetGroupsStep from "@/components/course/TargetGroupsForm";
import ContentModal from "@/components/course/ContentModal";
import QuizModal from "@/components/course/QuizModal";
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

  useEffect(() => {
    if (courseId) {
      dispatch(fetchCourseByIdAsync({ courseId }));
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
        tagIds: currentCourse.tagIds || [],
        startDuration: currentCourse.startDuration || null,
        deadline: currentCourse.deadLine || null,
        autoReassign: currentCourse.autoReassign || false,
      }));
    }
  }, [currentCourse, courseLoading, dispatch]);

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <BasicInfoForm />;
      case 2:
        return <ContentBuilderStep />;
      case 3:
        return <TargetGroupsStep isEditing={true} />;
      default:
        return <BasicInfoForm />;
    }
  };

  if (courseLoading) {
    return <LoadingSpinner />;
  }

  if (courseError || !currentCourse) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">{courseError || "Course not found"}</div>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-[#0AAC9E] text-white rounded-lg hover:bg-[#0AAC9E]/90"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <CourseCreateLayout isEditing={true}>
      {renderStepContent()}
      
      {/* Modals */}
      <ContentModal />
      <QuizModal />
    </CourseCreateLayout>
  );
};

export default CourseEditPage;