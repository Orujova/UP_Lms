'use client'
import React, { useEffect, useState, useRef } from "react";
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
  MoreHorizontal,
  SlidersHorizontal,
  RefreshCw,
  Star,
  Calendar,
  Target
} from "lucide-react";
import { fetchCoursesAsync, deleteCourseAsync, publishCourseAsync } from "@/redux/course/courseSlice";
import { fetchCourseCategoriesAsync } from "@/redux/courseCategory/courseCategorySlice";
import { fetchCourseTagsAsync } from "@/redux/courseTag/courseTagSlice";
import CourseCard from "@/components/course/CourseCard";
import LoadingSpinner from "@/components/loadingSpinner";
import DeleteConfirmationModal from "@/components/deleteModal";
import { toast } from "sonner";

// Enhanced Searchable Select Component with outside click handling
const SearchableSelect = ({ 
  options = [], 
  value, 
  onChange, 
  placeholder, 
  icon: Icon,
  emptyMessage = "No options found"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  const filteredOptions = options.filter(option => 
    option.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find(option => option.id.toString() === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        className="w-full pl-9 pr-8 py-2 border border-gray-300 rounded-lg focus-within:border-[#0AAC9E] cursor-pointer bg-white text-sm flex items-center justify-between hover:border-gray-400 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        {Icon && <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />}
        <span className={selectedOption ? "text-gray-900" : "text-gray-500"}>
          {selectedOption ? selectedOption.name : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-hidden">
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Search ${placeholder.toLowerCase()}...`}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-md text-sm outline-none focus:border-[#0AAC9E]"
                autoFocus
              />
            </div>
          </div>
          
          <div className="max-h-40 overflow-y-auto">
            <button
              onClick={() => {
                onChange("");
                setIsOpen(false);
                setSearchTerm("");
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700 border-b border-gray-50"
            >
              All {placeholder}
            </button>
            
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => {
                    onChange(option.id.toString());
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-50 text-sm transition-colors ${
                    value === option.id.toString() ? 'bg-[#0AAC9E]/10 text-[#0AAC9E] font-medium' : 'text-gray-700'
                  }`}
                >
                  {option.name}
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                {emptyMessage}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const CourseHomepage = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  
  // State
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, courseId: null, courseName: "" });
  
  // FIXED: Enhanced Filters state with proper sorting values
  const [filters, setFilters] = useState({
    search: "",
    categoryId: "",
    tagId: "",
    hasCertificate: "",
    isPromoted: "",
    status: "",
    sortBy: "datedesc", // FIXED: Use backend compatible value
    minDuration: "",
    maxDuration: ""
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

  // FIXED: Build API parameters with proper sorting
  const buildApiParams = () => {
    const params = {};
    
    if (filters.search) params.search = filters.search;
    if (filters.categoryId) {
      const category = categories.find(c => c.id.toString() === filters.categoryId);
      if (category) params.courseCategoryName = category.name;
    }
    if (filters.tagId) params.tagId = parseInt(filters.tagId);
    if (filters.hasCertificate !== "") params.hasCertificate = filters.hasCertificate === "true";
    if (filters.isPromoted !== "") params.isPromoted = filters.isPromoted === "true";
    if (filters.minDuration) params.minDuration = parseInt(filters.minDuration);
    if (filters.maxDuration) params.maxDuration = parseInt(filters.maxDuration);
    
    // FIXED: Direct mapping to backend values
    params.orderBy = filters.sortBy || "datedesc";
    
    console.log('Built API params:', params);
    return params;
  };

  // Apply filters with debouncing
  const applyFilters = () => {
    dispatch(fetchCoursesAsync(buildApiParams()));
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      applyFilters();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filters, categories]); // Added categories dependency

  // Filter courses locally for status (since API doesn't support it)
  const getFilteredCourses = () => {
    let filtered = [...courses];
    
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

const handlePublishCourse = async (courseId) => {
  try {
    await dispatch(publishCourseAsync(courseId)).unwrap();
    toast.success("Course published successfully!");
    setActiveDropdown(null);
  } catch (error) {
    toast.error("Failed to publish course: " + error.message);
  }
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
      isPromoted: "",
      status: "",
      sortBy: "datedesc", // FIXED
      minDuration: "",
      maxDuration: ""
    });
  };

  const getFilterCount = () => {
    return Object.entries(filters).filter(([key, value]) => 
      value !== "" && key !== "sortBy"
    ).length;
  };

  // Enhanced course stats
  const getCourseStats = () => {
    const published = courses.filter(c => c.publishCourse).length;
    const drafts = courses.filter(c => !c.publishCourse).length;
    const withCertificate = courses.filter(c => c.verifiedCertificate).length;
    const promoted = courses.filter(c => c.isPromoted || c.isPromotedCourse).length;
    
    return { published, drafts, withCertificate, promoted };
  };

  const stats = getCourseStats();

  const handleRefresh = () => {
    dispatch(fetchCoursesAsync(buildApiParams()));
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setActiveDropdown(null);
    };

    if (activeDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [activeDropdown]);

  if (loading && courses.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pt-14">
      {/* Header - Reduced font sizes */}
      <div className="bg-white border-b rounded-lg border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="px-5 py-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-[#0AAC9E]/10 to-[#089a8c]/10 rounded-lg">
                  <BookOpen className="w-5 h-5 text-[#0AAC9E]" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Course Management</h1>
                  <p className="text-xs text-gray-500">{totalCourseCount} total courses available</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              

              <button
                onClick={() => router.push('/admin/dashboard/courses/settings')}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 text-xs"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Settings</span>
              </button>

              <button
                onClick={handleCreateCourse}
                className="flex items-center space-x-2 px-5 py-2 bg-gradient-to-r from-[#0AAC9E] to-[#089a8c] text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200 text-xs font-medium"
              >
                <Plus className="w-4 h-4" />
                <span>Create Course</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className=" py-5">
        {/* Stats Cards - Reduced sizes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-[#0AAC9E]/30 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Total Courses</p>
                <p className="text-2xl font-bold text-gray-900">{totalCourseCount}</p>
              </div>
              <div className="p-2 bg-gradient-to-br from-[#0AAC9E]/10 to-[#089a8c]/10 rounded-lg">
                <BookOpen className="w-5 h-5 text-[#0AAC9E]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-green-400/30 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Published</p>
                <p className="text-2xl font-bold text-gray-900">{stats.published}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-amber-400/30 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Promoted</p>
                <p className="text-2xl font-bold text-gray-900">{stats.promoted}</p>
              </div>
              <div className="p-2 bg-amber-100 rounded-lg">
                <Star className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-blue-400/30 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Certificates</p>
                <p className="text-2xl font-bold text-gray-900">{stats.withCertificate}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Award className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search Panel - Reduced sizes */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
          <div className="p-5">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex items-center space-x-3 flex-1">
                {/* Search - Smaller */}
                <div className="relative flex-1 ">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    placeholder="Search courses..."
                    className="w-full pl-9 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0AAC9E]/20 focus:border-[#0AAC9E] text-xs transition-all duration-200"
                  />
                  {filters.search && (
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, search: "" }))}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Filter Toggle - Smaller */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-all duration-200 text-xs font-medium ${
                    showFilters || getFilterCount() > 0
                      ? 'border-[#0AAC9E] bg-gradient-to-r from-[#0AAC9E]/10 to-[#089a8c]/10 text-[#0AAC9E] shadow-sm'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                  }`}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Filters</span>
                  {getFilterCount() > 0 && (
                    <span className="bg-[#0AAC9E] text-white text-xs px-1.5 py-0.5 rounded-full min-w-[1.25rem] h-5 flex items-center justify-center font-bold">
                      {getFilterCount()}
                    </span>
                  )}
                  <ChevronDown className={`w-4 h-4 transform transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Controls - Smaller */}
              <div className="flex items-center ml-2 space-x-3">
                {/* FIXED: Sort Dropdown */}
                <div className="flex items-center space-x-2 text-xs">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600 font-medium">Sort:</span>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                    className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs focus:ring-2 focus:ring-[#0AAC9E]/20 focus:border-[#0AAC9E] outline-none bg-white min-w-[120px]"
                  >
                    <option value="datedesc">Newest First</option>
                    <option value="dateasc">Oldest First</option>
                    <option value="nameasc">Name A-Z</option>
                    <option value="namedesc">Name Z-A</option>
                    <option value="durationasc">Shortest</option>
                    <option value="durationdesc">Longest</option>
                  </select>
                </div>

                {/* View Mode Toggle - Smaller */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      viewMode === "grid" 
                        ? "bg-white text-[#0AAC9E] shadow-sm transform scale-105" 
                        : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      viewMode === "list" 
                        ? "bg-white text-[#0AAC9E] shadow-sm transform scale-105" 
                        : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
                
                
              </div>
            </div>

            {/* Expanded Filters Panel - Reduced sizes */}
            {showFilters && (
              <div className="mt-5 pt-5 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                  {/* Category Filter with Search */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">Category</label>
                    <SearchableSelect
                      options={categories}
                      value={filters.categoryId}
                      onChange={(value) => setFilters(prev => ({ ...prev, categoryId: value }))}
                      placeholder="All Categories"
                      icon={Folder}
                      emptyMessage="No categories found"
                    />
                  </div>

                  {/* Tag Filter with Search */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">Tag</label>
                    <SearchableSelect
                      options={tags}
                      value={filters.tagId}
                      onChange={(value) => setFilters(prev => ({ ...prev, tagId: value }))}
                      placeholder="All Tags"
                      icon={Tag}
                      emptyMessage="No tags found"
                    />
                  </div>

                  {/* Certificate Filter */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">Certificate</label>
                    <div className="relative">
                      <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <select
                        value={filters.hasCertificate}
                        onChange={(e) => setFilters(prev => ({ ...prev, hasCertificate: e.target.value }))}
                        className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0AAC9E]/20 focus:border-[#0AAC9E] text-xs outline-none"
                      >
                        <option value="">All Courses</option>
                        <option value="true">With Certificate</option>
                        <option value="false">No Certificate</option>
                      </select>
                    </div>
                  </div>

                  {/* Promoted Filter */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">Promotion Status</label>
                    <div className="relative">
                      <Star className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <select
                        value={filters.isPromoted}
                        onChange={(e) => setFilters(prev => ({ ...prev, isPromoted: e.target.value }))}
                        className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0AAC9E]/20 focus:border-[#0AAC9E] text-xs outline-none"
                      >
                        <option value="">All Courses</option>
                        <option value="true">Promoted</option>
                        <option value="false">Not Promoted</option>
                      </select>
                    </div>
                  </div>

                  {/* Duration Range */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">Duration (minutes)</label>
                    <div className="flex space-x-2">
                      <div className="relative flex-1">
                        <Clock className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="number"
                          placeholder="Min"
                          value={filters.minDuration}
                          onChange={(e) => setFilters(prev => ({ ...prev, minDuration: e.target.value }))}
                          className="w-full pl-8 pr-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0AAC9E]/20 focus:border-[#0AAC9E] text-xs outline-none"
                        />
                      </div>
                      <div className="relative flex-1">
                        <input
                          type="number"
                          placeholder="Max"
                          value={filters.maxDuration}
                          onChange={(e) => setFilters(prev => ({ ...prev, maxDuration: e.target.value }))}
                          className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0AAC9E]/20 focus:border-[#0AAC9E] text-xs outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">Publication Status</label>
                    <div className="relative">
                      <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <select
                        value={filters.status}
                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0AAC9E]/20 focus:border-[#0AAC9E] text-xs outline-none"
                      >
                        <option value="">All Status</option>
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Filter Actions */}
                <div className="flex items-center justify-between pt-5 border-t border-gray-100 mt-5">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={resetFilters}
                      className="flex items-center space-x-2 text-xs text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      <span>Clear all filters</span>
                    </button>
                    {getFilterCount() > 0 && (
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <Filter className="w-4 h-4" />
                        <span>{getFilterCount()} filter{getFilterCount() !== 1 ? 's' : ''} applied</span>
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => setShowFilters(false)}
                    className="px-5 py-2 bg-gradient-to-r from-[#0AAC9E] to-[#089a8c] text-white text-xs font-medium rounded-lg hover:shadow-lg transition-all duration-200"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Course Content */}
        {error ? (
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-7 h-7 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Courses</h3>
            <div className="text-red-600 mb-5 text-sm">{error}</div>
            <button
              onClick={handleRefresh}
              className="px-5 py-2 bg-gradient-to-r from-[#0AAC9E] to-[#089a8c] text-white rounded-lg hover:shadow-lg transition-all duration-200 text-sm"
            >
              Try Again
            </button>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-[#0AAC9E]/10 to-[#089a8c]/10 rounded-full flex items-center justify-center mx-auto mb-5">
              <BookOpen className="w-8 h-8 text-[#0AAC9E]" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              {getFilterCount() > 0 ? "No courses match your filters" : "No courses created yet"}
            </h3>
            <p className="text-gray-500 mb-6  mx-auto text-sm">
              {getFilterCount() > 0 
                ? "Try adjusting your search terms or filters to find the courses you're looking for"
                : "Get started by creating your first course to engage your learners"
              }
            </p>
            {getFilterCount() > 0 ? (
              <button
                onClick={resetFilters}
                className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 text-sm"
              >
                Clear All Filters
              </button>
            ) : (
              <button
                onClick={handleCreateCourse}
                className="px-6 py-2 bg-gradient-to-r from-[#0AAC9E] to-[#089a8c] text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200 font-medium text-sm"
              >
                Create Your First Course
              </button>
            )}
          </div>
        ) : (
          <div className={viewMode === "grid" 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6" 
            : "space-y-4"
          }>
            {filteredCourses.map((course) => (
  <CourseCard
    key={course.id}
    course={course}
    viewMode={viewMode}
    onEdit={handleEditCourse}
    onView={handleViewCourse}
    onDelete={handleDeleteCourse}
    onPublish={handlePublishCourse}
    activeDropdown={activeDropdown}
    onToggleDropdown={toggleDropdown} // Pass the function directly, not wrapped
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
    </div>
  );
};

export default CourseHomepage;