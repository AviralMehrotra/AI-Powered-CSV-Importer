import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/index.js';
import { PromptBuilder, CrmRecord } from './prompt.builder.js';

export class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    // We defer initializing genAI to runtime so the server can boot
    // even if the key is not initially supplied (e.g. during initialization/first build).
    if (config.geminiApiKey) {
      this.genAI = new GoogleGenerativeAI(config.geminiApiKey);
    }
  }

  /**
   * Initializes the AI engine if it wasn't done at construction time.
   */
  private getClient(): GoogleGenerativeAI {
    if (this.genAI) {
      return this.genAI;
    }
    
    // Attempt dynamic lookup in case the env variables were updated/loaded late
    const apiKey = config.geminiApiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        'GEMINI_API_KEY is not defined. Please add your Google Gemini API Key in the backend config.'
      );
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    return this.genAI;
  }

  /**
   * Processes a batch of raw CSV rows and returns the structured CRM records mapped by Gemini.
   */
  public async mapCsvBatch(headers: string[], rows: Record<string, string>[]): Promise<CrmRecord[]> {
    const client = this.getClient();
    const model = client.getGenerativeModel({
      model: config.geminiModel,
      systemInstruction: PromptBuilder.buildSystemInstruction(),
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const promptText = PromptBuilder.buildBatchPrompt(headers, rows);
    const result = await model.generateContent(promptText);
    const responseText = result.response.text();

    try {
      const records = JSON.parse(responseText);
      if (!Array.isArray(records)) {
        throw new Error('Gemini response is not a JSON array.');
      }
      return records as CrmRecord[];
    } catch (error: any) {
      console.error('Failed to parse Gemini response as JSON. Raw response content was:', responseText);
      throw new Error(`Gemini mapping parse failure: ${error.message}`);
    }
  }
}
