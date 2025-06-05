'use client'
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter, useParams } from "next/navigation";
import { 
  ArrowLeft,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
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
  Download
} from "lucide-react";
import { fetchCourseByIdAsync } from "@/redux/course/courseSlice";
import { toast } from "sonner";

const CourseDetailPage = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { courseId } = useParams();
  
  const [activeTab, setActiveTab] = useState("overview");

  const { 
    currentCourse, 
    courseLoading, 
    courseError 
  } = useSelector((state) => state.course || {});

  useEffect(() => {
    if (courseId) {
      dispatch(fetchCourseByIdAsync({ courseId }));
    }
  }, [dispatch, courseId]);

  const handleBack = () => {
    router.push("/admin/dashboard/courses");
  };

  const handleEdit = () => {
     router.push(`/admin/dashboard/courses/edit/${courseId}`);
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      // Implement delete functionality
      toast.success("Course deleted successfully!");
      router.push("/admin/dashboard/courses");
    }
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

  const getTotalDuration = () => {
    if (!currentCourse?.sections) return 0;
    return currentCourse.sections.reduce((total, section) => {
      return total + (section.duration || 0);
    }, 0);
  };

  const getTotalContent = () => {
    if (!currentCourse?.sections) return 0;
    return currentCourse.sections.reduce((total, section) => {
      return total + (section.contents?.length || 0);
    }, 0);
  };

  if (courseLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0AAC9E] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (courseError || !currentCourse) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">{courseError || "Course not found"}</div>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-[#0AAC9E] text-white rounded-lg hover:bg-[#0AAC9E]/90"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: BookOpen },
    { id: "content", label: "Content", icon: FileText },
    { id: "learners", label: "Learners", icon: Users },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back to Courses</span>
              </button>
              
              <div className="h-6 border-l border-gray-300"></div>
              
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{currentCourse.name}</h1>
                <div className="flex items-center space-x-2 mt-1">
                  {currentCourse.publishCourse ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#0AAC9E]/10 text-[#0AAC9E]">
                      Published
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      Draft
                    </span>
                  )}
                  {currentCourse.verifiedCertificate && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                      <Award className="w-3 h-3 mr-1" />
                      Certificate
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                <Share2 className="w-4 h-4" />
                <span>Share</span>
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

          {/* Tabs */}
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-1 py-4 border-b-2 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "border-[#0AAC9E] text-[#0AAC9E]"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Course Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Description</h3>
                <p className="text-gray-700 leading-relaxed">{currentCourse.description}</p>
              </div>

              {/* Course Structure */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Structure</h3>
                {currentCourse.sections && currentCourse.sections.length > 0 ? (
                  <div className="space-y-4">
                    {currentCourse.sections.map((section, index) => (
                      <div key={section.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">
                            {index + 1}. {section.title || `Section ${index + 1}`}
                          </h4>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {section.duration || 0}min
                            </span>
                            <span className="flex items-center">
                              <FileText className="w-3 h-3 mr-1" />
                              {section.contents?.length || 0} items
                            </span>
                          </div>
                        </div>
                        
                        {section.contents && section.contents.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {section.contents.map((content, contentIndex) => {
                              const Icon = getContentIcon(content.type);
                              return (
                                <div key={content.id} className="flex items-center space-x-3 text-sm text-gray-600">
                                  <Icon className="w-4 h-4" />
                                  <span>{content.title || content.fileName || `Content ${contentIndex + 1}`}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No sections added yet.</p>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Duration</span>
                    <span className="text-sm font-medium text-gray-900">
                      {getTotalDuration()} minutes
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Sections</span>
                    <span className="text-sm font-medium text-gray-900">
                      {currentCourse.sections?.length || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Content Items</span>
                    <span className="text-sm font-medium text-gray-900">
                      {getTotalContent()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Enrollments</span>
                    <span className="text-sm font-medium text-gray-900">
                      {currentCourse.enrollmentCount || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Course Settings */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Settings</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Category</span>
                    <span className="text-sm font-medium text-gray-900">
                      {currentCourse.category?.name || "Not set"}
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
                    <span className="text-sm text-gray-600">Created</span>
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(currentCourse.createdDate).toLocaleDateString()}
                    </span>
                  </div>
                  {currentCourse.tags && currentCourse.tags.length > 0 && (
                    <div>
                      <span className="text-sm text-gray-600 block mb-2">Tags</span>
                      <div className="flex flex-wrap gap-1">
                        {currentCourse.tags.map((tag) => (
                          <span
                            key={tag.id}
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                          >
                            #{tag.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-[#0AAC9E] text-white rounded-lg hover:bg-[#0AAC9E]/90 transition-colors text-sm">
                    <Play className="w-4 h-4" />
                    <span>Preview Course</span>
                  </button>
                  <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                    <Download className="w-4 h-4" />
                    <span>Export Data</span>
                  </button>
                  <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                    <Users className="w-4 h-4" />
                    <span>Manage Learners</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "content" && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Course Content</h3>
              <button
                onClick={handleEdit}
                className="flex items-center space-x-2 px-3 py-2 bg-[#0AAC9E] text-white rounded-lg hover:bg-[#0AAC9E]/90 transition-colors text-sm"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Content</span>
              </button>
            </div>
            
            {currentCourse.sections && currentCourse.sections.length > 0 ? (
              <div className="space-y-6">
                {currentCourse.sections.map((section, index) => (
                  <div key={section.id} className="border border-gray-200 rounded-lg">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">
                          Section {index + 1}: {section.title || `Section ${index + 1}`}
                        </h4>
                        <div className="flex items-center space-x-3 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {section.duration || 0} min
                          </span>
                          <span className="flex items-center">
                            <FileText className="w-4 h-4 mr-1" />
                            {section.contents?.length || 0} items
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      {section.contents && section.contents.length > 0 ? (
                        <div className="space-y-3">
                          {section.contents.map((content, contentIndex) => {
                            const Icon = getContentIcon(content.type);
                            return (
                              <div key={content.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                <div className="p-2 bg-white rounded-lg">
                                  <Icon className="w-4 h-4 text-gray-600" />
                                </div>
                                <div className="flex-1">
                                  <h5 className="font-medium text-gray-900">
                                    {content.title || content.fileName || `Content ${contentIndex + 1}`}
                                  </h5>
                                  <p className="text-sm text-gray-500">
                                    {content.description || "No description"}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-4">No content in this section</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No content yet</h4>
                <p className="text-gray-500 mb-6">Start adding sections and content to build your course.</p>
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 bg-[#0AAC9E] text-white rounded-lg hover:bg-[#0AAC9E]/90 transition-colors"
                >
                  Add Content
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "learners" && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Course Learners</h3>
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No learners yet</h4>
              <p className="text-gray-500">Learners will appear here once they enroll in your course.</p>
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Course Analytics</h3>
            <div className="text-center py-12">
              <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">Analytics coming soon</h4>
              <p className="text-gray-500">Detailed analytics and insights will be available here.</p>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Course Settings</h3>
            <div className="text-center py-12">
              <Settings className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">Settings panel</h4>
              <p className="text-gray-500">Advanced course settings and configurations.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetailPage;