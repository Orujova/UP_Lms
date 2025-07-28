'use client'
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { 
  X, 
  CheckCircle, 
  AlertCircle, 
  Users, 
  BookOpen, 
  Clock, 
  Target,
  Globe,
  Award,
  Loader2,
  Rocket,
  Eye
} from "lucide-react";
import {
  setModalOpen,
  publishCourseAsync,
  createCourseAsync,
  updateCourseAsync
} from "@/redux/course/courseSlice";

const PublishConfirmModal = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  
  const { 
    modals, 
    formData,
    sections,
    currentCourse,
    loading 
  } = useSelector((state) => state.course || {});
  
  const isOpen = modals?.publishConfirm || false;
  const [isPublishing, setIsPublishing] = useState(false);

  // Validation checks
  const validationChecks = [
    {
      id: 'basicInfo',
      label: 'Basic Information',
      check: formData?.name && formData?.description && formData?.categoryId,
      message: 'Course name, description, and category are required'
    },
    {
      id: 'content',
      label: 'Course Content',
      check: sections.length > 0 && sections.some(s => s.contents && s.contents.length > 0),
      message: 'At least one section with content is required'
    },
    {
      id: 'targetGroups',
      label: 'Target Groups',
      check: formData?.targetGroupIds && formData.targetGroupIds.length > 0,
      message: 'At least one target group must be assigned'
    },
    {
      id: 'duration',
      label: 'Course Duration',
      check: formData?.duration && formData.duration > 0,
      message: 'Course duration must be specified'
    }
  ];

  const allChecksPass = validationChecks.every(check => check.check);

  // Course statistics
  const courseStats = {
    totalSections: sections.length,
    totalContent: sections.reduce((sum, section) => sum + (section.contents?.length || 0), 0),
    totalDuration: formData?.duration || 0,
    targetGroups: formData?.targetGroupIds?.length || 0,
    hasQuizzes: sections.some(section => 
      section.contents?.some(content => content.type === 'quiz')
    ),
    hasCertificate: !!formData?.certificateId
  };

  const handleClose = () => {
    dispatch(setModalOpen({ modal: 'publishConfirm', isOpen: false }));
  };

  const handlePublish = async () => {
    if (!allChecksPass) return;
    
    setIsPublishing(true);
    
    try {
      // Prepare course data for publishing
      const courseData = {
        name: formData.name,
        description: formData.description,
        courseCategoryId: formData.categoryId,
        duration: formData.duration,
        verifiedCertificate: formData.verifiedCertificate,
        targetGroupIds: formData.targetGroupIds,
        courseCertificateId: formData.certificateId,
        tagIds: formData.tagIds,
        startDuration: formData.startDuration,
        deadLine: formData.deadline,
        autoReassign: formData.autoReassign,
        publishCourse: true, // Set to published
        hasEvaluation: formData.hasEvaluation,
        imageFile: formData.imageFile
      };

      if (currentCourse?.id) {
        // Update existing course and publish
        await dispatch(updateCourseAsync({ 
          courseId: currentCourse.id, 
          courseData 
        })).unwrap();
        
        // Then publish it
        await dispatch(publishCourseAsync(currentCourse.id)).unwrap();
      } else {
        // Create and publish new course
        const newCourse = await dispatch(createCourseAsync(courseData)).unwrap();
        await dispatch(publishCourseAsync(newCourse.id)).unwrap();
      }
      
      handleClose();
      
      // Redirect to courses list or show success message
      setTimeout(() => {
        router.push('/admin/dashboard/courses');
      }, 1000);
      
    } catch (error) {
      console.error("Error publishing course:", error);
      alert("Error publishing course: " + error.message);
    } finally {
      setIsPublishing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Rocket className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Ready to Publish?
                </h2>
                <p className="text-sm text-gray-600">
                  Review your course before making it available to learners
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          {/* Validation Checklist */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Course Validation</h3>
            <div className="space-y-3">
              {validationChecks.map((check) => (
                <div 
                  key={check.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg border ${
                    check.check 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  {check.check ? (
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${
                      check.check ? 'text-green-900' : 'text-red-900'
                    }`}>
                      {check.label}
                    </p>
                    {!check.check && (
                      <p className="text-xs text-red-700 mt-1">{check.message}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Course Overview */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Course Overview</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <BookOpen className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{formData?.name || 'Untitled Course'}</p>
                    <p className="text-xs text-gray-500">Course Name</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{courseStats.totalDuration} minutes</p>
                    <p className="text-xs text-gray-500">Total Duration</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Target className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{courseStats.targetGroups} groups</p>
                    <p className="text-xs text-gray-500">Target Groups</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{courseStats.totalSections} sections</p>
                    <p className="text-xs text-gray-500">Course Sections</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Course Features */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Course Features</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className={`flex items-center space-x-2 p-3 rounded-lg border ${
                courseStats.hasQuizzes 
                  ? 'border-blue-200 bg-blue-50 text-blue-700' 
                  : 'border-gray-200 bg-gray-50 text-gray-500'
              }`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  courseStats.hasQuizzes ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  {courseStats.hasQuizzes ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                </div>
                <span className="text-sm font-medium">Interactive Quizzes</span>
              </div>
              
              <div className={`flex items-center space-x-2 p-3 rounded-lg border ${
                courseStats.hasCertificate 
                  ? 'border-purple-200 bg-purple-50 text-purple-700' 
                  : 'border-gray-200 bg-gray-50 text-gray-500'
              }`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  courseStats.hasCertificate ? 'bg-purple-100' : 'bg-gray-100'
                }`}>
                  {courseStats.hasCertificate ? (
                    <Award className="w-4 h-4" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                </div>
                <span className="text-sm font-medium">Certificate</span>
              </div>
              
              <div className={`flex items-center space-x-2 p-3 rounded-lg border ${
                formData?.hasEvaluation 
                  ? 'border-green-200 bg-green-50 text-green-700' 
                  : 'border-gray-200 bg-gray-50 text-gray-500'
              }`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  formData?.hasEvaluation ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  {formData?.hasEvaluation ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                </div>
                <span className="text-sm font-medium">Course Evaluation</span>
              </div>
              
              <div className={`flex items-center space-x-2 p-3 rounded-lg border ${
                formData?.autoReassign 
                  ? 'border-orange-200 bg-orange-50 text-orange-700' 
                  : 'border-gray-200 bg-gray-50 text-gray-500'
              }`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  formData?.autoReassign ? 'bg-orange-100' : 'bg-gray-100'
                }`}>
                  {formData?.autoReassign ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                </div>
                <span className="text-sm font-medium">Auto Reassign</span>
              </div>
            </div>
          </div>

          {/* Warning if not all checks pass */}
          {!allChecksPass && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-red-900 mb-2">
                    Cannot Publish Yet
                  </h4>
                  <p className="text-sm text-red-800">
                    Please complete all required fields and add content to at least one section before publishing.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <button
              onClick={() => dispatch(setModalOpen({ modal: 'coursePreview', isOpen: true }))}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview Course
            </button>
            
            <div className="flex space-x-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePublish}
                disabled={!allChecksPass || isPublishing}
                className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Globe className="w-4 h-4 mr-2" />
                    Publish Course
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublishConfirmModal;