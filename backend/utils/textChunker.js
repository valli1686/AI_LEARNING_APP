/**
 * Split text into chunks for optimal AI processing
 * @param {string} text - Full text to chunk
 * @param {number} chunkSize - Desired size of each chunk (in words)
 * @param {number} overlap - Number of words to overlap between chunks
 * @return {Array<{content: string, text: string, chunkIndex: number, pageNumber: number}>} 
 */
export const chunkText = (text, chunkSize = 500, overlap = 50) => {
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
        return [];
    }

    // Clean text while preserving paragraph structure
    const cleanedText = text
        .replace(/\r\n/g, '\n')
        .replace(/\s+/g, ' ')
        .replace(/\n /g, '\n')
        .replace(/ \n/g, '\n')
        .trim();

    // Try to split by paragraphs (single or double newlines)
    const paragraphs = cleanedText.split(/\n+/).filter(p => p.trim().length > 0);

    const chunks = [];
    let currentChunk = [];
    let currentWordCount = 0;
    let chunkIndex = 0;

    for (const paragraph of paragraphs) {
        const paragraphWords = paragraph.trim().split(/\s+/);
        const paragraphWordCount = paragraphWords.length;

        // If single paragraph exceeds chunk size, split it by words
        if (paragraphWordCount > chunkSize) {
            if (currentChunk.length > 0) {
                const contentStr = currentChunk.join('\n\n');
                chunks.push({
                    content: contentStr,
                    text: contentStr,
                    chunkIndex: chunkIndex++,
                    pageNumber: 0
                });
                currentChunk = [];
                currentWordCount = 0;
            }

            // Split large paragraph into word-based chunks
            for (let i = 0; i < paragraphWords.length; i += chunkSize - overlap) {
                const chunkWords = paragraphWords.slice(i, i + chunkSize);
                const contentStr = chunkWords.join(' ');
                chunks.push({
                    content: contentStr,
                    text: contentStr,
                    chunkIndex: chunkIndex++,
                    pageNumber: 0
                });

                if (i + chunkSize >= paragraphWords.length) break;
            }
            continue;
        }

        // If adding this paragraph exceeds chunk size, save current chunk
        if (currentWordCount + paragraphWordCount > chunkSize && currentChunk.length > 0) {
            const contentStr = currentChunk.join('\n\n');
            chunks.push({
                content: contentStr,
                text: contentStr,
                chunkIndex: chunkIndex++,
                pageNumber: 0
            });
            // Create overlap from previous chunk
            const prevChunkText = currentChunk.join(' ');
            const prevWords = prevChunkText.split(/\s+/);
            const overlapText = prevWords.slice(-Math.min(overlap, prevWords.length)).join(' ');

            currentChunk = [overlapText, paragraph.trim()];
            currentWordCount = overlapText.split(/\s+/).length + paragraphWordCount;
        } else {
            // Add paragraph to current chunk
            currentChunk.push(paragraph.trim());
            currentWordCount += paragraphWordCount;
        }
    }

    // Add the last chunk
    if (currentChunk.length > 0) {
        const contentStr = currentChunk.join('\n\n');
        chunks.push({
            content: contentStr,
            text: contentStr,
            chunkIndex: chunkIndex++,
            pageNumber: 0
        });
    }

    // Fallback: if no chunks created, split by words
    if (chunks.length === 0 && cleanedText.length > 0) {
        const words = cleanedText.split(/\s+/);
        for (let i = 0; i < words.length; i += chunkSize - overlap) {
            const chunkWords = words.slice(i, i + chunkSize);
            const contentStr = chunkWords.join(' ');
            chunks.push({
                content: contentStr,
                text: contentStr,
                chunkIndex: chunkIndex++,
                pageNumber: 0
            });

            if (i + chunkSize >= words.length) break;
        }
    }

    return chunks;
};

/**
 * Find relevant chunks based on keyword matching
 * @param {Array<Object>} chunks - Array of chunks
 * @param {string} query - Search query
 * @param {number} maxChunks - Maximum chunks to return 
 * @return {Array<Object>}
 */
export const findRelevantChunks = (chunks, query, maxChunks = 3) => {
    if (!chunks || chunks.length === 0 || !query) {
        return [];
    }

    const stopWords = new Set([
        'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
        'have', 'has', 'had', 'do', 'does', 'did', 'to', 'from', 'in', 'out',
        'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here',
        'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each',
        'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not',
        'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can',
        'will', 'just', 'don', 'should', 'now', 'what', 'which', 'who', 'this', 'that'
    ]);

    const queryWords = query
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 2 && !stopWords.has(w));

    if (queryWords.length === 0) {
        return chunks.slice(0, maxChunks);
    }

    const scoredChunks = chunks.map((chunk, index) => {
        const contentStr = (chunk.content || chunk.text || '').toLowerCase();
        let score = 0;

        for (const word of queryWords) {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            const matches = contentStr.match(regex);
            if (matches) {
                score += matches.length;
            }
        }

        return {
            ...chunk,
            index: chunk.chunkIndex !== undefined ? chunk.chunkIndex : index,
            score
        };
    });

    scoredChunks.sort((a, b) => b.score - a.score);
    return scoredChunks.slice(0, maxChunks);
};