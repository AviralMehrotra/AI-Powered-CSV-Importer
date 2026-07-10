import { z } from 'zod';

export const CrmRecordSchema = z.object({
  created_at: z.string().nullable().optional().transform((val) => {
    if (!val) return new Date().toISOString();
    const d = new Date(val);
    return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
  }),
  name: z.string().nullable().optional().default(null),
  email: z.string().nullable().optional().default(null).transform((val) => {
    if (!val) return null;
    const trimmed = val.trim();
    return trimmed.length > 0 ? trimmed : null;
  }),
  country_code: z.string().nullable().optional().default(null).transform((val) => {
    if (!val) return null;
    return val.trim();
  }),
  mobile_without_country_code: z.string().nullable().optional().default(null).transform((val) => {
    if (!val) return null;
    const cleaned = val.replace(/[^0-9]/g, ''); // strip non-numeric
    return cleaned.length > 0 ? cleaned : null;
  }),
  company: z.string().nullable().optional().default(null),
  city: z.string().nullable().optional().default(null),
  state: z.string().nullable().optional().default(null),
  country: z.string().nullable().optional().default(null),
  lead_owner: z.string().nullable().optional().default(null),
  crm_status: z.enum(['GOOD_LEAD_FOLLOW_UP', 'DID_NOT_CONNECT', 'BAD_LEAD', 'SALE_DONE'])
    .nullable()
    .optional()
    .default('GOOD_LEAD_FOLLOW_UP')
    .transform((val) => val || 'GOOD_LEAD_FOLLOW_UP'),
  crm_note: z.string().nullable().optional().default(null),
  data_source: z.enum(['leads_on_demand', 'meridian_tower', 'eden_park', 'varah_swamy', 'sarjapur_plots'])
    .nullable()
    .optional()
    .default(null)
    .transform((val) => val || null),
  possession_time: z.string().nullable().optional().default(null),
  description: z.string().nullable().optional().default(null),
}).refine(
  (data) => {
    const hasEmail = data.email !== null && data.email.length > 0;
    const hasMobile = data.mobile_without_country_code !== null && data.mobile_without_country_code.length > 0;
    return hasEmail || hasMobile;
  },
  {
    message: 'Skip record: both email and mobile number are missing.',
    path: ['email'],
  }
);

export type ValidatedCrmRecord = z.infer<typeof CrmRecordSchema>;
export type RawCrmInput = z.input<typeof CrmRecordSchema>;
