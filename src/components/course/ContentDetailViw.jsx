import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { 
  ArrowLeft, Trash2, Eye, EyeOff, Save, 
  Video, Globe, File, Monitor, Presentation, HelpCircle, ExternalLink,
  Info, Settings, AlertCircle, CheckCircle, Loader2, Clock, Download, Upload,
  Plus, X, Copy, Target, Brain, Award, CheckCircle2, BarChart3,
  Users2, Trophy, PlayCircle, Edit2, Languages, Edit3
} from "lucide-react";

import {
  getContentsBySectionAsync,
  updateContentAsync,
  deleteContentAsync
} from "@/redux/courseContent/courseContentSlice";

import {
  setEditingContent,
  setContentModalType,
  setModalOpen
} from "@/redux/course/courseSlice";

// Import enhanced components
import EnhancedQuizDisplayComponent from "./QuizDisplayComponent";
import CompleteVideoPlayer from "./VideoPlayer";

const UpdatedContentDetailView = ({ contentId, sectionId, onBack }) => {
  const dispatch = useDispatch();
  
  // Redux state
  const { 
    contentsBySection = {},
    currentContent,
    contentLoading,
    contentError
  } = useSelector((state) => state.courseContent || {});
  
  const { 
    sections = [],
    modals 
  } = useSelector((state) => state.course || {});

  // Local state
  const [activeTab, setActiveTab] = useState('overview');
  const [editMode, setEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);

  // Get content details
  const content = useMemo(() => {
    if (sectionId && contentsBySection[sectionId]) {
      return contentsBySection[sectionId].find(c => 
        (c.id === contentId) || (c.contentId === contentId)
      );
    }
    return currentContent?.id === contentId || currentContent?.contentId === contentId ? currentContent : null;
  }, [contentId, sectionId, contentsBySection, currentContent]);

  // Get section info
  const section = useMemo(() => {
    return sections.find(s => s.id === sectionId);
  }, [sections, sectionId]);

  // Load content if not already loaded
  useEffect(() => {
    if (sectionId && (!contentsBySection[sectionId] || !content)) {
      dispatch(getContentsBySectionAsync(sectionId));
    }
  }, [dispatch, sectionId, contentsBySection, content]);

  // Initialize edit form data
  useEffect(() => {
    if (content) {
      setEditFormData({
        description: content.description || '',
        contentString: content.contentString || content.data || '',
        hideContent: Boolean(content.hideContent),
        isDiscussionEnabled: Boolean(content.isDiscussionEnabled),
        isMeetingAllowed: Boolean(content.isMeetingAllowed)
      });
    }
  }, [content]);

  // Enhanced content type configuration
  const getContentTypeConfig = useCallback((type) => {
    let normalizedType = type;
    
    if (typeof type === 'string') {
      const stringToTypeMap = {
        'Page': 0, 'Quiz': 2, 'WebURL': 3, 'Video': 4, 'OtherFile': 5, 'PPTX': 6
      };
      normalizedType = stringToTypeMap[type] || 1;
    }
    
    const configs = {
      0: { icon: Monitor, label: 'Page', color: 'bg-teal-50 text-teal-700 border-teal-200', description: 'Rich Text' },
      1: { icon: File, label: 'Text', color: 'bg-gray-50 text-gray-700 border-gray-200', description: 'Text Content' },
      2: { icon: HelpCircle, label: 'Quiz', color: 'bg-amber-50 text-amber-700 border-amber-200', description: 'Interactive quiz' },
      3: { icon: Globe, label: 'Link', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', description: 'External website' },
      4: { icon: Video, label: 'Video', color: 'bg-red-50 text-red-700 border-red-200', description: 'Video content' },
      5: { icon: File, label: 'File', color: 'bg-purple-50 text-purple-700 border-purple-200', description: 'Document upload' },
      6: { icon: Presentation, label: 'PowerPoint', color: 'bg-orange-50 text-orange-700 border-orange-200', description: 'Presentation' }
    };
    return configs[normalizedType] || configs[1];
  }, []);

  const contentConfig = useMemo(() => {
    return content ? getContentTypeConfig(content.type || content.contentType) : null;
  }, [content, getContentTypeConfig]);



  

  // Handle input changes
  const handleInputChange = useCallback((field, value) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Handle delete
  const handleDelete = useCallback(async () => {
    if (!content || !window.confirm('Are you sure you want to delete this content?')) return;
    
    try {
      await dispatch(deleteContentAsync(content.id || content.contentId)).unwrap();
      onBack();
    } catch (error) {
      console.error('Failed to delete content:', error);
    }
  }, [content, dispatch, onBack]);

  // Enhanced content preview renderer with compact design
  const renderContentPreview = () => {
    if (!content || !contentConfig) return null;
    
    const contentType = content.type || content.contentType;
    const contentData = content.contentString || content.data;

    // Video Content - Compact design
    if (contentType === 4 || contentType === 'Video') {
      return (
        <div className="space-y-2">
          <div className="relative bg-gray-900 rounded-lg overflow-hidden">
            <div className="aspect-video bg-gray-800 flex items-center justify-center">
              <div className="text-center text-white">
               <div><Video className="w-6 h-6 mx-auto mb-1.5 opacity-70" /></div> 
                <h4 className="text-xs font-medium mb-0.5">Video Content</h4>
                <p className="text-xs text-gray-300 mb-2">Click to play video</p>
                <div className="flex items-center justify-center space-x-2">
                  <button
                    onClick={() => setShowVideoPlayer(true)}
                    className="flex items-center px-2 py-1 bg-[#0AAC9E] text-white rounded hover:bg-[#0AAC9E]/90 transition-colors text-xs"
                  >
                  <div><PlayCircle className="w-4 h-3 mr-1" /></div>  
                    Play
                  </button>
                  {content.uploadStatus !== 3 && (
                    <div className="flex items-center space-x-1 text-amber-400">
                     <div><Clock className="w-4 h-3" /></div> 
                      <span className="text-xs">Processing</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>


        
        </div>
      );
    }

    // URL Content - Compact design
    if (contentType === 3 || contentType === 'WebURL') {
      return (
        <div className="space-y-2">
          <div className="border border-gray-200 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1.5">
             <div><Globe className="w-4 h-3 text-[#0AAC9E]" /></div> 
              <span className="text-xs font-medium text-gray-800">External Link</span>
            </div>
            <a 
              href={contentData} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#0AAC9E] hover:underline break-all text-xs"
            >
              {contentData}
            </a>
            <div className="mt-2 flex space-x-1.5">
              <button
                onClick={() => window.open(contentData, '_blank')}
                className="flex items-center px-1.5 py-0.5 text-xs font-medium text-white bg-[#0AAC9E] rounded hover:bg-[#0AAC9E]/90"
              >
              <div> <ExternalLink className="w-4 h-3 mr-0.5" /></div> 
                Open
              </button>
              <button
                onClick={() => navigator.clipboard.writeText(contentData)}
                className="flex items-center px-1.5 py-0.5 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
              >
                <Copy className="w-3 h-3 mr-0.5" />
                Copy
              </button>
            </div>
          </div>
        </div>
      );
    }

    // File Content - Compact design
    if (contentType === 6 || contentType === 'PPTX' || contentType === 5 || contentType === 'OtherFile') {
      const Icon = contentConfig.icon;
      return (
        <div className="space-y-2">
          <div className="border border-gray-200 rounded-lg p-4 text-center">
           <div><Icon className="w-6 h-6 mx-auto mb-1.5 text-gray-500" /></div> 
            <h4 className="text-xs font-medium text-gray-800 mb-0.5">
              {contentConfig.label} File
            </h4>
            <p className="text-xs text-gray-500 mb-2 break-all">
              {contentData?.split('/').pop() || 'File'}
            </p>
            <div className="flex justify-center space-x-1.5">
              <a
                href={contentData}
                download
                className="flex items-center px-1.5 py-0.5 text-xs font-medium text-white bg-[#0AAC9E] rounded hover:bg-[#0AAC9E]/90"
              >
              <div><Download className="w-4 h-3 mr-0.5" /></div>  
                Download
              </a>
              <button
                onClick={() => window.open(contentData, '_blank')}
                className="flex items-center px-1.5 py-0.5 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
              >
                <ExternalLink className="w-3 h-3 mr-0.5" />
                Open
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Default text/page content - Compact design
    const Icon = contentConfig.icon;
    return (
      <div className="space-y-2">
        <div className="border border-gray-200 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
           <div><Icon className="w-4 h-3 text-gray-600" /></div> 
            <span className="text-xs font-medium text-gray-800">{contentConfig.label} Content</span>
          </div>
          <div className="text-xs text-gray-700 whitespace-pre-wrap max-h-24 overflow-y-auto">
            {contentData}
          </div>
        </div>
      </div>
    );
  };

  const handleCreateQuiz = useCallback(() => {
    dispatch(setEditingContent(content));
    dispatch(setContentModalType('addQuiz'));
    dispatch(setModalOpen('addQuiz', true));
  }, [dispatch, content]);

  if (contentLoading) {
    return (
      <div className="p-3">
        <div className="flex items-center justify-center h-32">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#0AAC9E]" />
            <span className="text-xs text-gray-600">Loading content...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="p-3">
        <div className="text-center py-8">
          <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <h3 className="text-sm font-medium text-gray-900 mb-1">Content not found</h3>
          <p className="text-xs text-gray-500 mb-3">The requested content could not be loaded.</p>
          <button
            onClick={onBack}
            className="flex items-center px-2 py-1 text-xs text-[#0AAC9E] hover:bg-teal-50 rounded mx-auto"
          >
          <div><ArrowLeft className="w-4 h-3 mr-1" /></div>  
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Add safety check for contentConfig before using it
  if (!contentConfig) {
    return (
      <div className="p-3">
        <div className="text-center py-8">
          <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <h3 className="text-sm font-medium text-gray-900 mb-1">Invalid content type</h3>
          <p className="text-xs text-gray-500 mb-3">The content type is not recognized.</p>
          <button
            onClick={onBack}
            className="flex items-center px-2 py-1 text-xs text-[#0AAC9E] hover:bg-teal-50 rounded mx-auto"
          >
          <div><ArrowLeft className="w-4 h-3 mr-1" /></div>  
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const Icon = contentConfig.icon;
  const isQuizType = content.type === 2 || content.contentType === 'Quiz';
  const isVideoType = content.type === 4 || content.contentType === 'Video';

  return (
    <div className="p-3">
      {/* Compact Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={onBack}
              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
            >
              <ArrowLeft className="w-4 h-3" />
            </button>
            
            <div className={`w-6 h-6 rounded flex items-center justify-center border ${contentConfig.color}`}>
              <Icon className="w-4 h-3" />
            </div>
            
            <div>
              <div className="flex items-center space-x-1.5 mb-0.5">
                <h1 className="text-sm font-medium text-gray-900">
                  {content.description || `${contentConfig.label} Content`}
                </h1>
                <span className={`px-1 py-0.5 text-xs font-medium rounded border ${contentConfig.color}`}>
                  {contentConfig.label}
                </span>
                {content.hideContent && <EyeOff className="w-4 h-3 text-gray-400" />}
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <span>{section?.description || 'Unknown'}</span>
                <span>•</span>
                <span>ID: {content.id || content.contentId}</span>
                {isQuizType && (
                  <>
                    <span>•</span>
                    <span className={content.quiz || content.quizId ? 'text-emerald-600' : 'text-amber-600'}>
                      {content.quiz || content.quizId ? 'Quiz Active' : 'Quiz Pending'}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1">
    
              <>
                
                
                {isVideoType && (
                  <button
                    onClick={() => setShowVideoPlayer(true)}
                    disabled={content.uploadStatus !== 3}
                    className="flex items-center px-1.5 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50"
                  >
                   <div><PlayCircle className="w-4 h-3 mr-0.5" /></div> 
                    Play
                  </button>
                )}
                
                <button
                  onClick={handleDelete}
                  className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-3" />
                </button>
              </>
            
          </div>
        </div>
      </div>

      {/* Compact Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-4 px-3">
            {[
              { id: 'overview', label: 'Overview', icon: Eye },
              ...(isQuizType ? [{ id: 'quiz', label: 'Quiz', icon: Brain }] : []),
              ...(isVideoType ? [{ id: 'video', label: 'Video', icon: PlayCircle }] : []),
            ].map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-2.5 text-xs font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-[#0AAC9E] text-[#0AAC9E]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
                  }`}
                >
                 <div><TabIcon className="w-4 h-3 mr-1" /></div> 
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-3">
          {activeTab === 'overview' && (
            <div className="space-y-3">
              <h3 className="text-xs font-medium text-gray-900">Content Details</h3>
              
             
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    {[
                      { label: 'Type', value: contentConfig.description },
                      { label: 'Description', value: content.description || 'No description' },
                      { label: 'Status', value: content.hideContent ? 'Hidden' : 'Visible', icon: content.hideContent ? EyeOff : Eye },
                      ...(isQuizType ? [{ label: 'Quiz Status', value: content.quiz || content.quizId ? 'Active' : 'Needs Setup', icon: content.quiz || content.quizId ? CheckCircle2 : Clock }] : []),
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between py-1.5 border-b border-gray-100">
                        <span className="text-xs font-medium text-gray-500">{item.label}</span>
                        <span className="flex items-center text-xs text-gray-800">
                          {item.icon && <item.icon className="w-4 h-3 mr-0.5" />}
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-1.5">
                    {[
                      { label: 'Discussions', value: content.isDiscussionEnabled ? 'Enabled' : 'Disabled' },
                      { label: 'Meetings', value: content.isMeetingAllowed ? 'Allowed' : 'Not Allowed' },
                      ...(content.createdByUserName ? [{ label: 'Created By', value: content.createdByUserName }] : []),
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between py-1.5 border-b border-gray-100">
                        <span className="text-xs font-medium text-gray-500">{item.label}</span>
                        <span className="text-xs text-gray-800">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              

              {(content.contentString || content.data || isQuizType || isVideoType) && (
                <div className="mt-3 space-y-2">
                  <h3 className="text-xs font-medium text-gray-900">Content Preview</h3>
                  {renderContentPreview()}
                </div>
              )}
            </div>
          )}

          {activeTab === 'quiz' && isQuizType && (
            <div className="space-y-3">
              <EnhancedQuizDisplayComponent 
                content={content}
                onCreateQuiz={handleCreateQuiz}
                loading={false}
              />
            </div>
          )}

          {activeTab === 'video' && isVideoType && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-xs font-medium text-gray-900 flex items-center">
                  <div><PlayCircle className="w-4 h-3 mr-1.5 text-red-600" /></div>  
                    Video Player
                  </h3>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Play video with subtitles and interactions.
                  </p>
                </div>
              </div>

              {content.uploadStatus === 3 ? (
                <div className="bg-black rounded overflow-hidden">
                  <div className="aspect-video">
                    <CompleteVideoPlayer
                      content={content}
                      onClose={() => setActiveTab('overview')}
                      showInteractions={true}
                      showSubtitles={true}
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-gray-100 rounded p-6 text-center">
                  <div className="max-w-xs mx-auto">
                    {content.uploadStatus === 1 ? (
                      <>
                        <Loader2 className="w-6 h-6 text-blue-600 mx-auto mb-2 animate-spin" />
                        <h4 className="text-xs font-medium text-gray-900 mb-0.5">Processing Video</h4>
                        <p className="text-xs text-gray-600 mb-2">
                          Video is being processed for streaming.
                        </p>
                        <div className="w-full bg-gray-200 rounded-full h-1 mb-1">
                          <div 
                            className="bg-blue-500 h-1 rounded-full transition-all duration-300" 
                            style={{ width: `${content.uploadProgress || 0}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500">{content.uploadProgress || 0}% complete</p>
                      </>
                    ) : content.uploadStatus === 2 ? (
                      <>
                        <Upload className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                        <h4 className="text-xs font-medium text-gray-900 mb-0.5">Uploading Video</h4>
                        <p className="text-xs text-gray-600">Video is being uploaded to server.</p>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
                        <h4 className="text-xs font-medium text-gray-900 mb-0.5">Video Not Ready</h4>
                        <p className="text-xs text-gray-600">Upload failed or still pending.</p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Full Video Player Modal */}
      {showVideoPlayer && isVideoType && (
        <div className="fixed inset-0 bg-black z-50">
          <CompleteVideoPlayer
            content={content}
            onClose={() => setShowVideoPlayer(false)}
            showInteractions={true}
            showSubtitles={true}
          />
        </div>
      )}

      {/* Error Display */}
      {contentError && (
        <div className="bg-red-50 border border-red-200 rounded p-2.5 mb-3">
          <div className="flex items-start space-x-1.5">
            <AlertCircle className="w-3 h-3 text-red-600 mt-0.5" />
            <div>
              <h4 className="text-xs font-medium text-red-900">Error Loading Content</h4>
              <p className="text-xs text-red-700 mt-0.5">{contentError}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdatedContentDetailView;