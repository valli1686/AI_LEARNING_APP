import fs from 'fs/promises';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

/**
 * Extract text from a PDF file.
 * @param {string} filePath - Path to PDF file
 * @returns {Promise<string>} Clean extracted text string
 */
export const extractTextFromPDF = async (filePath) => {
    try {
        const dataBuffer = await fs.readFile(filePath);
        
        let extractedText = '';

        try {
            const pdfParseModule = require('pdf-parse');
            if (typeof pdfParseModule === 'function') {
                const data = await pdfParseModule(dataBuffer);
                extractedText = data.text || '';
            } else if (pdfParseModule.PDFParse) {
                const parser = new pdfParseModule.PDFParse(new Uint8Array(dataBuffer));
                if (typeof parser.load === 'function') {
                    await parser.load();
                }
                const result = await parser.getText();
                extractedText = typeof result === 'string' ? result : (result?.text || '');
            }
        } catch (parserErr) {
            console.warn('Primary PDF parser notice:', parserErr.message);
        }

        // Clean up extracted text
        const cleanedText = (extractedText || '')
            .replace(/\r\n/g, '\n')
            .replace(/\s+/g, ' ')
            .trim();

        if (!cleanedText) {
            console.warn(`PDF file at ${filePath} returned empty text.`);
        }

        return cleanedText;
    } catch (error) {
        console.error('PDF Parsing Error:', error);
        throw new Error('Failed to extract text from PDF file');
    }
};