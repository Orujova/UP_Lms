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

// Add quiz to content - multipart/form-data format
export const addQuiz = async (quizData) => {
  try {
    const formData = new FormData();
    formData.append("ContentId", quizData.contentId.toString());
    
    // Duration object with ticks - API documentation göstərir ki, object formatında olmalıdır
    const durationObject = {
      ticks: parseDurationToTicks(quizData.duration || 60)
    };
    formData.append("Duration", JSON.stringify(durationObject));
    formData.append("CanSkip", (quizData.canSkip || false).toString());

    const response = await axios.post(`${API_URL}Course/AddQuiz`, formData, {
      headers: {
        ...getHeaders(),
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error adding quiz:", error);
    throw new Error("Failed to add quiz: " + (error.response?.data?.detail || error.message));
  }
};

// Add questions to quiz - application/json format
export const addQuestions = async (questionsData) => {
  try {
    // API documentation göstərir ki, questions array formatında göndərilməlidir
    const payload = {
      questions: questionsData.questions.map(question => ({
        quizId: question.quizId,
        text: question.text || "",
        title: question.title || "",
        questionRate: question.questionRate || 1,
        duration: {
          ticks: parseDurationToTicks(question.duration || 30)
        },
        hasDuration: question.hasDuration !== undefined ? question.hasDuration : true,
        canSkip: question.canSkip || false,
        questionType: question.questionType || 1, // 1=Single choice, 2=Multiple choice, 3=Reorder, 4=Fill gap, 5=Categorize
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

// Add options to questions - application/json format
export const addOptions = async (optionsData) => {
  try {
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

// Create complete quiz with questions and options
export const createCompleteQuiz = async (quizData) => {
  try {
    // 1. Əvvəlcə quiz yaradırıq
    const quiz = await addQuiz({
      contentId: quizData.contentId,
      duration: quizData.duration,
      canSkip: quizData.canSkip,
    });

    if (!quiz || !quiz.id) {
      throw new Error("Quiz creation failed - no quiz ID returned");
    }

    // 2. Sonra sualları əlavə edirik
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

      // 3. Hər sual üçün seçimləri əlavə edirik
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

// Helper function to get question type ID
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

// Question type constants
export const QUESTION_TYPES = {
  SINGLE_CHOICE: 1,
  MULTIPLE_CHOICE: 2,
  REORDER: 3,
  FILL_GAP: 4,
  CATEGORIZE: 5,
};

// Quiz validation helper
export const validateQuizData = (quizData) => {
  const errors = [];

  if (!quizData.contentId) {
    errors.push("Content ID is required");
  }

  if (!quizData.questions || quizData.questions.length === 0) {
    errors.push("At least one question is required");
  }

  if (quizData.questions) {
    quizData.questions.forEach((question, index) => {
      if (!question.text && !question.questionText) {
        errors.push(`Question ${index + 1}: Question text is required`);
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
          break;

        case "reorder":
          if (!question.content?.answers || question.content.answers.length < 2) {
            errors.push(`Question ${index + 1}: At least 2 items required for reordering`);
          }
          break;
      }
    });
  }

  return errors;
};

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