import express from 'express';
import {
    getQuizzes,
    getQuizById,
    submitQuiz,
    getQuizResults,
    deleteQuiz,
} from '../controllers/quizController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/quiz/:id', getQuizById);
router.post('/quiz/:id/submit', submitQuiz);
router.get('/quiz/:id/results', getQuizResults);
router.delete('/quiz/:id', deleteQuiz);

// Document quizzes or direct ID query routes
router.get('/:id/submit', submitQuiz);
router.get('/:id/results', getQuizResults);
router.get('/:id', getQuizById);

export default router;
