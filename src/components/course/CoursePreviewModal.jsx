import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { 
  X, 
  Eye, 
  ChevronDown,
  ChevronRight, 
  Play, 
  FileText, 
  Video, 
  Link, 
  HelpCircle, 
  Clock, 
  Users,
  Star,
  Award,
  BookOpen,
  Globe,
  Target,
  Calendar,
  Download,
  Maximize2,
  ExternalLink
} from "lucide-react";
import {
  setModalOpen
} from "@/redux/course/courseSlice";

const CoursePreviewModal = () => {
  const dispatch = useDispatch();
  
  const { 
    modals, 
    currentCourse,
    formData,
    sections = []
  } = useSelector((state) => state.course || {});
  
  const isOpen = modals?.coursePreview || false;
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [activeTab, setActiveTab] = useState('overview');

  // Expand all sections by default when modal opens
  useEffect(() => {
    if (isOpen && sections.length > 0) {
      setExpandedSections(new Set(sections.map(s => s.id)));
    }
  }, [isOpen, sections]);

  const handleClose = () => {
    dispatch(setModalOpen({ modal: 'coursePreview', isOpen: false }));
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
    switch (type) {
      case 'video': return Video;
      case 'quiz': return HelpCircle;
      case 'url': return Globe;
      case 'file': return Download;
      case 'page':
      case 'text':
      default: return FileText;
    }
  };

  const getContentTypeLabel = (type) => {
    switch (type) {
      case 'video': return 'Video';
      case 'quiz': return 'Quiz';
      case 'url': return 'External Link';
      case 'file': return 'Document';
      case 'page': return 'Page';
      case 'text': return 'Text';
      default: return 'Content';
    }
  };

  // Calculate course statistics
  const courseStats = {
    totalSections: sections.length,
    totalContent: sections.reduce((sum, section) => sum + (section.contents?.length || 0), 0),
    totalDuration: formData?.duration || 0,
    hasQuizzes: sections.some(section => 
      section.contents?.some(content => content.type === 'quiz')
    ),
    videoCount: sections.reduce((sum, section) => 
      sum + (section.contents?.filter(c => c.type === 'video').length || 0), 0
    ),
    quizCount: sections.reduce((sum, section) => 
      sum + (section.contents?.filter(c => c.type === 'quiz').length || 0), 0
    )
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-[#0AAC9E]/5 to-[#0AAC9E]/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#0AAC9E]/20 rounded-lg">
                <Eye className="w-5 h-5 text-[#0AAC9E]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Course Preview
                </h2>
                <p className="text-sm text-gray-600">
                  See how your course will appear to learners
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.open(`/courses/${currentCourse?.id}/preview`, '_blank')}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Open in new window"
              >
                <ExternalLink className="w-5 h-5" />
              </button>
              <button
                onClick={handleClose}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'overview'
                  ? 'border-[#0AAC9E] text-[#0AAC9E] bg-white'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('content')}
              className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'content'
                  ? 'border-[#0AAC9E] text-[#0AAC9E] bg-white'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Course Content
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          
          {activeTab === 'overview' && (
            <div className="p-6 space-y-6">
              
              {/* Course Header */}
              <div className="bg-gradient-to-r from-[#0AAC9E]/10 to-[#0AAC9E]/5 rounded-xl p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                      {formData?.name || "Untitled Course"}
                    </h1>
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {formData?.description || "No description provided"}
                    </p>
                    
                    {/* Course Stats */}
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#0AAC9E]" />
                        <span className="font-medium">{courseStats.totalDuration} minutes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-[#0AAC9E]" />
                        <span className="font-medium">{courseStats.totalSections} sections</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#0AAC9E]" />
                        <span className="font-medium">{courseStats.totalContent} items</span>
                      </div>
                      {courseStats.videoCount > 0 && (
                        <div className="flex items-center gap-2">
                          <Video className="w-4 h-4 text-[#0AAC9E]" />
                          <span className="font-medium">{courseStats.videoCount} videos</span>
                        </div>
                      )}
                      {courseStats.quizCount > 0 && (
                        <div className="flex items-center gap-2">
                          <HelpCircle className="w-4 h-4 text-[#0AAC9E]" />
                          <span className="font-medium">{courseStats.quizCount} quizzes</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Course Image Placeholder */}
                  <div className="w-32 h-20 bg-gray-200 rounded-lg flex items-center justify-center ml-6">
                    <BookOpen className="w-8 h-8 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Course Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Learning Objectives */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4 text-[#0AAC9E]" />
                    What You'll Learn
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-[#0AAC9E] mt-1">•</span>
                      <span>Master the core concepts and principles</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#0AAC9E] mt-1">•</span>
                      <span>Apply knowledge through practical exercises</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#0AAC9E] mt-1">•</span>
                      <span>Complete assessments to test your understanding</span>
                    </li>
                    {formData?.verifiedCertificate && (
                      <li className="flex items-start gap-2">
                        <span className="text-[#0AAC9E] mt-1">•</span>
                        <span>Earn a verified certificate upon completion</span>
                      </li>
                    )}
                  </ul>
                </div>

                {/* Course Features */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Star className="w-4 h-4 text-[#0AAC9E]" />
                    Course Features
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#0AAC9E] rounded-full"></div>
                      <span>Self-paced learning</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#0AAC9E] rounded-full"></div>
                      <span>Mobile friendly content</span>
                    </li>
                    {courseStats.hasQuizzes && (
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-[#0AAC9E] rounded-full"></div>
                        <span>Interactive quizzes</span>
                      </li>
                    )}
                    {formData?.verifiedCertificate && (
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-[#0AAC9E] rounded-full"></div>
                        <span>Certificate of completion</span>
                      </li>
                    )}
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#0AAC9E] rounded-full"></div>
                      <span>Progress tracking</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Enrollment Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">
                  Enrollment Information
                </h3>
                <p className="text-sm text-blue-800">
                  This course is available to members of your assigned target groups. 
                  Once published, eligible learners will be able to enroll and begin learning immediately.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'content' && (
            <div className="p-6">
              
              {/* Course Outline */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Course Outline
                </h3>
                
                {sections.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No course content has been added yet.</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Add sections and content to see the course outline here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sections.map((section, sectionIndex) => (
                      <div key={section.id} className="border border-gray-200 rounded-lg overflow-hidden">
                        
                        {/* Section Header */}
                        <button
                          onClick={() => toggleSection(section.id)}
                          className="w-full p-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-[#0AAC9E] text-white rounded-lg flex items-center justify-center text-sm font-semibold">
                              {sectionIndex + 1}
                            </div>
                            <div className="text-left">
                              <h4 className="font-semibold text-gray-900">
                                {section.description || `Section ${sectionIndex + 1}`}
                              </h4>
                              <p className="text-sm text-gray-500">
                                {section.contents?.length || 0} items • {section.duration || 0} min
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {section.mandatory && (
                              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
                                Mandatory
                              </span>
                            )}
                            {expandedSections.has(section.id) ? (
                              <ChevronDown className="w-5 h-5 text-gray-400" />
                            ) : (
                              <ChevronRight className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                        </button>

                        {/* Section Content */}
                        {expandedSections.has(section.id) && (
                          <div className="border-t border-gray-200">
                            {section.contents && section.contents.length > 0 ? (
                              <div className="divide-y divide-gray-100">
                                {section.contents.map((content, contentIndex) => {
                                  const IconComponent = getContentIcon(content.type);
                                  
                                  return (
                                    <div key={content.id} className="p-4 hover:bg-gray-50 transition-colors">
                                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-white border border-gray-200 rounded-lg flex items-center justify-center">
                                          <IconComponent className="w-4 h-4 text-gray-600" />
                                        </div>
                                        
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2">
                                            <h5 className="font-medium text-gray-900">
                                              {content.title || `${getContentTypeLabel(content.type)} ${contentIndex + 1}`}
                                            </h5>
                                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                              {getContentTypeLabel(content.type)}
                                            </span>
                                          </div>
                                          {content.description && (
                                            <p className="text-sm text-gray-500 mt-1">
                                              {content.description}
                                            </p>
                                          )}
                                        </div>
                                        
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                          {content.duration && (
                                            <div className="flex items-center gap-1">
                                              <Clock className="w-3 h-3" />
                                              <span>{content.duration} min</span>
                                            </div>
                                          )}
                                          <Play className="w-4 h-4 text-[#0AAC9E]" />
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="p-8 text-center text-gray-500">
                                <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                <p className="text-sm">No content in this section</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            Last updated: {new Date().toLocaleDateString()}
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.open(`/courses/${currentCourse?.id}/preview`, '_blank')}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center gap-2"
            >
              <Maximize2 className="w-4 h-4" />
              <span>Full Preview</span>
            </button>
            
            <button
              onClick={handleClose}
              className="px-6 py-2 bg-[#0AAC9E] text-white rounded-lg hover:bg-[#0AAC9E]/90 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePreviewModal;