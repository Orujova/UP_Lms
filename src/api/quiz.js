import axios from "axios";
import { getToken } from "@/authtoken/auth.js";

const API_URL = "https://bravoadmin.uplms.org/api/";

const getHeaders = () => {
  const token = getToken();
  return {
    accept: "*/*",
    Authorization: `Bearer ${token}`,
  };
};

// ======================== QUIZ MANAGEMENT ========================

export const addQuiz = async (quizData) => {
  try {
    const formData = new FormData();
    formData.append("ContentId", quizData.contentId.toString());
    
    // FIXED: Duration is just a simple number (minutes), not ticks object!
    formData.append("Duration", (quizData.duration || 60).toString());
    formData.append("CanSkip", (quizData.canSkip || false).toString());

    console.log('FIXED: Sending simple duration format:', {
      contentId: quizData.contentId,
      duration: quizData.duration, // Simple number
      canSkip: quizData.canSkip
    });

    const response = await axios.post(`${API_URL}Course/AddQuiz`, formData, {
      headers: {
        ...getHeaders(),
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error adding quiz:", error);
    console.error("Request payload:", {
      ContentId: quizData.contentId,
      Duration: quizData.duration,
      CanSkip: quizData.canSkip
    });
    throw new Error("Failed to add quiz: " + (error.response?.data?.detail || error.message));
  }
};
// Add questions to quiz - application/json format (FIXED STRUCTURE)
export const addQuestions = async (questionsData) => {
  try {
    const payload = {
      questions: questionsData.questions.map(question => ({
        quizId: question.quizId,
        text: question.text || "",
        title: question.title || "",
        questionRate: question.questionRate || 1,
          duration: (question.duration || 30), // Əvvəlki `ticks` əvəzinə string format
          hasDuration: question.hasDuration !== undefined ? question.hasDuration : true,
        canSkip: question.canSkip || false,
        questionType: question.questionType || 1,
        categories: question.categories || [],
      }))
    };

    const response = await axios.post(
      `${API_URL}Course/AddQuestion`,
      payload,
      {
        headers: {
          ...getHeaders(),
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding questions:", error);
    throw new Error("Failed to add questions: " + (error.response?.data?.detail || error.message));
  }
};


// Add options to questions - application/json format (FIXED STRUCTURE)
export const addOptions = async (optionsData) => {
  try {
    // FIXED: API expects options array directly, not nested in object
    const payload = {
      options: optionsData.options.map(option => ({
        questionId: option.questionId,
        text: option.text || "",
        isCorrect: option.isCorrect || false,
        order: option.order || 0,
        gapText: option.gapText || option.text,
        category: option.category || "",
      }))
    };

    const response = await axios.post(
      `${API_URL}Course/AddOption`,
      payload,
      {
        headers: {
          ...getHeaders(),
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding options:", error);
    throw new Error("Failed to add options: " + (error.response?.data?.detail || error.message));
  }
};

// ======================== COMPLETE QUIZ CREATION ========================

// Create complete quiz with questions and options (FIXED)
export const createCompleteQuiz = async (quizData) => {
  try {
    // 1. First create the quiz
    const quiz = await addQuiz({
      contentId: quizData.contentId,
      duration: quizData.duration,
      canSkip: quizData.canSkip,
    });

    if (!quiz || !quiz.id) {
      throw new Error("Quiz creation failed - no quiz ID returned");
    }

    // 2. Then add questions
    if (quizData.questions && quizData.questions.length > 0) {
      const questionsPayload = {
        questions: quizData.questions.map((question) => ({
          quizId: quiz.id,
          text: question.text || question.questionText || "",
          title: question.title || "",
          questionRate: question.points || question.questionRate || 1,
          duration: {
            ticks: parseDurationToTicks(question.duration || 30)
          },
          hasDuration: true,
          canSkip: question.canSkip || false,
          questionType: getQuestionTypeId(question.type),
          categories: getQuestionCategories(question),
        })),
      };

      const questionsResult = await addQuestions(questionsPayload);

      // 3. Add options for each question
      if (questionsResult && questionsResult.length > 0) {
        for (let i = 0; i < questionsResult.length; i++) {
          const questionId = questionsResult[i].id;
          const questionOptions = formatOptionsForAPI(quizData.questions[i]);

          if (questionOptions && questionOptions.length > 0) {
            const optionsPayload = {
              options: questionOptions.map((option) => ({
                questionId: questionId,
                text: option.text,
                isCorrect: option.isCorrect,
                order: option.order,
                gapText: option.gapText || option.text,
                category: option.category || "",
              })),
            };

            await addOptions(optionsPayload);
          }
        }
      }

      return {
        quiz,
        questions: questionsResult,
      };
    }

    return { quiz, questions: [] };
  } catch (error) {
    console.error("Error creating complete quiz:", error);
    throw new Error("Failed to create complete quiz: " + error.message);
  }
};

// ======================== HELPER FUNCTIONS ========================

// Helper function to get question type ID (FIXED ENUM VALUES)
const getQuestionTypeId = (type) => {
  const typeMap = {
    choice: 1, // Single choice
    multiple: 2, // Multiple choice
    reorder: 3, // Reorder
    fillgap: 4, // Fill in the gap
    categorize: 5, // Categorize
  };
  return typeMap[type] || 1;
};

// Helper function to get question categories
const getQuestionCategories = (question) => {
  if (question.type === "categorize" && question.content?.categories) {
    return question.content.categories.map(cat => cat.name);
  }
  return [];
};

// Helper function to format options for API
const formatOptionsForAPI = (question) => {
  const content = question.content || {};

  switch (question.type) {
    case "choice":
    case "multiple":
      return (content.answers || []).map((answer, index) => ({
        text: answer,
        isCorrect: (content.correctAnswers || []).includes(answer),
        order: index + 1,
        gapText: answer,
        category: "",
      }));

    case "fillgap":
      const correctAnswers = (content.correctAnswers || []).map(
        (answer, index) => ({
          text: answer,
          isCorrect: true,
          order: index + 1,
          gapText: answer,
          category: "",
        })
      );

      const incorrectAnswers = (content.incorrectAnswers || []).map(
        (answer, index) => ({
          text: answer,
          isCorrect: false,
          order: correctAnswers.length + index + 1,
          gapText: answer,
          category: "",
        })
      );

      return [...correctAnswers, ...incorrectAnswers];

    case "categorize":
      return (content.categories || []).flatMap((category) =>
        (category.answers || []).map((answer, index) => ({
          text: answer,
          isCorrect: true,
          order: index + 1,
          gapText: answer,
          category: category.name,
        }))
      );

    case "reorder":
      return (content.answers || []).map((answer, index) => ({
        text: answer,
        isCorrect: true,
        order: index + 1,
        gapText: answer,
        category: "",
      }));

    default:
      return [];
  }
};

// Helper function to parse duration string to ticks
const parseDurationToTicks = (durationInput) => {
  // .NET Ticks: 1 second = 10,000,000 ticks
  const TICKS_PER_SECOND = 10000000;
  
  if (typeof durationInput === "number") {
    // Assume it's seconds
    return durationInput * TICKS_PER_SECOND;
  }
  
  if (typeof durationInput === "string") {
    // Try to parse "HH:MM:SS" format
    const parts = durationInput.split(":");
    if (parts.length === 3) {
      const hours = parseInt(parts[0]) || 0;
      const minutes = parseInt(parts[1]) || 0;
      const seconds = parseInt(parts[2]) || 0;
      const totalSeconds = hours * 3600 + minutes * 60 + seconds;
      return totalSeconds * TICKS_PER_SECOND;
    }
    
    // Try to parse as just seconds
    const seconds = parseInt(durationInput) || 0;
    return seconds * TICKS_PER_SECOND;
  }

  // Default 1 minute
  return 60 * TICKS_PER_SECOND;
};

// Helper function to convert ticks to seconds
export const ticksToSeconds = (ticks) => {
  const TICKS_PER_SECOND = 10000000;
  return Math.floor(ticks / TICKS_PER_SECOND);
};

// Helper function to convert ticks to readable duration
export const ticksToReadableDuration = (ticks) => {
  const seconds = ticksToSeconds(ticks);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// ======================== VALIDATION FUNCTIONS ========================

// Quiz validation helper
export const validateQuizData = (quizData) => {
  const errors = [];

  if (!quizData.contentId) {
    errors.push("Content ID is required");
  }

  if (!quizData.questions || quizData.questions.length === 0) {
    errors.push("At least one question is required");
  }

  if (quizData.duration && (quizData.duration < 1 || quizData.duration > 7200)) {
    errors.push("Quiz duration must be between 1 and 7200 seconds");
  }

  if (quizData.questions) {
    quizData.questions.forEach((question, index) => {
      if (!question.text && !question.questionText) {
        errors.push(`Question ${index + 1}: Question text is required`);
      }

      if (question.duration && (question.duration < 1 || question.duration > 600)) {
        errors.push(`Question ${index + 1}: Question duration must be between 1 and 600 seconds`);
      }

      if (question.questionRate && (question.questionRate < 1 || question.questionRate > 100)) {
        errors.push(`Question ${index + 1}: Question rate must be between 1 and 100`);
      }

      switch (question.type) {
        case "choice":
        case "multiple":
          if (!question.content?.answers || question.content.answers.length < 2) {
            errors.push(`Question ${index + 1}: At least 2 answers required`);
          }
          if (!question.content?.correctAnswers || question.content.correctAnswers.length === 0) {
            errors.push(`Question ${index + 1}: At least one correct answer required`);
          }
          if (question.type === "choice" && question.content?.correctAnswers?.length > 1) {
            errors.push(`Question ${index + 1}: Single choice questions can have only one correct answer`);
          }
          break;

        case "fillgap":
          if (!question.content?.correctAnswers || question.content.correctAnswers.length === 0) {
            errors.push(`Question ${index + 1}: At least one correct answer required`);
          }
          break;

        case "categorize":
          if (!question.content?.categories || question.content.categories.length === 0) {
            errors.push(`Question ${index + 1}: At least one category required`);
          }
          question.content.categories?.forEach((category, catIndex) => {
            if (!category.name?.trim()) {
              errors.push(`Question ${index + 1}, Category ${catIndex + 1}: Category name is required`);
            }
            if (!category.answers || category.answers.length === 0) {
              errors.push(`Question ${index + 1}, Category ${catIndex + 1}: At least one answer required`);
            }
          });
          break;

        case "reorder":
          if (!question.content?.answers || question.content.answers.length < 2) {
            errors.push(`Question ${index + 1}: At least 2 items required for reordering`);
          }
          break;

        default:
          errors.push(`Question ${index + 1}: Invalid question type`);
      }
    });
  }

  return errors;
};

// Validate question data
export const validateQuestionData = (questionData) => {
  const errors = [];

  if (!questionData.quizId) {
    errors.push("Quiz ID is required");
  }

  if (!questionData.text?.trim()) {
    errors.push("Question text is required");
  }

  if (questionData.text && questionData.text.length > 1000) {
    errors.push("Question text must be less than 1000 characters");
  }

  if (questionData.questionRate && (questionData.questionRate < 1 || questionData.questionRate > 100)) {
    errors.push("Question rate must be between 1 and 100");
  }

  if (!questionData.questionType || ![1, 2, 3, 4, 5].includes(questionData.questionType)) {
    errors.push("Valid question type is required");
  }

  return errors;
};

// Validate option data
export const validateOptionData = (optionData) => {
  const errors = [];

  if (!optionData.questionId) {
    errors.push("Question ID is required");
  }

  if (!optionData.text?.trim()) {
    errors.push("Option text is required");
  }

  if (optionData.text && optionData.text.length > 500) {
    errors.push("Option text must be less than 500 characters");
  }

  if (optionData.order && optionData.order < 1) {
    errors.push("Option order must be at least 1");
  }

  return errors;
};

// ======================== FORMATTING FUNCTIONS ========================

// Format quiz data for API submission
export const formatQuizForAPI = (quizFormData) => {
  return {
    contentId: quizFormData.contentId,
    duration: parseDurationToTicks(quizFormData.duration || 60),
    canSkip: quizFormData.canSkip || false,
    questions: quizFormData.questions.map((question) => ({
      text: question.text || question.questionText || "",
      title: question.title || "",
      questionRate: question.points || question.questionRate || 1,
      duration: parseDurationToTicks(question.duration || 30),
      hasDuration: true,
      canSkip: question.canSkip || false,
      questionType: getQuestionTypeId(question.type),
      categories: getQuestionCategories(question),
      options: formatOptionsForAPI(question),
    })),
  };
};

// Format quiz response for display
export const formatQuizForDisplay = (quiz) => {
  if (!quiz) return null;

  return {
    ...quiz,
    formattedDuration: ticksToReadableDuration(quiz.duration?.ticks || 0),
    durationInSeconds: ticksToSeconds(quiz.duration?.ticks || 0),
    questionsCount: quiz.questions?.length || 0,
    totalPoints: quiz.questions?.reduce((sum, q) => sum + (q.questionRate || 0), 0) || 0,
    averageQuestionDuration: quiz.questions?.length > 0 
      ? Math.round(quiz.questions.reduce((sum, q) => sum + ticksToSeconds(q.duration?.ticks || 0), 0) / quiz.questions.length)
      : 0,
  };
};

// Format question for display
export const formatQuestionForDisplay = (question) => {
  if (!question) return null;

  return {
    ...question,
    formattedDuration: ticksToReadableDuration(question.duration?.ticks || 0),
    durationInSeconds: ticksToSeconds(question.duration?.ticks || 0),
    typeName: getQuestionTypeName(question.questionType),
    optionsCount: question.options?.length || 0,
    correctOptionsCount: question.options?.filter(opt => opt.isCorrect).length || 0,
  };
};

// Get question type name
export const getQuestionTypeName = (questionType) => {
  const typeMap = {
    1: "Single Choice",
    2: "Multiple Choice", 
    3: "Reorder",
    4: "Fill in the Gap",
    5: "Categorize"
  };
  return typeMap[questionType] || "Unknown";
};

// ======================== QUIZ STATISTICS ========================

// Calculate quiz statistics
export const calculateQuizStats = (quiz) => {
  if (!quiz || !quiz.questions) {
    return {
      totalQuestions: 0,
      totalDuration: 0,
      totalPoints: 0,
      averageQuestionDuration: 0,
      questionTypes: {},
      difficultyLevel: 'unknown'
    };
  }

  const questions = quiz.questions;
  const totalDuration = questions.reduce((sum, q) => sum + ticksToSeconds(q.duration?.ticks || 0), 0);
  const totalPoints = questions.reduce((sum, q) => sum + (q.questionRate || 0), 0);
  
  // Count question types
  const questionTypes = questions.reduce((counts, q) => {
    const typeName = getQuestionTypeName(q.questionType);
    counts[typeName] = (counts[typeName] || 0) + 1;
    return counts;
  }, {});

  // Determine difficulty level
  let difficultyLevel = 'easy';
  if (questions.length > 10 || totalDuration > 300) {
    difficultyLevel = 'medium';
  }
  if (questions.length > 20 || totalDuration > 600 || totalPoints > 100) {
    difficultyLevel = 'hard';
  }

  return {
    totalQuestions: questions.length,
    totalDuration,
    totalPoints,
    averageQuestionDuration: questions.length > 0 ? Math.round(totalDuration / questions.length) : 0,
    questionTypes,
    difficultyLevel
  };
};

// ======================== QUIZ TEMPLATES ========================

// Get question templates for different types
export const getQuestionTemplates = () => {
  return {
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
    multiple: {
      type: 'multiple',
      text: '',
      title: '',
      questionRate: 1,
      duration: 45,
      hasDuration: true,
      canSkip: false,
      content: {
        question: '',
        multipleAnswers: true,
        answers: ['', '', ''],
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
      questionRate: 2,
      duration: 60,
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
      duration: 45,
      hasDuration: true,
      canSkip: false,
      content: {
        question: '',
        answers: ['', ''],
      },
    },
  };
};

// ======================== CONSTANTS ========================

// Question type constants (FIXED ENUM VALUES)
export const QUESTION_TYPES = {
  SINGLE_CHOICE: 1,
  MULTIPLE_CHOICE: 2,
  REORDER: 3,
  FILL_GAP: 4,
  CATEGORIZE: 5,
};

// Quiz difficulty levels
export const DIFFICULTY_LEVELS = {
  EASY: 'easy',
  MEDIUM: 'medium', 
  HARD: 'hard'
};

// Default quiz settings
export const DEFAULT_QUIZ_SETTINGS = {
  duration: 60, // seconds
  canSkip: false,
  questionDuration: 30, // seconds
  questionRate: 1,
  hasDuration: true,
};

export default {
  // Core quiz operations
  addQuiz,
  addQuestions,
  addOptions,
  createCompleteQuiz,
  
  // Validation functions
  validateQuizData,
  validateQuestionData,
  validateOptionData,
  
  // Formatting functions
  formatQuizForAPI,
  formatQuizForDisplay,
  formatQuestionForDisplay,
  
  // Helper functions
  ticksToSeconds,
  ticksToReadableDuration,
  getQuestionTypeName,
  calculateQuizStats,
  getQuestionTemplates,
  
  // Constants
  QUESTION_TYPES,
  DIFFICULTY_LEVELS,
  DEFAULT_QUIZ_SETTINGS,
};