import express from "express";

import {
    getFlashcards,
    getAllFlashcardSets,
    reviewFlashcards,
    toggleStarFlashcardSet,
    deleteFlashcardSet,
} from "../controllers/flashcardController.js";

import protect from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

// Get flashcards by document (already handled via query)
router.get("/", getFlashcards);

router.get("/sets", getAllFlashcardSets);

router.post("/review", reviewFlashcards);

router.post("/star/:id", toggleStarFlashcardSet);

router.delete("/set/:id", deleteFlashcardSet);

export default router;