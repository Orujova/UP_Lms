// src/components/course/CourseCard.jsx - Clean and modern design
import React from 'react';
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
  User,
  Globe,
  ChevronRight,
  Upload,
  Video
} from 'lucide-react';

const CourseCard = ({ 
  course, 
  viewMode = "grid", 
  onEdit, 
  onView, 
  onDelete,
  onPublish,
  activeDropdown, 
  onToggleDropdown 
}) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDuration = (minutes) => {
    if (!minutes) return '0min';
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  const getLearnerAvatars = () => {
    const learners = course.topAssignedUsers || [];
    const maxShow = 3;
    
    if (learners.length === 0) {
      return (
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-sm">
            <User className="w-3.5 h-3.5 text-gray-500" />
          </div>
          <span className="text-gray-600 text-xs font-medium">No learners</span>
        </div>
      );
    }
    
    return (
      <div className="flex items-center space-x-2">
        <div className="flex -space-x-1.5">
          {learners.slice(0, maxShow).map((learner, index) => (
            <div 
              key={index} 
              className="w-7 h-7 rounded-full border-2 border-white bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden shadow-sm hover:scale-110 transition-transform duration-200"
              title={learner.fullName}
            >
              {learner.profilePictureUrl ? (
                <img 
                  src={learner.profilePictureUrl} 
                  alt={learner.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-3.5 h-3.5 text-gray-500" />
              )}
            </div>
          ))}
          {learners.length > maxShow && (
            <div className="w-7 h-7 rounded-full border-2 border-white bg-gradient-to-br from-[#0AAC9E] to-[#089a8c] flex items-center justify-center text-xs font-semibold text-white shadow-sm">
              +{learners.length - maxShow}
            </div>
          )}
        </div>
        <span className="text-gray-600 text-xs font-medium">{learners.length} learners</span>
      </div>
    );
  };

  if (viewMode === "list") {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-xl hover:bg-white hover:border-[#0AAC9E]/40 transition-all duration-300 group">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            {/* Course Image */}
            <div 
              className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center cursor-pointer overflow-hidden flex-shrink-0 relative shadow-sm hover:shadow-md transition-all duration-200"
              onClick={() => onView(course.id)}
            >
              {course.imageUrl ? (
                <img 
                  src={course.imageUrl} 
                  alt={course.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                />
              ) : (
                <BookOpen className="w-6 h-6 text-gray-500" />
              )}
            </div>
            
            {/* Course Info */}
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center space-x-3">
                <h3 
                  className="font-semibold text-gray-800 truncate cursor-pointer hover:text-[#0AAC9E] transition-colors text-lg"
                  onClick={() => onView(course.id)}
                >
                  {course.name}
                </h3>
                {course.publishCourse ? (
                  <span className="px-2.5 py-1 bg-gradient-to-r from-[#0AAC9E] to-[#089a8c] text-white text-xs font-medium rounded-full shadow-sm">
                    Published
                  </span>
                ) : (
                  <span className="px-2.5 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-medium rounded-full shadow-sm">
                    Draft
                  </span>
                )}
              </div>
              
              <p className="text-sm text-gray-600 line-clamp-1">{course.description}</p>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <BookOpen className="w-4 h-4" />
                  <span>{course.totalSection || 0} sections</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatDuration(course.duration)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(course.createdDate)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions Menu */}
          <div className="relative ml-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleDropdown(course.id);
              }}
              className="p-2.5 hover:bg-gray-100 rounded-xl transition-all duration-200"
            >
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </button>

            {activeDropdown === course.id && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onView(course.id);
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>View</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(course.id);
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                {!course.publishCourse && onPublish && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onPublish(course.id);
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-[#0AAC9E] hover:bg-[#0AAC9E]/10 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Publish</span>
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(course.id);
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Grid View - Clean and modern design
  return (
    <div className="bg-white rounded-2xl border border-gray-200 hover:shadow-2xl hover:border-[#0AAC9E]/50 transition-all duration-500 group overflow-hidden">
      {/* Course Image */}
      <div 
        className="h-52 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center cursor-pointer relative overflow-hidden"
        onClick={() => onView(course.id)}
      >
        {course.imageUrl ? (
          <img 
            src={course.imageUrl} 
            alt={course.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <BookOpen className="w-14 h-14 text-gray-400 group-hover:text-gray-500 transition-colors" />
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Status Badge */}
        <div className="absolute top-4 left-4">
          {course.publishCourse ? (
            <span className="px-3 py-1.5 bg-[#0AAC9E]/90 text-white text-xs font-semibold rounded-full shadow-lg">
              Published
            </span>
          ) : (
            <span className="px-3 py-1.5 bg-amber-500/90 text-white text-xs font-semibold rounded-full shadow-lg">
              Draft
            </span>
          )}
        </div>

        {/* Actions Button */}
        <div className="absolute top-4 right-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleDropdown(course.id);
            }}
            className="p-2 bg-white/80 hover:bg-white/90 rounded-xl transition-all duration-200 opacity-0 group-hover:opacity-100 shadow-lg"
          >
            <MoreVertical className="w-4 h-4 text-gray-600" />
          </button>

          {activeDropdown === course.id && (
            <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded-xl shadow-xl z-30 overflow-hidden">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onView(course.id);
                }}
                className="w-full flex items-center space-x-2 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(course.id);
                }}
                className="w-full flex items-center space-x-2 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
              {!course.publishCourse && onPublish && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPublish(course.id);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2.5 text-sm text-[#0AAC9E] hover:bg-[#0AAC9E]/10 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Publish</span>
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(course.id);
                }}
                className="w-full flex items-center space-x-2 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Course Content */}
      <div className="p-5 space-y-4">
        {/* Course Title */}
        <h3 
          className="font-bold text-gray-800 text-lg cursor-pointer hover:text-[#0AAC9E] transition-colors line-clamp-2 leading-tight"
          onClick={() => onView(course.id)}
        >
          {course.name || 'Course Title'}
        </h3>
        
        {/* Course Description */}
        <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
          {course.description || 'Course description not available'}
        </p>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-[#0AAC9E]/10 to-[#089a8c]/10 rounded-xl p-3 text-center border border-[#0AAC9E]/20">
            <div className="text-xl font-bold text-gray-800">{course.totalSection || 0}</div>
            <div className="text-xs text-gray-600 font-medium">Sections</div>
          </div>
          <div className="bg-gradient-to-br from-[#0AAC9E]/10 to-[#089a8c]/10 rounded-xl p-3 text-center border border-[#0AAC9E]/20">
            <div className="text-xl font-bold text-gray-800">{course.totalContent || 0}</div>
            <div className="text-xs text-gray-600 font-medium">Content</div>
          </div>
        </div>

        {/* Duration and Video Count */}
        <div className="flex justify-between items-center bg-gray-50 rounded-xl p-3">
          <div className="flex items-center space-x-2 text-gray-600">
            <Video className="w-4 h-4" />
            <span className="text-sm font-medium">{course.totalContent || 0} videos</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">{formatDuration(course.duration)}</span>
          </div>
        </div>

        {/* Category and Certificate */}
        <div className="flex justify-between items-center">
          <span className="px-3 py-1.5 bg-gradient-to-r from-[#0AAC9E] to-[#089a8c] text-white text-xs font-semibold rounded-full shadow-sm">
            {course.courseCategoryName || 'Category'}
          </span>
          {course.verifiedCertificate && (
            <div className="flex items-center space-x-1 px-3 py-1.5 bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 text-xs font-semibold rounded-full border border-amber-200/50">
              <Award className="w-3.5 h-3.5" />
              <span>Certificate</span>
            </div>
          )}
        </div>

        {/* Learners and Creator */}
        <div className="flex justify-between items-center">
          {getLearnerAvatars()}
          <div className="text-right">
            <div className="text-gray-500 text-xs">by</div>
            <div className="font-semibold text-gray-800 text-sm">{course.createdBy || 'Nuran Ruslan'}</div>
          </div>
        </div>

        {/* Footer with Date */}
        <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-gray-500">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">{formatDate(course.createdDate)}</span>
          </div>
          <button 
            onClick={() => onView(course.id)}
            className="flex items-center space-x-1 text-[#0AAC9E] hover:text-[#089a8c] transition-colors group/btn"
          >
            <span className="text-sm font-medium">View Details</span>
            <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;