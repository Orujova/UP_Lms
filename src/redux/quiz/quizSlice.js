// redux/quiz/quizSlice.js (Updated from previous version)
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  addQuiz,
  addQuestions,
  addOptions,
  createCompleteQuiz,
  validateQuizData,
  formatQuizForAPI,
  QUESTION_TYPES,
  ticksToSeconds,
  ticksToReadableDuration,
} from '@/api/quiz';

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

const quizInitialState = {
  currentQuiz: {
    contentId: null,
    duration: 60,
    canSkip: false,
    questions: [],
  },
  builder: {
    isActive: false,
    currentQuestionIndex: -1,
    editingQuestion: null,
    previewMode: false,
  },
  questionTemplates: {
    choice: {
      type: 'choice',
      text: '',
      title: '',
      questionRate: 1,
      duration: 30,
      hasDuration: true,
      canSkip: false,
      content: {
        question: '',
        multipleAnswers: false,
        answers: ['', ''],
        correctAnswers: [],
      },
    },
    fillgap: {
      type: 'fillgap',
      text: '',
      title: '',
      questionRate: 1,
      duration: 30,
      hasDuration: true,
      canSkip: false,
      content: {
        questionText: '',
        correctAnswers: [],
        incorrectAnswers: [],
      },
    },
    categorize: {
      type: 'categorize',
      text: '',
      title: '',
      questionRate: 1,
      duration: 45,
      hasDuration: true,
      canSkip: false,
      content: {
        categories: [
          {
            name: '',
            answers: [''],
          },
        ],
      },
    },
    reorder: {
      type: 'reorder',
      text: '',
      title: '',
      questionRate: 1,
      duration: 30,
      hasDuration: true,
      canSkip: false,
      content: {
        question: '',
        answers: ['', ''],
      },
    },
  },
  loading: false,
  saving: false,
  error: null,
  validationErrors: [],
  showQuizBuilder: false,
  showQuestionModal: false,
  showPreview: false,
  selectedQuestionType: 'choice',
  stats: {
    totalQuestions: 0,
    totalDuration: 0,
    questionTypes: {
      choice: 0,
      fillgap: 0,
      categorize: 0,
      reorder: 0,
    },
  },
};

const quizSlice = createSlice({
  name: 'quiz',
  initialState: quizInitialState,
  reducers: {
    initializeQuiz: (state, action) => {
      const { contentId, existingQuiz = null } = action.payload;
      if (existingQuiz) {
        state.currentQuiz = existingQuiz;
      } else {
        state.currentQuiz = {
          contentId,
          duration: 60,
          canSkip: false,
          questions: [],
        };
      }
      state.builder.isActive = true;
      quizSlice.caseReducers.updateStats(state);
    },
    setQuizSettings: (state, action) => {
      state.currentQuiz = { ...state.currentQuiz, ...action.payload };
    },
    addQuestion: (state, action) => {
      const questionType = action.payload;
      const template = state.questionTemplates[questionType];
      if (template) {
        const newQuestion = {
          ...JSON.parse(JSON.stringify(template)),
          id: `temp_${Date.now()}`,
          title: `Question ${state.currentQuiz.questions.length + 1}`,
        };
        state.currentQuiz.questions.push(newQuestion);
        state.builder.currentQuestionIndex = state.currentQuiz.questions.length - 1;
        quizSlice.caseReducers.updateStats(state);
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
      }
    },
    deleteQuestion: (state, action) => {
      const index = action.payload;
      state.currentQuiz.questions.splice(index, 1);
      if (state.builder.currentQuestionIndex >= state.currentQuiz.questions.length) {
        state.builder.currentQuestionIndex = Math.max(0, state.currentQuiz.questions.length - 1);
      }
      quizSlice.caseReducers.updateStats(state);
    },
    setShowQuizBuilder: (state, action) => {
      state.showQuizBuilder = action.payload;
      if (!action.payload) {
        state.builder.isActive = false;
      }
    },
    resetQuiz: (state) => {
      state.currentQuiz = {
        contentId: null,
        duration: 60,
        canSkip: false,
        questions: [],
      };
      state.builder = {
        isActive: false,
        currentQuestionIndex: -1,
        editingQuestion: null,
        previewMode: false,
      };
      state.validationErrors = [];
      quizSlice.caseReducers.updateStats(state);
    },
    updateStats: (state) => {
      const questions = state.currentQuiz.questions;
      state.stats = {
        totalQuestions: questions.length,
        totalDuration: questions.reduce((sum, q) => sum + (q.duration || 0), 0),
        questionTypes: {
          choice: questions.filter(q => q.type === 'choice').length,
          fillgap: questions.filter(q => q.type === 'fillgap').length,
          categorize: questions.filter(q => q.type === 'categorize').length,
          reorder: questions.filter(q => q.type === 'reorder').length,
        },
      };
    },
    clearError: (state) => {
      state.error = null;
      state.validationErrors = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createQuizAsync.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(createQuizAsync.fulfilled, (state, action) => {
        state.saving = false;
        state.showQuizBuilder = false;
        state.builder.isActive = false;
        quizSlice.caseReducers.resetQuiz(state);
      })
      .addCase(createQuizAsync.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      });
  },
});

export const quizActions = quizSlice.actions;
export default quizSlice.reducer;