import { Request, Response, NextFunction } from 'express';
import { parseCsv } from '../services/csv.parser.js';
import { GeminiService } from '../services/gemini.service.js';
import { BatchProcessor } from '../services/batch.processor.js';

export class ImportController {
  private geminiService: GeminiService;
  private batchProcessor: BatchProcessor;

  constructor() {
    this.geminiService = new GeminiService();
    this.batchProcessor = new BatchProcessor(this.geminiService);
  }

  /**
   * Main handler to import a CSV file.
   */
  public importCsv = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ error: { message: 'No CSV file uploaded.' } });
        return;
      }

      const csvContent = req.file.buffer.toString('utf-8');
      if (!csvContent.trim()) {
        res.status(400).json({ error: { message: 'Uploaded CSV file is empty.' } });
        return;
      }

      // 1. Parse CSV rows and headers
      const startTime = Date.now();
      const { headers, rows } = await parseCsv(csvContent);

      if (rows.length === 0) {
        res.status(400).json({ error: { message: 'No rows found in the CSV file.' } });
        return;
      }

      // 2. Process all rows in batches using Gemini API + Validator
      const result = await this.batchProcessor.processAll(headers, rows);
      const durationMs = Date.now() - startTime;

      // 3. Return summary and lists
      res.status(200).json({
        success: true,
        summary: {
          total: rows.length,
          importedCount: result.imported.length,
          skippedCount: result.skipped.length,
          durationMs,
        },
        imported: result.imported,
        skipped: result.skipped,
      });
    } catch (error: any) {
      console.error('Error during CSV import process:', error);
      res.status(500).json({
        error: {
          message: error.message || 'An error occurred during import processing.',
        },
      });
    }
  };
}
