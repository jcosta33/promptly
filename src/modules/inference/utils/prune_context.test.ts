import { describe, it, expect } from 'vitest';
import { pruneContext } from './prune_context';
import type { Message } from '../models/inference_model';

describe('pruneContext', () => {
  it('should not prune if messages length is under maxHistory', () => {
    const messages: Message[] = [
      { role: 'system', content: 'sys' },
      { role: 'user', content: 'user1' },
      { role: 'assistant', content: 'asst1' }
    ];
    const result = pruneContext(messages, 5);
    expect(result).toHaveLength(3);
    expect(result).toEqual(messages);
  });

  it('should isolate system prompt and keep strictly alternating roles when pruning', () => {
    const messages: Message[] = [{ role: 'system', content: 'sys' }];
    for (let i = 0; i < 10; i++) {
      messages.push({ role: 'user', content: `user${i}` });
      messages.push({ role: 'assistant', content: `asst${i}` });
    }
    const result = pruneContext(messages, 5);
    expect(result[0].role).toBe('system');
    expect(result[1].role).toBe('user');
    expect(result[1].content).toContain('[System Note:');
    for (let i = 1; i < result.length - 1; i++) {
      expect(result[i].role).not.toBe(result[i+1].role);
    }
  });

  it('should drop leading assistant messages if prunedCount <= 0 but slice starts on assistant', () => {
    const messages: Message[] = [
      { role: 'system', content: 'sys' },
      { role: 'assistant', content: 'a0' },
      { role: 'user', content: 'u1' },
      { role: 'assistant', content: 'a1' }
    ];
    const result = pruneContext(messages, 3);
    expect(result[1].role).toBe('user');
    expect(result[1].content).toBe('u1');
  });

  it('should not drop if recentMessages starts with user in else block', () => {
    const messages: Message[] = [
      { role: 'system', content: 'sys' },
      { role: 'user', content: 'user0' },
      { role: 'assistant', content: 'asst1' },
      { role: 'user', content: 'user1' }
    ];
    const result = pruneContext(messages, 3);
    expect(result[0].role).toBe('system');
    expect(result[1].role).toBe('user');
    expect(result[1].content).toBe('user0');
  });

  it('should shift user if prepending summary creates user -> user', () => {
    const messages2: Message[] = [
      { role: 'system', content: 'sys' },
      { role: 'assistant', content: 'a1' },
      { role: 'user', content: 'u2' },
      { role: 'assistant', content: 'a2' },
      { role: 'user', content: 'u3' },
      { role: 'assistant', content: 'a3' }
    ];
    const result = pruneContext(messages2, 4);
    expect(result[1].role).toBe('user');
    expect(result[1].content).toContain('[System Note:');
    expect(result[2].role).toBe('assistant');
    expect(result[2].content).toBe('a2');
  });
});
