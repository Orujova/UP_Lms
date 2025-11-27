import React, { useRef, useEffect } from 'react';
import { 
  Clock, 
  Users, 
  BookOpen, 
  Award, 
  Edit3, 
  Eye, 
  Trash2,
  MoreVertical,
  Calendar,
  User,
  ChevronRight,
  Upload,
  Video,
  Star,
  TrendingUp,
  CheckCircle,
  FileText,
  Sparkles
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
  const dropdownRef = useRef(null);

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
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center shadow-sm border border-slate-200">
            <User className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <span className="text-slate-500 text-xs font-medium">No learners yet</span>
        </div>
      );
    }
    
    return (
      <div className="flex items-center space-x-2">
        <div className="flex -space-x-2">
          {learners.slice(0, maxShow).map((learner, index) => (
            <div 
              key={index} 
              className="w-7 h-7 rounded-full border-2 border-white bg-gradient-to-br from-[#01DBC8] to-[#0AAC9E] flex items-center justify-center overflow-hidden shadow-md hover:scale-110 hover:z-10 transition-all duration-200 relative ring-1 ring-[#01DBC8]/20"
              title={learner.fullName}
            >
              {learner.profilePictureUrl ? (
                <img 
                  src={learner.profilePictureUrl} 
                  alt={learner.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-3.5 h-3.5 text-white" />
              )}
            </div>
          ))}
          {learners.length > maxShow && (
            <div className="w-7 h-7 rounded-full border-2 border-white bg-gradient-to-br from-[#01DBC8] to-[#0AAC9E] flex items-center justify-center text-xs font-bold text-white shadow-md ring-1 ring-[#01DBC8]/20">
              +{learners.length - maxShow}
            </div>
          )}
        </div>
        <span className="text-slate-600 text-xs font-semibold">{learners.length} {learners.length === 1 ? 'Learner' : 'Learners'}</span>
      </div>
    );
  };

  const handleDropdownClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (onToggleDropdown) {
      onToggleDropdown(activeDropdown === course.id ? null : course.id);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        if (activeDropdown === course.id && onToggleDropdown) {
          onToggleDropdown(null);
        }
      }
    };

    if (activeDropdown === course.id) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [activeDropdown, course.id, onToggleDropdown]);

  const isPromoted = course.isPromoted || course.isPromotedCourse || false;

  const DropdownMenu = () => {
    const handleMenuClick = (action) => {
      if (onToggleDropdown) {
        onToggleDropdown(null);
      }
      
      if (action && typeof action === 'function') {
        setTimeout(() => action(course.id), 10);
      }
    };

    return (
      <div 
        className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-2xl z-[100] overflow-hidden backdrop-blur-sm"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
            handleMenuClick(onView);
          }}
          className="w-full flex items-center space-x-3 px-4 py-2 text-xs text-slate-700 hover:bg-gradient-to-r hover:from-[#01DBC8]/5 hover:to-[#0AAC9E]/5 transition-all text-left font-medium"
        >
          <Eye className="w-4 h-5 text-[#0AAC9E]" />
          <span>View Details</span>
        </button>
        <button
          onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
            handleMenuClick(onEdit);
          }}
          className="w-full flex items-center space-x-3 px-4 py-2 text-xs text-slate-700 hover:bg-gradient-to-r hover:from-[#01DBC8]/5 hover:to-[#0AAC9E]/5 transition-all text-left font-medium"
        >
          <Edit3 className="w-4 h-5 text-[#0AAC9E]" />
          <span>Edit Course</span>
        </button>
        {!course.publishCourse && onPublish && (
          <button
            onMouseDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handleMenuClick(onPublish);
            }}
            className="w-full flex items-center space-x-3 px-4 py-2 text-xs text-[#01DBC8] hover:bg-gradient-to-r hover:from-[#01DBC8]/10 hover:to-[#0AAC9E]/10 transition-all text-left font-medium"
          >
            <Upload className="w-4 h-5" />
            <span>Publish Now</span>
          </button>
        )}
        <div className="border-t border-slate-100"></div>
        <button
          onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
            handleMenuClick(onDelete);
          }}
          className="w-full flex items-center space-x-3 px-4 py-2 text-xs text-red-500 hover:bg-red-50 transition-all text-left font-medium"
        >
          <Trash2 className="w-4 h-5" />
          <span>Delete</span>
        </button>
      </div>
    );
  };

  if (viewMode === "list") {
    return (
      <div className={`bg-white border rounded-2xl p-4 hover:shadow-2xl transition-all duration-500 group relative n ${
        isPromoted 
          ? 'border-indigo-200/50 bg-gradient-to-r from-indigo-50/40 via-white to-white shadow-lg shadow-indigo-100/20' 
          : 'border-slate-200 hover:border-[#01DBC8]/40 hover:shadow-[#01DBC8]/10'
      }`}>
        {isPromoted && (
          <div className="absolute top-4 right-20 z-10">
            <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-purple-100 text-purple-500 text-xs font-medium rounded-full shadow-lg">
              <Star className="w-3.5 h-3.5 fill-white" />
              <span>FEATURED</span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-5 flex-1">
            <div 
              className="w-20 h-20 bg-gradient-to-br from-[#01DBC8]/20 to-[#0AAC9E]/20 rounded-2xl flex items-center justify-center cursor-pointer overflow-hidden flex-shrink-0 relative shadow-lg hover:shadow-xl hover:shadow-[#01DBC8]/20 transition-all duration-300 group/image border border-[#01DBC8]/10"
              onClick={() => onView && onView(course.id)}
            >
              {course.imageUrl ? (
                <img 
                  src={course.imageUrl} 
                  alt={course.name}
                  className="w-full h-full object-cover group-hover/image:scale-110 transition-transform duration-500"
                />
              ) : (
                <BookOpen className="w-8 h-8 text-[#0AAC9E] group-hover/image:text-[#01DBC8] transition-colors" />
              )}
              
              <div className="absolute inset-0 bg-gradient-to-br from-[#01DBC8]/30 to-[#0AAC9E]/30 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300"></div>
            </div>
            
            <div className="flex-1 min-w-0 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <h3 
                    className="font-semibold text-slate-800 text-base  truncate cursor-pointer hover:text-[#0AAC9E] transition-colors "
                    onClick={() => onView && onView(course.id)}
                  >
                    {course.name}
                  </h3>
                  
                  <div className="flex items-center space-x-2 flex-wrap gap-2">
                    {course.publishCourse ? (
                      <span className="px-3 py-1.5 bg-gradient-to-r from-[#01a89a] to-[#0AAC9E] text-white text-xs font-normal rounded-full shadow-md flex items-center space-x-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>PUBLISHED</span>
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-gradient-to-r from-slate-400 to-slate-500 text-white text-xs font-normal rounded-full shadow-md flex items-center space-x-1">
                        <FileText className="w-3.5 h-3.5" />
                        <span>DRAFT</span>
                      </span>
                    )}
                    
                  {course.verifiedCertificate && (
  <span className="px-3 py-1 bg-sky-100 text-sky-700 text-xs font-medium rounded-full shadow-sm flex items-center space-x-1">
    <Award className="w-3.5 h-3.5 text-sky-500" />
    <span>CERTIFIED</span>
  </span>
)}


                  </div>
                </div>
              </div>
              
              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{course.description}</p>
              
              <div className="flex items-center space-x-5 text-xs text-slate-500">
                <div className="flex items-center space-x-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg">
                  <BookOpen className="w-3.5 h-3.5 text-[#0AAC9E]" />
                  <span className="font-semibold text-slate-700">{course.totalSection || 0} Sections</span>
                </div>
                <div className="flex items-center space-x-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg">
                  <Video className="w-3.5 h-3.5 text-[#0AAC9E]" />
                  <span className="font-semibold text-slate-700">{course.totalContent || 0} Lessons</span>
                </div>
                <div className="flex items-center space-x-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg">
                  <Clock className="w-3.5 h-3.5 text-[#0AAC9E]" />
                  <span className="font-semibold text-slate-700">{formatDuration(course.duration)}</span>
                </div>
                <div className="flex items-center space-x-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg">
                  <Calendar className="w-3.5 h-3.5 text-[#0AAC9E]" />
                  <span className="font-semibold text-slate-700">{formatDate(course.createdDate)}</span>
                </div>
              </div>

              <div className="pt-1">
                {getLearnerAvatars()}
              </div>
            </div>
          </div>

          <div className="relative ml-6" ref={dropdownRef}>
            <button
              onClick={handleDropdownClick}
              className="p-2 hover:bg-gradient-to-br hover:from-[#01DBC8]/10 hover:to-[#0AAC9E]/10 rounded-xl transition-all duration-200 group/btn border border-transparent hover:border-[#01DBC8]/20"
              type="button"
            >
              <MoreVertical className="w-4 h-5 text-slate-400 group-hover/btn:text-[#0AAC9E]" />
            </button>

            {activeDropdown === course.id && <DropdownMenu />}
          </div>
        </div>
      </div>
    );
  }

  // Grid View
  return (
    <div className={`bg-white rounded-2xl border hover:shadow-2xl transition-all duration-500 group overflow-hidden relative ${
      isPromoted 
        ? 'border-indigo-200/50 shadow-xl shadow-indigo-100/30' 
        : 'border-slate-200 hover:border-[#01DBC8]/50 hover:shadow-[#01DBC8]/15'
    }`}>
      <div 
        className="h-52 bg-gradient-to-br from-[#01DBC8]/10 to-[#0AAC9E]/10 flex items-center justify-center cursor-pointer relative overflow-hidden group/image"
        onClick={() => onView && onView(course.id)}
      >
        {course.imageUrl ? (
          <img 
            src={course.imageUrl} 
            alt={course.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover/image:scale-110"
          />
        ) : (
          <BookOpen className="w-16 h-16 text-[#0AAC9E]/40 group-hover/image:text-[#01DBC8] transition-colors duration-300" />
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-300" />

        <div className="absolute top-4 left-4 flex flex-col space-y-2">
          {isPromoted && (
            <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-purple-100 text-purple-500 text-xs font-medium  rounded-full shadow-xl backdrop-blur-md">
              <Star className="w-3.5 h-3.5 fill-white" />
              <span>FEATURED</span>
            </div>
          )}
          
          {course.publishCourse ? (
            <span className="px-3 py-1.5 bg-gradient-to-r from-[#01a89a] to-[#0AAC9E] text-white text-xs font-medium rounded-full shadow-xl backdrop-blur-md flex items-center space-x-1">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>PUBLISHED</span>
            </span>
          ) : (
            <span className="px-3 py-1.5 bg-gradient-to-r from-slate-400 to-slate-500 text-white text-xs font-medium rounded-full shadow-xl backdrop-blur-md flex items-center space-x-1">
              <FileText className="w-3.5 h-3.5" />
              <span>DRAFT</span>
            </span>
          )}
        </div>

        <div className="absolute top-4 right-4" ref={dropdownRef}>
          <button
            onClick={handleDropdownClick}
            className="p-2 bg-white/95 hover:bg-white rounded-xl transition-all duration-200 opacity-0 group-hover/image:opacity-100 shadow-xl backdrop-blur-md hover:scale-110 border border-slate-100"
            type="button"
          >
            <MoreVertical className="w-3.5 h-4 text-slate-600" />
          </button>

          {activeDropdown === course.id && <DropdownMenu />}
        </div>
      </div>
      
      <div className="p-6 space-y-4">
        <div className="space-y-3">
          <h3 
            className="font-semibold text-slate-800 text-base  cursor-pointer hover:text-[#01a89a] transition-colors line-clamp-2 leading-tight "
            onClick={() => onView && onView(course.id)}
          >
            {course.name || 'Course Title'}
          </h3>
          
          <div className="flex items-center space-x-2 flex-wrap gap-2">
            <span className="px-3 py-1.5 bg-gradient-to-r from-[#3bb4a9] to-[#0AAC9E] text-white text-xs font-bold rounded-full shadow-md">
              {course.courseCategoryName || 'Category'}
            </span>
            {course.verifiedCertificate && (
              <div className="flex items-center space-x-1 px-3 py-1.5 bg-sky-100 text-sky-700 text-xs font-bold rounded-full  ">
                <Award className="w-3.5 h-3.5" />
                <span>CERTIFIED</span>
              </div>
            )}
          </div>
        </div>
        
        <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed ">
          {course.description || 'Course description not available'}
        </p>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-[#01DBC8]/10 to-[#0AAC9E]/10 rounded-xl px-3 py-2 border border-[#01DBC8]/20 hover:shadow-md hover:shadow-[#01DBC8]/10 transition-all">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#0AAC9E]" />
              <div className='flex gap-4 items-center justify-center'>
                <div className="text-base font-bold text-slate-800">{course.totalSection || 0}</div>
                <div className="text-xs text-slate-600 font-semibold">Sections</div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-[#01DBC8]/10 to-[#0AAC9E]/10 rounded-xl px-3 py-2 border border-[#01DBC8]/20 hover:shadow-md hover:shadow-[#01DBC8]/10 transition-all">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-[#0AAC9E]" />
              <div className='flex gap-4 items-center justify-center'>
                <div className="text-base font-bold text-slate-800">{course.totalContent || 0}</div>
                <div className="text-xs text-slate-600 font-semibold">Lessons</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl px-4 py-2 space-y-2 border border-slate-200/50">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-1.5 text-slate-600">
              <Clock className="w-3.5 h-4 text-[#0AAC9E]" />
              <span className="text-xs font-medium">{formatDuration(course.duration)}</span>
            </div>
            <div className="flex items-center space-x-1.5 text-slate-600">
              <TrendingUp className="w-3.5 h-4 text-[#0AAC9E]" />
              <span className="text-xs font-medium">{course.courseProgress || 0}% Complete</span>
            </div>
          </div>
        </div>

        <div className="pt-2">
          {getLearnerAvatars()}
        </div>

        <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-slate-500">
            <Calendar className="w-4 h-4 text-[#0AAC9E]" />
            <span className="text-xs font-semibold">{formatDate(course.createdDate)}</span>
          </div>
          <button 
            onClick={() => onView && onView(course.id)}
            className="flex items-center space-x-1.5 text-white bg-gradient-to-r from-[#01DBC8] to-[#0AAC9E] hover:from-[#01DBC8]/90 hover:to-[#0AAC9E]/90 transition-all group/btn px-4 py-2 rounded-xl shadow-md hover:shadow-lg hover:shadow-[#01DBC8]/30 font-semibold"
            type="button"
          >
            <span className="text-xs">View Course</span>
            <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;