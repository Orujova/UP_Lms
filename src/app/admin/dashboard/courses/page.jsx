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
  Star,
  Settings,
  ChevronRight,
  Zap,
  Target,
  BarChart3
} from "lucide-react";
import { fetchCoursesAsync, deleteCourseAsync } from "@/redux/course/courseSlice";
import CourseCard from "@/components/course/CourseCard";
import LoadingSpinner from "@/components/loadingSpinner";
import DeleteConfirmationModal from "@/components/deleteModal";
import { toast } from "sonner";

const EnhancedCoursesDashboard = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, courseId: null, courseName: "" });

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

  const getCourseStats = () => {
    const published = courses.filter(c => c.publishCourse).length;
    const drafts = courses.filter(c => !c.publishCourse).length;
    const totalEnrollments = courses.reduce((sum, c) => sum + (c.enrollmentCount || 0), 0);
    const avgDuration = courses.length > 0 ? Math.round(courses.reduce((sum, c) => sum + (c.duration || 0), 0) / courses.length) : 0;
    
    return { published, drafts, totalEnrollments, avgDuration };
  };

  const stats = getCourseStats();

  if (loading && courses.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Enhanced Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-[#0AAC9E] to-[#0AAC9E]/80 rounded-xl">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Course Management</h1>
                  <p className="text-sm text-gray-500">Create and manage your learning content</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push('/admin/dashboard/courses/settings')}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Settings</span>
              </button>

              <button
                onClick={handleCreateCourse}
                className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-[#0AAC9E] to-[#0AAC9E]/90 text-white rounded-lg hover:from-[#0AAC9E]/90 hover:to-[#0AAC9E]/80 transition-all shadow-lg hover:shadow-xl text-sm font-semibold"
              >
                <Plus className="w-4 h-4" />
                <span>Create Course</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-[#0AAC9E]/10 rounded-xl">
                <BookOpen className="w-6 h-6 text-[#0AAC9E]" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Courses</p>
                <p className="text-2xl font-bold text-gray-900">{totalCourseCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Published</p>
                <p className="text-2xl font-bold text-gray-900">{stats.published}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-amber-100 rounded-xl">
                <Edit3 className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Drafts</p>
                <p className="text-2xl font-bold text-gray-900">{stats.drafts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Learners</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalEnrollments}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1 sm:w-80">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search courses..."
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0AAC9E] focus:border-[#0AAC9E] text-sm"
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0AAC9E] focus:border-[#0AAC9E] text-sm"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0AAC9E] focus:border-[#0AAC9E] text-sm"
              >
                <option value="recent">Most Recent</option>
                <option value="name">Name A-Z</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === "grid" 
                      ? "bg-white text-[#0AAC9E] shadow-sm" 
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-colors ${
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
        {error ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
            <div className="text-red-600 mb-4 flex items-center justify-center space-x-2">
              <BarChart3 className="w-8 h-8" />
              <span className="text-lg">{error}</span>
            </div>
            <button
              onClick={() => dispatch(fetchCoursesAsync())}
              className="px-6 py-3 bg-[#0AAC9E] text-white rounded-xl hover:bg-[#0AAC9E]/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : sortedCourses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-[#0AAC9E]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-10 h-10 text-[#0AAC9E]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {searchTerm ? "No courses found" : "No courses yet"}
              </h3>
              <p className="text-gray-500 mb-8">
                {searchTerm 
                  ? `No courses match "${searchTerm}". Try adjusting your search.`
                  : "Start building amazing learning experiences for your learners"
                }
              </p>
              {!searchTerm && (
                <div className="space-y-4">
                  <button
                    onClick={handleCreateCourse}
                    className="px-8 py-3 bg-gradient-to-r from-[#0AAC9E] to-[#0AAC9E]/90 text-white rounded-xl hover:from-[#0AAC9E]/90 hover:to-[#0AAC9E]/80 transition-all font-semibold shadow-lg hover:shadow-xl"
                  >
                    Create Your First Course
                  </button>
                  <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4" />
                      <span>Easy to create</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Target className="w-4 h-4" />
                      <span>Target specific groups</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Award className="w-4 h-4" />
                      <span>Award certificates</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Course Grid/List */}
            <div className={viewMode === "grid" 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
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

            {/* Pagination or Load More could go here */}
            {sortedCourses.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center shadow-sm">
                <p className="text-gray-600">
                  Showing {sortedCourses.length} of {totalCourseCount} courses
                </p>
                {totalCourseCount > sortedCourses.length && (
                  <button className="mt-4 px-6 py-2 border border-[#0AAC9E] text-[#0AAC9E] rounded-xl hover:bg-[#0AAC9E]/5 transition-colors">
                    Load More Courses
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Quick Actions Panel */}
        <div className="mt-8 bg-gradient-to-r from-[#0AAC9E]/5 to-[#0AAC9E]/10 rounded-2xl border border-[#0AAC9E]/20 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={handleCreateCourse}
              className="flex items-center space-x-3 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all text-left group"
            >
              <div className="p-2 bg-[#0AAC9E]/10 rounded-lg group-hover:bg-[#0AAC9E]/20 transition-colors">
                <Plus className="w-5 h-5 text-[#0AAC9E]" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Create New Course</h4>
                <p className="text-sm text-gray-500">Start building your next course</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#0AAC9E] transition-colors" />
            </button>

            <button
              onClick={() => router.push('/admin/dashboard/courses/settings')}
              className="flex items-center space-x-3 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all text-left group"
            >
              <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                <Settings className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Course Settings</h4>
                <p className="text-sm text-gray-500">Manage categories, tags & more</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
            </button>

            <button
              onClick={() => router.push('/admin/dashboard/analytics')}
              className="flex items-center space-x-3 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all text-left group"
            >
              <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">View Analytics</h4>
                <p className="text-sm text-gray-500">Track course performance</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
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

export default EnhancedCoursesDashboard;