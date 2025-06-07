'use client'
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter, useParams } from "next/navigation";
import { 
  ArrowLeft,
  Edit3,
  Trash2,
  Eye,
  Users,
  Clock,
  BookOpen,
  Award,
  Play,
  FileText,
  Video,
  HelpCircle,
  Link,
  Upload,
  Settings,
  Share2,
  BarChart3,
  Download,
  Calendar,
  User,
  Monitor,
  Globe,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  UserCheck,
  Timer,
  Activity,
  Target,
  Zap,
  Star,
  MessageSquare,
  PlayCircle,
  PlusCircle,
  MoreVertical,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Folder
} from "lucide-react";
import { fetchCourseByIdAsync, deleteCourseAsync, publishCourseAsync, fetchCourseLearnersAsync } from "@/redux/course/courseSlice";
import LoadingSpinner from "@/components/loadingSpinner";
import DeleteConfirmationModal from "@/components/deleteModal";
import { toast } from "sonner";

const CourseDetailPage = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { courseId } = useParams();
  
  const [activeTab, setActiveTab] = useState("overview");
  const [deleteModal, setDeleteModal] = useState({ isOpen: false });
  const [expandedSections, setExpandedSections] = useState(new Set());

  const { 
    currentCourse, 
    courseLoading, 
    courseError,
    courseLearners
  } = useSelector((state) => state.course || {});

  useEffect(() => {
    if (courseId) {
      dispatch(fetchCourseByIdAsync({ courseId }));
      dispatch(fetchCourseLearnersAsync({ courseId, page: 1, take: 10 }));
    }
  }, [dispatch, courseId]);

  const handleBack = () => {
    router.push("/admin/dashboard/courses");
  };

  const handleEdit = () => {
     router.push(`/admin/dashboard/courses/edit/${courseId}`);
  };

  const handleDelete = () => {
    setDeleteModal({ isOpen: true });
  };

  const confirmDelete = async () => {
    try {
      await dispatch(deleteCourseAsync(courseId)).unwrap();
      toast.success("Course deleted successfully!");
      router.push("/admin/dashboard/courses");
    } catch (error) {
      toast.error("Failed to delete course: " + error.message);
    }
    setDeleteModal({ isOpen: false });
  };

  const handlePublish = async () => {
    try {
      await dispatch(publishCourseAsync(courseId)).unwrap();
      toast.success("Course published successfully!");
    } catch (error) {
      toast.error("Failed to publish course: " + error.message);
    }
  };

  const toggleSection = (sectionId) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const getContentIcon = (type) => {
    const icons = {
      0: FileText, // Page
      1: FileText, // Text
      2: HelpCircle, // Quiz
      3: Link, // URL
      4: Video, // Video
      5: Upload, // File
      6: FileText, // PPTX
    };
    return icons[type] || FileText;
  };

  const getContentTypeName = (type) => {
    const types = {
      0: "Page",
      1: "Text Content",
      2: "Quiz",
      3: "Web Link",
      4: "Video",
      5: "File Upload",
      6: "Presentation"
    };
    return types[type] || "Content";
  };

  const formatDuration = (minutes) => {
    if (!minutes) return '0m';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTotalStats = () => {
    if (!currentCourse?.sections) return { duration: 0, content: 0, videos: 0, quizzes: 0 };
    
    return currentCourse.sections.reduce((total, section) => {
      const sectionContent = section.contents || [];
      return {
        duration: total.duration + (section.duration || 0),
        content: total.content + sectionContent.length,
        videos: total.videos + sectionContent.filter(c => c.type === 4).length,
        quizzes: total.quizzes + sectionContent.filter(c => c.type === 2).length
      };
    }, { duration: 0, content: 0, videos: 0, quizzes: 0 });
  };

  const stats = getTotalStats();

  if (courseLoading) {
    return <LoadingSpinner />;
  }

  if (courseError || !currentCourse) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Course Not Found</h3>
          <p className="text-gray-600 mb-6">{courseError || "The course you're looking for doesn't exist or has been removed."}</p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-[#0AAC9E] text-white rounded-lg hover:bg-[#0AAC9E]/90 transition-colors"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: BookOpen },
    { id: "content", label: "Content & Structure", icon: FileText },
    { id: "learners", label: "Learners", icon: Users, count: courseLearners.totalCount },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
   
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 pt-14">
      {/* Hero Header */}
      <div className="bg-white rounded-lg border-b border-gray-200">
        <div className=" px-4 sm:px-6 lg:px-8">
          {/* Navigation */}
          <div className="flex items-center justify-between py-4 border-b border-gray-100">
            <button
              onClick={handleBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Courses</span>
            </button>
            
            <div className="flex items-center space-x-3">
            
              
              <button className="flex items-center space-x-2 px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              
              <button
                onClick={handleEdit}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit</span>
              </button>
              
              <button
                onClick={handleDelete}
                className="flex items-center space-x-2 px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors text-sm"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>

          {/* Course Header */}
          <div className="py-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <h1 className="text-2xl font-bold text-gray-900">{currentCourse.name}</h1>
                  <div className="flex items-center space-x-2">
                    {currentCourse.publishCourse ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#0AAC9E]/10 text-[#0AAC9E] border border-[#0AAC9E]/20">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                        <Clock className="w-3 h-3 mr-1" />
                        Draft
                      </span>
                    )}
                    {currentCourse.verifiedCertificate && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-200">
                        <Award className="w-3 h-3 mr-1" />
                        Certificate
                      </span>
                    )}
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4 leading-relaxed max-w-3xl">{currentCourse.description}</p>
                
                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <span className="flex items-center space-x-1">
                    <User className="w-4 h-4" />
                    <span>Created by {currentCourse.createdBy}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(currentCourse.createdDate)}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Folder className="w-4 h-4" />
                    <span>{currentCourse.courseCategoryName}</span>
                  </span>
                </div>
              </div>

              <div className="ml-6">
                {currentCourse.imageUrl ? (
                  <img 
                    src={currentCourse.imageUrl} 
                    alt={currentCourse.name}
                    className="w-32 h-32 rounded-lg object-cover border border-gray-200"
                  />
                ) : (
                  <div className="w-32 h-32 bg-gradient-to-br from-[#0AAC9E]/10 to-[#0AAC9E]/20 rounded-lg flex items-center justify-center border border-gray-200">
                    <BookOpen className="w-12 h-12 text-[#0AAC9E]" />
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{currentCourse.totalSection || 0}</div>
                <div className="text-sm text-gray-500">Sections</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{stats.content}</div>
                <div className="text-sm text-gray-500">Content Items</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#0AAC9E]">{formatDuration(currentCourse.duration)}</div>
                <div className="text-sm text-gray-500">Duration</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{courseLearners.totalCount || 0}</div>
                <div className="text-sm text-gray-500">Learners</div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-1 py-4 border-b-2 text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-[#0AAC9E] text-[#0AAC9E]"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className=" py-6">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Course Overview */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Overview</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Video className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <div className="text-xl font-bold text-gray-900">{stats.videos}</div>
                    <div className="text-sm text-gray-600">Videos</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <HelpCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <div className="text-xl font-bold text-gray-900">{stats.quizzes}</div>
                    <div className="text-sm text-gray-600">Quizzes</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <FileText className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                    <div className="text-xl font-bold text-gray-900">{stats.content - stats.videos - stats.quizzes}</div>
                    <div className="text-sm text-gray-600">Documents</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <Timer className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                    <div className="text-xl font-bold text-gray-900">{formatDuration(stats.duration)}</div>
                    <div className="text-sm text-gray-600">Total Time</div>
                  </div>
                </div>
              </div>

              {/* Course Structure Preview */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Course Structure</h3>
                  <button
                    onClick={() => setActiveTab('content')}
                    className="text-sm text-[#0AAC9E] hover:text-[#0AAC9E]/80 transition-colors"
                  >
                    View Full Structure →
                  </button>
                </div>
                
                {currentCourse.sections && currentCourse.sections.length > 0 ? (
                  <div className="space-y-3">
                    {currentCourse.sections.slice(0, 3).map((section, index) => (
                      <div key={section.id} className="border border-gray-100 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-[#0AAC9E]/10 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-[#0AAC9E]">{index + 1}</span>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {section.description || `Section ${index + 1}`}
                              </h4>
                              <p className="text-sm text-gray-500">
                                {section.contents?.length || 0} items • {section.duration || 0} minutes
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    ))}
                    {currentCourse.sections.length > 3 && (
                      <div className="text-center py-2">
                        <span className="text-sm text-gray-500">
                          +{currentCourse.sections.length - 3} more sections
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No content structure yet</p>
                    <button
                      onClick={handleEdit}
                      className="mt-3 text-sm text-[#0AAC9E] hover:text-[#0AAC9E]/80"
                    >
                      Add your first section
                    </button>
                  </div>
                )}
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Activity className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Course created</p>
                      <p className="text-xs text-gray-500">{formatDate(currentCourse.createdDate)}</p>
                    </div>
                  </div>
                  {!currentCourse.publishCourse && (
                    <div className="flex items-center space-x-3 p-3 bg-amber-50 rounded-lg">
                      <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                        <Clock className="w-4 h-4 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Waiting for publication</p>
                        <p className="text-xs text-gray-500">Course is in draft mode</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => toast.info("Preview functionality coming soon")}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-[#0AAC9E] text-white rounded-lg hover:bg-[#0AAC9E]/90 transition-colors text-sm"
                  >
                    <PlayCircle className="w-4 h-4" />
                    <span>Preview Course</span>
                  </button>
                  
                  {!currentCourse.publishCourse && (
                    <button
                      onClick={handlePublish}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      <Globe className="w-4 h-4" />
                      <span>Publish Course</span>
                    </button>
                  )}
                  
                  <button
                    onClick={handleEdit}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit Content</span>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('learners')}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    <Users className="w-4 h-4" />
                    <span>Manage Learners</span>
                  </button>
                </div>
              </div>

              {/* Course Details */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Details</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Category</span>
                    <span className="text-sm font-medium text-gray-900">
                      {currentCourse.courseCategoryName || "Not set"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Duration</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatDuration(currentCourse.duration)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Certificate</span>
                    <span className={`text-sm font-medium ${
                      currentCourse.verifiedCertificate ? "text-[#0AAC9E]" : "text-gray-500"
                    }`}>
                      {currentCourse.verifiedCertificate ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <span className={`text-sm font-medium ${
                      currentCourse.publishCourse ? "text-[#0AAC9E]" : "text-amber-600"
                    }`}>
                      {currentCourse.publishCourse ? "Published" : "Draft"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Created</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatDate(currentCourse.createdDate)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Created by</span>
                    <span className="text-sm font-medium text-gray-900">
                      {currentCourse.createdBy}
                    </span>
                  </div>
                </div>
              </div>

              {/* Performance Overview */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance</h3>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-[#0AAC9E]/5 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-[#0AAC9E] mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{courseLearners.totalCount || 0}</div>
                    <div className="text-sm text-gray-600">Total Enrollments</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-lg font-bold text-gray-900">0</div>
                      <div className="text-xs text-gray-600">Completed</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-lg font-bold text-gray-900">0</div>
                      <div className="text-xs text-gray-600">In Progress</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "content" && (
          <div className="space-y-6">
            {/* Content Header */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Course Content & Structure</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Organize your course content into sections and lessons
                  </p>
                </div>
                <button
                  onClick={handleEdit}
                  className="flex items-center space-x-2 px-4 py-2 bg-[#0AAC9E] text-white rounded-lg hover:bg-[#0AAC9E]/90 transition-colors text-sm"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Structure</span>
                </button>
              </div>

              {/* Content Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">{currentCourse.totalSection || 0}</div>
                  <div className="text-sm text-gray-500">Sections</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">{stats.content}</div>
                  <div className="text-sm text-gray-500">Total Items</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-blue-600">{stats.videos}</div>
                  <div className="text-sm text-gray-500">Videos</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-green-600">{stats.quizzes}</div>
                  <div className="text-sm text-gray-500">Quizzes</div>
                </div>
              </div>
            </div>
            
            {/* Course Sections */}
            {currentCourse.sections && currentCourse.sections.length > 0 ? (
              <div className="space-y-4">
                {currentCourse.sections.map((section, index) => (
                  <div key={section.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    {/* Section Header */}
                    <div 
                      className="bg-gray-50 px-6 py-4 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => toggleSection(section.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-[#0AAC9E]/10 rounded-lg flex items-center justify-center">
                            <span className="text-sm font-semibold text-[#0AAC9E]">{index + 1}</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {section.description || `Section ${index + 1}`}
                            </h4>
                            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                              <span className="flex items-center space-x-1">
                                <FileText className="w-4 h-4" />
                                <span>{section.contents?.length || 0} items</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>{section.duration || 0} min</span>
                              </span>
                              {section.mandatory && (
                                <span className="flex items-center space-x-1 text-red-600">
                                  <Star className="w-4 h-4" />
                                  <span>Required</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <ChevronDown 
                          className={`w-5 h-5 text-gray-400 transform transition-transform ${
                            expandedSections.has(section.id) ? 'rotate-180' : ''
                          }`} 
                        />
                      </div>
                    </div>
                    
                    {/* Section Content */}
                    {expandedSections.has(section.id) && (
                      <div className="p-6">
                        {section.contents && section.contents.length > 0 ? (
                          <div className="space-y-3">
                            {section.contents.map((content, contentIndex) => {
                              const Icon = getContentIcon(content.type);
                              return (
                                <div key={content.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                                    <Icon className="w-5 h-5 text-gray-600" />
                                  </div>
                                  <div className="flex-1">
                                    <h5 className="font-medium text-gray-900">
                                      {content.title || `${getContentTypeName(content.type)} ${contentIndex + 1}`}
                                    </h5>
                                    <div className="flex items-center space-x-3 mt-1">
                                      <span className="text-sm text-gray-500">
                                        {getContentTypeName(content.type)}
                                      </span>
                                      {content.type === 3 && (
                                        <div className="flex items-center space-x-1 text-sm text-blue-600">
                                          <ExternalLink className="w-3 h-3" />
                                          <span>External Link</span>
                                        </div>
                                      )}
                                      {content.hideContent && (
                                        <span className="text-xs text-gray-400 bg-gray-200 px-2 py-0.5 rounded">
                                          Hidden
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                                    <MoreVertical className="w-4 h-4" />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 mb-3">No content in this section</p>
                            <button
                              onClick={handleEdit}
                              className="text-sm text-[#0AAC9E] hover:text-[#0AAC9E]/80 transition-colors"
                            >
                              Add content to this section
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No content structure yet</h4>
                <p className="text-gray-500 mb-6">Start building your course by adding sections and content.</p>
                <button
                  onClick={handleEdit}
                  className="flex items-center space-x-2 px-4 py-2 bg-[#0AAC9E] text-white rounded-lg hover:bg-[#0AAC9E]/90 transition-colors mx-auto"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Add Your First Section</span>
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "learners" && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Course Learners</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Manage and track learner progress
                </p>
              </div>
              <button className="flex items-center space-x-2 px-4 py-2 bg-[#0AAC9E] text-white rounded-lg hover:bg-[#0AAC9E]/90 transition-colors text-sm">
                <UserCheck className="w-4 h-4" />
                <span>Add Learners</span>
              </button>
            </div>

            {courseLearners.data && courseLearners.data.length > 0 ? (
              <div className="space-y-4">
                {courseLearners.data.map((learner) => (
                  <div key={learner.userId} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-[#0AAC9E]/10 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-[#0AAC9E]" />
                    </div>
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900">{learner.fullName}</h5>
                      <p className="text-sm text-gray-500">{learner.email}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">In Progress</div>
                      <div className="text-xs text-gray-500">Started recently</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No learners yet</h4>
                <p className="text-gray-500 mb-6">Learners will appear here once they enroll in your course.</p>
                <button className="px-4 py-2 bg-[#0AAC9E] text-white rounded-lg hover:bg-[#0AAC9E]/90 transition-colors">
                  Invite Learners
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Course Analytics</h3>
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">Analytics Dashboard</h4>
              <p className="text-gray-500 mb-6">Detailed analytics and insights will be available here once learners start engaging with your course.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-md mx-auto">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-xl font-bold text-gray-900">0%</div>
                  <div className="text-sm text-gray-600">Completion Rate</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-xl font-bold text-gray-900">0</div>
                  <div className="text-sm text-gray-600">Avg. Score</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-xl font-bold text-gray-900">0h</div>
                  <div className="text-sm text-gray-600">Study Time</div>
                </div>
              </div>
            </div>
          </div>
        )}

     
      </div>

      {/* Delete Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false })}
        onConfirm={confirmDelete}
        item={`course "${currentCourse?.name}"`}
      />
    </div>
  );
};

export default CourseDetailPage;