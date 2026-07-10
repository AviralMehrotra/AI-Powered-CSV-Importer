export interface CrmRecord {
  created_at: string | null;
  name: string | null;
  email: string | null;
  country_code: string | null;
  mobile_without_country_code: string | null;
  company: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  lead_owner: string | null;
  crm_status: 'GOOD_LEAD_FOLLOW_UP' | 'DID_NOT_CONNECT' | 'BAD_LEAD' | 'SALE_DONE' | null;
  crm_note: string | null;
  data_source: 'leads_on_demand' | 'meridian_tower' | 'eden_park' | 'varah_swamy' | 'sarjapur_plots' | null;
  possession_time: string | null;
  description: string | null;
}

export class PromptBuilder {
  /**
   * Builds the system instruction prompt guiding Gemini on CSV parsing rules and target format.
   */
  public static buildSystemInstruction(): string {
    return `You are an expert data migration engine for GrowEasy CRM. Your task is to intelligently parse raw CSV data rows and extract details into our strict CRM schema.

CRM Fields and Extraction Rules:
1. "created_at": Date/time when the lead was created. Must be formatted as an ISO 8601 string or format parsable by JavaScript's "new Date(created_at)" (e.g. YYYY-MM-DDTHH:mm:ss.sssZ or YYYY-MM-DD). If not present or not a valid date, use the current ISO string.
2. "name": The full name of the lead/contact.
3. "email": The lead's primary email address. If multiple emails exist in a row, use the FIRST one. Append all remaining emails to "crm_note".
4. "country_code": The country code of the phone number (e.g., "+1", "+91"). Do not include leading zeroes or spaces if possible.
5. "mobile_without_country_code": The mobile/phone number excluding the country code. If multiple phone numbers exist in a row, use the FIRST one. Append all remaining phone numbers to "crm_note".
6. "company": The company or organization name.
7. "city": The city of the lead.
8. "state": The state of the lead.
9. "country": The country of the lead.
10. "lead_owner": The name of the salesperson or owner assigned to this lead.
11. "crm_status": The status of the lead. You must map the status to EXACTLY one of these four string constants:
    - "GOOD_LEAD_FOLLOW_UP"
    - "DID_NOT_CONNECT"
    - "BAD_LEAD"
    - "SALE_DONE"
    If there is no clear mapping, map it to the closest logical choice or use "GOOD_LEAD_FOLLOW_UP" by default.
12. "crm_note": A combined string compiling all miscellaneous notes, comments, remarks, follow-up logs, additional emails, and additional phone numbers found in the row. Format it cleanly (e.g. "Additional Emails: test@test.com | Notes: Interested in buying").
13. "data_source": The source of the lead. You must map it to EXACTLY one of these constants:
    - "leads_on_demand"
    - "meridian_tower"
    - "eden_park"
    - "varah_swamy"
    - "sarjapur_plots"
    If the value doesn't fit or is uncertain, leave it as null.
14. "possession_time": Any mention of a possession time frame, date, or period.
15. "description": A short summary or description of the lead or their interest.

Crucial Instructions:
- You must parse ANY layout. Learn from headers to extract these fields correctly.
- Return null for any fields you cannot locate or reasonably infer. DO NOT invent/hallucinate values.
- Return a JSON array of objects matching the schema. Do not return any markdown code block wraps unless using standard raw JSON mode.
- If you find columns containing email or phone numbers, extract them to "email" and "mobile_without_country_code" respectively. Keep in mind that a record requires at least one of these two fields. If both are completely missing, still map it but we will filter it out.
`;
  }

  /**
   * Constructs the prompt payload containing headers and rows of a CSV batch.
   */
  public static buildBatchPrompt(headers: string[], rows: Record<string, string>[]): string {
    return `Below is a batch of raw CSV rows. Map each row to the GrowEasy CRM schema.
CSV Headers: ${JSON.stringify(headers)}

CSV Rows to process:
${JSON.stringify(rows, null, 2)}

Provide the output as a strict JSON array of objects. Each object should have keys matching the CRM fields exactly:
[
  {
    "created_at": "string or null",
    "name": "string or null",
    "email": "string or null",
    "country_code": "string or null",
    "mobile_without_country_code": "string or null",
    "company": "string or null",
    "city": "string or null",
    "state": "string or null",
    "country": "string or null",
    "lead_owner": "string or null",
    "crm_status": "GOOD_LEAD_FOLLOW_UP" | "DID_NOT_CONNECT" | "BAD_LEAD" | "SALE_DONE" | null,
    "crm_note": "string or null",
    "data_source": "leads_on_demand" | "meridian_tower" | "eden_park" | "varah_swamy" | "sarjapur_plots" | null,
    "possession_time": "string or null",
    "description": "string or null"
  }
]
`;
  }
}
