import dotenv from 'dotenv';
import path from 'path';

// Load env variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  importBatchSize: parseInt(process.env.IMPORT_BATCH_SIZE || '50', 10),
  importConcurrency: parseInt(process.env.IMPORT_CONCURRENCY || '2', 10),
  importMaxRetries: parseInt(process.env.IMPORT_MAX_RETRIES || '3', 10),
};

// Simple sanity validation
if (!config.geminiApiKey && config.nodeEnv === 'production') {
  console.warn('WARNING: GEMINI_API_KEY is not defined in production environment variables.');
}
