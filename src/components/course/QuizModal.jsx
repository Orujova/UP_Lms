import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  X,
  Plus,
  Trash2,
  Edit3,
  ChevronDown,
  ChevronUp,
  Clock,
  HelpCircle,
  CheckCircle,
  Circle,
  Copy,
  Play,
  Settings,
  Target
} from "lucide-react";
import {
  setModalOpen,
  addContentToSection,
  updateContentInSection,
  closeAllModals,
} from "@/redux/course/courseSlice";

const QuizModal = () => {
  const dispatch = useDispatch();
  const {
    modals,
    contentModalType,
    editingContent,
    activeSection,
  } = useSelector((state) => state.course);

  const [quizSettings, setQuizSettings] = useState({
    duration: 60,
    canSkip: false,
    randomOrder: false,
    showCorrectAnswers: true,
  });

  const [questions, setQuestions] = useState([]);
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isOpen =
    (modals.addContent && contentModalType === "quiz") ||
    (modals.editContent && contentModalType === "quiz");
  const isEditing = modals.editContent && editingContent;

  useEffect(() => {
    if (isOpen) {
      if (isEditing && editingContent?.quiz) {
        setQuestions(editingContent.quiz.questions || []);
        setQuizSettings({
          duration: parseInt(editingContent.quiz.duration) || 60,
          canSkip: editingContent.quiz.canSkip || false,
          randomOrder: editingContent.quiz.randomOrder || false,
          showCorrectAnswers: editingContent.quiz.showCorrectAnswers ?? true,
        });
      } else {
        setQuestions([]);
        setQuizSettings({
          duration: 60,
          canSkip: false,
          randomOrder: false,
          showCorrectAnswers: true,
        });
      }
    }
  }, [isOpen, isEditing, editingContent]);

  const handleClose = () => {
    dispatch(closeAllModals());
    setPreviewMode(false);
    setExpandedQuestion(null);
    setQuestions([]);
  };

  const handleSave = async () => {
    if (!activeSection || questions.length === 0) return;

    setIsSubmitting(true);
    try {
      const quizData = {
        type: "quiz",
        quiz: {
          ...quizSettings,
          questions: questions,
        },
      };

      if (isEditing) {
        dispatch(
          updateContentInSection({
            sectionId: activeSection,
            contentId: editingContent.id,
            updates: quizData,
          })
        );
      } else {
        dispatch(
          addContentToSection({
            sectionId: activeSection,
            content: quizData,
          })
        );
      }

      handleClose();
    } catch (error) {
      console.error("Error saving quiz:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addNewQuestion = (type) => {
    const newQuestion = {
      id: `temp_${Date.now()}`,
      type: type,
      title: `Question ${questions.length + 1}`,
      questionRate: 1,
      duration: 30,
      hasDuration: true,
      canSkip: false,
      content: getQuestionTemplate(type),
    };
    
    setQuestions([...questions, newQuestion]);
    setExpandedQuestion(questions.length);
  };

  const getQuestionTemplate = (type) => {
    switch (type) {
      case "choice":
        return {
          question: "",
          multipleAnswers: false,
          answers: ["", ""],
          correctAnswers: [],
        };
      case "fillgap":
        return {
          questionText: "",
          correctAnswers: [],
          incorrectAnswers: [],
        };
      case "categorize":
        return {
          categories: [
            {
              name: "",
              answers: [""],
            },
          ],
        };
      case "reorder":
        return {
          question: "",
          answers: ["", ""],
        };
      default:
        return {};
    }
  };

  const updateQuestion = (index, updates) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], ...updates };
    setQuestions(newQuestions);
  };

  const deleteQuestion = (index) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
    setExpandedQuestion(null);
  };

  const duplicateQuestion = (index) => {
    const question = questions[index];
    if (question) {
      const duplicatedQuestion = {
        ...JSON.parse(JSON.stringify(question)),
        id: `temp_${Date.now()}`,
        title: `${question.title} (Copy)`,
      };
      const newQuestions = [...questions];
      newQuestions.splice(index + 1, 0, duplicatedQuestion);
      setQuestions(newQuestions);
    }
  };

  const canSave = () => {
    return (
      questions.length > 0 &&
      questions.every((q) => {
        switch (q.type) {
          case "choice":
            return (
              q.content.question.trim() &&
              q.content.answers.some((a) => a.trim()) &&
              q.content.correctAnswers.length > 0
            );
          case "fillgap":
            return (
              q.content.questionText.trim() &&
              q.content.correctAnswers.length > 0
            );
          case "categorize":
            return q.content.categories.every(
              (cat) => cat.name.trim() && cat.answers.some((a) => a.trim())
            );
          case "reorder":
            return (
              q.content.question.trim() &&
              q.content.answers.length >= 2 &&
              q.content.answers.every((a) => a.trim())
            );
          default:
            return false;
        }
      })
    );
  };

  const getStats = () => {
    const totalDuration = questions.reduce((sum, q) => sum + (q.duration || 0), 0);
    const questionTypes = {
      choice: questions.filter(q => q.type === 'choice').length,
      fillgap: questions.filter(q => q.type === 'fillgap').length,
      categorize: questions.filter(q => q.type === 'categorize').length,
      reorder: questions.filter(q => q.type === 'reorder').length,
    };

    return {
      totalQuestions: questions.length,
      totalDuration,
      questionTypes,
    };
  };

  const stats = getStats();

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-[#0AAC9E]/5 to-[#0AAC9E]/10">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-[#0AAC9E]/10 rounded-lg">
                <HelpCircle className="w-5 h-5 text-[#0AAC9E]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {isEditing ? "Edit Quiz" : "Create Quiz"}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.totalQuestions} question{stats.totalQuestions !== 1 ? "s" : ""} • 
                  {Math.round(stats.totalDuration / 60)} min duration
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className="flex items-center space-x-2 px-3 py-1.5 text-[#0AAC9E] border border-[#0AAC9E] rounded-lg hover:bg-[#0AAC9E]/5 transition-colors text-sm"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{previewMode ? "Edit" : "Preview"}</span>
              </button>
              
              <button
                onClick={handleClose}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Quiz Settings */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
              <Settings className="w-4 h-4 mr-2" />
              Quiz Settings
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={quizSettings.duration}
                  onChange={(e) =>
                    setQuizSettings(prev => ({
                      ...prev,
                      duration: parseInt(e.target.value) || 0,
                    }))
                  }
                  min="1"
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0AAC9E] focus:border-[#0AAC9E] text-sm"
                />
              </div>

              <div className="flex items-end">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={quizSettings.canSkip}
                    onChange={(e) =>
                      setQuizSettings(prev => ({
                        ...prev,
                        canSkip: e.target.checked,
                      }))
                    }
                    className="w-3 h-3 text-[#0AAC9E] border-gray-300 rounded focus:ring-[#0AAC9E]"
                  />
                  <span className="text-xs text-gray-700">Allow skip</span>
                </label>
              </div>

              <div className="flex items-end">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={quizSettings.randomOrder}
                    onChange={(e) =>
                      setQuizSettings(prev => ({
                        ...prev,
                        randomOrder: e.target.checked,
                      }))
                    }
                    className="w-3 h-3 text-[#0AAC9E] border-gray-300 rounded focus:ring-[#0AAC9E]"
                  />
                  <span className="text-xs text-gray-700">Random order</span>
                </label>
              </div>

              <div className="flex items-end">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={quizSettings.showCorrectAnswers}
                    onChange={(e) =>
                      setQuizSettings(prev => ({
                        ...prev,
                        showCorrectAnswers: e.target.checked,
                      }))
                    }
                    className="w-3 h-3 text-[#0AAC9E] border-gray-300 rounded focus:ring-[#0AAC9E]"
                  />
                  <span className="text-xs text-gray-700">Show answers</span>
                </label>
              </div>
            </div>
          </div>

          {/* Questions List */}
          <div className="flex-1 overflow-y-auto">
            {questions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8">
                <div className="w-16 h-16 bg-[#0AAC9E]/10 rounded-full flex items-center justify-center mb-4">
                  <HelpCircle className="w-8 h-8 text-[#0AAC9E]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No questions yet
                </h3>
                <p className="text-sm text-gray-500 mb-6 text-center max-w-md">
                  Start building your quiz by adding different types of questions. 
                  Create engaging assessments to test your learners' knowledge.
                </p>
              </div>
            ) : (
              <div className="p-4">
                <div className="space-y-3">
                  {questions.map((question, index) => (
                    <QuestionCard
                      key={question.id || index}
                      question={question}
                      index={index}
                      isExpanded={expandedQuestion === index}
                      onToggleExpand={() =>
                        setExpandedQuestion(
                          expandedQuestion === index ? null : index
                        )
                      }
                      onUpdate={(updates) => updateQuestion(index, updates)}
                      onDelete={() => deleteQuestion(index)}
                      onDuplicate={() => duplicateQuestion(index)}
                      previewMode={previewMode}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Add Question Buttons */}
            {!previewMode && (
              <div className="p-4 pt-2 border-t border-gray-200 bg-gray-50">
                <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Question
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { type: "choice", label: "Multiple Choice", desc: "Single or multiple answers" },
                    { type: "fillgap", label: "Fill in Blank", desc: "Text input answers" },
                    { type: "categorize", label: "Categorize", desc: "Group items by category" },
                    { type: "reorder", label: "Reorder", desc: "Arrange items in order" },
                  ].map(({ type, label, desc }) => (
                    <button
                      key={type}
                      onClick={() => addNewQuestion(type)}
                      className="flex flex-col items-center p-3 border border-gray-300 rounded-lg hover:border-[#0AAC9E] hover:bg-[#0AAC9E]/5 transition-colors group text-center"
                    >
                      <div className="w-6 h-6 bg-[#0AAC9E]/10 rounded-full flex items-center justify-center mb-2 group-hover:bg-[#0AAC9E]/20">
                        <Circle className="w-3 h-3 text-[#0AAC9E]" />
                      </div>
                      <span className="text-xs font-medium text-gray-700 group-hover:text-[#0AAC9E]">
                        {label}
                      </span>
                      <span className="text-xs text-gray-500 group-hover:text-[#0AAC9E]/80 mt-1">
                        {desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-4">
              <div className="text-xs text-gray-600">
                <span className="font-medium">{stats.totalQuestions}</span> questions • 
                <span className="font-medium"> {Math.round(stats.totalDuration / 60)}</span> min duration
              </div>
              
              {Object.values(stats.questionTypes).some(count => count > 0) && (
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  {stats.questionTypes.choice > 0 && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                      {stats.questionTypes.choice} Choice
                    </span>
                  )}
                  {stats.questionTypes.fillgap > 0 && (
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                      {stats.questionTypes.fillgap} Fill Gap
                    </span>
                  )}
                  {stats.questionTypes.categorize > 0 && (
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                      {stats.questionTypes.categorize} Categorize
                    </span>
                  )}
                  {stats.questionTypes.reorder > 0 && (
                    <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs">
                      {stats.questionTypes.reorder} Reorder
                    </span>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!canSave() || isSubmitting}
                className="px-4 py-2 bg-[#0AAC9E] text-white rounded-lg hover:bg-[#0AAC9E]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </div>
                ) : (
                  `${isEditing ? "Update" : "Create"} Quiz`
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Question Card Component (simplified for brevity)
const QuestionCard = ({
  question,
  index,
  isExpanded,
  onToggleExpand,
  onUpdate,
  onDelete,
  onDuplicate,
  previewMode = false,
}) => {
  return (
    <div className="border border-gray-200 rounded-lg bg-white shadow-sm">
      {/* Question Header */}
      <div className="p-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <span className="w-6 h-6 bg-[#0AAC9E]/10 text-[#0AAC9E] rounded-full flex items-center justify-center text-xs font-semibold">
              {index + 1}
            </span>
            
            {!previewMode ? (
              <input
                type="text"
                value={question.title}
                onChange={(e) => onUpdate({ title: e.target.value })}
                placeholder="Question title"
                className="flex-1 px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0AAC9E] focus:border-[#0AAC9E] text-sm"
              />
            ) : (
              <h4 className="flex-1 font-medium text-gray-900">{question.title}</h4>
            )}
          </div>

          <div className="flex items-center space-x-1">
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-[#0AAC9E]/10 text-[#0AAC9E]">
              {question.type}
            </span>
            
            {!previewMode && (
              <>
                <button
                  onClick={onDuplicate}
                  className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700"
                  title="Duplicate question"
                >
                  <Copy className="w-3 h-3" />
                </button>
                
                <button
                  onClick={onToggleExpand}
                  className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700"
                >
                  {isExpanded ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </button>
                
                <button
                  onClick={onDelete}
                  className="p-1 hover:bg-red-100 text-red-600 rounded"
                  title="Delete question"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {(isExpanded || previewMode) && (
        <div className="p-3">
          <div className="text-sm text-gray-600">
            Question content would be rendered here based on type: {question.type}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizModal;