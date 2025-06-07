// src/components/course/CourseCard.jsx - Modern clean design
import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  Clock, 
  Users, 
  PlayCircle, 
  BookOpen, 
  Award, 
  Edit3, 
  Eye, 
  Trash2,
  MoreVertical,
  Calendar,
  User
} from 'lucide-react';

const CourseCard = ({ 
  course, 
  viewMode = "grid", 
  onEdit, 
  onView, 
  onDelete, 
  activeDropdown, 
  onToggleDropdown 
}) => {
  const router = useRouter();

  const getStatusBadge = () => {
    if (course.publishCourse) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#0AAC9E]/10 text-[#0AAC9E] border border-[#0AAC9E]/20">
          Published
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
        Draft
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getLearnerAvatars = () => {
    const learners = course.topAssignedUsers || [];
    const maxShow = 3;
    
    return (
      <div className="flex items-center">
        <div className="flex -space-x-1.5">
          {learners.slice(0, maxShow).map((learner, index) => (
            <div 
              key={index} 
              className="w-6 h-6 rounded-full border-2 border-white bg-[#0AAC9E]/10 flex items-center justify-center overflow-hidden"
              title={learner.fullName}
            >
              {learner.profilePictureUrl ? (
                <img 
                  src={learner.profilePictureUrl} 
                  alt={learner.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-3 h-3 text-[#0AAC9E]" />
              )}
            </div>
          ))}
          {learners.length > maxShow && (
            <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center">
              <span className="text-xs font-medium text-gray-600">
                +{learners.length - maxShow}
              </span>
            </div>
          )}
        </div>
        {learners.length > 0 && (
          <span className="ml-2 text-xs text-gray-500">
            {learners.length} learner{learners.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    );
  };

  if (viewMode === "list") {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-all duration-200 group">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            {/* Course Image */}
            <div 
              className="w-12 h-12 bg-gradient-to-br from-[#0AAC9E]/10 to-[#0AAC9E]/20 rounded-lg flex items-center justify-center cursor-pointer overflow-hidden flex-shrink-0"
              onClick={() => onView(course.id)}
            >
              {course.imageUrl ? (
                <img 
                  src={course.imageUrl} 
                  alt={course.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <BookOpen className="w-5 h-5 text-[#0AAC9E]" />
              )}
            </div>
            
            {/* Course Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 
                  className="font-medium text-gray-900 truncate cursor-pointer hover:text-[#0AAC9E] transition-colors"
                  onClick={() => onView(course.id)}
                >
                  {course.name}
                </h3>
                {getStatusBadge()}
              </div>
              
              <p className="text-sm text-gray-500 line-clamp-1 mb-2">{course.description}</p>
              
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {course.duration || 60}min
                </span>
                <span className="flex items-center">
                  <Users className="w-3 h-3 mr-1" />
                  {course.topAssignedUsers?.length || 0}
                </span>
                <span className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  {formatDate(course.createdDate)}
                </span>
                {course.verifiedCertificate && (
                  <span className="flex items-center text-[#0AAC9E]">
                    <Award className="w-3 h-3 mr-1" />
                    Certificate
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="relative ml-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleDropdown(course.id);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
            >
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </button>

            {activeDropdown === course.id && (
              <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onView(course.id);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
                >
                  <Eye className="w-3 h-3" />
                  <span>View Details</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(course.id);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit Course</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(course.id);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Grid view - Following the design from the image
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-[#0AAC9E]/30 transition-all duration-300 group relative">
      {/* Status Badge - Top Left */}
      <div className="absolute top-3 left-3 z-10">
        {getStatusBadge()}
      </div>

      {/* Actions Dropdown - Top Right */}
      <div className="absolute top-3 right-3 z-10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleDropdown(course.id);
          }}
          className="p-1.5 bg-white/80 hover:bg-white rounded-lg transition-colors opacity-0 group-hover:opacity-100 shadow-sm"
        >
          <MoreVertical className="w-4 h-4 text-gray-600" />
        </button>

        {activeDropdown === course.id && (
          <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-30">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onView(course.id);
              }}
              className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 rounded-t-lg"
            >
              <Eye className="w-3 h-3" />
              <span>View Details</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(course.id);
              }}
              className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
            >
              <Edit3 className="w-3 h-3" />
              <span>Edit</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(course.id);
              }}
              className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-b-lg"
            >
              <Trash2 className="w-3 h-3" />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>

      {/* Course Image */}
      <div 
        className="h-32 bg-gradient-to-br from-[#0AAC9E]/10 to-[#0AAC9E]/20 flex items-center justify-center cursor-pointer relative overflow-hidden"
        onClick={() => onView(course.id)}
      >
        {course.imageUrl ? (
          <img 
            src={course.imageUrl} 
            alt={course.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <BookOpen className="w-10 h-10 text-[#0AAC9E]/60" />
        )}
        
        {/* Play overlay on hover */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <PlayCircle className="w-8 h-8 text-white" />
        </div>
      </div>
      
      {/* Course Content */}
      <div className="p-4">
        <div className="mb-2">
          <h3 
            className="font-medium text-gray-900 line-clamp-2 mb-1 cursor-pointer hover:text-[#0AAC9E] transition-colors text-sm leading-relaxed"
            onClick={() => onView(course.id)}
          >
            {course.name}
          </h3>
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
            {course.description}
          </p>
        </div>
        
        {/* Course Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <div className="flex items-center space-x-3">
            <span className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {course.duration || 60}min
            </span>
            <span className="flex items-center">
              <Users className="w-3 h-3 mr-1" />
              {course.topAssignedUsers?.length || 0}
            </span>
          </div>
          
          {course.verifiedCertificate && (
            <Award className="w-4 h-4 text-[#0AAC9E]" />
          )}
        </div>

        {/* Creation Date */}
        <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
          <span className="flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            {formatDate(course.createdDate)}
          </span>
          <span>by {course.createdBy || 'Unknown'}</span>
        </div>

        {/* Learners Section */}
        {course.publishCourse && course.topAssignedUsers && course.topAssignedUsers.length > 0 ? (
          <div className="pt-3 border-t border-gray-100">
            {getLearnerAvatars()}
          </div>
        ) : !course.publishCourse ? (
          <div className="pt-3 border-t border-gray-100">
            <div className="flex items-center justify-center text-xs text-gray-400">
              <Users className="w-3 h-3 mr-1" />
              <span>No learners assigned yet</span>
            </div>
          </div>
        ):null}
      </div>
    </div>
  );
};

export default CourseCard;