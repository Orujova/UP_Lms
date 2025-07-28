import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { 
  X, 
  Trash2, 
  AlertTriangle, 
  Loader2,
  BookOpen,
  Users,
  Clock,
  FileText
} from "lucide-react";
import {
  setModalOpen,
  deleteCourseAsync,
  deleteSectionAsync,
  deleteContentAsync,
  closeAllModals
} from "@/redux/course/courseSlice";

const DeleteConfirmModal = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  
  const { 
    modals, 
    deleteConfirm,
    currentCourse,
    loading 
  } = useSelector((state) => state.course || {});
  
  const isOpen = modals?.deleteConfirm || false;
  const [isDeleting, setIsDeleting] = useState(false);

  const handleClose = () => {
    if (!isDeleting) {
      dispatch(setModalOpen({ modal: 'deleteConfirm', isOpen: false }));
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    
    setIsDeleting(true);
    
    try {
      switch (deleteConfirm.type) {
        case 'course':
          if (deleteConfirm.courseId) {
            await dispatch(deleteCourseAsync(deleteConfirm.courseId)).unwrap();
            // Redirect to courses list after successful deletion
            router.push('/admin/dashboard/courses');
          }
          break;
          
        case 'section':
          if (deleteConfirm.sectionId) {
            await dispatch(deleteSectionAsync(deleteConfirm.sectionId)).unwrap();
          }
          break;
          
        case 'content':
          if (deleteConfirm.contentId && deleteConfirm.sectionId) {
            await dispatch(deleteContentAsync({
              contentId: deleteConfirm.contentId,
              sectionId: deleteConfirm.sectionId
            })).unwrap();
          }
          break;
          
        default:
          console.error('Unknown delete type:', deleteConfirm.type);
          return;
      }
      
      // Close modal and show success
      dispatch(closeAllModals());
      
    } catch (error) {
      console.error('Delete failed:', error);
      // You could add a toast notification here
    } finally {
      setIsDeleting(false);
    }
  };

  const getDeleteInfo = () => {
    if (!deleteConfirm) return { title: '', message: '', icon: Trash2, color: 'red' };
    
    switch (deleteConfirm.type) {
      case 'course':
        return {
          title: 'Delete Course',
          message: `Are you sure you want to delete "${deleteConfirm.title || 'this course'}"? This action cannot be undone and will remove all course content, sections, and learner progress.`,
          details: [
            'All course sections and content will be permanently deleted',
            'Learner progress and completion data will be lost',
            'Course assignments will be removed',
            'This action cannot be reversed'
          ],
          icon: BookOpen,
          color: 'red',
          buttonText: 'Delete Course'
        };
        
      case 'section':
        return {
          title: 'Delete Section',
          message: `Are you sure you want to delete the section "${deleteConfirm.title || 'Untitled Section'}"? All content within this section will also be deleted.`,
          details: [
            'All content within this section will be deleted',
            'Learner progress in this section will be lost',
            'Section order will be automatically adjusted',
            'This action cannot be undone'
          ],
          icon: FileText,
          color: 'orange',
          buttonText: 'Delete Section'
        };
        
      case 'content':
        return {
          title: 'Delete Content',
          message: `Are you sure you want to delete "${deleteConfirm.title || 'this content'}"? This will remove the content from the course permanently.`,
          details: [
            'Content will be removed from the section',
            'Learner progress on this content will be deleted',
            'Associated quizzes and files will be removed',
            'This action cannot be reversed'
          ],
          icon: FileText,
          color: 'yellow',
          buttonText: 'Delete Content'
        };
        
      default:
        return {
          title: 'Delete Item',
          message: 'Are you sure you want to delete this item?',
          details: ['This action cannot be undone'],
          icon: Trash2,
          color: 'red',
          buttonText: 'Delete'
        };
    }
  };

  const deleteInfo = getDeleteInfo();
  const IconComponent = deleteInfo.icon;

  if (!isOpen || !deleteConfirm) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                deleteInfo.color === 'red' ? 'bg-red-100' :
                deleteInfo.color === 'orange' ? 'bg-orange-100' :
                deleteInfo.color === 'yellow' ? 'bg-yellow-100' :
                'bg-gray-100'
              }`}>
                <IconComponent className={`w-5 h-5 ${
                  deleteInfo.color === 'red' ? 'text-red-600' :
                  deleteInfo.color === 'orange' ? 'text-orange-600' :
                  deleteInfo.color === 'yellow' ? 'text-yellow-600' :
                  'text-gray-600'
                }`} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                {deleteInfo.title}
              </h2>
            </div>
            
            <button
              onClick={handleClose}
              disabled={isDeleting}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          
          {/* Warning Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>

          {/* Message */}
          <div className="text-center mb-6">
            <p className="text-gray-700 mb-4">
              {deleteInfo.message}
            </p>
            
            {/* Details */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left">
              <h4 className="font-semibold text-red-800 text-sm mb-2">
                This will result in:
              </h4>
              <ul className="space-y-1">
                {deleteInfo.details.map((detail, index) => (
                  <li key={index} className="text-red-700 text-sm flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Course/Section Info (if available) */}
          {deleteConfirm.type === 'course' && currentCourse && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{currentCourse.enrolledCount || 0} learners</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{currentCourse.duration || 0} min</span>
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  <span>{currentCourse.sectionsCount || 0} sections</span>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              disabled={isDeleting}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className={`flex-1 px-4 py-3 text-white rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                deleteInfo.color === 'red' ? 'bg-red-600 hover:bg-red-700' :
                deleteInfo.color === 'orange' ? 'bg-orange-600 hover:bg-orange-700' :
                deleteInfo.color === 'yellow' ? 'bg-yellow-600 hover:bg-yellow-700' :
                'bg-gray-600 hover:bg-gray-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>{deleteInfo.buttonText}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;