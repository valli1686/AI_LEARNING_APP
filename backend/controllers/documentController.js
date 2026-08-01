import Document from '../models/Document.js';
import Flashcard from '../models/Flashcard.js';
import Quiz from '../models/Quiz.js';

import { extractTextFromPDF } from '../utils/pdfParser.js';
import { chunkText } from '../utils/textChunker.js';

import fs from 'fs/promises';
import mongoose from 'mongoose';

// @desc    Upload PDF document
// @route   POST /api/documents/upload
export const uploadDocument = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'Please upload a PDF file',
                statusCode: 400
            });
        }

        const { title } = req.body;

        if (!title) {
            await fs.unlink(req.file.path).catch(() => {});
            return res.status(400).json({
                success: false,
                error: 'Please provide a title',
                statusCode: 400
            });
        }

        const baseUrl = `http://localhost:${process.env.PORT || 8000}`;
        const fileUrl = `${baseUrl}/uploads/documents/${req.file.filename}`;

        const document = await Document.create({
            userId: req.user._id,
            title,
            fileName: req.file.originalname,
            filePath: req.file.path,
            fileSize: req.file.size,
            extractedText: "",
            status: 'processing'
        });

        // Process PDF async
        processPDF(document._id, req.file.path).catch((err) => {
            console.error('PDF Processing Error:', err);
        });

        res.status(201).json({
            success: true,
            data: document,
            message: 'Document uploaded successfully'
        });

    } catch (error) {
        if (req.file) {
            await fs.unlink(req.file.path).catch(() => {});
        }
        next(error);
    }
};

// PDF Processing Helper
const processPDF = async (documentId, filePath) => {
    try {
        const text = await extractTextFromPDF(filePath);
        const textStr = typeof text === 'string' ? text : (text?.text || '');

        const chunks = chunkText(textStr, 500, 50);

        await Document.findByIdAndUpdate(documentId, {
            extractedText: textStr,
            chunks: chunks,
            status: 'ready'
        });

        console.log(`Document ${documentId} processed successfully (${chunks.length} chunks)`);
    } catch (error) {
        console.error(`Error processing document ${documentId}:`, error);
        await Document.findByIdAndUpdate(documentId, {
            status: 'failed'
        });
    }
};

// @desc    Get all user documents
export const getDocuments = async (req, res, next) => {
    try {
        const documents = await Document.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(req.user._id)
                }
            },
            {
                $sort: {
                    createdAt: -1
                }
            }
        ]);

        res.status(200).json({
            success: true,
            count: documents.length,
            data: documents
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Get single document
export const getDocument = async (req, res, next) => {
    try {
        const document = await Document.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found'
            });
        }

        const flashcardsCount = await Flashcard.countDocuments({ documentId: document._id });
        const quizzesCount = await Quiz.countDocuments({ documentId: document._id });

        Document.updateOne({ _id: document._id }, { lastAccessed: new Date() }).catch(() => {});

        const documentData = document.toObject();
        documentData.flashcardsCount = flashcardsCount;
        documentData.quizzesCount = quizzesCount;

        res.status(200).json({
            success: true,
            data: documentData,
            flashcardsCount,
            quizzesCount
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Delete document
export const deleteDocument = async (req, res, next) => {
    try {
        const document = await Document.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found',
                statusCode: 404
            });
        }

        await fs.unlink(document.filePath).catch(() => {});
        await document.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Document deleted successfully'
        });

    } catch (error) {
        next(error);
    }
};
