import express from 'express';
import { body } from 'express-validator';

import {
    register,
    login,
    getProfile,
    updateProfile,
    changePassword
} from '../controllers/authController.js';

import protect from '../middleware/auth.js';

const router = express.Router();


// Register Validation
const registerValidation = [
    body('name')
        .trim()
        .isLength({ min: 3 })
        .withMessage('Name must be at least 3 characters'),

    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide valid email'),

    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters')
];


// Login Validation
const loginValidation = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide valid email'),

    body('password')
        .notEmpty()
        .withMessage('Password is required')
];


// Public Routes
router.post('/register', registerValidation, register);

router.post('/login', loginValidation, login);


// Protected Routes
router.get('/profile', protect, getProfile);

router.put('/profile', protect, updateProfile);

router.put('/change-password', protect, changePassword);


export default router;