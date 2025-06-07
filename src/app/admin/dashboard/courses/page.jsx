'use client'
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { 
  Plus, 
  Search, 
  Filter, 
  BookOpen, 
  TrendingUp,
  Grid,
  List,
  Settings,
  ChevronDown,
  X,
  Award,
  Clock,
  Users,
  Tag,
  Folder,
  MoreHorizontal
} from "lucide-react";
import { fetchCoursesAsync, deleteCourseAsync } from "@/redux/course/courseSlice";
import { fetchCourseCategoriesAsync } from "@/redux/courseCategory/courseCategorySlice";
import { fetchCourseTagsAsync } from "@/redux/courseTag/courseTagSlice";
import CourseCard from "@/components/course/CourseCard";
import LoadingSpinner from "@/components/loadingSpinner";
import DeleteConfirmationModal from "@/components/deleteModal";
import { toast } from "sonner";

const CourseHomepage = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  
  // State
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, courseId: null, courseName: "" });
  
  // Filters state
  const [filters, setFilters] = useState({
    search: "",
    categoryId: "",
    tagId: "",
    hasCertificate: "",
    status: "",
    sortBy: "recent"
  });

  // Redux state
  const { 
    courses = [], 
    loading = false, 
    error = null,
    totalCourseCount = 0 
  } = useSelector((state) => state.course || {});
  
  const { categories = [] } = useSelector((state) => state.courseCategory || {});
  const { tags = [] } = useSelector((state) => state.courseTag || {});

  useEffect(() => {
    dispatch(fetchCoursesAsync(buildApiParams()));
    dispatch(fetchCourseCategoriesAsync());
    dispatch(fetchCourseTagsAsync());
  }, [dispatch]);

  // Build API parameters from filters
  const buildApiParams = () => {
    const params = {};
    
    if (filters.search) params.search = filters.search;
    if (filters.categoryId) params.courseCategoryId = filters.categoryId;
    if (filters.tagId) params.tagId = filters.tagId;
    if (filters.hasCertificate !== "") params.hasCertificate = filters.hasCertificate === "true";
    if (filters.sortBy) params.orderBy = filters.sortBy;
    
    return params;
  };

  // Apply filters
  const applyFilters = () => {
    dispatch(fetchCoursesAsync(buildApiParams()));
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      applyFilters();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filters]);

  // Filter and sort courses locally
  const getFilteredCourses = () => {
    let filtered = [...courses];
    
    // Status filter
    if (filters.status === "published") {
      filtered = filtered.filter(course => course.publishCourse);
    } else if (filters.status === "draft") {
      filtered = filtered.filter(course => !course.publishCourse);
    }
    
    return filtered;
  };

  const filteredCourses = getFilteredCourses();

  // Event handlers
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
    const course = courses.find(c => c.id === courseId);
    setDeleteModal({
      isOpen: true,
      courseId,
      courseName: course?.name || "Unknown Course"
    });
    setActiveDropdown(null);
  };

  const confirmDelete = async () => {
    try {
      await dispatch(deleteCourseAsync(deleteModal.courseId)).unwrap();
      toast.success("Course deleted successfully!");
      setDeleteModal({ isOpen: false, courseId: null, courseName: "" });
    } catch (error) {
      toast.error("Failed to delete course: " + error.message);
    }
  };

  const toggleDropdown = (courseId) => {
    setActiveDropdown(activeDropdown === courseId ? null : courseId);
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      categoryId: "",
      tagId: "",
      hasCertificate: "",
      status: "",
      sortBy: "recent"
    });
  };

  const getFilterCount = () => {
    return Object.values(filters).filter(value => value !== "").length;
  };

  const getCourseStats = () => {
    const published = courses.filter(c => c.publishCourse).length;
    const drafts = courses.filter(c => !c.publishCourse).length;
    const withCertificate = courses.filter(c => c.verifiedCertificate).length;
    
    return { published, drafts, withCertificate };
  };

  const stats = getCourseStats();

  if (loading && courses.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-[#0AAC9E]/10 rounded-xl">
                  <BookOpen className="w-5 h-5 text-[#0AAC9E]" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Courses</h1>
                  <p className="text-sm text-gray-500">{totalCourseCount} total courses</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push('/admin/dashboard/courses/settings')}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Settings</span>
              </button>

              <button
                onClick={handleCreateCourse}
                className="flex items-center space-x-2 px-4 py-2 bg-[#0AAC9E] text-white rounded-lg hover:bg-[#0AAC9E]/90 transition-colors text-sm font-medium shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Create Course</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-[#0AAC9E]/10 rounded-lg">
                <BookOpen className="w-5 h-5 text-[#0AAC9E]" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Courses</p>
                <p className="text-xl font-bold text-gray-900">{totalCourseCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Published</p>
                <p className="text-xl font-bold text-gray-900">{stats.published}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Drafts</p>
                <p className="text-xl font-bold text-gray-900">{stats.drafts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Award className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">With Certificate</p>
                <p className="text-xl font-bold text-gray-900">{stats.withCertificate}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  placeholder="Search courses..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0AAC9E] focus:border-[#0AAC9E] text-sm"
                />
                {filters.search && (
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, search: "" }))}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-3 py-2 border rounded-lg transition-colors text-sm ${
                  showFilters || getFilterCount() > 0
                    ? 'border-[#0AAC9E] bg-[#0AAC9E]/5 text-[#0AAC9E]'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                {getFilterCount() > 0 && (
                  <span className="bg-[#0AAC9E] text-white text-xs px-1.5 py-0.5 rounded-full min-w-[1.25rem] h-5 flex items-center justify-center">
                    {getFilterCount()}
                  </span>
                )}
                <ChevronDown className={`w-4 h-4 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* View Controls */}
            <div className="flex items-center space-x-3">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "grid" 
                      ? "bg-white text-[#0AAC9E] shadow-sm" 
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "list" 
                      ? "bg-white text-[#0AAC9E] shadow-sm" 
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
              
              <span className="text-sm text-gray-500">
                {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <div className="relative">
                    <Folder className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <select
                      value={filters.categoryId}
                      onChange={(e) => setFilters(prev => ({ ...prev, categoryId: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0AAC9E] focus:border-[#0AAC9E] text-sm"
                    >
                      <option value="">All Categories</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Tag Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tag</label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <select
                      value={filters.tagId}
                      onChange={(e) => setFilters(prev => ({ ...prev, tagId: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0AAC9E] focus:border-[#0AAC9E] text-sm"
                    >
                      <option value="">All Tags</option>
                      {tags.map((tag) => (
                        <option key={tag.id} value={tag.id}>
                          {tag.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Certificate Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Certificate</label>
                  <div className="relative">
                    <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <select
                      value={filters.hasCertificate}
                      onChange={(e) => setFilters(prev => ({ ...prev, hasCertificate: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0AAC9E] focus:border-[#0AAC9E] text-sm"
                    >
                      <option value="">All Courses</option>
                      <option value="true">With Certificate</option>
                      <option value="false">No Certificate</option>
                    </select>
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0AAC9E] focus:border-[#0AAC9E] text-sm"
                  >
                    <option value="">All Status</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              {/* Filter Actions */}
              <div className="flex items-center justify-between mt-4">
                <button
                  onClick={resetFilters}
                  className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Clear all filters
                </button>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>Sort by:</span>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                    className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-[#0AAC9E] focus:border-[#0AAC9E]"
                  >
                    <option value="recent">Most Recent</option>
                    <option value="name">Name A-Z</option>
                    <option value="duration">Duration</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Course Content */}
        {error ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="text-red-600 mb-4">{error}</div>
            <button
              onClick={() => dispatch(fetchCoursesAsync())}
              className="px-4 py-2 bg-[#0AAC9E] text-white rounded-lg hover:bg-[#0AAC9E]/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-[#0AAC9E]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-[#0AAC9E]" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {getFilterCount() > 0 ? "No courses found" : "No courses yet"}
              </h3>
              <p className="text-gray-500 mb-6">
                {getFilterCount() > 0 
                  ? "Try adjusting your filters or search terms"
                  : "Create your first course to get started"
                }
              </p>
              {getFilterCount() > 0 ? (
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear Filters
                </button>
              ) : (
                <button
                  onClick={handleCreateCourse}
                  className="px-4 py-2 bg-[#0AAC9E] text-white rounded-lg hover:bg-[#0AAC9E]/90 transition-colors"
                >
                  Create Your First Course
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className={viewMode === "grid" 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
            : "space-y-4"
          }>
            {filteredCourses.map((course) => (
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
      </div>

      {/* Delete Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, courseId: null, courseName: "" })}
        onConfirm={confirmDelete}
        item={`course "${deleteModal.courseName}"`}
      />

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

export default CourseHomepage;