import { describe, it, expect } from 'vitest';
import { chunkText } from './chunking';

describe('chunkText', () => {
  it('should return an empty array for empty strings', () => {
    expect(chunkText('')).toEqual([]);
    expect(chunkText('   ')).toEqual([]);
  });

  it('should handle text shorter than maxWords as a single chunk', () => {
    const text = 'This is a short text.';
    const chunks = chunkText(text, 10, 5);
    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toBe(text);
  });

  it('should split text longer than maxWords into multiple chunks with overlap', () => {
    const text = 'word '.repeat(10).trim(); // 10 words
    const chunks = chunkText(text, 5, 2); 
    // Chunk 1: words 0-4
    // Chunk 2: overlap 2 words, so starts at 5 - 2 = 3. words 3-7
    // Chunk 3: starts at 8 - 2 = 6. words 6-9
    
    expect(chunks.length).toBeGreaterThan(1);
    
    // First chunk should be 5 words
    expect(chunks[0].split(' ').length).toBe(5);
    
    // Verify overlap: The last two words of chunk 1 should be the first two words of chunk 2
    const chunk1Words = chunks[0].split(' ');
    const chunk2Words = chunks[1].split(' ');
    expect(chunk1Words.slice(-2)).toEqual(chunk2Words.slice(0, 2));
  });

  it('should clean excessive whitespace', () => {
    const text = '  This    has   too   much  space.  ';
    const chunks = chunkText(text, 10, 2);
    expect(chunks[0]).toBe('This has too much space.');
  });
});
