import Quiz from '../models/Quiz.js';

// @desc    Get all quizzes for user (optionally filtered by documentId)
// @route   GET /api/quizzes or GET /api/quizzes?documentId=xxx
export const getQuizzes = async (req, res, next) => {
    try {
        const query = { userId: req.user._id };
        if (req.query.documentId || req.params.documentId) {
            query.documentId = req.query.documentId || req.params.documentId;
        }

        const quizzes = await Quiz.find(query)
            .populate('documentId', 'title')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: quizzes.length,
            data: quizzes
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get quiz by ID
// @route   GET /api/quizzes/:id
export const getQuizById = async (req, res, next) => {
    try {
        const quiz = await Quiz.findOne({
            _id: req.params.id,
            userId: req.user._id
        }).populate('documentId', 'title');

        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: 'Quiz not found',
                statusCode: 404
            });
        }
        res.status(200).json({
            success: true,
            data: quiz
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Submit quiz answers and calculate score
// @route   POST /api/quizzes/:id/submit
export const submitQuiz = async (req, res, next) => {
    try {
        const { answers } = req.body;

        if (!Array.isArray(answers)) {
            return res.status(400).json({
                success: false,
                message: 'Answers must be a non-empty array',
                statusCode: 400
            });
        }

        const quiz = await Quiz.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: 'Quiz not found',
                statusCode: 404
            });
        }

        if (quiz.completedAt) {
            return res.status(400).json({
                success: false,
                message: 'Quiz has already been submitted',
                statusCode: 400
            });
        }

        let correctCount = 0;
        const userAnswers = [];

        answers.forEach(ans => {
            const { questionIndex, selectedOption, selectedAnswer } = ans;
            const chosen = selectedOption || selectedAnswer;

            if (questionIndex < quiz.questions.length) {
                const question = quiz.questions[questionIndex];
                const isCorrect = question.correctAnswer === chosen;
                if (isCorrect) {
                    correctCount++;
                }
                userAnswers.push({
                    questionIndex,
                    selectedOption: chosen,
                    isCorrect,
                    answeredAt: new Date()
                });
            }
        });

        const score = Math.round((correctCount / quiz.totalQuestions) * 100);

        quiz.userAnswers = userAnswers;
        quiz.score = score;
        quiz.completedAt = new Date();

        await quiz.save();

        res.status(200).json({
            success: true,
            data: {
                quizId: quiz._id,
                score,
                correctCount,
                totalQuestions: quiz.totalQuestions,
                userAnswers
            },
            message: 'Quiz submitted successfully'
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Get detailed quiz results
// @route   GET /api/quizzes/:id/results
export const getQuizResults = async (req, res, next) => {
    try {
        const quiz = await Quiz.findOne({
            _id: req.params.id,
            userId: req.user._id
        }).populate('documentId', 'title');

        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: 'Quiz not found',
                statusCode: 404
            });
        }

        if (!quiz.completedAt) {
            return res.status(400).json({
                success: false,
                message: 'Quiz has not been submitted yet',
                statusCode: 400
            });
        }

        const detailedResults = quiz.questions.map((question, index) => {
            const userAnswer = quiz.userAnswers.find(ans => ans.questionIndex === index);
            return {
                questionIndex: index,
                questionText: question.question,
                options: question.options,
                correctAnswer: question.correctAnswer,
                selectedOption: userAnswer ? userAnswer.selectedOption : null,
                isCorrect: userAnswer ? userAnswer.isCorrect : false,
                explanation: question.explanation || ''
            };
        });

        res.status(200).json({
            success: true,
            data: {
                id: quiz._id,
                title: quiz.title,
                document: quiz.documentId,
                score: quiz.score,
                totalQuestions: quiz.totalQuestions,
                correctCount: quiz.userAnswers.filter(ans => ans.isCorrect).length,
                results: detailedResults
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete quiz
// @route   DELETE /api/quizzes/:id
export const deleteQuiz = async (req, res, next) => {
    try {
        const quiz = await Quiz.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: 'Quiz not found',
                statusCode: 404
            });
        }

        await quiz.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Quiz deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};
