import { CrmRecordSchema, ValidatedCrmRecord } from '../validators/crm.validator.js';

export interface SkippedCrmRecord {
  record: any;
  reason: string;
}

export interface MappingResult {
  imported: ValidatedCrmRecord[];
  skipped: SkippedCrmRecord[];
}

export class CrmMapper {
  /**
   * Validates a list of raw records against the Zod schema.
   * Separates them into imported and skipped groups.
   */
  public static mapAndValidate(records: any[]): MappingResult {
    const result: MappingResult = {
      imported: [],
      skipped: [],
    };

    if (!Array.isArray(records)) {
      return result;
    }

    for (const record of records) {
      try {
        const validated = CrmRecordSchema.parse(record);
        result.imported.push(validated);
      } catch (error: any) {
        let reason = 'Validation failed';
        if (error.errors && error.errors.length > 0) {
          reason = error.errors.map((e: any) => e.message).join(', ');
        } else if (error.message) {
          reason = error.message;
        }
        result.skipped.push({
          record,
          reason,
        });
      }
    }

    return result;
  }
}
