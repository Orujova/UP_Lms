import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { 
  Brain,
  Target,
  Clock,
  Award,
  ListChecks,
  HelpCircle,
  Plus,
  Edit3,
  PlayCircle,
  BarChart3,
  AlertCircle,
  Loader2,
  RefreshCw,
  Star,
  Check,
  Move3D,
  Type,
  Link2,
  X,
  ArrowRight,
  ArrowLeft,
  Save,
  Trash2
} from "lucide-react";

// API functions
import { getQuizzesByContentId } from "@/api/course";
import axios from 'axios';
import { getToken } from '@/authtoken/auth.js';

const API_URL = 'https://demoadmin.databyte.app/api/';

const getHeaders = () => {
  const token = getToken();
  return {
    accept: '*/*',
    Authorization: `Bearer ${token}`,
  };
};

// Quiz API functions
const updateQuizAPI = async (updateData) => {
  try {
    // API expects direct object without request wrapper
    const payload = {
      quizId: updateData.quizId,
      contentId: updateData.contentId,
    };

    // Only add duration if provided
    if (updateData.duration) {
      payload.duration = updateData.duration;
    }
    
    // Only add canSkip if provided
    if (updateData.canSkip !== undefined) {
      payload.canSkip = updateData.canSkip;
    }

    console.log('Update quiz payload:', payload);

    const response = await axios.put(`${API_URL}Course/update-quiz`, payload, {
      headers: { ...getHeaders(), 'Content-Type': 'application/json' }
    });
    return response.data;
  } catch (error) {
    console.error('Update quiz error:', error.response?.data || error);
    throw new Error(`Failed to update quiz: ${error.response?.data?.detail || error.message}`);
  }
};

const deleteQuizAPI = async (quizId) => {
  try {
    const payload = { quizId };

    console.log('Delete quiz payload:', payload);

    const response = await axios.delete(`${API_URL}Course/delete-quiz`, {
      headers: { ...getHeaders(), 'Content-Type': 'application/json' },
      data: payload
    });
    return response.data;
  } catch (error) {
    console.error('Delete quiz error:', error.response?.data || error);
    throw new Error(`Failed to delete quiz: ${error.response?.data?.detail || error.message}`);
  }
};

const addQuestionAPI = async (questionData) => {
  try {
    const payload = {
      ...questionData,
      duration: questionData.duration ? { 
        ticks: questionData.duration * 10000000 // seconds to ticks
      } : { ticks: 300000000 } // 30 seconds default
    };

    const response = await axios.post(`${API_URL}Course/AddQuestion`, payload, {
      headers: { ...getHeaders(), 'Content-Type': 'application/json' }
    });
    return response.data;
  } catch (error) {
    console.error('Add question error:', error.response?.data || error);
    throw new Error(`Failed to add question: ${error.response?.data?.detail || error.message}`);
  }
};

const updateQuestionAPI = async (updateData) => {
  try {
    const payload = {
      ...updateData
    };

    if (updateData.duration) {
      payload.duration = { ticks: updateData.duration * 10000000 };
    }

    const response = await axios.put(`${API_URL}Course/update-question`, payload, {
      headers: { ...getHeaders(), 'Content-Type': 'application/json' }
    });
    return response.data;
  } catch (error) {
    console.error('Update question error:', error.response?.data || error);
    throw new Error(`Failed to update question: ${error.response?.data?.detail || error.message}`);
  }
};

const deleteQuestionAPI = async (questionId) => {
  try {
    const payload = { questionId };

    const response = await axios.delete(`${API_URL}Course/delete-question`, {
      headers: { ...getHeaders(), 'Content-Type': 'application/json' },
      data: payload
    });
    return response.data;
  } catch (error) {
    console.error('Delete question error:', error.response?.data || error);
    throw new Error(`Failed to delete question: ${error.response?.data?.detail || error.message}`);
  }
};

const addOptionAPI = async (optionData) => {
  try {
    const payload = optionData;

    const response = await axios.post(`${API_URL}Course/AddOption`, payload, {
      headers: { ...getHeaders(), 'Content-Type': 'application/json' }
    });
    return response.data;
  } catch (error) {
    console.error('Add option error:', error.response?.data || error);
    throw new Error(`Failed to add option: ${error.response?.data?.detail || error.message}`);
  }
};

const updateOptionAPI = async (updateData) => {
  try {
    const payload = updateData;

    const response = await axios.put(`${API_URL}Course/update-option`, payload, {
      headers: { ...getHeaders(), 'Content-Type': 'application/json' }
    });
    return response.data;
  } catch (error) {
    console.error('Update option error:', error.response?.data || error);
    throw new Error(`Failed to update option: ${error.response?.data?.detail || error.message}`);
  }
};

const deleteOptionAPI = async (optionId) => {
  try {
    const payload = { optionId };

    const response = await axios.delete(`${API_URL}Course/delete-option`, {
      headers: { ...getHeaders(), 'Content-Type': 'application/json' },
      data: payload
    });
    return response.data;
  } catch (error) {
    console.error('Delete option error:', error.response?.data || error);
    throw new Error(`Failed to delete option: ${error.response?.data?.detail || error.message}`);
  }
};

const EnhancedQuizDisplayComponent = ({ content, onEditQuiz, onCreateQuiz, loading }) => {
  const [quizDetails, setQuizDetails] = useState(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState(null);
  const [showQuizPreview, setShowQuizPreview] = useState(false);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});

  const isQuizType = content.type === 2 || content.contentType === 'Quiz';
  
  if (!isQuizType) return null;

  // Enhanced quiz detection
  const hasQuiz = content.quiz || content.quizId || content.quizzes?.length > 0 || 
                 content.questions?.length > 0 || quizDetails?.length > 0;
  
  const quizData = content.quiz || (content.quizzes && content.quizzes[0]) || 
                  (content.questions?.length > 0 ? { questions: content.questions } : {}) ||
                  (quizDetails?.length > 0 ? quizDetails[0] : {});

  // Load quiz details
  useEffect(() => {
    const loadQuizDetails = async () => {
      if (content?.id || content?.contentId) {
        setQuizLoading(true);
        setQuizError(null);
        try {
          const quizResponse = await getQuizzesByContentId(content.id || content.contentId);
          setQuizDetails(quizResponse);
        } catch (error) {
          setQuizError(error.message);
        } finally {
          setQuizLoading(false);
        }
      }
    };

    loadQuizDetails();
  }, [content?.id, content?.contentId]);

  // Quiz statistics calculation
  const getQuizStats = () => {
    const apiQuizData = quizDetails?.length > 0 ? quizDetails[0] : null;
    const questions = apiQuizData?.questions || quizData.questions || content.questions || [];
    
    if (!hasQuiz && !apiQuizData && quizDetails?.length === 0) {
      return {
        totalQuestions: 0,
        totalPoints: 0,
        estimatedTime: 0,
        difficultyLevel: 'Not Set',
        hasQuestions: false,
        quizTitle: content.description || 'Untitled Quiz'
      };
    }

    const totalQuestions = questions.length;
    const totalPoints = questions.reduce((sum, q) => sum + (q.questionRate || q.points || 1), 0);
    
    // Parse duration properly - handle "241.00:00:00" format
    let totalDuration = 0;
    if (apiQuizData?.duration) {
      const duration = apiQuizData.duration;
      if (typeof duration === 'string') {
        // Parse "241.00:00:00" format (days.hours:minutes:seconds)
        const parts = duration.split(':');
        if (parts.length >= 3) {
          const dayHour = parts[0].split('.');
          const days = dayHour.length > 1 ? parseInt(dayHour[0]) || 0 : 0;
          const hours = dayHour.length > 1 ? parseInt(dayHour[1]) || 0 : parseInt(dayHour[0]) || 0;
          const minutes = parseInt(parts[1]) || 0;
          totalDuration = (days * 24 * 60) + (hours * 60) + minutes;
        } else {
          totalDuration = 20; // Default 20 minutes
        }
      } else {
        totalDuration = duration * 60;
      }
    } else {
      totalDuration = questions.reduce((sum, q) => {
        if (q.duration && typeof q.duration === 'string') {
          const parts = q.duration.split(':');
          return sum + (parseInt(parts[2]) || 30);
        }
        return sum + (q.duration || 30);
      }, 0) / 60;
    }
    
    let difficultyLevel = 'Easy';
    const complexityScore = totalQuestions * 2 + (totalDuration / 60) + totalPoints;
    
    if (complexityScore > 60) difficultyLevel = 'Hard';
    else if (complexityScore > 30) difficultyLevel = 'Medium';

    return {
      totalQuestions,
      totalPoints,
      estimatedTime: Math.max(1, Math.ceil(totalDuration)),
      difficultyLevel,
      hasQuestions: totalQuestions > 0,
      quizTitle: apiQuizData?.title || content.description || 'Untitled Quiz',
      questions: questions,
      quizId: apiQuizData?.quizId || apiQuizData?.id
    };
  };

  const quizStats = getQuizStats();

  // Event handlers
  const handleQuizPreview = useCallback(() => {
    setShowQuizPreview(true);
  }, []);

  const handleRefreshQuiz = useCallback(async () => {
    if (content?.id || content?.contentId) {
      setQuizLoading(true);
      setQuizError(null);
      try {
        const quizResponse = await getQuizzesByContentId(content.id || content.contentId);
        setQuizDetails(quizResponse);
      } catch (error) {
        setQuizError(error.message);
      } finally {
        setQuizLoading(false);
      }
    }
  }, [content?.id, content?.contentId]);

  // Delete quiz API integration
  const handleDeleteQuiz = useCallback(async () => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) return;
    
    setQuizLoading(true);
    try {
      const quizId = quizData?.id || quizData?.quizId;
      if (quizId) {
        await deleteQuizAPI(quizId);
        setQuizDetails(null);
        handleRefreshQuiz();
      }
    } catch (error) {
      setQuizError(error.message);
    } finally {
      setQuizLoading(false);
    }
  }, [quizData, handleRefreshQuiz]);

  // Update quiz API integration
  const handleUpdateQuiz = useCallback(async () => {
    if (!editData.duration && editData.canSkip === undefined) return;
    
    setQuizLoading(true);
    try {
      const quizId = quizData?.id || quizData?.quizId;
      const updatePayload = {
        quizId: quizId,
        contentId: content.id || content.contentId,
      };

      // Convert minutes to seconds for TimeSpan format
      if (editData.duration) {
        updatePayload.duration = editData.duration * 60; // Convert minutes to seconds
      }
      
      if (editData.canSkip !== undefined) {
        updatePayload.canSkip = editData.canSkip;
      }

      await updateQuizAPI(updatePayload);
      setEditMode(false);
      setEditData({});
      handleRefreshQuiz();
    } catch (error) {
      setQuizError(error.message);
    } finally {
      setQuizLoading(false);
    }
  }, [editData, quizData, content, handleRefreshQuiz]);

  const getQuestionTypeIcon = (questionType) => {
    const iconMap = {
      1: Target, 2: Check, 3: Move3D, 4: Type, 5: Link2
    };
    return iconMap[questionType] || HelpCircle;
  };

  const getQuestionTypeName = (questionType) => {
    const nameMap = {
      1: 'Single Choice', 2: 'Multiple Choice', 3: 'Reorder', 4: 'Fill Gap', 5: 'Categorize'
    };
    return nameMap[questionType] || 'Unknown';
  };

  const renderQuestionContent = (question) => {
    const QuestionIcon = getQuestionTypeIcon(question.questionType);
    const typeName = getQuestionTypeName(question.questionType);

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded bg-[#0AAC9E]/10 flex items-center justify-center">
              <QuestionIcon className="w-3 h-3 text-[#0AAC9E]" />
            </div>
            <div>
              <h5 className="text-sm font-medium text-gray-900">
                {question.title || `Question ${activeQuestionIndex + 1}`}
              </h5>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <span className="px-1.5 py-0.5 rounded bg-[#0AAC9E]/10 text-[#0AAC9E]">
                  {typeName}
                </span>
                <span>{question.questionRate || 1} pts</span>
                <span>{question.duration || 30}s</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded p-2.5">
          <p className="text-sm text-gray-800">
            {question.text || 'No question text provided'}
          </p>
        </div>

        {(question.questionType === 1 || question.questionType === 2) && question.options && (
          <div className="space-y-1.5">
            <h6 className="text-xs font-medium text-gray-700 flex items-center">
              <ListChecks className="w-3 h-3 mr-1" />
              Options:
            </h6>
            <div className="space-y-1.5">
              {question.options.map((option, index) => (
                <div 
                  key={option.id || index}
                  className={`p-2 rounded border text-xs ${
                    option.isCorrect 
                      ? 'bg-[#0AAC9E]/5 border-[#0AAC9E]/30' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
                      option.isCorrect 
                        ? 'bg-[#0AAC9E] text-white' 
                        : 'bg-gray-300 text-gray-600'
                    }`}>
                      {option.isCorrect ? '✓' : String.fromCharCode(65 + index)}
                    </div>
                    <span className="text-gray-700">{option.text}</span>
                    {option.isCorrect && <Star className="w-3 h-3 text-[#0AAC9E]" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {question.questionType === 4 && question.options && (
          <div className="space-y-1.5">
            <h6 className="text-xs font-medium text-gray-700 flex items-center">
              <Type className="w-3 h-3 mr-1" />
              Correct Answers:
            </h6>
            {question.options.filter(opt => opt.isCorrect).map((option, index) => (
              <div key={option.id || index} className="p-2 rounded bg-orange-50 border border-orange-200">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs">
                    {index + 1}
                  </div>
                  <span className="text-xs text-gray-700">{option.text}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Quiz Header */}
      <div className="bg-[#0AAC9E]/5 border border-[#0AAC9E]/20 rounded p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[#0AAC9E] rounded flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">Interactive Quiz</h3>
              <p className="text-xs text-gray-600 mb-1">
                {hasQuiz 
                  ? `${quizStats.totalQuestions} questions, ${quizStats.totalPoints} points` 
                  : 'No quiz configured'
                }
              </p>
              {hasQuiz && (
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <span className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    ~{quizStats.estimatedTime} min
                  </span>
                  <span className="flex items-center">
                    <Award className="w-3 h-3 mr-1" />
                    {quizStats.difficultyLevel}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-1.5">
            <button
              onClick={handleRefreshQuiz}
              disabled={quizLoading}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${quizLoading ? 'animate-spin' : ''}`} />
            </button>

            {hasQuiz ? (
              <>
                <button
                  onClick={handleQuizPreview}
                  className="flex items-center px-2.5 py-1.5 text-xs font-medium text-[#0AAC9E] bg-[#0AAC9E]/10 rounded hover:bg-[#0AAC9E]/20"
                >
                  <PlayCircle className="w-3.5 h-3.5 mr-1" />
                  Preview
                </button>
                <button
                  onClick={() => setEditMode(!editMode)}
                  className="flex items-center px-2.5 py-1.5 text-xs font-medium text-orange-700 bg-orange-100 rounded hover:bg-orange-200"
                >
                  <Edit3 className="w-3.5 h-3.5 mr-1" />
                  {editMode ? 'Cancel' : 'Edit'}
                </button>
                {editMode && (
                  <button
                    onClick={handleUpdateQuiz}
                    disabled={quizLoading}
                    className="flex items-center px-2.5 py-1.5 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5 mr-1" />
                    Save
                  </button>
                )}
                <button
                  onClick={handleDeleteQuiz}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <button
                onClick={onCreateQuiz}
                disabled={loading || quizLoading}
                className="flex items-center px-3 py-1.5 text-xs font-medium text-white bg-[#0AAC9E] rounded hover:bg-[#0AAC9E]/90 disabled:opacity-50"
              >
                {loading || quizLoading ? (
                  <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                ) : (
                  <Plus className="w-3.5 h-3.5 mr-1" />
                )}
                Create Quiz
              </button>
            )}
          </div>
        </div>

        {/* Edit Form */}
        {editMode && hasQuiz && (
          <div className="mt-4 pt-4 border-t border-[#0AAC9E]/20">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  min="1"
                  max="180"
                  value={editData.duration || quizData?.duration || 20}
                  onChange={(e) => setEditData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#0AAC9E]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Settings</label>
                <div className="flex items-center space-x-3">
                  <label className="flex items-center text-xs">
                    <input
                      type="checkbox"
                      checked={editData.canSkip !== undefined ? editData.canSkip : (quizData?.canSkip || false)}
                      onChange={(e) => setEditData(prev => ({ ...prev, canSkip: e.target.checked }))}
                      className="w-3 h-3 text-[#0AAC9E] border-gray-300 rounded mr-1.5"
                    />
                    Allow Skip
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quiz Statistics */}
      {hasQuiz && (
        <div className="grid grid-cols-4 gap-3">
          <div className="text-center p-3 bg-[#0AAC9E]/5 rounded border border-[#0AAC9E]/20">
            <div className="text-lg font-semibold text-[#0AAC9E]">{quizStats.totalQuestions}</div>
            <div className="text-xs text-gray-600">Questions</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded border border-green-200">
            <div className="text-lg font-semibold text-green-600">{quizStats.totalPoints}</div>
            <div className="text-xs text-gray-600">Points</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded border border-purple-200">
            <div className="text-lg font-semibold text-purple-600">{quizStats.estimatedTime}m</div>
            <div className="text-xs text-gray-600">Duration</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded border border-orange-200">
            <div className="text-lg font-semibold text-orange-600">{quizStats.difficultyLevel}</div>
            <div className="text-xs text-gray-600">Level</div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!hasQuiz && (
        <div className="text-center py-6 bg-gray-50 border border-dashed border-gray-300 rounded">
          <Brain className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <h3 className="text-sm font-medium text-gray-900 mb-1">Create Interactive Quiz</h3>
          <p className="text-xs text-gray-500 mb-3 max-w-sm mx-auto">
            Transform this content into an engaging learning experience.
          </p>
          <button
            onClick={onCreateQuiz}
            disabled={loading || quizLoading}
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-[#0AAC9E] rounded hover:bg-[#0AAC9E]/90 disabled:opacity-50"
          >
            {loading || quizLoading ? (
              <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
            ) : (
              <Plus className="w-3.5 h-3.5 mr-1" />
            )}
            Create Quiz
          </button>
        </div>
      )}

      {/* Error Display */}
      {quizError && (
        <div className="bg-red-50 border border-red-200 rounded p-3">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <div className="flex-1">
              <h4 className="text-xs font-medium text-red-900">Error</h4>
              <p className="text-xs text-red-700">{quizError}</p>
            </div>
            <button
              onClick={() => {
                setQuizError(null);
                handleRefreshQuiz();
              }}
              className="px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded hover:bg-red-200"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Quiz Preview Modal */}
      {showQuizPreview && hasQuiz && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b bg-gray-50">
              <div className="flex items-center space-x-2">
                <Brain className="w-4 h-4 text-[#0AAC9E]" />
                <h3 className="text-sm font-medium text-gray-900">Quiz Preview</h3>
              </div>
              <button
                onClick={() => setShowQuizPreview(false)}
                className="p-1.5 text-gray-500 hover:text-gray-700 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex h-[calc(90vh-60px)]">
              <div className="w-48 border-r bg-gray-50 overflow-y-auto">
                <div className="p-3 border-b bg-white">
                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    <div className="text-center p-1.5 bg-[#0AAC9E]/5 rounded">
                      <div className="font-semibold text-[#0AAC9E]">{quizStats.totalQuestions}</div>
                      <div className="text-gray-600">Questions</div>
                    </div>
                    <div className="text-center p-1.5 bg-green-50 rounded">
                      <div className="font-semibold text-green-600">{quizStats.totalPoints}</div>
                      <div className="text-gray-600">Points</div>
                    </div>
                  </div>
                </div>

                <div className="p-2 space-y-1.5">
                  {quizStats.questions.map((question, index) => {
                    const QuestionIcon = getQuestionTypeIcon(question.questionType);
                    const isActive = index === activeQuestionIndex;
                    
                    return (
                      <button
                        key={question.id || index}
                        onClick={() => setActiveQuestionIndex(index)}
                        className={`w-full text-left p-2 rounded border text-xs ${
                          isActive 
                            ? 'border-[#0AAC9E] bg-[#0AAC9E]/5' 
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-1.5">
                          <div className={`w-4 h-4 rounded flex items-center justify-center ${
                            isActive ? 'bg-[#0AAC9E]' : 'bg-gray-100'
                          }`}>
                            <QuestionIcon className={`w-2.5 h-2.5 ${
                              isActive ? 'text-white' : 'text-gray-600'
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 truncate">
                              Q{index + 1}: {question.title || question.text?.substring(0, 12) + '...' || 'Untitled'}
                            </div>
                            <div className="text-gray-500 flex items-center space-x-1">
                              <span>{question.questionRate || 1}pts</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="p-4">
                  {quizStats.questions[activeQuestionIndex] && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between bg-gray-50 rounded p-2.5">
                        <button
                          onClick={() => setActiveQuestionIndex(Math.max(0, activeQuestionIndex - 1))}
                          disabled={activeQuestionIndex === 0}
                          className="flex items-center px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                        >
                          <ArrowLeft className="w-3 h-3 mr-1" />
                          Previous
                        </button>

                        <div className="text-center">
                          <div className="text-sm font-medium text-gray-900">
                            Question {activeQuestionIndex + 1} of {quizStats.questions.length}
                          </div>
                          <div className="text-xs text-gray-600">
                            {getQuestionTypeName(quizStats.questions[activeQuestionIndex].questionType)}
                          </div>
                        </div>

                        <button
                          onClick={() => setActiveQuestionIndex(Math.min(quizStats.questions.length - 1, activeQuestionIndex + 1))}
                          disabled={activeQuestionIndex === quizStats.questions.length - 1}
                          className="flex items-center px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                        >
                          Next
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </button>
                      </div>

                      <div className="bg-white border border-gray-200 rounded p-3">
                        {renderQuestionContent(quizStats.questions[activeQuestionIndex])}
                      </div>

                      <div className="bg-gray-50 rounded p-2.5">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-medium text-gray-700">Progress</span>
                          <span className="text-xs text-gray-500">
                            {Math.round(((activeQuestionIndex + 1) / quizStats.questions.length) * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="bg-[#0AAC9E] h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${((activeQuestionIndex + 1) / quizStats.questions.length) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedQuizDisplayComponent;