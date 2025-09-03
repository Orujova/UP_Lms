import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { 
  X, 
  Plus, 
  Trash2, 
  ListChecks , 
  Check, 
  Clock, 
  HelpCircle,
  ChevronUp,
  ChevronDown,
  Move3D,
  Target,
  Type,
  Link2,
  CheckCircle,
  AlertCircle,
  Brain,
  BookOpen,
  Settings,
  PlayCircle,
  Award,
  Loader2,
  Save,

  FileText,

  ArrowRight,
  ArrowLeft,
  Star,
  Timer,
  Tag,
  Folder,
  ChevronDown as ChevronDownIcon
} from "lucide-react";

// Redux actions
import {
  setModalOpen,
  closeAllModals
} from "@/redux/course/courseSlice";

// API functions
import {
  addQuiz,
  addQuestions,
  addOptions
} from "@/api/quiz";

const QuizModal = () => {
  const dispatch = useDispatch();
  
  const { 
    modals, 
    activeSection,
    editingContent,
    currentCourse,
    loading
  } = useSelector((state) => state.course || {});

  const isOpen = modals?.addQuiz || modals?.editQuiz || false;
  const isEditing = modals?.editQuiz && editingContent;

  // Quiz state
  const [quizState, setQuizState] = useState({
    contentId: null,
    duration: 20,
    canSkip: true,
    title: '',
    questions: [],
    quizId: null
  });

  const [expandedQuestions, setExpandedQuestions] = useState(new Set());
  const [showQuestionTypes, setShowQuestionTypes] = useState(false);
  const [step, setStep] = useState('settings');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Helper function to format duration for API
  const formatDurationForAPI = useCallback((seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Question types mapping
  const questionTypes = useMemo(() => [
    {
      type: 1,
      apiType: "choice",
      title: "Single Choice",
      description: "One correct answer",
      icon: Target,
      color: "#0AAC9E",
      example: "What is the capital of France?"
    },
    {
      type: 2,
      apiType: "multiple", 
      title: "Multiple Choice", 
      description: "Multiple correct answers",
      icon: Check,
      color: "#0AAC9E",
      example: "Select all programming languages"
    },
    {
      type: 3,
      apiType: "reorder",
      title: "Reorder",
      description: "Arrange items in order",
      icon: Move3D,
      color: "#0AAC9E",
      example: "Arrange steps in order"
    },
    {
      type: 4,
      apiType: "fillgap",
      title: "Fill the Gap",
      description: "Type the correct answer",
      icon: Type,
      color: "#0AAC9E",
      example: "The sky is ___ in color"
    },
    {
      type: 5,
      apiType: "categorize",
      title: "Categorize",
      description: "Group items by category",
      icon: Link2,
      color: "#0AAC9E",
      example: "Group animals by habitat"
    }
  ], []);

  // Initialize state
  useEffect(() => {
    if (!isOpen) return;

    // Check for pending quiz data from localStorage
    const pendingData = localStorage.getItem('pendingQuizData');
    if (pendingData && !isEditing) {
      try {
        const quizData = JSON.parse(pendingData);
        setQuizState({
          contentId: quizData.contentId,
          duration: quizData.duration || 20,
          canSkip: quizData.canSkip !== undefined ? quizData.canSkip : true,
          title: quizData.title || '',
          questions: [],
          quizId: null
        });
        localStorage.removeItem('pendingQuizData');
      } catch (error) {
        console.error('Error parsing pending quiz data:', error);
      }
    } else if (isEditing && editingContent) {
      const existingQuiz = editingContent.quiz || editingContent.quizData;
      const existingQuestions = existingQuiz?.questions || editingContent.questions || [];
      
      setQuizState({
        contentId: editingContent.id || editingContent.contentId,
        duration: existingQuiz?.duration || 20,
        canSkip: existingQuiz?.canSkip || true,
        title: editingContent.description || 'Untitled Quiz',
        questions: existingQuestions,
        quizId: existingQuiz?.id || existingQuiz?.quizId || null
      });
    } else {
      setQuizState({
        contentId: editingContent?.id || editingContent?.contentId || null,
        duration: 20,
        canSkip: true,
        title: '',
        questions: [],
        quizId: null
      });
    }
    
    setError(null);
    setSuccessMessage(null);
    setStep('settings');
    setExpandedQuestions(new Set());
  }, [isOpen, isEditing, editingContent]);

  const handleClose = useCallback(() => {
    if (!saving) {
      dispatch(closeAllModals());
      setError(null);
      setSuccessMessage(null);
      setStep('settings');
      setQuizState({
        contentId: null,
        duration: 20,
        canSkip: true,
        title: '',
        questions: [],
        quizId: null
      });
      setExpandedQuestions(new Set());
      localStorage.removeItem('pendingQuizData');
    }
  }, [dispatch, saving]);

  // Toggle question expansion
  const toggleQuestionExpansion = useCallback((questionId) => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  }, []);

  // Add question with proper API structure
  const handleAddQuestion = useCallback((questionTypeObj, insertIndex = null) => {
    const newQuestion = {
      id: `temp_${Date.now()}`,
      quizId: quizState.quizId,
      text: "",
      title: `Question ${quizState.questions.length + 1}`,
      questionRate: 1,
      duration: 30, // Auto-set to 30 seconds
      hasDuration: true,
      canSkip: false,
      questionType: questionTypeObj.type,
      categories: [questionTypeObj.title], // Use question type as category
      content: {
        answers: questionTypeObj.apiType === "choice" || questionTypeObj.apiType === "multiple" 
          ? ["", "", "", ""] 
          : questionTypeObj.apiType === "fillgap"
          ? [""]
          : questionTypeObj.apiType === "reorder"
          ? ["", ""]
          : [],
        correctAnswers: [],
        categories: questionTypeObj.apiType === "categorize" 
          ? [{ name: "", items: [""] }] 
          : undefined,
        items: questionTypeObj.apiType === "reorder" 
          ? ["", ""] 
          : undefined
      }
    };

    setQuizState(prev => {
      const newQuestions = [...prev.questions];
      if (insertIndex !== null) {
        newQuestions.splice(insertIndex + 1, 0, newQuestion);
      } else {
        newQuestions.push(newQuestion);
      }
      return {
        ...prev,
        questions: newQuestions
      };
    });

    // Expand the new question
    setExpandedQuestions(prev => new Set([...prev, newQuestion.id]));
    setShowQuestionTypes(false);
    setStep('questions');
  }, [quizState.questions.length, quizState.quizId]);

  // Update question
  const handleUpdateQuestion = useCallback((questionId, field, value) => {
    setQuizState(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId 
          ? { ...q, [field]: value }
          : q
      )
    }));
  }, []);

  // Update question content
  const handleUpdateQuestionContent = useCallback((questionId, field, value) => {
    setQuizState(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId 
          ? { 
              ...q, 
              content: {
                ...q.content,
                [field]: value
              }
            }
          : q
      )
    }));
  }, []);

  // Delete question
  const handleDeleteQuestion = useCallback((questionId) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      setQuizState(prev => ({
        ...prev,
        questions: prev.questions.filter(q => q.id !== questionId)
      }));
      
      setExpandedQuestions(prev => {
        const newSet = new Set(prev);
        newSet.delete(questionId);
        return newSet;
      });
    }
  }, []);

  // Save quiz to API
  const handleSaveQuiz = useCallback(async () => {
    // Validation
    if (!quizState.contentId) {
      setError("Content ID is missing. Please try again.");
      return;
    }

    if (!quizState.title.trim()) {
      setError("Please enter a quiz title.");
      return;
    }

    if (quizState.questions.length === 0) {
      setError("Please add at least one question to the quiz.");
      return;
    }

    // Validate questions
    for (let i = 0; i < quizState.questions.length; i++) {
      const question = quizState.questions[i];
      if (!question.text.trim()) {
        setError(`Question ${i + 1} is missing question text.`);
        return;
      }

      // Type-specific validation
      if ((question.questionType === 1 || question.questionType === 2) && 
          (!question.content.answers || question.content.answers.filter(a => a.trim()).length < 2)) {
        setError(`Question ${i + 1} must have at least 2 answer choices.`);
        return;
      }

      if ((question.questionType === 1 || question.questionType === 2) && 
          (!question.content.correctAnswers || question.content.correctAnswers.length === 0)) {
        setError(`Question ${i + 1} must have at least one correct answer.`);
        return;
      }

      if (question.questionType === 4 && 
          (!question.content.answers || question.content.answers.filter(a => a.trim()).length === 0)) {
        setError(`Question ${i + 1} must have at least one correct answer for fill-in-the-gap.`);
        return;
      }
    }

    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      console.log('Creating quiz with API integration...');
      
      // STEP 1: Create quiz
      const quizResult = await addQuiz({
        contentId: quizState.contentId,
        duration: quizState.duration,
        canSkip: quizState.canSkip
      });

      if (!quizResult?.quizId) {
        throw new Error("Quiz creation failed - no quiz ID returned");
      }
      
      const quizId = quizResult.quizId;
      setQuizState(prev => ({ ...prev, quizId: quizId }));

      // STEP 2: Add questions
      if (quizState.questions.length > 0) {
        const questionsData = {
          questions: quizState.questions.map(question => ({
            quizId: quizId,
            text: question.text,
            title: question.text, // Same value for both text and title
            questionRate: question.questionRate,
            duration: formatDurationForAPI(question.duration),
            hasDuration: question.hasDuration,
            canSkip: question.canSkip,
            questionType: question.questionType,
            categories: question.categories || []
          }))
        };

        const questionsResult = await addQuestions(questionsData);

        // STEP 3: Add options for each question
        if (questionsResult?.questionIds && questionsResult.questionIds.length > 0) {
          for (let i = 0; i < questionsResult.questionIds.length; i++) {
            const question = quizState.questions[i];
            const questionId = questionsResult.questionIds[i];

            let optionsToAdd = [];

            if (question.questionType === 1 || question.questionType === 2) {
              // Choice questions
              optionsToAdd = question.content.answers
                .filter(answer => answer.trim() !== "")
                .map((answer, index) => ({
                  questionId: questionId,
                  text: answer,
                  isCorrect: question.content.correctAnswers?.includes(index) || false,
                  order: index,
                  gapText: answer,
                  category: ""
                }));
            } else if (question.questionType === 4) {
              // Fill gap questions
              optionsToAdd = question.content.answers
                .filter(answer => answer.trim() !== "")
                .map((answer, index) => ({
                  questionId: questionId,
                  text: answer,
                  isCorrect: true,
                  order: index,
                  gapText: answer,
                  category: ""
                }));
            } else if (question.questionType === 3) {
              // Reorder questions
              const items = question.content.items || question.content.answers || [];
              optionsToAdd = items
                .filter(item => item.trim() !== "")
                .map((item, index) => ({
                  questionId: questionId,
                  text: item,
                  isCorrect: true,
                  order: index,
                  gapText: item,
                  category: ""
                }));
            } else if (question.questionType === 5) {
              // Categorize questions
              if (question.content.categories) {
                question.content.categories.forEach(category => {
                  if (category.items && category.name.trim()) {
                    category.items
                      .filter(item => item.trim() !== "")
                      .forEach((item, itemIndex) => {
                        optionsToAdd.push({
                          questionId: questionId,
                          text: item,
                          isCorrect: true,
                          order: optionsToAdd.length,
                          gapText: item,
                          category: category.name
                        });
                      });
                  }
                });
              }
            }

            if (optionsToAdd.length > 0) {
              const optionsData = { options: optionsToAdd };
              await addOptions(optionsData);
            }
          }
        }
      }

      setSuccessMessage(`Quiz "${quizState.title}" created successfully with ${quizState.questions.length} questions!`);
      
      setTimeout(() => {
        handleClose();
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error("Failed to save quiz:", error);
      setError(error.message || "Failed to save quiz. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [quizState, handleClose, formatDurationForAPI]);

  // Quiz settings renderer
  const renderQuizSettings = () => (
    <div className="space-y-5">
      <div className="text-center py-5">
        <div className="w-12 h-12 bg-gradient-to-br from-[#0AAC9E] to-[#08887a] rounded-lg flex items-center justify-center mx-auto mb-3 shadow-md">
          <Brain className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Quiz Configuration</h3>
        <p className="text-xs text-gray-600 max-w-md mx-auto">Set up your quiz details and configure the basic settings</p>
      </div>

      <div className="space-y-4">
        {/* Quiz Title */}
        <div className="group">
          <label className="text-xs font-medium text-gray-900 mb-1.5 flex items-center">
           <div> <FileText className="w-4 h-3 mr-1.5 text-[#0AAC9E]" /></div>
            Quiz Title <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="text"
            value={quizState.title}
            onChange={(e) => setQuizState(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Enter quiz title"
            className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#0AAC9E]/20 focus:border-[#0AAC9E] transition-all duration-200 bg-white"
          />
        </div>

        {/* Quiz Settings Card */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-800 mb-3 flex items-center">
           <div><Settings className="w-4 h-4 mr-1.5 text-[#0AAC9E]" /></div> 
            Configuration
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-700 flex items-center">
               <div><Timer className="w-4 h-3 mr-1 text-[#0AAC9E]" /></div> 
                Duration (minutes)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="180"
                  value={quizState.duration}
                  onChange={(e) => setQuizState(prev => ({ ...prev, duration: parseInt(e.target.value) || 20 }))}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#0AAC9E]/20 focus:border-[#0AAC9E] transition-all bg-white"
                />
                <div className="absolute right-3 top-2 text-gray-400">
                  <Clock className="w-3 h-3" />
                </div>
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-700 flex items-center">
               <div><CheckCircle className="w-4 h-3 mr-1 text-[#0AAC9E]" /></div> 
                Allow Skip
              </label>
              <select
                value={quizState.canSkip}
                onChange={(e) => setQuizState(prev => ({ ...prev, canSkip: e.target.value === 'true' }))}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#0AAC9E]/20 focus:border-[#0AAC9E] transition-all bg-white"
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-gray-700 flex items-center">
               <div><Tag className="w-4 h-3 mr-1 text-[#0AAC9E]" /></div> 
                Content ID:
              </span>
              <span className="text-[#0AAC9E] font-mono bg-[#0AAC9E]/10 px-2 py-1 rounded text-xs">
                #{quizState.contentId || 'Not Set'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <div className="flex items-center text-xs text-gray-500">
          <div className="w-6 h-6 bg-[#0AAC9E] text-white rounded-full flex items-center justify-center text-xs font-semibold mr-2">1</div>
          Step 1 of 2
        </div>
        <button
          onClick={() => setStep('questions')}
          disabled={!quizState.contentId || !quizState.title.trim()}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-[#0AAC9E] to-[#08887a] text-white text-xs font-medium rounded-lg hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          Start Adding Questions
          <div><ArrowRight className="w-4 h-3 ml-1.5" /></div>
        </button>
      </div>
    </div>
  );

  // Choice options renderer
  const renderChoiceOptions = (question) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-medium text-gray-900 flex items-center">
         <div><ListChecks className="w-4 h-3 mr-1.5 text-[#0AAC9E]" /></div> 
          Answer Options <span className="text-red-500 ml-1">*</span>
        </h4>
        <div className="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded">
          {(question.content.correctAnswers || []).length} correct
        </div>
      </div>

      <div className="space-y-2">
        {question.content.answers.map((answer, index) => (
          <div key={index} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:border-gray-300 group bg-white">
            <button
              onClick={() => {
                const correctAnswers = question.content.correctAnswers || [];
                const isCorrect = correctAnswers.includes(index);
                
                let newCorrectAnswers;
                if (question.questionType === 1) {
                  newCorrectAnswers = isCorrect ? [] : [index];
                } else {
                  newCorrectAnswers = isCorrect 
                    ? correctAnswers.filter(i => i !== index)
                    : [...correctAnswers, index];
                }
                
                handleUpdateQuestionContent(question.id, 'correctAnswers', newCorrectAnswers);
              }}
              className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                (question.content.correctAnswers || []).includes(index)
                  ? 'border-[#0AAC9E] bg-[#0AAC9E]'
                  : 'border-gray-300 hover:border-[#0AAC9E]/50 bg-white'
              }`}
            >
              {(question.content.correctAnswers || []).includes(index) && (
                <Check className="w-3 h-3 text-white" />
              )}
            </button>
            
            <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
              {String.fromCharCode(65 + index)}
            </div>
            
            <input
              type="text"
              value={answer}
              onChange={(e) => {
                const newAnswers = [...question.content.answers];
                newAnswers[index] = e.target.value;
                handleUpdateQuestionContent(question.id, 'answers', newAnswers);
              }}
              placeholder={`Option ${String.fromCharCode(65 + index)}`}
              className="flex-1 px-3 py-1.5 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-[#0AAC9E]/20 focus:border-[#0AAC9E] transition-all"
            />
            
            {question.content.answers.length > 2 && (
              <button
                onClick={() => {
                  const newAnswers = question.content.answers.filter((_, i) => i !== index);
                  const newCorrectAnswers = (question.content.correctAnswers || [])
                    .filter(i => i !== index)
                    .map(i => i > index ? i - 1 : i);
                  
                  handleUpdateQuestionContent(question.id, 'answers', newAnswers);
                  handleUpdateQuestionContent(question.id, 'correctAnswers', newCorrectAnswers);
                }}
                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
        
        <button
          onClick={() => {
            const newAnswers = [...question.content.answers, ""];
            handleUpdateQuestionContent(question.id, 'answers', newAnswers);
          }}
          className="flex items-center justify-center gap-2 w-full px-3 py-2 text-xs text-[#0AAC9E] font-medium border border-dashed border-[#0AAC9E]/40 rounded-lg hover:bg-[#0AAC9E]/5 transition-all"
        >
         <div><Plus className="w-4 h-3" /></div> 
          Add Option
        </button>
      </div>
    </div>
  );

  // Fill gap options renderer
  const renderFillGapOptions = (question) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-medium text-gray-900 flex items-center">
          <div><Type className="w-4 h-3 mr-1.5 text-[#0AAC9E]" /></div>
          Correct Answers <span className="text-red-500 ml-1">*</span>
        </h4>
        <div className="text-xs font-medium text-[#0AAC9E] bg-[#0AAC9E]/10 px-2 py-0.5 rounded">
          {question.content.answers?.filter(a => a.trim()).length || 0} answers
        </div>
      </div>

      <div className="space-y-2">
        {(question.content.answers || [""]).map((answer, index) => (
          <div key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-gray-300 group bg-white">
            <div className="w-6 h-6 bg-gradient-to-br from-[#0AAC9E] to-[#08887a] rounded-full flex items-center justify-center text-xs font-medium text-white">
              {index + 1}
            </div>
            <input
              type="text"
              value={answer}
              onChange={(e) => {
                const newAnswers = [...(question.content.answers || [])];
                newAnswers[index] = e.target.value;
                handleUpdateQuestionContent(question.id, 'answers', newAnswers);
              }}
              placeholder={`Correct answer ${index + 1}`}
              className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-[#0AAC9E]/20 focus:border-[#0AAC9E] transition-all"
            />
            
            {(question.content.answers || []).length > 1 && (
              <button
                onClick={() => {
                  const newAnswers = (question.content.answers || []).filter((_, i) => i !== index);
                  handleUpdateQuestionContent(question.id, 'answers', newAnswers);
                }}
                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
        
        <button
          onClick={() => {
            const newAnswers = [...(question.content.answers || []), ""];
            handleUpdateQuestionContent(question.id, 'answers', newAnswers);
          }}
          className="flex items-center justify-center gap-2 w-full px-3 py-2 text-xs text-[#0AAC9E] font-medium border border-dashed border-[#0AAC9E]/40 rounded-lg hover:bg-[#0AAC9E]/5 transition-all"
        >
         <div> <Plus className="w-4 h-3" /></div>
          Add Answer
        </button>
      </div>
    </div>
  );

  // Reorder items renderer
  const renderReorderItems = (question) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-medium text-gray-900 flex items-center">
         <div><Move3D className="w-4 h-3 mr-1.5 text-[#0AAC9E]" /></div> 
          Items to Reorder <span className="text-red-500 ml-1">*</span>
        </h4>
        <div className="text-xs font-medium text-[#0AAC9E] bg-[#0AAC9E]/10 px-2 py-0.5 rounded">
          {(question.content.items || question.content.answers || []).filter(i => i.trim()).length} items
        </div>
      </div>

      <div className="space-y-2">
        {(question.content.items || question.content.answers || [""]).map((item, index) => (
          <div key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-gray-300 group bg-white">
            <div className="w-6 h-6 bg-gradient-to-br from-[#0AAC9E] to-[#08887a] rounded-full flex items-center justify-center text-xs font-medium text-white">
              {index + 1}
            </div>
            <input
              type="text"
              value={item}
              onChange={(e) => {
                const currentItems = question.content.items || question.content.answers || [];
                const newItems = [...currentItems];
                newItems[index] = e.target.value;
                
                if (question.content.items !== undefined) {
                  handleUpdateQuestionContent(question.id, 'items', newItems);
                } else {
                  handleUpdateQuestionContent(question.id, 'answers', newItems);
                }
              }}
              placeholder={`Item ${index + 1}`}
              className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-[#0AAC9E]/20 focus:border-[#0AAC9E] transition-all"
            />
            
            {(question.content.items || question.content.answers || []).length > 2 && (
              <button
                onClick={() => {
                  const currentItems = question.content.items || question.content.answers || [];
                  const newItems = currentItems.filter((_, i) => i !== index);
                  
                  if (question.content.items !== undefined) {
                    handleUpdateQuestionContent(question.id, 'items', newItems);
                  } else {
                    handleUpdateQuestionContent(question.id, 'answers', newItems);
                  }
                }}
                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
        
        <button
          onClick={() => {
            const currentItems = question.content.items || question.content.answers || [];
            const newItems = [...currentItems, ""];
            
            if (question.content.items !== undefined) {
              handleUpdateQuestionContent(question.id, 'items', newItems);
            } else {
              handleUpdateQuestionContent(question.id, 'answers', newItems);
            }
          }}
          className="flex items-center justify-center gap-2 w-full px-3 py-2 text-xs text-[#0AAC9E] font-medium border border-dashed border-[#0AAC9E]/40 rounded-lg hover:bg-[#0AAC9E]/5 transition-all"
        >
         <div> <Plus className="w-4 h-3" /></div>
          Add Item
        </button>
      </div>
    </div>
  );

  // Categorize items renderer
  const renderCategorizeItems = (question) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-medium text-gray-900 flex items-center">
         <div><Link2 className="w-4 h-3 mr-1.5 text-[#0AAC9E]" /></div> 
          Categories and Items <span className="text-red-500 ml-1">*</span>
        </h4>
        <div className="text-xs font-medium text-[#0AAC9E] bg-[#0AAC9E]/10 px-2 py-0.5 rounded">
          {(question.content.categories || []).length} categories
        </div>
      </div>

      <div className="space-y-4">
        {(question.content.categories || []).map((category, categoryIndex) => (
          <div key={categoryIndex} className="border border-[#0AAC9E]/20 rounded-lg p-4 bg-[#0AAC9E]/5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-gradient-to-br from-[#0AAC9E] to-[#08887a] rounded-full flex items-center justify-center text-xs font-medium text-white">
                {categoryIndex + 1}
              </div>
              <input
                type="text"
                value={category.name || ''}
                onChange={(e) => {
                  const newCategories = [...(question.content.categories || [])];
                  newCategories[categoryIndex] = {
                    ...newCategories[categoryIndex],
                    name: e.target.value
                  };
                  handleUpdateQuestionContent(question.id, 'categories', newCategories);
                }}
                placeholder={`Category ${categoryIndex + 1} name`}
                className="flex-1 px-3 py-2 text-xs font-medium border border-[#0AAC9E]/30 rounded bg-white"
              />
              
              {(question.content.categories || []).length > 1 && (
                <button
                  onClick={() => {
                    const newCategories = (question.content.categories || []).filter((_, i) => i !== categoryIndex);
                    handleUpdateQuestionContent(question.id, 'categories', newCategories);
                  }}
                  className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-100 rounded transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="space-y-2">
              <h5 className="text-xs font-medium text-[#0AAC9E] flex items-center">
                <ListChecks className="w-3 h-3 mr-1" />
                Items:
              </h5>
              {(category.items || [""]).map((item, itemIndex) => (
                <div key={itemIndex} className="flex items-center gap-2 p-2 bg-white rounded">
                  <div className="w-5 h-5 bg-[#0AAC9E]/10 border border-[#0AAC9E]/30 rounded-full flex items-center justify-center text-xs font-medium text-[#0AAC9E]">
                    {itemIndex + 1}
                  </div>
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => {
                      const newCategories = [...(question.content.categories || [])];
                      const newItems = [...(newCategories[categoryIndex].items || [])];
                      newItems[itemIndex] = e.target.value;
                      newCategories[categoryIndex] = {
                        ...newCategories[categoryIndex],
                        items: newItems
                      };
                      handleUpdateQuestionContent(question.id, 'categories', newCategories);
                    }}
                    placeholder={`Item ${itemIndex + 1}`}
                    className="flex-1 px-3 py-1.5 text-xs border border-[#0AAC9E]/20 rounded bg-white"
                  />
                  
                  {(category.items || []).length > 1 && (
                    <button
                      onClick={() => {
                        const newCategories = [...(question.content.categories || [])];
                        const newItems = (newCategories[categoryIndex].items || []).filter((_, i) => i !== itemIndex);
                        newCategories[categoryIndex] = {
                          ...newCategories[categoryIndex],
                          items: newItems
                        };
                        handleUpdateQuestionContent(question.id, 'categories', newCategories);
                      }}
                      className="p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded transition-all"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
              
              <button
                onClick={() => {
                  const newCategories = [...(question.content.categories || [])];
                  const newItems = [...(newCategories[categoryIndex].items || []), ""];
                  newCategories[categoryIndex] = {
                    ...newCategories[categoryIndex],
                    items: newItems
                  };
                  handleUpdateQuestionContent(question.id, 'categories', newCategories);
                }}
                className="flex items-center gap-1.5 w-full px-2 py-1.5 text-xs text-[#0AAC9E] font-medium border border-dashed border-[#0AAC9E]/30 rounded hover:bg-[#0AAC9E]/5 transition-all"
              >
              <div><Plus className="w-4 h-3" /></div>  
                Add Item
              </button>
            </div>
          </div>
        ))}
        
        <button
          onClick={() => {
            const newCategories = [...(question.content.categories || []), { name: '', items: [''] }];
            handleUpdateQuestionContent(question.id, 'categories', newCategories);
          }}
          className="flex items-center justify-center gap-2 w-full px-3 py-2 text-xs text-[#0AAC9E] font-medium border border-dashed border-[#0AAC9E]/40 rounded-lg hover:bg-[#0AAC9E]/5 transition-all"
        >
         <div><Plus className="w-4 h-3" /></div> 
          Add Category
        </button>
      </div>
    </div>
  );

  // Question editor renderer
  const renderQuestionEditor = (question) => {
    const questionType = questionTypes.find(t => t.type === question.questionType);

    return (
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        {/* Question Form */}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-900 mb-1.5 flex items-center">
             <div><HelpCircle className="w-4 h-3 mr-1.5 text-[#0AAC9E]" /></div> 
              Question Text <span className="text-red-500 ml-1">*</span>
            </label>
            <textarea
              value={question.text}
              onChange={(e) => handleUpdateQuestion(question.id, 'text', e.target.value)}
              placeholder="Write your question here..."
              rows={2}
              className="w-full px-3 py-2 text-xs border outline-0 border-gray-200 rounded focus:ring-1 focus:ring-[#0AAC9E]/20 focus:border-[#0AAC9E] resize-none transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-900 mb-1.5 flex items-center">
            <div><Star className="w-4 h-3 mr-1.5 text-[#0AAC9E]" /></div>  
              Points
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={question.questionRate}
              onChange={(e) => handleUpdateQuestion(question.id, 'questionRate', parseInt(e.target.value) || 1)}
              className="w-24 px-3 py-2 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-[#0AAC9E]/20 focus:border-[#0AAC9E] transition-all"
            />
          </div>

          {/* Hidden duration field - auto-set to 30 seconds */}
          <input type="hidden" value={question.duration || 30} />
        </div>

        {/* Question Content */}
        <div className="border-t border-gray-200 pt-3">
          {(question.questionType === 1 || question.questionType === 2) && renderChoiceOptions(question)}
          {question.questionType === 4 && renderFillGapOptions(question)}
          {question.questionType === 3 && renderReorderItems(question)}
          {question.questionType === 5 && renderCategorizeItems(question)}
        </div>
      </div>
    );
  };

  // Add question button component
  const AddQuestionButton = ({ onClick, className = "" }) => (
    <div className={`group relative ${className}`}>
      <div className="absolute inset-0 flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button
          onClick={onClick}
          className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-gradient-to-r from-[#0AAC9E] to-[#08887a] text-white text-xs font-medium rounded-lg hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 border border-white shadow-sm"
        >
         <div><Plus className="w-4 h-3" /></div> 
          Add Question Here
        </button>
      </div>
      <div className="h-8 border-l border-dashed border-gray-300 ml-6 group-hover:border-[#0AAC9E] transition-colors duration-300"></div>
    </div>
  );

  // Questions list renderer
  const renderQuestionsList = () => {
    const stats = {
      totalQuestions: quizState.questions.length,
      totalPoints: quizState.questions.reduce((sum, q) => sum + (q.questionRate || 0), 0),
      estimatedTime: Math.ceil((quizState.questions.reduce((sum, q) => sum + (q.duration || 30), 0) + quizState.duration * 60) / 60)
    };

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
          <div>
            <h3 className="text-base font-semibold text-gray-900 flex items-center mb-1">
             <div><HelpCircle className="w-4 h-5 mr-2 text-[#0AAC9E]" /></div> 
              Quiz Questions ({quizState.questions.length})
            </h3>
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <div className="flex items-center gap-1">
               <div><ListChecks className="w-4 h-3 text-[#0AAC9E]" /></div> 
                <span>{stats.totalQuestions} questions</span>
              </div>
              <div className="flex items-center gap-1">
              <div><Star className="w-4 h-3 text-[#0AAC9E]" /></div>  
                <span>{stats.totalPoints} points</span>
              </div>
              <div className="flex items-center gap-1">
               <div><Timer className="w-4 h-3 text-[#0AAC9E]" /></div> 
                <span>~{stats.estimatedTime} min</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => setShowQuestionTypes(true)}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-[#0AAC9E] to-[#08887a] text-white text-xs font-medium rounded-lg hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200"
          >
           <div><Plus className="w-4 h-3 mr-1.5" /></div> 
            Add Question
          </button>
        </div>

        {/* Questions List */}
        {quizState.questions.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 border border-dashed border-gray-300 rounded-lg">
            <div className="w-12 h-12 bg-gradient-to-br from-[#0AAC9E] to-[#08887a] rounded-lg flex items-center justify-center mx-auto mb-3">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">No questions yet</h3>
            <p className="text-xs text-gray-600 mb-4 max-w-md mx-auto">Start building your quiz by adding engaging questions</p>
            <button
              onClick={() => setShowQuestionTypes(true)}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#0AAC9E] to-[#08887a] text-white text-xs font-medium rounded-lg hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200"
            >
             <div><Plus className="w-4 h-3 mr-1.5" /></div> 
              Add Question
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Add question button at top */}
            <AddQuestionButton
              onClick={() => setShowQuestionTypes(true)}
              className="mb-3"
            />

            {quizState.questions.map((question, index) => {
              const questionType = questionTypes.find(t => t.type === question.questionType);
              const isExpanded = expandedQuestions.has(question.id);
              
              return (
                <div key={question.id} className="relative">
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    {/* Question Header */}
                    <div 
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-all ${isExpanded ? 'border-b border-gray-200' : ''}`}
                      onClick={() => toggleQuestionExpansion(question.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-sm"
                              style={{ background: `linear-gradient(135deg, ${questionType?.color || '#0AAC9E'}, ${questionType?.color || '#0AAC9E'}90)` }}
                            >
                              {questionType && <questionType.icon className="w-4 h-4" />}
                            </div>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleQuestionExpansion(question.id);
                              }}
                              className="p-1.5 hover:bg-gray-200 rounded transition-all"
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-gray-500" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-gray-500" />
                              )}
                            </button>
                          </div>
                          
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 text-sm mb-0.5">
                              Question {index + 1}: {questionType?.title}
                            </h4>
                            <div className="text-xs text-gray-600">
                              {question.text || <span className="italic">No text entered</span>}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="text-xs font-medium text-[#0AAC9E] bg-[#0AAC9E]/10 px-2 py-1 rounded">
                            {question.questionRate} pts
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteQuestion(question.id);
                            }}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Question Content (Collapsible) */}
                    {isExpanded && (
                      <div className="p-4 bg-gray-50/50">
                        {renderQuestionEditor(question)}
                      </div>
                    )}
                  </div>

                  {/* Add question button between questions */}
                  {index < quizState.questions.length - 1 && (
                    <AddQuestionButton
                      onClick={() => {
                        setShowQuestionTypes({ insertIndex: index });
                      }}
                    />
                  )}
                </div>
              );
            })}

            {/* Add question button at bottom */}
            <AddQuestionButton
              onClick={() => setShowQuestionTypes(true)}
              className="mt-3"
            />
          </div>
        )}

        {/* Question Types Modal */}
        {showQuestionTypes && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-0.5">Choose Question Type</h4>
                  <p className="text-xs text-gray-600">Select the type of question you want to add</p>
                </div>
                <button
                  onClick={() => setShowQuestionTypes(false)}
                  className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {questionTypes.map((type) => (
                  <button
                    key={type.type}
                    onClick={() => {
                      if (typeof showQuestionTypes === 'object' && showQuestionTypes.insertIndex !== undefined) {
                        handleAddQuestion(type, showQuestionTypes.insertIndex);
                      } else {
                        handleAddQuestion(type);
                      }
                    }}
                    className="p-4 text-left border border-gray-200 rounded-lg hover:border-[#0AAC9E] hover:bg-[#0AAC9E]/5 transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-sm group-hover:shadow-md transition-all"
                        style={{ background: `linear-gradient(135deg, ${type.color}, ${type.color}90)` }}
                      >
                        <type.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900 text-sm mb-0.5">{type.title}</h5>
                        <p className="text-xs text-gray-600 mb-1.5">{type.description}</p>
                        <p className="text-xs text-gray-500 italic bg-gray-50 p-2 rounded">{type.example}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <button
            onClick={() => setStep('settings')}
            className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all"
          >
            <ArrowLeft className="w-3 h-3 mr-1.5" />
            Back to Settings
          </button>
          
          <div className="flex items-center text-xs text-gray-500">
            <div className="w-6 h-6 bg-[#0AAC9E] text-white rounded-full flex items-center justify-center text-xs font-medium mr-2">2</div>
            Step 2 of 2: Questions ({quizState.questions.length} added)
          </div>
          
          <button
            onClick={handleSaveQuiz}
            disabled={saving || quizState.questions.length === 0}
            className="flex items-center px-4 py-2 bg-gradient-to-r bg-[#0AAC9E] text-white text-xs font-medium rounded-lg hover:shadow-md transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none transition-all duration-200"
          >
            {saving ? (
              <>
                <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                Saving Quiz...
              </>
            ) : (
              <>
                <Save className="w-3 h-3 mr-1.5" />
                Save Quiz
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-[#0AAC9E] to-[#08887a] rounded-lg">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {isEditing ? 'Edit Quiz' : 'Create Quiz'}
              </h2>
              <p className="text-xs text-gray-600">
                {step === 'settings' && 'Configure quiz settings and requirements'}
                {step === 'questions' && 'Add and customize quiz questions'}
              </p>
            </div>
          </div>
          
          <button
            onClick={handleClose}
            disabled={saving}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="p-3 bg-red-50 border-b border-red-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span className="text-xs text-red-700 flex-1">{error}</span>
              <button
                onClick={() => setError(null)}
                className="p-1 text-red-500 hover:text-red-700 rounded hover:bg-red-100 transition-all"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="p-3 bg-green-50 border-b border-green-200">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
              <span className="text-xs text-green-700 flex-1">{successMessage}</span>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            {step === 'settings' && renderQuizSettings()}
            {step === 'questions' && renderQuestionsList()}
          </div>
        </div>

        {/* Loading Overlay */}
        {saving && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center space-y-3 border border-gray-200">
              <div className="w-12 h-12 bg-gradient-to-br from-[#0AAC9E] to-[#08887a] rounded-lg flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              </div>
              <div className="text-center">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">Creating Quiz...</h3>
                <p className="text-xs text-gray-600">Please wait while we save your quiz</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizModal;