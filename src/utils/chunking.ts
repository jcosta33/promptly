export const chunkText = (text: string, maxWords = 200, overlapWords = 50): string[] => {
  if (!text) return [];

  // Remove excessive whitespace
  const cleanText = text.replace(/\s+/g, ' ').trim();
  const words = cleanText.split(' ');
  
  if (words.length <= maxWords) {
    return [cleanText];
  }

  const chunks: string[] = [];
  let i = 0;
  
  while (i < words.length) {
    const chunkWords = words.slice(i, i + maxWords);
    chunks.push(chunkWords.join(' '));
    i += maxWords - overlapWords;
  }
  
  return chunks;
};
