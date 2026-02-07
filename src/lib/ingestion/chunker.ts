export interface Chunk {
  index: number;
  text: string;
  wordCount: number;
}

const TARGET_WORDS = 1500;
const OVERLAP_WORDS = 200;

export function chunkText(rawText: string): Chunk[] {
  const paragraphs = rawText
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  if (paragraphs.length === 0) {
    return [];
  }

  const chunks: Chunk[] = [];
  let currentParagraphs: string[] = [];
  let currentWordCount = 0;
  let chunkIndex = 0;

  for (const para of paragraphs) {
    const paraWords = countWords(para);

    if (currentWordCount + paraWords > TARGET_WORDS && currentParagraphs.length > 0) {
      // Emit current chunk
      const chunkText = currentParagraphs.join('\n\n');
      chunks.push({
        index: chunkIndex++,
        text: chunkText,
        wordCount: currentWordCount,
      });

      // Start new chunk with overlap from the end of the previous
      const overlapParagraphs = getOverlapParagraphs(currentParagraphs, OVERLAP_WORDS);
      currentParagraphs = [...overlapParagraphs, para];
      currentWordCount = countWords(currentParagraphs.join('\n\n'));
    } else {
      currentParagraphs.push(para);
      currentWordCount += paraWords;
    }
  }

  // Emit final chunk
  if (currentParagraphs.length > 0) {
    const chunkText = currentParagraphs.join('\n\n');
    chunks.push({
      index: chunkIndex,
      text: chunkText,
      wordCount: countWords(chunkText),
    });
  }

  return chunks;
}

function countWords(text: string): number {
  return text.split(/\s+/).filter((w) => w.length > 0).length;
}

function getOverlapParagraphs(paragraphs: string[], targetWords: number): string[] {
  const result: string[] = [];
  let wordCount = 0;

  for (let i = paragraphs.length - 1; i >= 0; i--) {
    const paraWords = countWords(paragraphs[i]);
    if (wordCount + paraWords > targetWords && result.length > 0) {
      break;
    }
    result.unshift(paragraphs[i]);
    wordCount += paraWords;
  }

  return result;
}
