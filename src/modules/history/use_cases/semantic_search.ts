import { EventType } from '../../messaging/models/event_types';
import { publish } from '../../messaging/repositories/message_bus';
import { semanticSearch, VectorRecord } from '../repositories/vector_db';
import { logger } from '../../../utils/logger';

export const performSemanticSearch = async (query: string, limit = 5): Promise<VectorRecord[]> => {
  try {
    // 1. Get embedding for the query from the background/offscreen engine
    const response = await publish<{ text: string }>(
      'GENERATE_EMBEDDING' as EventType,
      { text: query }
    );

    if (!response || !response.embedding) {
      throw new Error('Failed to generate embedding for query');
    }

    // 2. Perform the search against the local IndexedDB
    const results = await semanticSearch(response.embedding, limit);
    return results;
  } catch (error) {
    logger.error('Error during semantic search', error);
    return [];
  }
};
