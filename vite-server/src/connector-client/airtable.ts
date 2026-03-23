import type { ConnectionEntry } from "./types.ts";
import { resolveEnvVar } from "./env.ts";

export interface AirtableClient {
  listRecords(tableIdOrName: string, options?: {
    fields?: string[];
    filterByFormula?: string;
    maxRecords?: number;
    sort?: { field: string; direction?: "asc" | "desc" }[];
    pageSize?: number;
    offset?: string;
  }): Promise<{ records: AirtableRecord[]; offset?: string }>;
  getRecord(tableIdOrName: string, recordId: string): Promise<AirtableRecord>;
}

export interface AirtableRecord {
  id: string;
  fields: Record<string, unknown>;
  createdTime: string;
}

export function createAirtableClient(entry: ConnectionEntry, slug: string): AirtableClient {
  const baseId = resolveEnvVar(entry, "base-id", slug);
  const apiKey = resolveEnvVar(entry, "api-key", slug);

  const baseUrl = `https://api.airtable.com/v0/${baseId}`;
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };

  return {
    async listRecords(tableIdOrName, options) {
      const params = new URLSearchParams();
      if (options?.filterByFormula) params.set("filterByFormula", options.filterByFormula);
      if (options?.maxRecords) params.set("maxRecords", String(options.maxRecords));
      if (options?.pageSize) params.set("pageSize", String(options.pageSize));
      if (options?.offset) params.set("offset", options.offset);
      options?.fields?.forEach((f) => params.append("fields[]", f));
      options?.sort?.forEach((s, i) => {
        params.set(`sort[${i}][field]`, s.field);
        if (s.direction) params.set(`sort[${i}][direction]`, s.direction);
      });

      const qs = params.toString();
      const url = `${baseUrl}/${encodeURIComponent(tableIdOrName)}${qs ? `?${qs}` : ""}`;
      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error(`Airtable API error: ${res.status} ${await res.text()}`);
      return res.json() as Promise<{ records: AirtableRecord[]; offset?: string }>;
    },

    async getRecord(tableIdOrName, recordId) {
      const url = `${baseUrl}/${encodeURIComponent(tableIdOrName)}/${recordId}`;
      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error(`Airtable API error: ${res.status} ${await res.text()}`);
      return res.json() as Promise<AirtableRecord>;
    },
  };
}
