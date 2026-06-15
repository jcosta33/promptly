import { describe, it, expect } from 'vitest';
import { pruneContext } from './prune_context';
import type { Message } from '../models/inference_model';

describe('pruneContext', () => {
  it('should not prune if messages length is under maxHistory', () => {
    
    
    // Max history 3
    // Sliced last 3: asst1, user2, asst2
    // prunedCount = 5 - 3 - 1 = 1 -> wait, prunedCount is > 0 here.
    // Let's create a case where prunedCount == 0 but messages > maxHistory.
    // e.g. messages length = 4, maxHistory = 3, system = 1
    // PrunedCount = 4 - 3 - 1 = 0
    const m2: Message[] = [
      { role: 'system', content: 'sys' },
      { role: 'user', content: 'u1' },
      { role: 'assistant', content: 'a1' },
      { role: 'user', content: 'u2' }
    ];
    // length = 4, maxHistory = 3.
    // slice(-3) -> u1, a1, u2. Starts with user!
    const res2 = pruneContext(m2, 3);
    expect(res2[1].role).toBe('user');
    expect(res2[1].content).toBe('u1');

    
    // length = 5, maxHistory = 4.
    // slice(-4) -> u1, a1, u2, a2.
    // prunedCount = 5 - 4 - 1 = 0.
    // slice starts with u1 (user), valid!
    
    // Let's remove system prompt to hit the assistant leading case
    const m4: Message[] = [
      { role: 'system', content: 'sys' },
      { role: 'assistant', content: 'a0' },
      { role: 'user', content: 'u1' },
      { role: 'assistant', content: 'a1' }
    ];
    // length = 4, maxHistory = 3, hasSystem = true.
    // recentMessages = last 3: a0, u1, a1
    // prunedCount = 4 - 3 - 1 = 0.
    // recentMessages starts with assistant, so it gets shifted.
    // recentMessages = u1, a1
    // truncatedMessages = sys, u1, a1
    const res4 = pruneContext(m4, 3);
    expect(res4[1].role).toBe('user');
    expect(res4[1].content).toBe('u1');
  });
});
