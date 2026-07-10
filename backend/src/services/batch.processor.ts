import { config } from '../config/index.js';
import { GeminiService } from './gemini.service.js';
import { CrmMapper, MappingResult, SkippedCrmRecord } from './crm.mapper.js';
import { ValidatedCrmRecord } from '../validators/crm.validator.js';

export interface BatchProcessorOptions {
  batchSize?: number;
  concurrency?: number;
  maxRetries?: number;
  onProgress?: (processedRows: number, totalRows: number) => void;
}

export class BatchProcessor {
  private geminiService: GeminiService;

  constructor(geminiService: GeminiService) {
    this.geminiService = geminiService;
  }

  /**
   * Helper delay utility for exponential backoff.
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Processes all rows in chunks using concurrency control and retries.
   */
  public async processAll(
    headers: string[],
    rows: Record<string, string>[],
    options: BatchProcessorOptions = {}
  ): Promise<MappingResult> {
    const batchSize = options.batchSize || config.importBatchSize;
    const concurrency = options.concurrency || config.importConcurrency;
    const maxRetries = options.maxRetries || config.importMaxRetries;
    const onProgress = options.onProgress;

    const finalResult: MappingResult = {
      imported: [],
      skipped: [],
    };

    if (rows.length === 0) {
      return finalResult;
    }

    // Split rows into batches
    const batches: Record<string, string>[][] = [];
    for (let i = 0; i < rows.length; i += batchSize) {
      batches.push(rows.slice(i, i + batchSize));
    }

    const totalRows = rows.length;
    let processedRowsCount = 0;

    // Track active promises to manage concurrency
    let currentBatchIndex = 0;
    const workers: Promise<void>[] = [];

    const worker = async () => {
      while (currentBatchIndex < batches.length) {
        const index = currentBatchIndex++;
        const batch = batches[index];

        try {
          const mappedRecords = await this.processBatchWithRetries(
            headers,
            batch,
            maxRetries
          );
          
          // Map and validate records
          const { imported, skipped } = CrmMapper.mapAndValidate(mappedRecords);
          finalResult.imported.push(...imported);
          finalResult.skipped.push(...skipped);
        } catch (error: any) {
          // If the entire batch failed (all retries exhausted), we skip all records in this batch
          console.error(`Batch ${index + 1} failed completely:`, error.message);
          const skippedRecords: SkippedCrmRecord[] = batch.map((row) => ({
            record: row,
            reason: `AI service error: ${error.message || 'Unknown error after retries'}`,
          }));
          finalResult.skipped.push(...skippedRecords);
        } finally {
          processedRowsCount += batch.length;
          if (onProgress) {
            onProgress(processedRowsCount, totalRows);
          }
        }
      }
    };

    // Spawn up to the concurrency limit
    const workerCount = Math.min(concurrency, batches.length);
    for (let i = 0; i < workerCount; i++) {
      workers.push(worker());
    }

    // Wait for all workers to finish
    await Promise.all(workers);

    return finalResult;
  }

  /**
   * Processes a single batch with a retry policy (exponential backoff).
   */
  private async processBatchWithRetries(
    headers: string[],
    batch: Record<string, string>[],
    maxRetries: number
  ): Promise<any[]> {
    let attempt = 0;
    
    while (true) {
      try {
        return await this.geminiService.mapCsvBatch(headers, batch);
      } catch (error: any) {
        attempt++;
        if (attempt > maxRetries) {
          throw error; // Rethrow to let the caller handle complete failure
        }
        
        // Exponential backoff delay (e.g. 1s, 2s, 4s...)
        const backoffMs = Math.pow(2, attempt) * 1000;
        console.warn(
          `Gemini mapping attempt ${attempt} failed. Retrying in ${backoffMs}ms... Error:`,
          error.message
        );
        await this.delay(backoffMs);
      }
    }
  }
}
