import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Execute a Gemini request with model fallbacks and friendly error handling
 */
const callGeminiWithFallback = async (generateFn) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim() === '' || apiKey.includes('YOUR_GEMINI_API_KEY')) {
        throw new Error('GEMINI_API_KEY is not configured in backend/.env. Please get an API key from Google AI Studio (https://aistudio.google.com/app/apikey) and add it to backend/.env.');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Priority order of models to try
    const candidates = [
        process.env.GEMINI_MODEL,
        'gemini-3.5-flash',
        'gemini-3.6-flash',
        'gemini-3.5-flash-lite',
        'gemini-2.0-flash',
        'gemini-1.5-flash-8b',
        'gemini-1.5-flash'
    ].filter(Boolean);

    // Remove duplicates while keeping order
    const modelsToTry = [...new Set(candidates)];

    let lastError = null;

    for (const modelName of modelsToTry) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            return await generateFn(model);
        } catch (err) {
            lastError = err;
            const msg = err.message || err.toString();

            // Direct fatal error checks - don't retry if key is invalid
            if (msg.includes('API_KEY_INVALID') || msg.includes('API key not valid')) {
                throw new Error('Invalid GEMINI_API_KEY configured in backend/.env. Please update backend/.env with a valid API key from Google AI Studio (https://aistudio.google.com/app/apikey).');
            }

            if (msg.includes('Quota exceeded') || msg.includes('429')) {
                throw new Error('Gemini API quota or rate limit exceeded. Please wait a few seconds before trying again, or check your API key quota at https://ai.dev/rate-limit.');
            }

            console.warn(`Gemini model '${modelName}' failed: ${msg}. Trying next fallback model...`);
        }
    }

    throw lastError || new Error('Failed to generate content with Gemini API');
};

// Helper to strip markdown JSON formatting if model wraps output in ```json ... ```
const parseJSONFromResponse = (text) => {
    try {
        const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
        return JSON.parse(cleaned);
    } catch (err) {
        console.error('Failed to parse JSON from Gemini response:', text);
        throw new Error('Invalid JSON response format from Gemini model');
    }
};

/**
 * Generate flashcards from document text
 */
export const generateFlashcardsFromDocument = async (text, count = 10) => {
    return callGeminiWithFallback(async (model) => {
        const prompt = `You are an expert AI tutor. Based on the following study document text, generate exactly ${count} educational flashcards.

Document Text:
${text.substring(0, 15000)}

Return ONLY a valid JSON array of objects with no additional commentary or markdown formatting.
Each object must have the following structure:
[
  {
    "question": "Clear concise question?",
    "answer": "Accurate clear answer.",
    "difficulty": "easy" | "medium" | "hard"
  }
]`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const flashcards = parseJSONFromResponse(responseText);

        if (!Array.isArray(flashcards)) {
            throw new Error('Gemini response is not an array of flashcards');
        }

        return flashcards;
    });
};

/**
 * Generate quiz questions from document text
 */
export const generateQuizFromDocument = async (text, numQuestions = 5) => {
    return callGeminiWithFallback(async (model) => {
        const prompt = `You are an expert quiz maker. Generate a multiple-choice quiz with exactly ${numQuestions} questions based on the following document text.

Document Text:
${text.substring(0, 15000)}

Return ONLY a valid JSON array of objects with no markdown outside the JSON block.
Each question object MUST strictly follow this JSON schema:
[
  {
    "question": "Question string?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Exact string matching one of the options",
    "explanation": "Clear explanation of why this answer is correct.",
    "difficulty": "easy" | "medium" | "hard"
  }
]`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const questions = parseJSONFromResponse(responseText);

        if (!Array.isArray(questions)) {
            throw new Error('Gemini response is not an array of quiz questions');
        }

        return questions;
    });
};

/**
 * Generate summary from document text
 */
export const generateSummaryFromDocument = async (text) => {
    return callGeminiWithFallback(async (model) => {
        const prompt = `You are an expert AI summarizer. Provide a clean, comprehensive, well-structured study summary of the following document.
Include an executive overview, key concepts, bullet points of key takeaways, and a brief conclusion. Use Markdown formatting.

Document Text:
${text.substring(0, 20000)}`;

        const result = await model.generateContent(prompt);
        return result.response.text();
    });
};

/**
 * Chat with context (RAG)
 */
export const chatWithContext = async (question, relevantChunks = []) => {
    return callGeminiWithFallback(async (model) => {
        const contextText = relevantChunks
            .map((chunk, idx) => `[Excerpt ${idx + 1}]:\n${chunk.text || chunk.content || ''}`)
            .join('\n\n');

        const prompt = `You are an AI Learning Assistant tutor helping a student study their document.
Answer the student's question accurately using the provided excerpts from their document. If the document doesn't contain the answer, use your general knowledge but mention that it isn't directly stated in the text.

Relevant Document Excerpts:
${contextText}

Student Question:
${question}

Response:`;

        const result = await model.generateContent(prompt);
        return result.response.text();
    });
};

/**
 * Explain a specific concept based on document context
 */
export const explainConcept = async (concept, context) => {
    return callGeminiWithFallback(async (model) => {
        const prompt = `You are an expert educator. Explain the concept "${concept}" clearly and intuitively for a student, referencing the relevant document context below. Use analogies and simple breakdowns where applicable.

Document Context:
${context}

Concept to explain: ${concept}`;

        const result = await model.generateContent(prompt);
        return result.response.text();
    });
};