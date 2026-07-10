import Papa from 'papaparse';

export interface ParsedCsvResult {
  headers: string[];
  rows: Record<string, string>[];
}

/**
 * Parses raw CSV string data into an array of objects (rows) and a list of headers.
 * Uses PapaParse with auto-delimiter detection and greedy empty line skipping.
 */
export function parseCsv(csvContent: string): Promise<ParsedCsvResult> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(csvContent, {
      header: true,
      skipEmptyLines: 'greedy',
      transformHeader: (header) => header.trim(),
      transform: (value) => value.trim(),
      complete: (results) => {
        if (results.errors.length > 0) {
          // Some errors in PapaParse are warnings, but if there are critical errors we should know.
          const criticalErrors = results.errors.filter(
            (err) => err.code !== 'UndetectableDelimiter'
          );
          if (criticalErrors.length > 0) {
            return reject(
              new Error(
                `CSV parsing errors: ${criticalErrors.map((e) => `${e.message} (row ${e.row})`).join(', ')}`
              )
            );
          }
        }

        const headers = results.meta.fields || [];
        const rows = results.data;

        resolve({ headers, rows });
      },
      error: (error: Error) => {
        reject(new Error(`Failed to parse CSV: ${error.message}`));
      },
    });
  });
}
