// redux/quiz/quizSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  addQuiz,
  addQuestions,
  addOptions,
  createCompleteQuiz,
  validateQuizData,
  validateQuestionData,
  validateOptionData,
  formatQuizForAPI,
  formatQuizForDisplay,
  formatQuestionForDisplay,
  getQuestionTypeName,
  calculateQuizStats,
  getQuestionTemplates,
  QUESTION_TYPES,
  DIFFICULTY_LEVELS,
  DEFAULT_QUIZ_SETTINGS,
  ticksToSeconds,
  ticksToReadableDuration,
} from '@/api/quiz';

// ======================== ASYNC THUNKS ========================

export const createQuizAsync = createAsyncThunk(
  'quiz/createQuiz',
  async (quizData, { rejectWithValue }) => {
    try {
      const errors = validateQuizData(quizData);
      if (errors.length > 0) {
        return rejectWithValue(errors.join(', '));
      }
      
      const response = await createCompleteQuiz(quizData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addQuizAsync = createAsyncThunk(
  'quiz/addQuiz',
  async (quizData, { rejectWithValue }) => {
    try {
      const response = await addQuiz(quizData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addQuestionsAsync = createAsyncThunk(
  'quiz/addQuestions',
  async (questionsData, { rejectWithValue }) => {
    try {
      const response = await addQuestions(questionsData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addOptionsAsync = createAsyncThunk(
  'quiz/addOptions',
  async (optionsData, { rejectWithValue }) => {
    try {
      const response = await addOptions(optionsData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ======================== INITIAL STATE ========================

const quizInitialState = {
  // Current quiz being created/edited
  currentQuiz: {
    contentId: null,
    duration: DEFAULT_QUIZ_SETTINGS.duration,
    canSkip: DEFAULT_QUIZ_SETTINGS.canSkip,
    questions: [],
  },
  
  // Quiz builder state
  builder: {
    isActive: false,
    currentQuestionIndex: -1,
    editingQuestion: null,
    previewMode: false,
    step: 'settings', // 'settings', 'questions', 'preview'
  },
  
  // Question templates for different types
  questionTemplates: getQuestionTemplates(),
  
  // Loading states
  loading: false,
  saving: false,
  questionLoading: false,
  optionLoading: false,
  
  // Error states
  error: null,
  questionError: null,
  optionError: null,
  validationErrors: [],
  
  // Quiz settings form
  settingsForm: {
    duration: DEFAULT_QUIZ_SETTINGS.duration,
    canSkip: DEFAULT_QUIZ_SETTINGS.canSkip,
    questionDuration: DEFAULT_QUIZ_SETTINGS.questionDuration,
    randomizeQuestions: false,
    randomizeOptions: false,
    showCorrectAnswers: true,
    allowRetake: false,
    passingScore: 70,
  },
  
  // Current question being edited
  currentQuestion: {
    type: 'choice',
    text: '',
    title: '',
    questionRate: DEFAULT_QUIZ_SETTINGS.questionRate,
    duration: DEFAULT_QUIZ_SETTINGS.questionDuration,
    hasDuration: DEFAULT_QUIZ_SETTINGS.hasDuration,
    canSkip: false,
    content: {},
  },
  
  // UI state
  showQuizBuilder: false,
  showQuestionModal: false,
  showPreview: false,
  showDeleteConfirm: false,
  showTemplateSelector: false,
  selectedQuestionType: 'choice',
  selectedQuestionIndex: -1,
  
  // Import/Export
  importData: null,
  exportData: null,
  
  // Statistics and analytics
  stats: {
    totalQuestions: 0,
    totalDuration: 0,
    totalPoints: 0,
    averageQuestionDuration: 0,
    questionTypes: {
      choice: 0,
      multiple: 0,
      fillgap: 0,
      categorize: 0,
      reorder: 0,
    },
    difficultyLevel: 'easy',
    estimatedCompletionTime: 0,
  },
  
  // Performance tracking
  performance: {
    questionsCreated: 0,
    optionsCreated: 0,
    quizzesCompleted: 0,
    averageCreationTime: 0,
    lastSaved: null,
  },
  
  // Validation
  validation: {
    isValid: false,
    errors: [],
    warnings: [],
  },
  
  // Accessibility
  accessibility: {
    enableKeyboardNavigation: true,
    enableScreenReader: true,
    highContrast: false,
    largeText: false,
  },
};

// ======================== SLICE ========================

const quizSlice = createSlice({
  name: 'quiz',
  initialState: quizInitialState,
  reducers: {
    // Quiz initialization
    initializeQuiz: (state, action) => {
      const { contentId, existingQuiz = null } = action.payload;
      
      if (existingQuiz) {
        state.currentQuiz = existingQuiz;
        state.settingsForm = {
          duration: ticksToSeconds(existingQuiz.duration?.ticks || 0),
          canSkip: existingQuiz.canSkip || false,
          questionDuration: DEFAULT_QUIZ_SETTINGS.questionDuration,
          randomizeQuestions: existingQuiz.randomizeQuestions || false,
          randomizeOptions: existingQuiz.randomizeOptions || false,
          showCorrectAnswers: existingQuiz.showCorrectAnswers ?? true,
          allowRetake: existingQuiz.allowRetake || false,
          passingScore: existingQuiz.passingScore || 70,
        };
      } else {
        state.currentQuiz = {
          contentId,
          duration: DEFAULT_QUIZ_SETTINGS.duration,
          canSkip: DEFAULT_QUIZ_SETTINGS.canSkip,
          questions: [],
        };
      }
      
      state.builder.isActive = true;
      state.builder.step = 'settings';
      quizSlice.caseReducers.updateStats(state);
      quizSlice.caseReducers.validateQuiz(state);
    },
    
    // Quiz settings management
    setQuizSettings: (state, action) => {
      state.settingsForm = { ...state.settingsForm, ...action.payload };
      state.currentQuiz = { 
        ...state.currentQuiz, 
        duration: action.payload.duration || state.currentQuiz.duration,
        canSkip: action.payload.canSkip ?? state.currentQuiz.canSkip,
      };
      quizSlice.caseReducers.updateStats(state);
      quizSlice.caseReducers.validateQuiz(state);
    },
    
    // Builder step management
    setBuilderStep: (state, action) => {
      state.builder.step = action.payload;
    },
    
    nextBuilderStep: (state) => {
      const steps = ['settings', 'questions', 'preview'];
      const currentIndex = steps.indexOf(state.builder.step);
      if (currentIndex < steps.length - 1) {
        state.builder.step = steps[currentIndex + 1];
      }
    },
    
    prevBuilderStep: (state) => {
      const steps = ['settings', 'questions', 'preview'];
      const currentIndex = steps.indexOf(state.builder.step);
      if (currentIndex > 0) {
        state.builder.step = steps[currentIndex - 1];
      }
    },
    
    // Question management
    addQuestion: (state, action) => {
      const questionType = action.payload || state.selectedQuestionType;
      const template = state.questionTemplates[questionType];
      
      if (template) {
        const newQuestion = {
          ...JSON.parse(JSON.stringify(template)),
          id: `temp_${Date.now()}`,
          title: `Question ${state.currentQuiz.questions.length + 1}`,
          orderNumber: state.currentQuiz.questions.length + 1,
        };
        
        state.currentQuiz.questions.push(newQuestion);
        state.builder.currentQuestionIndex = state.currentQuiz.questions.length - 1;
        state.selectedQuestionIndex = state.builder.currentQuestionIndex;
        quizSlice.caseReducers.updateStats(state);
        quizSlice.caseReducers.validateQuiz(state);
      }
    },
    
    updateQuestion: (state, action) => {
      const { index, updates } = action.payload;
      if (state.currentQuiz.questions[index]) {
        state.currentQuiz.questions[index] = {
          ...state.currentQuiz.questions[index],
          ...updates,
        };
        quizSlice.caseReducers.updateStats(state);
        quizSlice.caseReducers.validateQuiz(state);
      }
    },
    
    deleteQuestion: (state, action) => {
      const index = action.payload;
      state.currentQuiz.questions.splice(index, 1);
      
      // Update order numbers
      state.currentQuiz.questions.forEach((question, idx) => {
        question.orderNumber = idx + 1;
        question.title = `Question ${idx + 1}`;
      });
      
      // Adjust current question index
      if (state.builder.currentQuestionIndex >= state.currentQuiz.questions.length) {
        state.builder.currentQuestionIndex = Math.max(0, state.currentQuiz.questions.length - 1);
      }
      
      quizSlice.caseReducers.updateStats(state);
      quizSlice.caseReducers.validateQuiz(state);
    },
    
    duplicateQuestion: (state, action) => {
      const index = action.payload;
      const questionToDuplicate = state.currentQuiz.questions[index];
      
      if (questionToDuplicate) {
        const duplicatedQuestion = {
          ...JSON.parse(JSON.stringify(questionToDuplicate)),
          id: `temp_${Date.now()}`,
          title: `${questionToDuplicate.title} (Copy)`,
          orderNumber: state.currentQuiz.questions.length + 1,
        };
        
        state.currentQuiz.questions.push(duplicatedQuestion);
        state.builder.currentQuestionIndex = state.currentQuiz.questions.length - 1;
        quizSlice.caseReducers.updateStats(state);
      }
    },
    
    reorderQuestions: (state, action) => {
      const { sourceIndex, destinationIndex } = action.payload;
      const questions = Array.from(state.currentQuiz.questions);
      const [movedQuestion] = questions.splice(sourceIndex, 1);
      questions.splice(destinationIndex, 0, movedQuestion);
      
      // Update order numbers
      questions.forEach((question, index) => {
        question.orderNumber = index + 1;
        question.title = `Question ${index + 1}`;
      });
      
      state.currentQuiz.questions = questions;
    },
    
    // Current question editing
    setCurrentQuestion: (state, action) => {
      state.currentQuestion = { ...state.currentQuestion, ...action.payload };
    },
    
    resetCurrentQuestion: (state) => {
      const questionType = state.selectedQuestionType;
      state.currentQuestion = {
        ...state.questionTemplates[questionType],
        type: questionType,
      };
    },
    
    setSelectedQuestionType: (state, action) => {
      state.selectedQuestionType = action.payload;
      quizSlice.caseReducers.resetCurrentQuestion(state);
    },
    
    setSelectedQuestionIndex: (state, action) => {
      state.selectedQuestionIndex = action.payload;
      state.builder.currentQuestionIndex = action.payload;
      
      if (action.payload >= 0 && state.currentQuiz.questions[action.payload]) {
        state.currentQuestion = { ...state.currentQuiz.questions[action.payload] };
      }
    },
    
    // Question content management
    updateQuestionContent: (state, action) => {
      const { field, value } = action.payload;
      
      if (!state.currentQuestion.content) {
        state.currentQuestion.content = {};
      }
      
      state.currentQuestion.content[field] = value;
      
      // Update in questions array if editing existing question
      if (state.selectedQuestionIndex >= 0) {
        const questionIndex = state.selectedQuestionIndex;
        if (state.currentQuiz.questions[questionIndex]) {
          state.currentQuiz.questions[questionIndex].content = {
            ...state.currentQuiz.questions[questionIndex].content,
            [field]: value,
          };
        }
      }
    },
    
    // Answer management for choice/multiple questions
    addAnswer: (state, action) => {
      const answerText = action.payload || '';
      
      if (!state.currentQuestion.content.answers) {
        state.currentQuestion.content.answers = [];
      }
      
      state.currentQuestion.content.answers.push(answerText);
      
      // Update in questions array
      if (state.selectedQuestionIndex >= 0) {
        const questionIndex = state.selectedQuestionIndex;
        if (state.currentQuiz.questions[questionIndex]) {
          if (!state.currentQuiz.questions[questionIndex].content.answers) {
            state.currentQuiz.questions[questionIndex].content.answers = [];
          }
          state.currentQuiz.questions[questionIndex].content.answers.push(answerText);
        }
      }
    },
    
    updateAnswer: (state, action) => {
      const { index, text } = action.payload;
      
      if (state.currentQuestion.content.answers && state.currentQuestion.content.answers[index] !== undefined) {
        state.currentQuestion.content.answers[index] = text;
        
        // Update in questions array
        if (state.selectedQuestionIndex >= 0) {
          const questionIndex = state.selectedQuestionIndex;
          if (state.currentQuiz.questions[questionIndex]?.content?.answers) {
            state.currentQuiz.questions[questionIndex].content.answers[index] = text;
          }
        }
      }
    },
    
    removeAnswer: (state, action) => {
      const index = action.payload;
      
      if (state.currentQuestion.content.answers) {
        state.currentQuestion.content.answers.splice(index, 1);
        
        // Remove from correct answers if it was selected
        if (state.currentQuestion.content.correctAnswers) {
          const removedAnswer = state.currentQuestion.content.answers[index];
          state.currentQuestion.content.correctAnswers = state.currentQuestion.content.correctAnswers.filter(
            answer => answer !== removedAnswer
          );
        }
        
        // Update in questions array
        if (state.selectedQuestionIndex >= 0) {
          const questionIndex = state.selectedQuestionIndex;
          if (state.currentQuiz.questions[questionIndex]?.content?.answers) {
            state.currentQuiz.questions[questionIndex].content.answers.splice(index, 1);
            
            if (state.currentQuiz.questions[questionIndex].content.correctAnswers) {
              state.currentQuiz.questions[questionIndex].content.correctAnswers = 
                state.currentQuiz.questions[questionIndex].content.correctAnswers.filter(
                  answer => answer !== removedAnswer
                );
            }
          }
        }
      }
    },
    
    toggleCorrectAnswer: (state, action) => {
      const answer = action.payload;
      
      if (!state.currentQuestion.content.correctAnswers) {
        state.currentQuestion.content.correctAnswers = [];
      }
      
      const index = state.currentQuestion.content.correctAnswers.indexOf(answer);
      if (index > -1) {
        state.currentQuestion.content.correctAnswers.splice(index, 1);
      } else {
        // For single choice questions, replace the correct answer
        if (state.currentQuestion.type === 'choice') {
          state.currentQuestion.content.correctAnswers = [answer];
        } else {
          state.currentQuestion.content.correctAnswers.push(answer);
        }
      }
      
      // Update in questions array
      if (state.selectedQuestionIndex >= 0) {
        const questionIndex = state.selectedQuestionIndex;
        if (state.currentQuiz.questions[questionIndex]) {
          state.currentQuiz.questions[questionIndex].content.correctAnswers = 
            [...state.currentQuestion.content.correctAnswers];
        }
      }
    },
    
    // Category management for categorize questions
    addCategory: (state, action) => {
      const categoryName = action.payload || '';
      
      if (!state.currentQuestion.content.categories) {
        state.currentQuestion.content.categories = [];
      }
      
      state.currentQuestion.content.categories.push({
        name: categoryName,
        answers: [''],
      });
    },
    
    updateCategory: (state, action) => {
      const { categoryIndex, name } = action.payload;
      
      if (state.currentQuestion.content.categories && state.currentQuestion.content.categories[categoryIndex]) {
        state.currentQuestion.content.categories[categoryIndex].name = name;
      }
    },
    
    removeCategory: (state, action) => {
      const categoryIndex = action.payload;
      
      if (state.currentQuestion.content.categories) {
        state.currentQuestion.content.categories.splice(categoryIndex, 1);
      }
    },
    
    addCategoryAnswer: (state, action) => {
      const { categoryIndex, answer = '' } = action.payload;
      
      if (state.currentQuestion.content.categories && state.currentQuestion.content.categories[categoryIndex]) {
        state.currentQuestion.content.categories[categoryIndex].answers.push(answer);
      }
    },
    
    updateCategoryAnswer: (state, action) => {
      const { categoryIndex, answerIndex, text } = action.payload;
      
      if (state.currentQuestion.content.categories && 
          state.currentQuestion.content.categories[categoryIndex] &&
          state.currentQuestion.content.categories[categoryIndex].answers[answerIndex] !== undefined) {
        state.currentQuestion.content.categories[categoryIndex].answers[answerIndex] = text;
      }
    },
    
    removeCategoryAnswer: (state, action) => {
      const { categoryIndex, answerIndex } = action.payload;
      
      if (state.currentQuestion.content.categories && 
          state.currentQuestion.content.categories[categoryIndex] &&
          state.currentQuestion.content.categories[categoryIndex].answers.length > 1) {
        state.currentQuestion.content.categories[categoryIndex].answers.splice(answerIndex, 1);
      }
    },
    
    // UI state management
    setShowQuizBuilder: (state, action) => {
      state.showQuizBuilder = action.payload;
      if (!action.payload) {
        state.builder.isActive = false;
        state.builder.step = 'settings';
      }
    },
    
    setShowQuestionModal: (state, action) => {
      state.showQuestionModal = action.payload;
    },
    
    setShowPreview: (state, action) => {
      state.showPreview = action.payload;
      state.builder.previewMode = action.payload;
    },
    
    setShowDeleteConfirm: (state, action) => {
      state.showDeleteConfirm = action.payload;
    },
    
    setShowTemplateSelector: (state, action) => {
      state.showTemplateSelector = action.payload;
    },
    
    // Reset and cleanup
    resetQuiz: (state) => {
      state.currentQuiz = {
        contentId: null,
        duration: DEFAULT_QUIZ_SETTINGS.duration,
        canSkip: DEFAULT_QUIZ_SETTINGS.canSkip,
        questions: [],
      };
      state.builder = {
        isActive: false,
        currentQuestionIndex: -1,
        editingQuestion: null,
        previewMode: false,
        step: 'settings',
      };
      state.settingsForm = quizInitialState.settingsForm;
      state.currentQuestion = quizInitialState.currentQuestion;
      state.selectedQuestionIndex = -1;
      state.validationErrors = [];
      quizSlice.caseReducers.updateStats(state);
    },
    
    // Statistics calculation
    updateStats: (state) => {
      const questions = state.currentQuiz.questions;
      const settings = state.settingsForm;
      
      const questionTypes = questions.reduce((counts, q) => {
        const typeName = q.type || 'choice';
        counts[typeName] = (counts[typeName] || 0) + 1;
        return counts;
      }, {
        choice: 0,
        multiple: 0,
        fillgap: 0,
        categorize: 0,
        reorder: 0,
      });
      
      const totalDuration = questions.reduce((sum, q) => sum + (q.duration || 0), 0);
      const totalPoints = questions.reduce((sum, q) => sum + (q.questionRate || 0), 0);
      
      // Determine difficulty level
      let difficultyLevel = DIFFICULTY_LEVELS.EASY;
      if (questions.length > 10 || totalDuration > 300 || totalPoints > 50) {
        difficultyLevel = DIFFICULTY_LEVELS.MEDIUM;
      }
      if (questions.length > 20 || totalDuration > 600 || totalPoints > 100) {
        difficultyLevel = DIFFICULTY_LEVELS.HARD;
      }
      
      state.stats = {
        totalQuestions: questions.length,
        totalDuration: totalDuration + (settings.duration || 0),
        totalPoints,
        averageQuestionDuration: questions.length > 0 ? Math.round(totalDuration / questions.length) : 0,
        questionTypes,
        difficultyLevel,
        estimatedCompletionTime: totalDuration + (questions.length * 10), // Add thinking time
      };
    },
    
    // Validation
    validateQuiz: (state) => {
      const errors = validateQuizData(state.currentQuiz);
      const warnings = [];
      
      // Additional warnings
      if (state.currentQuiz.questions.length === 0) {
        warnings.push('Quiz has no questions');
      }
      
      if (state.currentQuiz.questions.length > 0) {
        const hasUnansweredQuestions = state.currentQuiz.questions.some(q => {
          if (q.type === 'choice' || q.type === 'multiple') {
            return !q.content?.correctAnswers || q.content.correctAnswers.length === 0;
          }
          return false;
        });
        
        if (hasUnansweredQuestions) {
          warnings.push('Some questions have no correct answers defined');
        }
      }
      
      if (state.stats.totalDuration > 3600) { // 1 hour
        warnings.push('Quiz duration is very long (>1 hour)');
      }
      
      state.validation = {
        isValid: errors.length === 0,
        errors,
        warnings,
      };
      
      state.validationErrors = errors;
    },
    
    // Import/Export functionality
    setImportData: (state, action) => {
      state.importData = action.payload;
    },
    
    importQuiz: (state, action) => {
      const importedQuiz = action.payload;
      
      if (importedQuiz.questions) {
        state.currentQuiz.questions = importedQuiz.questions.map((q, index) => ({
          ...q,
          id: `imported_${Date.now()}_${index}`,
          orderNumber: index + 1,
        }));
      }
      
      if (importedQuiz.settings) {
        state.settingsForm = { ...state.settingsForm, ...importedQuiz.settings };
      }
      
      quizSlice.caseReducers.updateStats(state);
      quizSlice.caseReducers.validateQuiz(state);
    },
    
    exportQuiz: (state) => {
      state.exportData = {
        quiz: state.currentQuiz,
        settings: state.settingsForm,
        stats: state.stats,
        exportedAt: new Date().toISOString(),
      };
    },
    
    // Performance tracking
    updatePerformance: (state, action) => {
      const { type, data } = action.payload;
      
      switch (type) {
        case 'questionCreated':
          state.performance.questionsCreated += 1;
          break;
        case 'optionCreated':
          state.performance.optionsCreated += 1;
          break;
        case 'quizCompleted':
          state.performance.quizzesCompleted += 1;
          state.performance.lastSaved = new Date().toISOString();
          break;
        case 'creationTime':
          state.performance.averageCreationTime = data.averageTime;
          break;
      }
    },
    
    // Accessibility settings
    setAccessibilitySettings: (state, action) => {
      state.accessibility = { ...state.accessibility, ...action.payload };
    },
    
    // Error management
    clearError: (state) => {
      state.error = null;
      state.questionError = null;
      state.optionError = null;
      state.validationErrors = [];
    },
    
    // Question type helpers
    getQuestionTypeStats: (state) => {
      const types = state.stats.questionTypes;
      const total = state.stats.totalQuestions;
      
      return Object.entries(types).map(([type, count]) => ({
        type,
        name: getQuestionTypeName(QUESTION_TYPES[type.toUpperCase()]),
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      }));
    },
    
    // Auto-save functionality
    setAutoSave: (state, action) => {
      state.autoSave = {
        enabled: action.payload.enabled ?? true,
        interval: action.payload.interval ?? 30000, // 30 seconds
        lastSaved: action.payload.lastSaved || null,
      };
    },
    
    markAsSaved: (state) => {
      if (state.autoSave) {
        state.autoSave.lastSaved = new Date().toISOString();
      }
      state.performance.lastSaved = new Date().toISOString();
    },
  },
  
  extraReducers: (builder) => {
    builder
      // Create complete quiz
      .addCase(createQuizAsync.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(createQuizAsync.fulfilled, (state, action) => {
        state.saving = false;
        state.showQuizBuilder = false;
        state.builder.isActive = false;
        
        // Update performance
        quizSlice.caseReducers.updatePerformance(state, {
          payload: { type: 'quizCompleted' }
        });
        
        // Reset quiz after successful creation
        quizSlice.caseReducers.resetQuiz(state);
      })
      .addCase(createQuizAsync.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      
      // Add quiz
      .addCase(addQuizAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addQuizAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.currentQuiz.id = action.payload.id;
      })
      .addCase(addQuizAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add questions
      .addCase(addQuestionsAsync.pending, (state) => {
        state.questionLoading = true;
        state.questionError = null;
      })
      .addCase(addQuestionsAsync.fulfilled, (state, action) => {
        state.questionLoading = false;
        
        // Update questions with returned IDs
        if (action.payload && Array.isArray(action.payload)) {
          action.payload.forEach((returnedQuestion, index) => {
            if (state.currentQuiz.questions[index]) {
              state.currentQuiz.questions[index].id = returnedQuestion.id;
            }
          });
        }
        
        quizSlice.caseReducers.updatePerformance(state, {
          payload: { type: 'questionCreated' }
        });
      })
      .addCase(addQuestionsAsync.rejected, (state, action) => {
        state.questionLoading = false;
        state.questionError = action.payload;
      })
      
      // Add options
      .addCase(addOptionsAsync.pending, (state) => {
        state.optionLoading = true;
        state.optionError = null;
      })
      .addCase(addOptionsAsync.fulfilled, (state, action) => {
        state.optionLoading = false;
        
        quizSlice.caseReducers.updatePerformance(state, {
          payload: { type: 'optionCreated' }
        });
      })
      .addCase(addOptionsAsync.rejected, (state, action) => {
        state.optionLoading = false;
        state.optionError = action.payload;
      });
  },
});

// ======================== ACTIONS EXPORT ========================

export const quizActions = quizSlice.actions;

export const {
  initializeQuiz,
  setQuizSettings,
  setBuilderStep,
  nextBuilderStep,
  prevBuilderStep,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  duplicateQuestion,
  reorderQuestions,
  setCurrentQuestion,
  resetCurrentQuestion,
  setSelectedQuestionType,
  setSelectedQuestionIndex,
  updateQuestionContent,
  addAnswer,
  updateAnswer,
  removeAnswer,
  toggleCorrectAnswer,
  addCategory,
  updateCategory,
  removeCategory,
  addCategoryAnswer,
  updateCategoryAnswer,
  removeCategoryAnswer,
  setShowQuizBuilder,
  setShowQuestionModal,
  setShowPreview,
  setShowDeleteConfirm,
  setShowTemplateSelector,
  resetQuiz,
  updateStats,
  validateQuiz,
  setImportData,
  importQuiz,
  exportQuiz,
  updatePerformance,
  setAccessibilitySettings,
  clearError,
  getQuestionTypeStats,
  setAutoSave,
  markAsSaved,
} = quizSlice.actions;

// ======================== SELECTORS ========================

// Basic selectors
export const selectCurrentQuiz = (state) => state.quiz.currentQuiz;
export const selectBuilder = (state) => state.quiz.builder;
export const selectQuizLoading = (state) => state.quiz.loading || state.quiz.saving;
export const selectQuizError = (state) => state.quiz.error;

// Settings selectors
export const selectSettingsForm = (state) => state.quiz.settingsForm;
export const selectCurrentQuestion = (state) => state.quiz.currentQuestion;
export const selectQuestionTemplates = (state) => state.quiz.questionTemplates;

// UI selectors
export const selectSelectedQuestionType = (state) => state.quiz.selectedQuestionType;
export const selectSelectedQuestionIndex = (state) => state.quiz.selectedQuestionIndex;
export const selectShowQuizBuilder = (state) => state.quiz.showQuizBuilder;
export const selectShowQuestionModal = (state) => state.quiz.showQuestionModal;

// Data selectors
export const selectQuizStats = (state) => state.quiz.stats;
export const selectValidation = (state) => state.quiz.validation;
export const selectPerformance = (state) => state.quiz.performance;
export const selectAccessibility = (state) => state.quiz.accessibility;

// Computed selectors
export const selectQuizQuestions = (state) => {
  return state.quiz.currentQuiz.questions.map(question => 
    formatQuestionForDisplay(question)
  );
};

export const selectCurrentQuestionFormatted = (state) => {
  const currentQuestion = state.quiz.currentQuestion;
  return formatQuestionForDisplay(currentQuestion);
};

export const selectQuizProgress = (state) => {
  const totalSteps = 3; // settings, questions, preview
  const currentStepIndex = ['settings', 'questions', 'preview'].indexOf(state.quiz.builder.step);
  return {
    currentStep: currentStepIndex + 1,
    totalSteps,
    percentage: Math.round(((currentStepIndex + 1) / totalSteps) * 100),
  };
};

export const selectQuestionsByType = (state) => {
  const questions = state.quiz.currentQuiz.questions;
  return questions.reduce((acc, question) => {
    const type = question.type || 'choice';
    if (!acc[type]) acc[type] = [];
    acc[type].push(question);
    return acc;
  }, {});
};

export const selectQuizDifficultyAnalysis = (state) => {
  const stats = state.quiz.stats;
  const questions = state.quiz.currentQuiz.questions;
  
  return {
    difficulty: stats.difficultyLevel,
    factors: {
      questionCount: questions.length,
      averageDuration: stats.averageQuestionDuration,
      totalPoints: stats.totalPoints,
      complexQuestionTypes: questions.filter(q => 
        ['categorize', 'reorder', 'fillgap'].includes(q.type)
      ).length,
    },
    recommendations: (() => {
      const recommendations = [];
      
      if (questions.length < 5) {
        recommendations.push('Consider adding more questions for better assessment');
      }
      
      if (stats.totalDuration > 1800) { // 30 minutes
        recommendations.push('Quiz might be too long - consider splitting into multiple quizzes');
      }
      
      if (stats.questionTypes.choice === questions.length) {
        recommendations.push('Mix in different question types for better engagement');
      }
      
      return recommendations;
    })(),
  };
};

export const selectCanSaveQuiz = (state) => {
  const validation = state.quiz.validation;
  const questions = state.quiz.currentQuiz.questions;
  
  return validation.isValid && 
         questions.length > 0 && 
         state.quiz.currentQuiz.contentId &&
         !state.quiz.saving;
};

export const selectQuizSummary = (state) => {
  const quiz = state.quiz.currentQuiz;
  const stats = state.quiz.stats;
  const settings = state.quiz.settingsForm;
  
  return {
    title: `Quiz with ${stats.totalQuestions} questions`,
    duration: `${Math.ceil(stats.estimatedCompletionTime / 60)} minutes`,
    difficulty: stats.difficultyLevel,
    points: stats.totalPoints,
    questionTypes: Object.entries(stats.questionTypes)
      .filter(([_, count]) => count > 0)
      .map(([type, count]) => `${count} ${type}`)
      .join(', '),
    settings: {
      canSkip: settings.canSkip,
      randomizeQuestions: settings.randomizeQuestions,
      passingScore: settings.passingScore,
    },
  };
};

export const selectQuestionValidation = (questionIndex) => (state) => {
  const question = state.quiz.currentQuiz.questions[questionIndex];
  if (!question) return { isValid: false, errors: ['Question not found'] };
  
  const errors = validateQuestionData(question);
  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const selectExportData = (state) => {
  if (!state.quiz.exportData) return null;
  
  return {
    ...state.quiz.exportData,
    formattedQuiz: formatQuizForDisplay(state.quiz.currentQuiz),
    summary: quizSlice.getSelectors().selectQuizSummary(state),
  };
};

export default quizSlice.reducer;