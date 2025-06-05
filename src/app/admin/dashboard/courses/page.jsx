'use client'
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { 
  Plus, 
  Search, 
  Filter, 
  BookOpen, 
  Users, 
  Clock, 
  Award,
  Eye,
  Edit3,
  Trash2,
  MoreVertical,
  Grid,
  List,
  TrendingUp,
  Star
} from "lucide-react";
import { fetchCoursesAsync } from "@/redux/course/courseSlice";
import { toast } from "sonner";

const CoursesDashboardPage = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [activeDropdown, setActiveDropdown] = useState(null);

  const { 
    courses = [], 
    loading = false, 
    error = null,
    totalCourseCount = 0 
  } = useSelector((state) => state.course || {});

  useEffect(() => {
    dispatch(fetchCoursesAsync());
  }, [dispatch]);

  // Filter and search courses
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "published" && course.publishCourse) ||
                         (filterStatus === "draft" && !course.publishCourse);
    
    return matchesSearch && matchesStatus;
  });

  // Sort courses
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "recent":
        return new Date(b.createdDate || 0) - new Date(a.createdDate || 0);
      case "popular":
        return (b.enrollmentCount || 0) - (a.enrollmentCount || 0);
      default:
        return 0;
    }
  });

const handleCreateCourse = () => {
  router.push("/admin/dashboard/courses/add");
};

  const handleEditCourse = (courseId) => {
    router.push(`/admin/dashboard/courses/edit/${courseId}`);
    setActiveDropdown(null);
  };

  const handleViewCourse = (courseId) => {
    router.push(`/admin/dashboard/courses/${courseId}`);
    setActiveDropdown(null);
  };

  const handleDeleteCourse = (courseId) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      // Implement delete functionality
      toast.success("Course deleted successfully!");
    }
    setActiveDropdown(null);
  };

  const toggleDropdown = (courseId) => {
    setActiveDropdown(activeDropdown === courseId ? null : courseId);
  };

  const getStatusBadge = (course) => {
    if (course.publishCourse) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#0AAC9E]/10 text-[#0AAC9E]">
          Published
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
        Draft
      </span>
    );
  };

  const getCourseStats = () => {
    const published = courses.filter(c => c.publishCourse).length;
    const drafts = courses.filter(c => !c.publishCourse).length;
    const totalEnrollments = courses.reduce((sum, c) => sum + (c.enrollmentCount || 0), 0);
    
    return { published, drafts, totalEnrollments };
  };

  const stats = getCourseStats();

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage and organize your course content
            </p>
          </div>
          <button
            onClick={handleCreateCourse}
            className="flex items-center space-x-2 px-4 py-2 bg-[#0AAC9E] text-white rounded-lg hover:bg-[#0AAC9E]/90 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create Course</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#0AAC9E]/10 rounded-lg">
              <BookOpen className="w-5 h-5 text-[#0AAC9E]" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Courses</p>
              <p className="text-lg font-bold text-gray-900">{totalCourseCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Published</p>
              <p className="text-lg font-bold text-gray-900">{stats.published}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Edit3 className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Drafts</p>
              <p className="text-lg font-bold text-gray-900">{stats.drafts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Enrollments</p>
              <p className="text-lg font-bold text-gray-900">{stats.totalEnrollments}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search courses..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0AAC9E] focus:border-[#0AAC9E] text-sm w-64"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0AAC9E] focus:border-[#0AAC9E] text-sm"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0AAC9E] focus:border-[#0AAC9E] text-sm"
            >
              <option value="recent">Most Recent</option>
              <option value="name">Name A-Z</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded transition-colors ${
                  viewMode === "grid" 
                    ? "bg-white text-[#0AAC9E] shadow-sm" 
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded transition-colors ${
                  viewMode === "list" 
                    ? "bg-white text-[#0AAC9E] shadow-sm" 
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            
            <span className="text-sm text-gray-500">
              {sortedCourses.length} of {totalCourseCount} courses
            </span>
          </div>
        </div>
      </div>

      {/* Courses Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0AAC9E]"></div>
          <span className="ml-3 text-gray-600">Loading courses...</span>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">{error}</div>
          <button
            onClick={() => dispatch(fetchCoursesAsync())}
            className="px-4 py-2 bg-[#0AAC9E] text-white rounded-lg hover:bg-[#0AAC9E]/90"
          >
            Retry
          </button>
        </div>
      ) : sortedCourses.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? "No courses found" : "No courses yet"}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm 
              ? `No courses match "${searchTerm}"`
              : "Create your first course to get started with teaching"
            }
          </p>
          {!searchTerm && (
            <button
              onClick={handleCreateCourse}
              className="px-6 py-2 bg-[#0AAC9E] text-white rounded-lg hover:bg-[#0AAC9E]/90 transition-colors"
            >
              Create Your First Course
            </button>
          )}
        </div>
      ) : (
        <div className={viewMode === "grid" 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
          : "space-y-4"
        }>
          {sortedCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              viewMode={viewMode}
              onEdit={() => handleEditCourse(course.id)}
              onView={() => handleViewCourse(course.id)}
              onDelete={() => handleDeleteCourse(course.id)}
              activeDropdown={activeDropdown}
              onToggleDropdown={() => toggleDropdown(course.id)}
            />
          ))}
        </div>
      )}

      {/* Click outside to close dropdown */}
      {activeDropdown && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setActiveDropdown(null)}
        />
      )}
    </div>
  );
};

// Course Card Component - mövcud kodunuzda bu hissəni tapıb əvəz edin
const CourseCard = ({ 
  course, 
  viewMode, 
  onEdit, 
  onView, 
  onDelete, 
  activeDropdown, 
  onToggleDropdown 
}) => {
  const getStatusBadge = (course) => {
    if (course.publishCourse) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Published
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        Draft
      </span>
    );
  };

  if (viewMode === "list") {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center space-x-4 flex-1 cursor-pointer"
            onClick={() => onView(course.id)}
          >
            <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center">
              {course.coverImage ? (
                <img 
                  src={course.coverImage} 
                  alt={course.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <BookOpen className="w-6 h-6 text-blue-600" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 truncate">{course.name}</h3>
              <p className="text-sm text-gray-500 truncate">{course.description}</p>
              <div className="flex items-center space-x-4 mt-2">
                {getStatusBadge(course)}
                <span className="text-xs text-gray-500 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {course.duration || 60}min
                </span>
                <span className="text-xs text-gray-500 flex items-center">
                  <Users className="w-3 h-3 mr-1" />
                  {course.enrollmentCount || 0} enrolled
                </span>
              </div>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleDropdown(course.id);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
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
    );
  }

  // Grid view
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow group">
      {/* Course Image */}
      <div 
        className="h-40 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center cursor-pointer relative"
        onClick={() => onView(course.id)}
      >
        {course.coverImage ? (
          <img 
            src={course.coverImage} 
            alt={course.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <BookOpen className="w-12 h-12 text-blue-500" />
        )}
        
        {/* Status badge */}
        <div className="absolute top-3 left-3">
          {getStatusBadge(course)}
        </div>
      </div>
      
      {/* Course Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 
            className="font-medium text-gray-900 line-clamp-2 flex-1 cursor-pointer"
            onClick={() => onView(course.id)}
          >
            {course.name}
          </h3>
          
          <div className="relative ml-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleDropdown(course.id);
              }}
              className="p-1 hover:bg-gray-100 rounded transition-colors opacity-0 group-hover:opacity-100"
            >
              <MoreVertical className="w-4 h-4 text-gray-400" />
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
        
        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{course.description}</p>
        
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
        </div>
      </div>
    </div>
  );
};

export default CoursesDashboardPage;