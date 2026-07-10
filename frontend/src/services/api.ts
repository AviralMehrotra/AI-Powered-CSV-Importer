import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000, // 5 minutes timeout to support heavy batches and retries
});

export interface SummaryStats {
  total: number;
  importedCount: number;
  skippedCount: number;
  durationMs: number;
}

export interface CrmRecord {
  created_at: string;
  name: string | null;
  email: string | null;
  country_code: string | null;
  mobile_without_country_code: string | null;
  company: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  lead_owner: string | null;
  crm_status: 'GOOD_LEAD_FOLLOW_UP' | 'DID_NOT_CONNECT' | 'BAD_LEAD' | 'SALE_DONE';
  crm_note: string | null;
  data_source: 'leads_on_demand' | 'meridian_tower' | 'eden_park' | 'varah_swamy' | 'sarjapur_plots' | null;
  possession_time: string | null;
  description: string | null;
}

export interface SkippedRecord {
  record: any;
  reason: string;
}

export interface ImportResponse {
  success: boolean;
  summary: SummaryStats;
  imported: CrmRecord[];
  skipped: SkippedRecord[];
}

/**
 * Sends the CSV file to the backend Express server import API.
 */
export async function importCsvFile(file: File): Promise<ImportResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<ImportResponse>('/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}
