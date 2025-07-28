import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { 
  X, 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  Clock, 
  HelpCircle,
  ChevronUp,
  ChevronDown,
  Move3D,
  Target,
  Type,
  Link2,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Brain,
  BookOpen,
  Settings,
  PlayCircle,
  Award,
  Loader2,
  Save,
  Eye,
  EyeOff
} from "lucide-react";
import {
  setModalOpen,
  closeAllModals,
  addContentToSection
} from "@/redux/course/courseSlice";
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
    currentCourse 
  } = useSelector((state) => state.course || {});
  
  const isOpen = modals?.addQuiz || modals?.editQuiz || false;
  const isEditing = !!editingContent && editingContent.type === 'quiz';

  // Quiz state
  const [currentQuiz, setCurrentQuiz] = useState({
    title: '',
    description: '',
    duration: 30, // minutes
    canSkip: false,
    questions: []
  });

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showQuestionTypes, setShowQuestionTypes] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState('settings'); // 'settings', 'questions', 'preview'

  // Question types mapping to your API
  const questionTypes = [
    {
      type: 1, // Single Choice
      apiType: "choice",
      title: "Single Choice",
      description: "One correct answer",
      icon: Target
    },
    {
      type: 2, // Multiple Choice
      apiType: "multiple",
      title: "Multiple Choice", 
      description: "Multiple correct answers",
      icon: Check
    },
    {
      type: 3, // Reorder
      apiType: "reorder",
      title: "Reorder Items",
      description: "Arrange in correct order",
      icon: Move3D
    },
    {
      type: 4, // Fill in the Gap
      apiType: "fillgap",
      title: "Fill in the Gap",
      description: "Type the correct answer",
      icon: Type
    },
    {
      type: 5, // Categorize
      apiType: "categorize",
      title: "Categorize",
      description: "Group into categories",
      icon: Link2
    }
  ];

  // Helper function to parse duration to ticks (100-nanosecond units)
  const parseDurationToTicks = (durationInSeconds) => {
    return durationInSeconds * 10000000; // Convert seconds to ticks
  };

  // Initialize quiz data
  useEffect(() => {
    if (isEditing && editingContent) {
      setCurrentQuiz({
        title: editingContent.title || '',
        description: editingContent.description || '',
        duration: editingContent.duration || 30,
        canSkip: editingContent.canSkip || false,
        questions: editingContent.questions || []
      });
    } else {
      setCurrentQuiz({
        title: '',
        description: '',
        duration: 30,
        canSkip: false,
        questions: []
      });
    }
    setError(null);
    setStep('settings');
    setCurrentQuestionIndex(0);
  }, [isOpen, isEditing, editingContent]);

  const handleClose = () => {
    if (!saving) {
      dispatch(closeAllModals());
      setPreviewMode(false);
      setError(null);
      setStep('settings');
    }
  };

  const handleAddQuestion = (questionTypeObj) => {
    const newQuestion = {
      id: Date.now(), // Temporary ID
      quizId: null, // Will be set after quiz creation
      text: "",
      title: "",
      questionRate: 1,
      duration: { ticks: 30 * 10000000 }, // 30 seconds in ticks (100ns units)
      hasDuration: true,
      canSkip: false,
      questionType: questionTypeObj.type, // API expects numeric type
      categories: [],
      // Content for different question types
      content: {
        answers: questionTypeObj.apiType === "choice" || questionTypeObj.apiType === "multiple" 
          ? ["", "", "", ""] 
          : [],
        correctAnswers: [],
        categories: questionTypeObj.apiType === "categorize" 
          ? [{ name: "", items: [""] }] 
          : undefined,
        items: questionTypeObj.apiType === "reorder" 
          ? [""] 
          : undefined
      }
    };

    setCurrentQuiz(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
    setCurrentQuestionIndex(currentQuiz.questions.length);
    setShowQuestionTypes(false);
    setStep('questions');
  };

  const handleUpdateQuestion = (field, value) => {
    setCurrentQuiz(prev => ({
      ...prev,
      questions: prev.questions.map((q, index) => 
        index === currentQuestionIndex 
          ? { ...q, [field]: value }
          : q
      )
    }));
  };

  const handleUpdateQuestionContent = (field, value) => {
    setCurrentQuiz(prev => ({
      ...prev,
      questions: prev.questions.map((q, index) => 
        index === currentQuestionIndex 
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
  };

  const handleDeleteQuestion = (index) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      setCurrentQuiz(prev => ({
        ...prev,
        questions: prev.questions.filter((_, i) => i !== index)
      }));
      
      if (currentQuestionIndex >= index && currentQuestionIndex > 0) {
        setCurrentQuestionIndex(currentQuestionIndex - 1);
      }
    }
  };

  const handleSaveQuiz = async () => {
    if (!currentQuiz.title.trim()) {
      setError("Please enter a quiz title.");
      return;
    }

    if (currentQuiz.questions.length === 0) {
      setError("Please add at least one question to the quiz.");
      return;
    }

    // Validate questions
    for (let i = 0; i < currentQuiz.questions.length; i++) {
      const question = currentQuiz.questions[i];
      if (!question.text.trim()) {
        setError(`Question ${i + 1} is missing question text.`);
        return;
      }
      if (!question.title.trim()) {
        setError(`Question ${i + 1} is missing a title.`);
        return;
      }
    }

    setSaving(true);
    setError(null);

    try {
      // Step 1: First create content for the quiz
      const contentData = {
        title: currentQuiz.title,
        description: currentQuiz.description,
        type: 'quiz',
        duration: currentQuiz.duration,
        mandatory: false,
        visible: true,
        sectionId: activeSection,
        courseId: currentCourse?.id,
        content: {
          quizSettings: {
            duration: currentQuiz.duration,
            canSkip: currentQuiz.canSkip
          }
        }
      };

      // Add content to section first
      const result = await dispatch(addContentToSection(contentData));
      let contentId;
      
      if (result.type.endsWith('/rejected')) {
        throw new Error(result.payload || 'Failed to create quiz content');
      } else {
        contentId = result.payload?.id || result.payload?.contentId;
      }

      if (!contentId) {
        // If contentId is still not available, we need to create a placeholder content
        // In real implementation, you should have a proper content creation flow
        contentId = Math.floor(Math.random() * 1000000); // Temporary solution
      }

      // Step 2: Create quiz with the API format
      const quizData = {
        contentId: contentId,
        duration: parseDurationToTicks(currentQuiz.duration * 60), // Convert minutes to seconds to ticks
        canSkip: currentQuiz.canSkip
      };

      const quizResponse = await addQuiz(quizData);
      
      if (!quizResponse || !quizResponse.id) {
        throw new Error("Quiz creation failed - no quiz ID returned");
      }
      
      const quizId = quizResponse.id;

      // Step 3: Add questions to the quiz
      const questionsData = {
        questions: currentQuiz.questions.map(question => ({
          quizId: quizId,
          text: question.text,
          title: question.title,
          questionRate: question.questionRate,
          duration: question.duration,
          hasDuration: question.hasDuration,
          canSkip: question.canSkip,
          questionType: question.questionType,
          categories: question.categories || []
        }))
      };

      const questionsResponse = await addQuestions(questionsData);

      // Step 4: Add options for each question
      if (questionsResponse && questionsResponse.length > 0) {
        for (let i = 0; i < questionsResponse.length; i++) {
          const question = currentQuiz.questions[i];
          const createdQuestion = questionsResponse[i];

          if (question.content.answers && question.content.answers.length > 0) {
            const optionsData = {
              options: question.content.answers.map((answer, index) => ({
                questionId: createdQuestion.id,
                text: answer,
                isCorrect: question.content.correctAnswers?.includes(index) || false,
                order: index + 1,
                gapText: answer,
                category: ""
              })).filter(opt => opt.text.trim() !== "")
            };

            if (optionsData.options.length > 0) {
              await addOptions(optionsData);
            }
          }
        }
      }

      handleClose();
    } catch (error) {
      console.error("Failed to save quiz:", error);
      setError(error.message || "Failed to save quiz");
    } finally {
      setSaving(false);
    }
  };

  const getStats = () => {
    const totalQuestions = currentQuiz.questions.length;
    const totalDuration = Math.ceil(currentQuiz.questions.reduce((sum, q) => {
      const durationInSeconds = q.duration?.ticks ? q.duration.ticks / 10000000 : 30;
      return sum + durationInSeconds;
    }, 0) / 60);
    return { totalQuestions, totalDuration };
  };

  const stats = getStats();

  const renderQuizSettings = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Quiz Settings
        </h3>
        <p className="text-sm text-gray-600">
          Configure the basic settings for your quiz
        </p>
      </div>

      <div className="space-y-4">
        {/* Quiz Title */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Quiz Title *
          </label>
          <input
            type="text"
            value={currentQuiz.title}
            onChange={(e) => setCurrentQuiz(prev => ({
              ...prev,
              title: e.target.value
            }))}
            placeholder="Enter quiz title"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0AAC9E]/20 focus:border-[#0AAC9E]"
          />
        </div>

        {/* Quiz Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Description (Optional)
          </label>
          <textarea
            value={currentQuiz.description}
            onChange={(e) => setCurrentQuiz(prev => ({
              ...prev,
              description: e.target.value
            }))}
            placeholder="Brief description of this quiz..."
            rows={2}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0AAC9E]/20 focus:border-[#0AAC9E] resize-none"
          />
        </div>

        {/* Quiz Duration */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Quiz Duration (minutes)
          </label>
          <input
            type="number"
            min="1"
            max="300"
            value={currentQuiz.duration}
            onChange={(e) => setCurrentQuiz(prev => ({
              ...prev,
              duration: parseInt(e.target.value) || 30
            }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0AAC9E]/20 focus:border-[#0AAC9E]"
          />
        </div>

        {/* Can Skip */}
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div>
            <div className="font-medium text-sm">Allow Skipping Questions</div>
            <div className="text-xs text-gray-500">
              Let learners skip questions and come back later
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={currentQuiz.canSkip}
              onChange={(e) => setCurrentQuiz(prev => ({
                ...prev,
                canSkip: e.target.checked
              }))}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#0AAC9E]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0AAC9E]"></div>
          </label>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => setStep('questions')}
          disabled={!currentQuiz.title.trim()}
          className="px-6 py-2 bg-[#0AAC9E] text-white rounded-lg hover:bg-[#0AAC9E]/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next: Add Questions
        </button>
      </div>
    </div>
  );

  const renderQuestionEditor = () => {
    const question = currentQuiz.questions[currentQuestionIndex];
    if (!question) return null;

    const questionType = questionTypes.find(t => t.type === question.questionType);

    return (
      <div className="space-y-4">
        {/* Question Header */}
        <div className="flex items-center justify-between p-3 bg-[#0AAC9E]/5 rounded-lg border border-[#0AAC9E]/20">
          <div className="flex items-center gap-2">
            {questionType && (
              <div className="p-1.5 bg-[#0AAC9E]/10 rounded border border-[#0AAC9E]/20">
                <questionType.icon className="w-4 h-4 text-[#0AAC9E]" />
              </div>
            )}
            <div>
              <h4 className="text-sm font-semibold text-gray-900">
                Question {currentQuestionIndex + 1}: {questionType?.title}
              </h4>
              <p className="text-xs text-gray-500">{questionType?.description}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="text-xs text-gray-500">
              {Math.round((question.duration?.ticks || 300000000) / 10000000)}s
            </div>
            <button
              onClick={() => handleDeleteQuestion(currentQuestionIndex)}
              className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Question Title */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Question Title *
          </label>
          <input
            type="text"
            value={question.title}
            onChange={(e) => handleUpdateQuestion('title', e.target.value)}
            placeholder="Enter question title"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0AAC9E]/20 focus:border-[#0AAC9E]"
          />
        </div>

        {/* Question Text */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Question Text *
          </label>
          <textarea
            value={question.text}
            onChange={(e) => handleUpdateQuestion('text', e.target.value)}
            placeholder="Enter your question here..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0AAC9E]/20 focus:border-[#0AAC9E] resize-none"
          />
        </div>

        {/* Question Settings */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Points
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={question.questionRate}
              onChange={(e) => handleUpdateQuestion('questionRate', parseInt(e.target.value) || 1)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0AAC9E]/20 focus:border-[#0AAC9E]"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Time Limit (seconds)
            </label>
            <input
              type="number"
              min="5"
              max="300"
              value={Math.round((question.duration?.ticks || 300000000) / 10000000)}
              onChange={(e) => handleUpdateQuestion('duration', { 
                ticks: (parseInt(e.target.value) || 30) * 10000000 
              })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0AAC9E]/20 focus:border-[#0AAC9E]"
            />
          </div>
        </div>

        {/* Question Type Specific Content */}
        {(question.questionType === 1 || question.questionType === 2) && renderChoiceOptions(question)}
        {question.questionType === 4 && renderFillGapOptions(question)}
        {question.questionType === 3 && renderReorderOptions(question)}
        {question.questionType === 5 && renderCategorizeOptions(question)}
      </div>
    );
  };

  const renderChoiceOptions = (question) => (
    <div>
      <label className="block text-sm font-semibold text-gray-900 mb-2">
        Answer Options *
      </label>
      <div className="space-y-2">
        {question.content.answers.map((answer, index) => (
          <div key={index} className="flex items-center gap-3">
            <button
              onClick={() => {
                const correctAnswers = question.content.correctAnswers || [];
                const isCorrect = correctAnswers.includes(index);
                
                let newCorrectAnswers;
                if (question.questionType === 1) { // Single choice
                  newCorrectAnswers = isCorrect ? [] : [index];
                } else { // Multiple choice
                  newCorrectAnswers = isCorrect 
                    ? correctAnswers.filter(i => i !== index)
                    : [...correctAnswers, index];
                }
                
                handleUpdateQuestionContent('correctAnswers', newCorrectAnswers);
              }}
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                (question.content.correctAnswers || []).includes(index)
                  ? 'border-[#0AAC9E] bg-[#0AAC9E]'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {(question.content.correctAnswers || []).includes(index) && (
                <Check className="w-3 h-3 text-white" />
              )}
            </button>
            
            <input
              type="text"
              value={answer}
              onChange={(e) => {
                const newAnswers = [...question.content.answers];
                newAnswers[index] = e.target.value;
                handleUpdateQuestionContent('answers', newAnswers);
              }}
              placeholder={`Option ${index + 1}`}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0AAC9E]/20 focus:border-[#0AAC9E] text-sm"
            />
            
            {question.content.answers.length > 2 && (
              <button
                onClick={() => {
                  const newAnswers = question.content.answers.filter((_, i) => i !== index);
                  const newCorrectAnswers = (question.content.correctAnswers || [])
                    .filter(i => i !== index)
                    .map(i => i > index ? i - 1 : i);
                  
                  handleUpdateQuestionContent('answers', newAnswers);
                  handleUpdateQuestionContent('correctAnswers', newCorrectAnswers);
                }}
                className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
        
        <button
          onClick={() => {
            const newAnswers = [...question.content.answers, ""];
            handleUpdateQuestionContent('answers', newAnswers);
          }}
          className="flex items-center justify-center gap-1 w-full px-3 py-2 text-[#0AAC9E] border-2 border-dashed border-[#0AAC9E] rounded-lg hover:bg-[#0AAC9E]/5 transition-colors text-sm font-medium"
        >
          <Plus className="w-3 h-3" />
          Add Option
        </button>
      </div>
    </div>
  );

  const renderFillGapOptions = (question) => (
    <div>
      <label className="block text-sm font-semibold text-gray-900 mb-2">
        Correct Answers *
      </label>
      <div className="space-y-2">
        {(question.content.answers || [""]).map((answer, index) => (
          <div key={index} className="flex items-center gap-3">
            <input
              type="text"
              value={answer}
              onChange={(e) => {
                const newAnswers = [...(question.content.answers || [""])];
                newAnswers[index] = e.target.value;
                handleUpdateQuestionContent('answers', newAnswers);
              }}
              placeholder={`Correct answer ${index + 1}`}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0AAC9E]/20 focus:border-[#0AAC9E] text-sm"
            />
            
            {(question.content.answers || []).length > 1 && (
              <button
                onClick={() => {
                  const newAnswers = (question.content.answers || []).filter((_, i) => i !== index);
                  handleUpdateQuestionContent('answers', newAnswers);
                }}
                className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
        
        <button
          onClick={() => {
            const newAnswers = [...(question.content.answers || [""]), ""];
            handleUpdateQuestionContent('answers', newAnswers);
          }}
          className="flex items-center justify-center gap-1 w-full px-3 py-2 text-[#0AAC9E] border-2 border-dashed border-[#0AAC9E] rounded-lg hover:bg-[#0AAC9E]/5 transition-colors text-sm font-medium"
        >
          <Plus className="w-3 h-3" />
          Add Alternative Answer
        </button>
      </div>
      
      <p className="text-xs text-gray-500 mt-2">
        Add multiple acceptable answers for this fill-in-the-blank question
      </p>
    </div>
  );

  const renderReorderOptions = (question) => (
    <div>
      <label className="block text-sm font-semibold text-gray-900 mb-2">
        Items to Reorder *
      </label>
      <div className="space-y-2">
        {(question.content.items || [""]).map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center text-xs font-medium text-gray-600">
              {index + 1}
            </div>
            
            <input
              type="text"
              value={item}
              onChange={(e) => {
                const newItems = [...(question.content.items || [""])];
                newItems[index] = e.target.value;
                handleUpdateQuestionContent('items', newItems);
              }}
              placeholder={`Item ${index + 1}`}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0AAC9E]/20 focus:border-[#0AAC9E] text-sm"
            />
            
            {(question.content.items || []).length > 2 && (
              <button
                onClick={() => {
                  const newItems = (question.content.items || []).filter((_, i) => i !== index);
                  handleUpdateQuestionContent('items', newItems);
                }}
                className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
        
        <button
          onClick={() => {
            const newItems = [...(question.content.items || [""]), ""];
            handleUpdateQuestionContent('items', newItems);
          }}
          className="flex items-center justify-center gap-1 w-full px-3 py-2 text-[#0AAC9E] border-2 border-dashed border-[#0AAC9E] rounded-lg hover:bg-[#0AAC9E]/5 transition-colors text-sm font-medium"
        >
          <Plus className="w-3 h-3" />
          Add Item
        </button>
      </div>
      
      <p className="text-xs text-gray-500 mt-2">
        List items in the correct order. Students will need to rearrange them.
      </p>
    </div>
  );

  const renderCategorizeOptions = (question) => (
    <div>
      <label className="block text-sm font-semibold text-gray-900 mb-2">
        Categories and Items *
      </label>
      <div className="space-y-4">
        {(question.content.categories || [{ name: "", items: [""] }]).map((category, categoryIndex) => (
          <div key={categoryIndex} className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <input
                type="text"
                value={category.name}
                onChange={(e) => {
                  const newCategories = [...(question.content.categories || [])];
                  newCategories[categoryIndex] = { ...category, name: e.target.value };
                  handleUpdateQuestionContent('categories', newCategories);
                }}
                placeholder={`Category ${categoryIndex + 1} name`}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0AAC9E]/20 focus:border-[#0AAC9E] text-sm font-medium"
              />
              
              {(question.content.categories || []).length > 1 && (
                <button
                  onClick={() => {
                    const newCategories = (question.content.categories || []).filter((_, i) => i !== categoryIndex);
                    handleUpdateQuestionContent('categories', newCategories);
                  }}
                  className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
            
            <div className="space-y-2">
              {(category.items || [""]).map((item, itemIndex) => (
                <div key={itemIndex} className="flex items-center gap-2 ml-4">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => {
                      const newCategories = [...(question.content.categories || [])];
                      const newItems = [...(category.items || [""])];
                      newItems[itemIndex] = e.target.value;
                      newCategories[categoryIndex] = { ...category, items: newItems };
                      handleUpdateQuestionContent('categories', newCategories);
                    }}
                    placeholder={`Item ${itemIndex + 1}`}
                    className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm"
                  />
                  
                  {(category.items || []).length > 1 && (
                    <button
                      onClick={() => {
                        const newCategories = [...(question.content.categories || [])];
                        const newItems = (category.items || []).filter((_, i) => i !== itemIndex);
                        newCategories[categoryIndex] = { ...category, items: newItems };
                        handleUpdateQuestionContent('categories', newCategories);
                      }}
                      className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-2 h-2" />
                    </button>
                  )}
                </div>
              ))}
              
              <button
                onClick={() => {
                  const newCategories = [...(question.content.categories || [])];
                  const newItems = [...(category.items || [""]), ""];
                  newCategories[categoryIndex] = { ...category, items: newItems };
                  handleUpdateQuestionContent('categories', newCategories);
                }}
                className="text-xs text-[#0AAC9E] hover:text-[#0AAC9E]/80 flex items-center gap-1 ml-4"
              >
                <Plus className="w-3 h-3" />
                Add Item
              </button>
            </div>
          </div>
        ))}
        
        <button
          onClick={() => {
            const currentCategories = question.content.categories || [];
            handleUpdateQuestionContent('categories', [...currentCategories, { name: "", items: [""] }]);
          }}
          className="flex items-center justify-center gap-1 w-full px-3 py-2 text-[#0AAC9E] border-2 border-dashed border-[#0AAC9E] rounded-lg hover:bg-[#0AAC9E]/5 transition-colors text-sm font-medium"
        >
          <Plus className="w-3 h-3" />
          Add Category
        </button>
      </div>
    </div>
  );

  const renderQuestionsList = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Quiz Questions ({currentQuiz.questions.length})
          </h3>
          <p className="text-sm text-gray-600">
            Total duration: ~{stats.totalDuration} minutes
          </p>
        </div>
        
        <button
          onClick={() => setShowQuestionTypes(true)}
          className="px-4 py-2 bg-[#0AAC9E] text-white rounded-lg hover:bg-[#0AAC9E]/90 transition-colors font-medium flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Question
        </button>
      </div>

      {/* Questions List */}
      {currentQuiz.questions.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-[#0AAC9E]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Brain className="w-8 h-8 text-[#0AAC9E]" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Create Your First Question
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Start building your quiz by adding questions. Choose from multiple question types.
          </p>
          <button
            onClick={() => setShowQuestionTypes(true)}
            className="px-6 py-2 bg-[#0AAC9E] text-white rounded-lg hover:bg-[#0AAC9E]/90 transition-colors font-medium"
          >
            Add First Question
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {currentQuiz.questions.map((question, index) => {
            const questionType = questionTypes.find(t => t.type === question.questionType);
            const isActive = currentQuestionIndex === index;
            
            return (
              <div
                key={question.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  isActive 
                    ? 'border-[#0AAC9E] bg-[#0AAC9E]/5' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setCurrentQuestionIndex(index)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isActive ? 'bg-[#0AAC9E] text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {questionType && <questionType.icon className="w-4 h-4" />}
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {question.title || `Question ${index + 1}`}
                      </h4>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span>{questionType?.title}</span>
                        <span>•</span>
                        <span>{question.questionRate} point{question.questionRate !== 1 ? 's' : ''}</span>
                        <span>•</span>
                        <span>{Math.round((question.duration?.ticks || 300000000) / 10000000)}s</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteQuestion(index);
                      }}
                      className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Question Editor */}
      {currentQuiz.questions.length > 0 && (
        <div className="border-t border-gray-200 pt-6">
          {renderQuestionEditor()}
        </div>
      )}

      {/* Question Type Selector Modal */}
      {showQuestionTypes && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold">Choose Question Type</h4>
              <button
                onClick={() => setShowQuestionTypes(false)}
                className="p-1 text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-2">
              {questionTypes.map((type) => (
                <button
                  key={type.type}
                  onClick={() => handleAddQuestion(type)}
                  className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-[#0AAC9E] hover:bg-[#0AAC9E]/5 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <type.icon className="w-5 h-5 text-[#0AAC9E]" />
                    <div>
                      <div className="font-medium text-gray-900">{type.title}</div>
                      <div className="text-sm text-gray-500">{type.description}</div>
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
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          Back to Settings
        </button>
        
        <button
          onClick={() => setStep('preview')}
          disabled={currentQuiz.questions.length === 0}
          className="px-6 py-2 bg-[#0AAC9E] text-white rounded-lg hover:bg-[#0AAC9E]/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Preview Quiz
        </button>
      </div>
    </div>
  );

  const renderPreview = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Quiz Preview
        </h3>
        <p className="text-sm text-gray-600">
          Review your quiz before saving
        </p>
      </div>

      {/* Quiz Summary */}
      <div className="bg-[#0AAC9E]/5 border border-[#0AAC9E]/20 rounded-lg p-4">
        <h4 className="font-semibold text-[#0AAC9E] mb-2">Quiz Summary</h4>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Questions:</span>
            <span className="font-semibold text-gray-900 ml-1">{stats.totalQuestions}</span>
          </div>
          <div>
            <span className="text-gray-600">Duration:</span>
            <span className="font-semibold text-gray-900 ml-1">~{stats.totalDuration} min</span>
          </div>
          <div>
            <span className="text-gray-600">Skip allowed:</span>
            <span className="font-semibold text-gray-900 ml-1">
              {currentQuiz.canSkip ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
      </div>

      {/* Questions Preview */}
      <div className="space-y-4">
        {currentQuiz.questions.map((question, index) => {
          const questionType = questionTypes.find(t => t.type === question.questionType);
          
          return (
            <div key={question.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-[#0AAC9E] text-white rounded-lg flex items-center justify-center text-sm font-semibold">
                  {index + 1}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h5 className="font-medium text-gray-900">{question.title}</h5>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      {questionType?.title}
                    </span>
                    <span className="px-2 py-1 bg-[#0AAC9E]/10 text-[#0AAC9E] text-xs rounded">
                      {question.questionRate} pt{question.questionRate !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  <p className="text-gray-700 mb-3">{question.text}</p>
                  
                  {/* Show options preview based on question type */}
                  {(question.questionType === 1 || question.questionType === 2) && (
                    <div className="space-y-1">
                      {question.content.answers?.filter(a => a.trim()).map((answer, aIndex) => (
                        <div key={aIndex} className={`text-sm p-2 rounded ${
                          (question.content.correctAnswers || []).includes(aIndex)
                            ? 'bg-green-50 border-l-4 border-green-400 text-green-800'
                            : 'bg-gray-50 text-gray-700'
                        }`}>
                          {(question.content.correctAnswers || []).includes(aIndex) && '✓ '}{answer}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <button
          onClick={() => setStep('questions')}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          Back to Questions
        </button>
        
        <button
          onClick={handleSaveQuiz}
          disabled={saving || currentQuiz.questions.length === 0}
          className="px-6 py-2 bg-[#0AAC9E] text-white rounded-lg hover:bg-[#0AAC9E]/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving Quiz...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Quiz</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-[#0AAC9E]/10 to-[#0AAC9E]/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0AAC9E]/20 rounded-lg">
              <Brain className="w-5 h-5 text-[#0AAC9E]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {isEditing ? 'Edit Quiz' : 'Create Quiz'}
              </h2>
              <p className="text-sm text-gray-600">
                {step === 'settings' && 'Configure quiz settings'}
                {step === 'questions' && 'Add and edit questions'}
                {step === 'preview' && 'Review your quiz'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Progress Indicator */}
            <div className="flex items-center gap-2 mr-4">
              {['settings', 'questions', 'preview'].map((s, index) => (
                <div key={s} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                    step === s 
                      ? 'bg-[#0AAC9E] text-white' 
                      : ['settings', 'questions', 'preview'].indexOf(step) > index
                        ? 'bg-[#0AAC9E]/20 text-[#0AAC9E]'
                        : 'bg-gray-200 text-gray-500'
                  }`}>
                    {index + 1}
                  </div>
                  {index < 2 && (
                    <div className={`w-8 h-0.5 ${
                      ['settings', 'questions', 'preview'].indexOf(step) > index
                        ? 'bg-[#0AAC9E]'
                        : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            
            <button
              onClick={handleClose}
              disabled={saving}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border-b border-red-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <span className="text-red-700 text-sm font-medium">{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-auto p-1 text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 'settings' && renderQuizSettings()}
          {step === 'questions' && renderQuestionsList()}
          {step === 'preview' && renderPreview()}
        </div>
      </div>
    </div>
  );
};

export default QuizModal;