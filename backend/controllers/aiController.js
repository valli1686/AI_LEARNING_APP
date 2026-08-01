import Document from '../models/Document.js';
import FlashcardSet from '../models/Flashcard.js';
import Quiz from '../models/Quiz.js';
import ChatHistory from '../models/ChatHistory.js';
import * as geminiService from '../utils/geminiService.js';
import { findRelevantChunks } from '../utils/textChunker.js';


// @desc    Generate flashcards from a document
// @route   POST /api/ai/flashcards
// @access  Private
export const generateFlashcards = async (req, res, next) => {
    try {
        const { documentId, count = 10 } = req.body;

        if (!documentId) {
            return res.status(400).json({
                success: false,
                message: 'Document ID is required',
                statusCode: 400
            });
        }

        const document = await Document.findOne({ _id: documentId, userId: req.user._id });

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found',
                statusCode: 404
            });
        }

        if (!document.extractedText || !document.extractedText.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Document text is empty or could not be extracted from the PDF',
                statusCode: 400
            });
        }

        // Generate flashcards using Gemini
        const flashcards = await geminiService.generateFlashcardsFromDocument(
            document.extractedText,
            parseInt(count)
        );

        // Save flashcards to database
    const flashcardSet = new FlashcardSet({
        userId: req.user._id,
        documentId: document._id,
        cards: flashcards.map(card => ({
            question: card.question,
            answer: card.answer,
            difficulty: card.difficulty,
            reviewCount: 0,
            isStarred: false
        }))
    });
        await flashcardSet.save();

        res.status(201).json({
            success: true,
            data: flashcardSet,
            message: 'Flashcards generated successfully',
            statusCode: 201
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Generate quiz from a document
// @route   POST /api/ai/quiz
// @access  Private 
// @desc    Generate quiz from a document
// @route   POST /api/ai/quiz
// @access  Private
export const generateQuiz = async (req, res, next) => {
    try {
        const { documentId, numQuestions = 5, title } = req.body;

        if (!documentId) {
            return res.status(400).json({
                success: false,
                message: 'Document ID is required',
                statusCode: 400
            });
        }

        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found',
                statusCode: 404
            });
        }

        if (!document.extractedText || !document.extractedText.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Document text is empty or could not be extracted from the PDF',
                statusCode: 400
            });
        }

        const questions = await geminiService.generateQuizFromDocument(
            document.extractedText,
            parseInt(numQuestions)
        );

        const newQuiz = await Quiz.create({
            userId: req.user._id,
            documentId: document._id,
            title: title || `Quiz for ${document.title}`,
            questions,
            totalQuestions: questions.length,
            userAnswers: [],
            score: 0
        });

        res.status(201).json({
            success: true,
            data: newQuiz,
            message: 'Quiz generated successfully',
            statusCode: 201
        });

    } catch (error) {
        next(error);
    }
};


// @desc    Generate summary from a document
// @route   POST /api/ai/summary
// @access  Private
export const generateSummary = async (req, res, next) => {
    try {
        const { documentId } = req.body;

        if (!documentId) {
            return res.status(400).json({
                success: false,
                message: 'Document ID is required',
                statusCode: 400
            });
        }

        const document = await Document.findOne({ _id: documentId, userId: req.user._id, status: 'ready' });

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found or not ready',
                statusCode: 404
            });
        }

        const summary = await geminiService.generateSummaryFromDocument(document.extractedText);

        res.status(200).json({
            success: true,
            data: {
                documentId: document._id,
                title: document.title,
                summary
            },
            message: 'Summary generated successfully',
            statusCode: 200
        });
    }  
    catch (error) {
        next(error);
    }
};

// @desc    Chat with AI
// @route   POST /api/ai/chat
// @access  Private 
export const chat = async (req, res, next) => {
    try {
        const { documentId, question } = req.body;

        if(!documentId || !question) {
            return res.status(400).json({
                success: false,
                message: 'Document ID and question are required',
                statusCode: 400
            });
        }

        const document = await Document.findOne({ _id: documentId, userId: req.user._id, status: 'ready' });

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found or not ready',
                statusCode: 404
            });
        }
        // Find relevant chunks
        const relevantChunks = findRelevantChunks(document.chunks, question, 3);
        const chunkIndices = relevantChunks.map(chunk => chunk.index);

        // Get or create chat history
        let chatHistory = await ChatHistory.findOne({ userId: req.user._id, documentId: document._id });
        if (!chatHistory) {
            chatHistory = new ChatHistory({
                userId: req.user._id,
                documentId: document._id,
                messages: []
            });
        }
        // Generate answer using Gemini
        const answer = await geminiService.chatWithContext(question, relevantChunks);   
        
        chatHistory.messages.push(
            {
                role: 'user',
                content: question,
                timestamp: new Date(),
                relevantChunks: []    
            },
            {
                role: 'assistant',
                content: answer,
                timestamp: new Date(),
                relevantChunks: chunkIndices
            }
        );
        await chatHistory.save();
        res.status(200).json({
            success: true,
            data: {
                question,
                answer,
                relevantChunks: chunkIndices,
                chatHistoryId: chatHistory._id
            },
            message: 'Chat response generated successfully',
            statusCode: 200
        });
    } catch (error) {
        next(error);
    }   
};  
// @desc    Explain a concept
// @route   POST /api/ai/explain
// @access  Private     
// @desc    Explain a concept
// @route   POST /api/ai/explain
// @access  Private
export const explainConcept = async (req, res, next) => {
    try {
        const { documentId, concept } = req.body;

        if (!documentId || !concept) {
            return res.status(400).json({
                success: false,
                message: 'Document ID and concept are required',
                statusCode: 400
            });
        }

        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: 'ready'
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found or not ready',
                statusCode: 404
            });
        }

        const relevantChunks = findRelevantChunks(
            document.chunks,
            concept,
            3
        );

        const context = relevantChunks
            .map(chunk => chunk.text)
            .join('\n\n');

        const explanation = await geminiService.explainConcept(
            concept,
            context
        );

        res.status(200).json({
            success: true,
            data: {
                concept,
                explanation,
                relevantChunks: relevantChunks.map(chunk => chunk.index)
            },
            message: 'Concept explained successfully',
            statusCode: 200
        });

    } catch (error) {
        next(error);
    }
};
// @desc    Get chat history
// @route   GET /api/ai/chat/history
// @access  Private
export const getChatHistory = async (req, res, next) => {
    try {
        const { documentId } = req.query;

        if (!documentId) {
            return res.status(400).json({
                success: false,
                message: 'Document ID is required',
                statusCode: 400
            });
        }

        const chatHistory = await ChatHistory.findOne({ userId: req.user._id, documentId }).select('messages');

        if (!chatHistory) {
            return res.status(404).json({
                success: false,
                message: 'Chat history not found',
                statusCode: 404
            });
        }

        res.status(200).json({
            success: true,
            data: chatHistory.messages, 
            message: 'Chat history retrieved successfully',
            statusCode: 200
        });
    }   catch (error) {
        next(error);
    }   
};