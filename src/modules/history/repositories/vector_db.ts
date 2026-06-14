import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { logger } from '../../../utils/logger';

export interface VectorRecord {
  id: string;
  conversationId: string;
  text: string;
  embedding: number[];
  timestamp: number;
}

export interface KnowledgeRecord {
  chunkId: string;
  filename: string;
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
  knowledge: {
    key: string;
    value: KnowledgeRecord;
    indexes: {
      'by-filename': string;
    };
  };
}

const DB_NAME = 'promptly-vector-db';
const DB_VERSION = 2;

let dbPromise: Promise<IDBPDatabase<PromptlyVectorSchema>> | null = null;

export const getVectorDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<PromptlyVectorSchema>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          const store = db.createObjectStore('embeddings', {
            keyPath: 'id',
          });
          store.createIndex('by-conversation', 'conversationId');
        }
        if (oldVersion < 2) {
          const kStore = db.createObjectStore('knowledge', {
            keyPath: 'chunkId',
          });
          kStore.createIndex('by-filename', 'filename');
        }
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

export const storeKnowledgeEmbedding = async (
  filename: string,
  text: string,
  embedding: number[]
) => {
  try {
    const db = await getVectorDB();
    const chunkId = `${filename}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    await db.put('knowledge', {
      chunkId,
      filename,
      text,
      embedding,
      timestamp: Date.now(),
    });
    logger.log(`Stored knowledge embedding for ${filename}`);
  } catch (error) {
    logger.error('Failed to store knowledge embedding', error);
  }
};

export const semanticKnowledgeSearch = async (queryEmbedding: number[], limit = 3): Promise<KnowledgeRecord[]> => {
  try {
    const db = await getVectorDB();
    const allRecords = await db.getAll('knowledge');
    
    const scoredRecords = allRecords.map(record => ({
      ...record,
      score: cosineSimilarity(queryEmbedding, record.embedding)
    }));
    
    scoredRecords.sort((a, b) => b.score - a.score);
    return scoredRecords.slice(0, limit);
  } catch (error) {
    logger.error('Failed to perform semantic knowledge search', error);
    return [];
  }
};

export interface KnowledgeMetadata {
  filename: string;
  chunkCount: number;
  timestamp: number;
}

export const getAllKnowledgeMetadata = async (): Promise<KnowledgeMetadata[]> => {
  try {
    const db = await getVectorDB();
    const allRecords = await db.getAll('knowledge');
    const metadataMap = new Map<string, KnowledgeMetadata>();
    
    for (const record of allRecords) {
      const existing = metadataMap.get(record.filename);
      if (existing) {
        existing.chunkCount += 1;
        existing.timestamp = Math.max(existing.timestamp, record.timestamp);
      } else {
        metadataMap.set(record.filename, {
          filename: record.filename,
          chunkCount: 1,
          timestamp: record.timestamp
        });
      }
    }
    
    return Array.from(metadataMap.values());
  } catch (error) {
    logger.error('Failed to get knowledge metadata', error);
    return [];
  }
};

export const deleteKnowledgeByFilename = async (filename: string) => {
  try {
    const db = await getVectorDB();
    const tx = db.transaction('knowledge', 'readwrite');
    const index = tx.store.index('by-filename');
    let cursor = await index.openCursor(IDBKeyRange.only(filename));
    
    let deletedCount = 0;
    while (cursor) {
      await cursor.delete();
      deletedCount++;
      cursor = await cursor.continue();
    }
    await tx.done;
    logger.log(`Deleted ${deletedCount} chunks for file ${filename}`);
  } catch (error) {
    logger.error(`Failed to delete knowledge for ${filename}`, error);
  }
};
