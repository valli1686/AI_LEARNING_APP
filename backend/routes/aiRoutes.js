import express from 'express';

import {
    generateFlashcards,
    generateQuiz,
    generateSummary,
    chat,
    explainConcept,
    getChatHistory,
} from '../controllers/aiController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/flashcards', generateFlashcards);
router.post('/quiz', generateQuiz);
router.post('/summary', generateSummary);
router.post('/chat', chat);
router.post('/explain', explainConcept);
router.get('/chat/history', getChatHistory);

export default router;