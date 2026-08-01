import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";
const getErrorMessage = (error, defaultMsg) => {
  const data = error.response?.data;
  if (!data) return { message: defaultMsg };
  const msg = data.error || data.message || defaultMsg;
  return { ...data, message: typeof msg === 'string' ? msg : JSON.stringify(msg) };
};

const generateFlashcards = async (documentId, options) => {
  try {
    const response = await axiosInstance.post(
      API_PATHS.AI.GENERATE_FLASHCARDS,
      { documentId, ...options }
    );

    return response.data;
  } catch (error) {
    throw getErrorMessage(error, "Failed to generate flashcards");
  }
};

const generateQuiz = async (documentId, options) => {
  try {
    const response = await axiosInstance.post(
      API_PATHS.AI.GENERATE_QUIZ,
      { documentId, ...options }
    );

    return response.data;
  } catch (error) {
    throw getErrorMessage(error, "Failed to generate quiz");
  }
};

const generateSummary = async (documentId) => {
  try {
    const response = await axiosInstance.post(
      API_PATHS.AI.GENERATE_SUMMARY,
      { documentId }
    );

    return response.data?.data;
  } catch (error) {
    throw getErrorMessage(error, "Failed to generate summary");
  }
};

const chat = async (documentId, message) => {
  try {
    const response = await axiosInstance.post(
      API_PATHS.AI.CHAT,
      {
        documentId,
        question: message,
      }
    );

    return response.data;
  } catch (error) {
    throw getErrorMessage(error, "Chat request failed");
  }
};

const explainConcept = async (documentId, concept) => {
  try {
    const response = await axiosInstance.post(
      API_PATHS.AI.EXPLAIN_CONCEPT,
      {
        documentId,
        concept,
      }
    );

    return response.data?.data;
  } catch (error) {
    throw getErrorMessage(error, "Failed to explain concept");
  }
};

const getChatHistory = async (documentId) => {
  try {
    const response = await axiosInstance.get(
      API_PATHS.AI.GET_CHAT_HISTORY(documentId)
    );

    return response.data;
  } catch (error) {
    throw getErrorMessage(error, "Failed to fetch chat history");
  }
};
const aiService = {
  generateFlashcards,
  generateQuiz,
  generateSummary,
  chat,
  explainConcept,
  getChatHistory,
};

export default aiService;