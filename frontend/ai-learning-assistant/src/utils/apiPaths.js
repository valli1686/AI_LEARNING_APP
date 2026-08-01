export const BASE_URL = "http://localhost:8000";

export const API_PATHS = {
  AUTH: {
    REGISTER: "/api/auth/register",
    LOGIN: "/api/auth/login",
    GET_PROFILE: "/api/auth/profile",
    UPDATE_PROFILE: "/api/auth/profile",
    CHANGE_PASSWORD: "/api/auth/change-password",
  },

  DOCUMENTS: {
    UPLOAD: "/api/documents/upload",
    GET_DOCUMENTS: "/api/documents",
    GET_DOCUMENT_BY_ID: (id) => `/api/documents/${id}`,
    DELETE_DOCUMENT: (id) => `/api/documents/${id}`,
    UPDATE_DOCUMENT: (id) => `/api/documents/${id}`,
  },

  AI: {
    GENERATE_FLASHCARDS: "/api/ai/flashcards",
    GENERATE_QUIZ: "/api/ai/quiz",
    GENERATE_SUMMARY: "/api/ai/summary",
    CHAT: "/api/ai/chat",
    EXPLAIN_CONCEPT: "/api/ai/explain",
    GET_CHAT_HISTORY: (documentId) =>
      `/api/ai/chat/history?documentId=${documentId}`,
  },

  FLASHCARDS: {
    GET_ALL_FLASHCARD_SETS: "/api/flashcards/sets",
    GET_FLASHCARDS_FOR_DOC: (documentId) =>
      `/api/flashcards?documentId=${documentId}`,
    REVIEW_FLASHCARD: (cardId) =>
      `/api/flashcards/review`,
    TOGGLE_STAR: (cardId) =>
      `/api/flashcards/star/${cardId}`,
    DELETE_FLASHCARD_SET: (id) =>
      `/api/flashcards/set/${id}`,
  },

  QUIZZES: {
    GET_QUIZZES_FOR_DOC: (documentId) =>
      `/api/quizzes/${documentId}`,
    GET_QUIZ_BY_ID: (id) =>
      `/api/quizzes/quiz/${id}`,
    SUBMIT_QUIZ: (id) =>
      `/api/quizzes/quiz/${id}/submit`,
    GET_QUIZ_RESULTS: (id) =>
      `/api/quizzes/quiz/${id}/results`,
    DELETE_QUIZ: (id) =>
      `/api/quizzes/quiz/${id}`,
  },

  PROGRESS: {
    GET_DASHBOARD: "/api/progress/dashboard",
  },
};