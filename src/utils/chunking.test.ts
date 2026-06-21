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

  it('should leave valid-input output unchanged (overlap < maxWords)', () => {
    // 12 distinct words so chunk boundaries are observable and exact.
    const text = 'w0 w1 w2 w3 w4 w5 w6 w7 w8 w9 w10 w11';
    // step = max(1, 5 - 2) = 3 (the clamp is a no-op here).
    // i=0 -> w0..w4 ; i=3 -> w3..w7 ; i=6 -> w6..w10 ; i=9 -> w9..w11
    expect(chunkText(text, 5, 2)).toEqual([
      'w0 w1 w2 w3 w4',
      'w3 w4 w5 w6 w7',
      'w6 w7 w8 w9 w10',
      'w9 w10 w11',
    ]);
  });

  it('should terminate and cover the input when overlapWords === maxWords', () => {
    const text = 'w0 w1 w2 w3 w4 w5';
    // Without the clamp the step would be 0 and the loop would never end.
    const chunks = chunkText(text, 3, 3);
    // step = max(1, 3 - 3) = 1: i=0 -> w0..w2 ; i=1 -> w1..w3 ; ... ; i=5 -> w5
    expect(chunks).toEqual([
      'w0 w1 w2',
      'w1 w2 w3',
      'w2 w3 w4',
      'w3 w4 w5',
      'w4 w5',
      'w5',
    ]);
    // The whole input is covered: last word appears in the final chunk.
    expect(chunks[chunks.length - 1]).toBe('w5');
  });

  it('should terminate when overlapWords > maxWords', () => {
    const text = 'w0 w1 w2 w3';
    // Without the clamp the step would be negative and i would run backwards.
    const chunks = chunkText(text, 2, 5);
    // step = max(1, 2 - 5) = 1: i=0 -> w0,w1 ; i=1 -> w1,w2 ; i=2 -> w2,w3 ; i=3 -> w3
    expect(chunks).toEqual(['w0 w1', 'w1 w2', 'w2 w3', 'w3']);
  });
});
