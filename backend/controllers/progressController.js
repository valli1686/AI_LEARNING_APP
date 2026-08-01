import Document from '../models/Document.js';
import Flashcard from '../models/Flashcard.js';
import Quiz from '../models/Quiz.js';

// @desc    Get user learning statistics
// @route   GET /api/progress/dashboard
// @access  Private

export const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Get counts
    const totalFlashcardSets = await Flashcard.countDocuments({ userId });
    const totalDocuments = await Document.countDocuments({ userId });
    const totalQuizzes = await Quiz.countDocuments({ userId });

    const completedQuizzes = await Quiz.countDocuments({
      userId,
      completedAt: { $ne: null }
    });

    // Get flashcard statistics
    const flashcardSets = await Flashcard.find({ userId });

    let totalFlashcards = 0;
    let reviewedFlashcards = 0;
    let starredFlashcards = 0;

    flashcardSets.forEach((set) => {
      totalFlashcards += set.cards.length;

      reviewedFlashcards += set.cards.filter(
        (card) => card.reviewCount > 0
      ).length;

      starredFlashcards += set.cards.filter(
        (card) => card.isStarred
      ).length;
    });

    // Get quiz statistics
    const quizzes = await Quiz.find({
      userId,
      completedAt: { $ne: null }
    });

    const averageScore =
      quizzes.length > 0
        ? Math.round(
            quizzes.reduce((sum, q) => sum + q.score, 0) / quizzes.length
          )
        : 0;

    // Recent activity
    const recentDocuments = await Document.find({ userId })
      .sort({ lastAccessed: -1, createdAt: -1 })
      .limit(5)
      .select('title fileName lastAccessed status createdAt');

    const recentQuizzes = await Quiz.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('documentId', 'title')
      .select('title score totalQuestions completedAt createdAt');

    // Calculate dynamic study streak based on actual user activity dates
    const docDates = await Document.find({ userId }).select('createdAt lastAccessed');
    const quizDates = await Quiz.find({ userId }).select('createdAt updatedAt completedAt');
    const flashDates = await Flashcard.find({ userId }).select('createdAt updatedAt cards.lastReviewed');

    const activityDates = new Set();
    const addDate = (d) => {
      if (d) {
        const dateStr = new Date(d).toISOString().split('T')[0];
        activityDates.add(dateStr);
      }
    };

    docDates.forEach(doc => { addDate(doc.createdAt); addDate(doc.lastAccessed); });
    quizDates.forEach(q => { addDate(q.createdAt); addDate(q.updatedAt); addDate(q.completedAt); });
    flashDates.forEach(f => {
      addDate(f.createdAt);
      addDate(f.updatedAt);
      f.cards?.forEach(c => addDate(c.lastReviewed));
    });

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let streak = 0;
    let checkDate = new Date(now);

    if (activityDates.has(todayStr) || activityDates.has(yesterdayStr)) {
      if (!activityDates.has(todayStr)) {
        checkDate = yesterday;
      }
      while (true) {
        const dateStr = checkDate.toISOString().split('T')[0];
        if (activityDates.has(dateStr)) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    const studyStreak = Math.max(streak, totalDocuments > 0 ? 1 : 0);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalDocuments: totalDocuments,
          totalFlashcardSets: totalFlashcardSets,
          totalFlashcards: totalFlashcards,
          reviewedFlashcards: reviewedFlashcards,
          starredFlashcards: starredFlashcards,
          totalQuizzes: totalQuizzes,
          completedQuizzes: completedQuizzes,
          averageScore: averageScore,
          studyStreak: studyStreak
        },
        recentActivity: {
          documents: recentDocuments,
          quizzes: recentQuizzes
        }
      }
    });
  } catch (error) {
    next(error);
  }
};