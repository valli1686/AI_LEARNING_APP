import Flashcard from "../models/Flashcard.js";

// @desc    Get flashcard set for a document
// @route   GET /api/flashcards?documentId=xxx
export const getFlashcards = async (req, res, next) => {
    try {
        const { documentId } = req.query;

        if (!documentId) {
            return res.status(400).json({
                success: false,
                message: "documentId is required in query"
            });
        }

        const flashcards = await Flashcard.find({
            documentId: documentId,
            userId: req.user._id
        })
            .populate("documentId", "title")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: flashcards.length,
            data: flashcards
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Get all flashcard sets for user
// @route   GET /api/flashcards/sets
export const getAllFlashcardSets = async (req, res, next) => {
    try {
        const flashcardSets = await Flashcard.find({
            userId: req.user._id
        })
            .populate("documentId", "title")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: flashcardSets.length,
            data: flashcardSets
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Review flashcards and update performance
// @route   POST /api/flashcards/review
export const reviewFlashcards = async (req, res, next) => {
    try {
        const { flashcardId, reviewCount } = req.body;

        const flashcard = await Flashcard.findOne({
            "cards._id": flashcardId,
            userId: req.user._id
        });

        if (!flashcard) {
            return res.status(404).json({
                success: false,
                message: "Flashcard set not found"
            });
        }

        const cardIndex = flashcard.cards.findIndex(
            card => card._id.toString() === flashcardId
        );

        if (cardIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Card not found"
            });
        }

        flashcard.cards[cardIndex].lastReviewed = new Date();
        flashcard.cards[cardIndex].reviewCount = (reviewCount !== undefined) ? reviewCount : (flashcard.cards[cardIndex].reviewCount + 1);

        await flashcard.save();

        res.status(200).json({
            success: true,
            message: "Flashcard reviewed successfully",
            data: flashcard
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Toggle star flashcard card
// @route   POST /api/flashcards/star/:id
export const toggleStarFlashcardSet = async (req, res, next) => {
    try {
        const flashcard = await Flashcard.findOne({
            "cards._id": req.params.id,
            userId: req.user._id
        });

        if (!flashcard) {
            return res.status(404).json({
                success: false,
                message: "Flashcard not found"
            });
        }

        const cardIndex = flashcard.cards.findIndex(
            card => card._id.toString() === req.params.id
        );

        if (cardIndex !== -1) {
            flashcard.cards[cardIndex].isStarred = !flashcard.cards[cardIndex].isStarred;
            await flashcard.save();
        }

        res.status(200).json({
            success: true,
            message: flashcard.cards[cardIndex]?.isStarred ? "Starred" : "Unstarred",
            data: flashcard
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Delete flashcard set
// @route   DELETE /api/flashcards/set/:id
export const deleteFlashcardSet = async (req, res, next) => {
    try {
        const flashcardSet = await Flashcard.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!flashcardSet) {
            return res.status(404).json({
                success: false,
                message: "Flashcard set not found"
            });
        }

        await flashcardSet.deleteOne();

        res.status(200).json({
            success: true,
            message: "Flashcard set deleted successfully"
        });

    } catch (error) {
        next(error);
    }
};