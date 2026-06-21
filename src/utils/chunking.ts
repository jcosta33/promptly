export const chunkText = (text: string, maxWords = 200, overlapWords = 50): string[] => {
  if (!text) return [];

  // Remove excessive whitespace
  const cleanText = text.replace(/\s+/g, ' ').trim();
  if (cleanText === '') return [];
  const words = cleanText.split(' ');
  
  if (words.length <= maxWords) {
    return [cleanText];
  }

  const chunks: string[] = [];
  let i = 0;

  // Clamp the window step to at least one word so the loop always makes
  // positive progress. For valid inputs (overlapWords < maxWords) the step is
  // already positive and Math.max is a no-op, leaving output unchanged.
  const step = Math.max(1, maxWords - overlapWords);

  while (i < words.length) {
    const chunkWords = words.slice(i, i + maxWords);
    chunks.push(chunkWords.join(' '));
    i += step;
  }

  return chunks;
};
