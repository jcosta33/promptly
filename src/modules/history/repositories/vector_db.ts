import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { logger } from '../../../utils/logger';

export interface VectorRecord {
  id: string;
  conversationId: string;
  text: string;
  embedding: number[];
  timestamp: number;
}

interface PromptlyVectorSchema extends DBSchema {
  embeddings: {
    key: string;
    value: VectorRecord;
    indexes: {
      'by-conversation': string;
    };
  };
}

const DB_NAME = 'promptly-vector-db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<PromptlyVectorSchema>> | null = null;

export const getVectorDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<PromptlyVectorSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const store = db.createObjectStore('embeddings', {
          keyPath: 'id',
        });
        store.createIndex('by-conversation', 'conversationId');
      },
    });
  }
  return dbPromise;
};

export const cosineSimilarity = (a: number[], b: number[]): number => {
  if (a.length !== b.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

export const storeConversationEmbedding = async (
  conversationId: string,
  text: string,
  embedding: number[]
) => {
  try {
    const db = await getVectorDB();
    const id = `${conversationId}_${Date.now()}`;
    await db.put('embeddings', {
      id,
      conversationId,
      text,
      embedding,
      timestamp: Date.now(),
    });
    logger.log(`Stored embedding for conversation ${conversationId}`);
  } catch (error) {
    logger.error('Failed to store conversation embedding', error);
  }
};

export const semanticSearch = async (queryEmbedding: number[], limit = 5): Promise<VectorRecord[]> => {
  try {
    const db = await getVectorDB();
    const allRecords = await db.getAll('embeddings');
    
    const scoredRecords = allRecords.map(record => ({
      ...record,
      score: cosineSimilarity(queryEmbedding, record.embedding)
    }));
    
    scoredRecords.sort((a, b) => b.score - a.score);
    return scoredRecords.slice(0, limit);
  } catch (error) {
    logger.error('Failed to perform semantic search', error);
    return [];
  }
};
