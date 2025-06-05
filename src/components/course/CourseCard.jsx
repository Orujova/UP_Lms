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
  Star,
  TrendingUp
} from 'lucide-react';

const getImageUrl = (url) => {
  if (!url) return null;
  if (url.includes("https://100.42.179.27:7198/")) {
    return `https://bravoadmin.uplms.org/uploads/${url.replace(
      "https://100.42.179.27:7198/",
      ""
    )}`;
  }
  return url;
};

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
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#0AAC9E]/10 text-[#0AAC9E]">
          Published
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
        Draft
      </span>
    );
  };

  const imageUrl = getImageUrl(course.imageUrl);

  if (viewMode === "list") {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200 group">
        <div className="flex items-center space-x-4">
          <div 
            className="w-16 h-16 bg-gradient-to-br from-[#0AAC9E]/10 to-[#0AAC9E]/20 rounded-lg flex items-center justify-center cursor-pointer overflow-hidden"
            onClick={() => onView(course.id)}
          >
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt={course.name}
                className="w-full h-full object-cover rounded-lg"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <BookOpen className="w-6 h-6 text-[#0AAC9E]" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 
                  className="font-semibold text-gray-900 truncate cursor-pointer hover:text-[#0AAC9E] transition-colors"
                  onClick={() => onView(course.id)}
                >
                  {course.name}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2 mt-1">{course.description}</p>
                
                <div className="flex items-center space-x-4 mt-2">
                  {getStatusBadge()}
                  <div className="flex items-center space-x-3 text-xs text-gray-500">
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {course.duration || 60}min
                    </span>
                    <span className="flex items-center">
                      <Users className="w-3 h-3 mr-1" />
                      {course.enrollmentCount || 0}
                    </span>
                    {course.verifiedCertificate && (
                      <span className="flex items-center">
                        <Award className="w-3 h-3 mr-1" />
                        Certificate
                      </span>
                    )}
                  </div>
                </div>
              </div>

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
                  <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onView(course.id);
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
                    >
                      <Eye className="w-3 h-3" />
                      <span>View</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(course.id);
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit</span>
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
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 group">
      {/* Course Image */}
      <div 
        className="h-40 bg-gradient-to-br from-[#0AAC9E]/10 to-[#0AAC9E]/20 flex items-center justify-center cursor-pointer relative overflow-hidden"
        onClick={() => onView(course.id)}
      >
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={course.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div className="w-full h-full flex items-center justify-center">
          <BookOpen className="w-12 h-12 text-[#0AAC9E]/60" />
        </div>
        
        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <PlayCircle className="w-12 h-12 text-white" />
        </div>
        
        {/* Status badge */}
        <div className="absolute top-3 left-3">
          {getStatusBadge()}
        </div>

        {/* Actions dropdown */}
        <div className="absolute top-3 right-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleDropdown(course.id);
            }}
            className="p-1.5 bg-white/90 hover:bg-white rounded-lg transition-colors opacity-0 group-hover:opacity-100"
          >
            <MoreVertical className="w-4 h-4 text-gray-600" />
          </button>

          {activeDropdown === course.id && (
            <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onView(course.id);
                }}
                className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 rounded-t-lg"
              >
                <Eye className="w-3 h-3" />
                <span>View</span>
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
      </div>
      
      {/* Course Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 
            className="font-semibold text-gray-900 line-clamp-2 flex-1 cursor-pointer hover:text-[#0AAC9E] transition-colors text-sm"
            onClick={() => onView(course.id)}
          >
            {course.name}
          </h3>
        </div>
        
        <p className="text-xs text-gray-500 line-clamp-2 mb-3">{course.description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 text-xs text-gray-500">
            <span className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {course.duration || 60}min
            </span>
            <span className="flex items-center">
              <Users className="w-3 h-3 mr-1" />
              {course.enrollmentCount || 0}
            </span>
          </div>
          
          {course.verifiedCertificate && (
            <Award className="w-4 h-4 text-[#0AAC9E]" />
          )}
        </div>

        {/* Progress indicator for drafts */}
        {!course.publishCourse && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Draft</span>
              <span className="text-[#0AAC9E]">Continue editing →</span>
            </div>
          </div>
        )}

        {/* Learner avatars for published courses */}
        {course.publishCourse && course.topAssignedUsers && course.topAssignedUsers.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex -space-x-1">
                {course.topAssignedUsers.slice(0, 3).map((user, index) => (
                  <div key={index} className="w-6 h-6 rounded-full border-2 border-white overflow-hidden">
                    {user.profilePictureUrl ? (
                      <img 
                        src={getImageUrl(user.profilePictureUrl)} 
                        alt={user.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#0AAC9E]/20 flex items-center justify-center">
                        <span className="text-xs font-medium text-[#0AAC9E]">
                          {user.fullName?.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
                {course.topAssignedUsers.length > 3 && (
                  <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center">
                    <span className="text-xs text-gray-600">+{course.topAssignedUsers.length - 3}</span>
                  </div>
                )}
              </div>
              <span className="text-xs text-gray-500">
                {course.topAssignedUsers.length} learners
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseCard;