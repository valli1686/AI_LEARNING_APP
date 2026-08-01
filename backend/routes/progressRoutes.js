import express from 'express';
import { getDashboard } from '../controllers/progressController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

// Protect all routes in this router
router.use(protect);

router.get('/dashboard', getDashboard);

export default router;