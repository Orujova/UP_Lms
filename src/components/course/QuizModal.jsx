import React, { useState, useEffect } from "react";
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
  Loader
} from "lucide-react";

const QuizModal = () => {
  // Mock Redux state - replace with actual Redux hooks
  const [modals] = useState({ addQuiz: true, editQuiz: false });
  const [activeSection] = useState("section-1");

  const [currentQuiz, setCurrentQuiz] = useState({
    questions: [],
    duration: 60,
    canSkip: false
  });

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showQuestionTypes, setShowQuestionTypes] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const isOpen = modals.addQuiz || modals.editQuiz;

  const questionTypes = [
    {
      type: "choice",
      title: "Single Choice",
      description: "One correct answer",
      icon: Target
    },
    {
      type: "multiple",
      title: "Multiple Choice", 
      description: "Multiple correct answers",
      icon: Check
    },
    {
      type: "fillgap",
      title: "Fill in the Gap",
      description: "Type the correct answer",
      icon: Type
    },
    {
      type: "reorder",
      title: "Reorder Items",
      description: "Arrange in correct order",
      icon: Move3D
    },
    {
      type: "categorize",
      title: "Categorize",
      description: "Group into categories",
      icon: Link2
    }
  ];

  const handleClose = () => {
    setCurrentQuiz({ questions: [], duration: 60, canSkip: false });
    setError(null);
    setPreviewMode(false);
    setCurrentQuestionIndex(0);
  };

  const handleAddQuestion = (questionType) => {
    const newQuestion = {
      id: Date.now(),
      type: questionType,
      text: "",
      questionRate: 1,
      duration: 30,
      canSkip: false,
      content: {
        answers: questionType === "choice" || questionType === "multiple" ? ["", "", "", ""] : [],
        correctAnswers: [],
        categories: questionType === "categorize" ? [{ name: "", items: [""] }] : undefined
      }
    };

    setCurrentQuiz(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
    setCurrentQuestionIndex(currentQuiz.questions.length);
    setShowQuestionTypes(false);
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

  const handleSetQuizSettings = (field, value) => {
    setCurrentQuiz(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveQuiz = async () => {
    if (currentQuiz.questions.length === 0) {
      alert("Please add at least one question to the quiz.");
      return;
    }

    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      handleClose();
    } catch (error) {
      setError("Failed to save quiz");
      console.error("Failed to save quiz:", error);
    } finally {
      setSaving(false);
    }
  };

  const getStats = () => {
    const totalQuestions = currentQuiz.questions.length;
    const totalDuration = Math.ceil(currentQuiz.questions.reduce((sum, q) => sum + (q.duration || 30), 0) / 60);
    return { totalQuestions, totalDuration };
  };

  const stats = getStats();

  const renderQuestionEditor = () => {
    const question = currentQuiz.questions[currentQuestionIndex];
    if (!question) return null;

    const questionType = questionTypes.find(t => t.type === question.type);

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
              {currentQuestionIndex + 1} of {currentQuiz.questions.length}
            </div>
            <div className="w-16 bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-[#0AAC9E] h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Question Settings */}
        <div className="grid grid-cols-3 gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Points
            </label>
            <input
              type="number"
              value={question.questionRate || 1}
              onChange={(e) => handleUpdateQuestion("questionRate", parseInt(e.target.value) || 1)}
              min="1"
              max="10"
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-[#0AAC9E]/20 focus:border-[#0AAC9E]"
            />
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Time (sec)
            </label>
            <input
              type="number"
              value={question.duration || 30}
              onChange={(e) => handleUpdateQuestion("duration", parseInt(e.target.value) || 30)}
              min="5"
              max="300"
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-[#0AAC9E]/20 focus:border-[#0AAC9E]"
            />
          </div>
          
          <div className="flex items-end">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={question.canSkip || false}
                onChange={(e) => handleUpdateQuestion("canSkip", e.target.checked)}
                className="w-3 h-3 text-[#0AAC9E] border-gray-300 rounded focus:ring-[#0AAC9E]"
              />
              <span className="text-xs text-gray-700 font-medium">Allow Skip</span>
            </label>
          </div>
        </div>

        {/* Question Content Editor */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Question Text <span className="text-red-500">*</span>
            </label>
            <textarea
              value={question.text || ""}
              onChange={(e) => handleUpdateQuestion("text", e.target.value)}
              placeholder="Enter your question..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0AAC9E]/20 focus:border-[#0AAC9E] resize-none text-sm"
            />
          </div>

          {(question.type === "choice" || question.type === "multiple") && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Answer Options
              </label>
              <div className="space-y-2">
                {(question.content?.answers || []).map((answer, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200">
                    <input
                      type={question.type === "choice" ? "radio" : "checkbox"}
                      name={question.type === "choice" ? `correct-${currentQuestionIndex}` : undefined}
                      checked={
                        question.type === "choice" 
                          ? (question.content?.correctAnswers || []).includes(answer)
                          : (question.content?.correctAnswers || []).includes(answer)
                      }
                      onChange={() => {
                        if (question.type === "choice") {
                          handleUpdateQuestionContent("correctAnswers", [answer]);
                        } else {
                          const currentCorrect = question.content?.correctAnswers || [];
                          if (currentCorrect.includes(answer)) {
                            handleUpdateQuestionContent("correctAnswers", currentCorrect.filter(a => a !== answer));
                          } else {
                            handleUpdateQuestionContent("correctAnswers", [...currentCorrect, answer]);
                          }
                        }
                      }}
                      className="w-4 h-4 text-[#0AAC9E] border-gray-300 focus:ring-[#0AAC9E]"
                    />
                    <input
                      type="text"
                      value={answer}
                      onChange={(e) => {
                        const newAnswers = [...(question.content?.answers || [])];
                        newAnswers[index] = e.target.value;
                        handleUpdateQuestionContent("answers", newAnswers);
                      }}
                      placeholder={`Option ${index + 1}`}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-[#0AAC9E]/20 focus:border-[#0AAC9E]"
                    />
                    <button
                      onClick={() => {
                        const newAnswers = question.content?.answers?.filter((_, i) => i !== index) || [];
                        handleUpdateQuestionContent("answers", newAnswers);
                        
                        const correctAnswers = question.content?.correctAnswers?.filter(a => a !== answer) || [];
                        handleUpdateQuestionContent("correctAnswers", correctAnswers);
                      }}
                      className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                
                <button
                  onClick={() => {
                    const currentAnswers = question.content?.answers || [];
                    handleUpdateQuestionContent("answers", [...currentAnswers, ""]);
                  }}
                  className="flex items-center justify-center gap-1 w-full px-3 py-2 text-[#0AAC9E] border-2 border-dashed border-[#0AAC9E] rounded-lg hover:bg-[#0AAC9E]/5 transition-colors text-sm font-medium"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Option</span>
                </button>
              </div>
            </div>
          )}

          {question.type === "fillgap" && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Correct Answers
              </label>
              <div className="mb-2 text-xs text-gray-500 flex items-center gap-1">
                <Type className="w-3 h-3" />
                Use [brackets] in question text to indicate gaps
              </div>
              <div className="space-y-2">
                {(question.content?.correctAnswers || []).map((answer, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-[#0AAC9E]/5 rounded border border-[#0AAC9E]/20">
                    <div className="flex items-center justify-center w-6 h-6 bg-[#0AAC9E] text-white rounded-full text-xs font-medium">
                      {index + 1}
                    </div>
                    <input
                      type="text"
                      value={answer}
                      onChange={(e) => {
                        const newAnswers = [...(question.content?.correctAnswers || [])];
                        newAnswers[index] = e.target.value;
                        handleUpdateQuestionContent("correctAnswers", newAnswers);
                      }}
                      placeholder={`Answer ${index + 1}`}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-[#0AAC9E]/20 focus:border-[#0AAC9E]"
                    />
                    <button
                      onClick={() => {
                        const newAnswers = question.content?.correctAnswers?.filter((_, i) => i !== index) || [];
                        handleUpdateQuestionContent("correctAnswers", newAnswers);
                      }}
                      className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                
                <button
                  onClick={() => {
                    const currentAnswers = question.content?.correctAnswers || [];
                    handleUpdateQuestionContent("correctAnswers", [...currentAnswers, ""]);
                  }}
                  className="flex items-center justify-center gap-1 w-full px-3 py-2 text-[#0AAC9E] border-2 border-dashed border-[#0AAC9E] rounded-lg hover:bg-[#0AAC9E]/5 transition-colors text-sm font-medium"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Answer</span>
                </button>
              </div>
            </div>
          )}

          {question.type === "reorder" && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Items (in correct order)
              </label>
              <div className="space-y-2">
                {(question.content?.answers || []).map((item, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-[#0AAC9E]/5 rounded border border-[#0AAC9E]/20">
                    <div className="flex items-center justify-center w-6 h-6 bg-[#0AAC9E] text-white rounded-full text-xs font-medium">
                      {index + 1}
                    </div>
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => {
                        const newItems = [...(question.content?.answers || [])];
                        newItems[index] = e.target.value;
                        handleUpdateQuestionContent("answers", newItems);
                      }}
                      placeholder={`Item ${index + 1}`}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-[#0AAC9E]/20 focus:border-[#0AAC9E]"
                    />
                    <button
                      onClick={() => {
                        const newItems = question.content?.answers?.filter((_, i) => i !== index) || [];
                        handleUpdateQuestionContent("answers", newItems);
                      }}
                      className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                
                <button
                  onClick={() => {
                    const currentItems = question.content?.answers || [];
                    handleUpdateQuestionContent("answers", [...currentItems, ""]);
                  }}
                  className="flex items-center justify-center gap-1 w-full px-3 py-2 text-[#0AAC9E] border-2 border-dashed border-[#0AAC9E] rounded-lg hover:bg-[#0AAC9E]/5 transition-colors text-sm font-medium"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Item</span>
                </button>
              </div>
            </div>
          )}

          {question.type === "categorize" && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Categories & Items
              </label>
              <div className="space-y-2">
                {(question.content?.categories || []).map((category, index) => (
                  <div key={index} className="p-3 bg-[#0AAC9E]/5 rounded border border-[#0AAC9E]/20">
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        value={category.name || ""}
                        onChange={(e) => {
                          const newCategories = [...(question.content?.categories || [])];
                          newCategories[index] = { ...category, name: e.target.value };
                          handleUpdateQuestionContent("categories", newCategories);
                        }}
                        placeholder={`Category ${index + 1}`}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-[#0AAC9E]/20 focus:border-[#0AAC9E]"
                      />
                      <button
                        onClick={() => {
                          const newCategories = question.content?.categories?.filter((_, i) => i !== index) || [];
                          handleUpdateQuestionContent("categories", newCategories);
                        }}
                        className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="space-y-1">
                      {(category.items || []).map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => {
                              const newCategories = [...(question.content?.categories || [])];
                              const newItems = [...(category.items || [])];
                              newItems[itemIndex] = e.target.value;
                              newCategories[index] = { ...category, items: newItems };
                              handleUpdateQuestionContent("categories", newCategories);
                            }}
                            placeholder={`Item ${itemIndex + 1}`}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-[#0AAC9E]/20 focus:border-[#0AAC9E]"
                          />
                          <button
                            onClick={() => {
                              const newCategories = [...(question.content?.categories || [])];
                              const newItems = category.items?.filter((_, i) => i !== itemIndex) || [];
                              newCategories[index] = { ...category, items: newItems };
                              handleUpdateQuestionContent("categories", newCategories);
                            }}
                            className="p-0.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const newCategories = [...(question.content?.categories || [])];
                          const newItems = [...(category.items || []), ""];
                          newCategories[index] = { ...category, items: newItems };
                          handleUpdateQuestionContent("categories", newCategories);
                        }}
                        className="text-xs text-[#0AAC9E] hover:text-[#0AAC9E]/80 flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        Add Item
                      </button>
                    </div>
                  </div>
                ))}
                
                <button
                  onClick={() => {
                    const currentCategories = question.content?.categories || [];
                    handleUpdateQuestionContent("categories", [...currentCategories, { name: "", items: [""] }]);
                  }}
                  className="flex items-center justify-center gap-1 w-full px-3 py-2 text-[#0AAC9E] border-2 border-dashed border-[#0AAC9E] rounded-lg hover:bg-[#0AAC9E]/5 transition-colors text-sm font-medium"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Category</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Compact Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-[#0AAC9E]/10 to-[#0AAC9E]/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0AAC9E]/20 rounded-lg">
              <Brain className="w-5 h-5 text-[#0AAC9E]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {modals.editQuiz ? "Edit Quiz" : "Create Quiz"}
              </h2>
              <p className="text-xs text-gray-600">
                {stats.totalQuestions} questions • ~{stats.totalDuration} min
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {!previewMode && currentQuiz.questions.length > 0 && (
              <button
                onClick={() => setPreviewMode(true)}
                className="flex items-center gap-1 px-2 py-1 bg-[#0AAC9E]/10 text-[#0AAC9E] rounded-lg hover:bg-[#0AAC9E]/20 transition-colors text-xs font-medium"
              >
                <PlayCircle className="w-3 h-3" />
                <span>Preview</span>
              </button>
            )}
            
            <button
              onClick={handleClose}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border-b border-red-200">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Compact */}
          <div className="w-72 border-r border-gray-200 bg-gray-50 flex flex-col">
            
            {/* Quiz Settings */}
            <div className="p-3 border-b border-gray-200 bg-white">
              <h3 className="text-xs font-bold text-gray-900 mb-2 flex items-center gap-1">
                <Settings className="w-3 h-3" />
                Quiz Settings
              </h3>
              
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Duration (min)
                  </label>
                  <input
                    type="number"
                    value={currentQuiz.duration || 60}
                    onChange={(e) => handleSetQuizSettings("duration", parseInt(e.target.value) || 60)}
                    min="1"
                    max="180"
                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-[#0AAC9E]/20 focus:border-[#0AAC9E]"
                  />
                </div>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={currentQuiz.canSkip || false}
                    onChange={(e) => handleSetQuizSettings("canSkip", e.target.checked)}
                    className="w-3 h-3 text-[#0AAC9E] border-gray-300 rounded focus:ring-[#0AAC9E]"
                  />
                  <span className="text-xs text-gray-700 font-medium">Allow skipping</span>
                </label>
              </div>
            </div>

            {/* Questions List */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-gray-900">Questions</h3>
                  <button
                    onClick={() => setShowQuestionTypes(!showQuestionTypes)}
                    className="flex items-center gap-1 px-2 py-1 bg-[#0AAC9E] text-white rounded text-xs font-medium hover:bg-[#0AAC9E]/90 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add</span>
                  </button>
                </div>

                {/* Question Types Dropdown */}
                {showQuestionTypes && (
                  <div className="mb-3 p-2 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="text-xs font-medium text-gray-700 mb-2">Select Type:</div>
                    <div className="space-y-1">
                      {questionTypes.map((type) => (
                        <button
                          key={type.type}
                          onClick={() => handleAddQuestion(type.type)}
                          className="w-full flex items-center gap-2 p-2 rounded-lg border border-[#0AAC9E]/20 bg-[#0AAC9E]/5 hover:bg-[#0AAC9E]/10 transition-colors text-left"
                        >
                          <div className="p-1 bg-white rounded text-[#0AAC9E]">
                            <type.icon className="w-3 h-3" />
                          </div>
                          <div>
                            <div className="text-xs font-medium text-[#0AAC9E]">
                              {type.title}
                            </div>
                            <div className="text-xs text-gray-500">
                              {type.description}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Questions List */}
                <div className="space-y-2">
                  {currentQuiz.questions.map((question, index) => {
                    const questionType = questionTypes.find(t => t.type === question.type);
                    const isActive = index === currentQuestionIndex;
                    
                    return (
                      <div
                        key={question.id}
                        className={`p-2 rounded-lg border transition-all cursor-pointer group ${
                          isActive 
                            ? 'border-[#0AAC9E] bg-[#0AAC9E]/5'
                            // This is the continuation of QuizModal component from the previous artifact

                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                        onClick={() => setCurrentQuestionIndex(index)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-2 flex-1 min-w-0">
                            {questionType && (
                              <div className="p-1 bg-[#0AAC9E]/10 rounded border border-[#0AAC9E]/20 mt-0.5">
                                <div className="w-4 h-4 flex items-center justify-center">
                                  <questionType.icon className="w-4 h-4 text-[#0AAC9E]" />
                                </div>
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-semibold text-gray-900 mb-1">
                                Q{index + 1}: {questionType?.title}
                              </div>
                              <div className="text-xs text-gray-500 truncate">
                                {question.text || "No question text"}
                              </div>
                              <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                                <span className="flex items-center gap-1">
                                  <div className="w-3 h-3 flex items-center justify-center">
                                    <Clock className="w-3 h-3" />
                                  </div>
                                  {question.duration || 30}s
                                </span>
                                <span className="flex items-center gap-1">
                                  <div className="w-3 h-3 flex items-center justify-center">
                                    <Award className="w-3 h-3" />
                                  </div>
                                  {question.questionRate || 1}pt
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteQuestion(index);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-all"
                          >
                            <div className="w-4 h-4 flex items-center justify-center">
                              <Trash2 className="w-4 h-4" />
                            </div>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  
                  {currentQuiz.questions.length === 0 && (
                    <div className="text-center py-6 text-gray-500">
                      <div className="w-8 h-8 mx-auto mb-2 opacity-50 flex items-center justify-center">
                        <BookOpen className="w-8 h-8" />
                      </div>
                      <p className="text-xs">No questions yet</p>
                      <p className="text-xs">Click "Add" to start</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {currentQuiz.questions.length > 0 ? (
              <>
                {/* Question Navigation */}
                <div className="p-3 border-b border-gray-200 bg-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                        disabled={currentQuestionIndex === 0}
                        className="p-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <div className="w-4 h-4 flex items-center justify-center">
                          <ChevronUp className="w-4 h-4" />
                        </div>
                      </button>
                      
                      <button
                        onClick={() => setCurrentQuestionIndex(Math.min(currentQuiz.questions.length - 1, currentQuestionIndex + 1))}
                        disabled={currentQuestionIndex === currentQuiz.questions.length - 1}
                        className="p-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <div className="w-4 h-4 flex items-center justify-center">
                          <ChevronDown className="w-4 h-4" />
                        </div>
                      </button>
                      
                      <span className="text-sm text-gray-600 font-medium">
                        Question {currentQuestionIndex + 1} of {currentQuiz.questions.length}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => setPreviewMode(!previewMode)}
                      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                        previewMode 
                          ? 'bg-[#0AAC9E] text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <div className="w-4 h-4 flex items-center justify-center">
                        {previewMode ? <Edit2 className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                      </div>
                      <span>{previewMode ? 'Edit' : 'Preview'}</span>
                    </button>
                  </div>
                </div>

                {/* Question Content */}
                <div className="flex-1 overflow-y-auto p-4">
                  {previewMode ? (
                    <QuestionPreview 
                      question={currentQuiz.questions[currentQuestionIndex]}
                      questionNumber={currentQuestionIndex + 1}
                      totalQuestions={currentQuiz.questions.length}
                    />
                  ) : (
                    renderQuestionEditor()
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center max-w-md">
                  <div className="w-16 h-16 bg-[#0AAC9E]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <div className="w-8 h-8 flex items-center justify-center">
                      <Brain className="w-8 h-8 text-[#0AAC9E]" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Create Your First Question
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Start building your quiz by adding questions. Choose from multiple question types.
                  </p>
                  <button
                    onClick={() => setShowQuestionTypes(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0AAC9E] text-white rounded-lg hover:bg-[#0AAC9E]/90 transition-colors font-medium mx-auto"
                  >
                    <div className="w-4 h-4 flex items-center justify-center">
                      <Plus className="w-4 h-4" />
                    </div>
                    <span>Add Question</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Compact Footer */}
        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-gray-600">
              <span className="flex items-center gap-1">
                <div className="w-4 h-4 flex items-center justify-center">
                  <HelpCircle className="w-4 h-4" />
                </div>
                {stats.totalQuestions} questions
              </span>
              <span className="flex items-center gap-1">
                <div className="w-4 h-4 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                ~{stats.totalDuration} min
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleClose}
                className="px-3 py-1.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-xs font-medium"
              >
                Cancel
              </button>
              
              <button
                onClick={handleSaveQuiz}
                disabled={saving || currentQuiz.questions.length === 0}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#0AAC9E] text-white rounded-lg hover:bg-[#0AAC9E]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs font-medium"
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  {saving ? <Loader className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                </div>
                <span>{saving ? 'Saving...' : 'Save Quiz'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Compact Question Preview Component with Updated Icons
const QuestionPreview = ({ question, questionNumber, totalQuestions }) => {
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [fillAnswers, setFillAnswers] = useState({});
  const [reorderItems, setReorderItems] = useState([]);

  useEffect(() => {
    setSelectedAnswers([]);
    setFillAnswers({});
    
    if (question.type === "reorder") {
      const shuffled = [...(question.content?.answers || [])].sort(() => Math.random() - 0.5);
      setReorderItems(shuffled);
    }
  }, [question]);

  const handleAnswerSelect = (answer) => {
    if (question.type === "choice") {
      setSelectedAnswers([answer]);
    } else if (question.type === "multiple") {
      setSelectedAnswers(prev => 
        prev.includes(answer) 
          ? prev.filter(a => a !== answer)
          : [...prev, answer]
      );
    }
  };

  const questionTypes = {
    choice: { icon: Target },
    multiple: { icon: Check },
    fillgap: { icon: Type },
    reorder: { icon: Move3D },
    categorize: { icon: Link2 }
  };

  const currentType = questionTypes[question.type];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Question Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#0AAC9E]/10 rounded-lg">
              <div className="w-4 h-4 flex items-center justify-center">
                {currentType && <currentType.icon className="w-4 h-4 text-[#0AAC9E]" />}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Question {questionNumber} of {totalQuestions}</div>
              <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                <span className="flex items-center gap-1">
                  <div className="w-4 h-4 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                  {question.duration || 30}s
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-4 h-4 flex items-center justify-center">
                    <Award className="w-4 h-4" />
                  </div>
                  {question.questionRate || 1}pts
                </span>
                {question.canSkip && (
                  <span className="flex items-center gap-1 text-orange-500">
                    <div className="w-4 h-4 flex items-center justify-center">
                      <RotateCcw className="w-4 h-4" />
                    </div>
                    Skippable
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="w-16 h-1 bg-gray-200 rounded-full">
            <div 
              className="h-1 bg-[#0AAC9E] rounded-full transition-all duration-300"
              style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
            />
          </div>
        </div>
        
        <h3 className="text-lg font-bold text-gray-900 leading-relaxed">
          {question.text || "Question text will appear here..."}
        </h3>
      </div>

      {/* Question Content */}
      <div className="space-y-3">
        {(question.type === "choice" || question.type === "multiple") && (
          <div className="space-y-2">
            {(question.content?.answers || []).map((answer, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(answer)}
                className={`w-full p-3 text-left border-2 rounded-lg transition-all ${
                  selectedAnswers.includes(answer)
                    ? 'border-[#0AAC9E] bg-[#0AAC9E]/5'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 ${question.type === "choice" ? "rounded-full" : "rounded"} border-2 flex items-center justify-center ${
                    selectedAnswers.includes(answer)
                      ? 'border-[#0AAC9E] bg-[#0AAC9E]'
                      : 'border-gray-300'
                  }`}>
                    {selectedAnswers.includes(answer) && (
                      question.type === "choice" ? (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      ) : (
                        <div className="w-4 h-4 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )
                    )}
                  </div>
                  <span className="font-medium text-sm">{answer || `Option ${index + 1}`}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {question.type === "fillgap" && (
          <div className="space-y-3">
            <div className="p-3 bg-[#0AAC9E]/5 border border-[#0AAC9E]/20 rounded-lg">
              <div className="text-gray-700 leading-relaxed text-sm">
                {question.text && question.text.split(/\[([^\]]+)\]/).map((part, index) => 
                  index % 2 === 0 ? (
                    <span key={index}>{part}</span>
                  ) : (
                    <input
                      key={index}
                      type="text"
                      placeholder="Type answer..."
                      className="inline-block mx-1 px-2 py-1 border-b-2 border-[#0AAC9E] bg-transparent focus:outline-none min-w-[80px] text-sm"
                      value={fillAnswers[index] || ""}
                      onChange={(e) => setFillAnswers(prev => ({...prev, [index]: e.target.value}))}
                    />
                  )
                )}
              </div>
            </div>
            <div className="text-xs text-gray-500">
              Fill in the blanks with the correct answers
            </div>
          </div>
        )}

        {question.type === "reorder" && (
          <div className="space-y-3">
            <div className="p-3 bg-[#0AAC9E]/5 border border-[#0AAC9E]/20 rounded-lg">
              <div className="text-xs text-gray-600 mb-2">Drag items to reorder correctly:</div>
              <div className="space-y-2">
                {reorderItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded-lg cursor-move hover:shadow-sm transition-shadow"
                  >
                    <div className="w-4 h-4 flex items-center justify-center">
                      <Move3D className="w-4 h-4 text-gray-400" />
                    </div>
                    <span className="font-medium text-sm">{item || `Item ${index + 1}`}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {question.type === "categorize" && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {(question.content?.categories || []).map((category, index) => (
                <div key={index} className="p-3 bg-[#0AAC9E]/5 border border-[#0AAC9E]/20 rounded-lg">
                  <h4 className="font-semibold text-[#0AAC9E] mb-2 text-sm">
                    {category.name || `Category ${index + 1}`}
                  </h4>
                  <div className="space-y-1 min-h-[60px] border-2 border-dashed border-[#0AAC9E]/30 rounded-lg p-2">
                    <div className="text-xs text-gray-500 text-center">
                      Drop items here
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2 text-sm">Items to Categorize</h4>
              <div className="flex flex-wrap gap-2">
                {(question.content?.categories || []).flatMap(cat => cat.items || []).map((item, index) => (
                  <div
                    key={index}
                    className="px-2 py-1 bg-white border border-gray-200 rounded-lg cursor-move hover:shadow-sm transition-shadow text-sm"
                  >
                    {item || `Item ${index + 1}`}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Preview Actions */}
      <div className="mt-6 flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="text-xs text-gray-600">
          Preview mode - how learners will see this question
        </div>
        <div className="flex items-center gap-2">
          <button className="px-2 py-1 text-gray-600 border border-gray-300 rounded hover:bg-gray-100 transition-colors text-xs">
            {question.canSkip ? 'Skip' : 'Skip (Disabled)'}
          </button>
          <button className="px-2 py-1 bg-[#0AAC9E] text-white rounded hover:bg-[#0AAC9E]/90 transition-colors text-xs">
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizModal;