import type { ConnectionEntry } from "./types.ts";
import { resolveEnvVar } from "./env.ts";

export interface KintoneClient {
  getRecords(appId: string | number, options?: {
    query?: string;
    fields?: string[];
    totalCount?: boolean;
  }): Promise<{ records: Record<string, unknown>[]; totalCount: string | null }>;
  getRecord(appId: string | number, recordId: string | number): Promise<{ record: Record<string, unknown> }>;
  listApps(options?: {
    ids?: (string | number)[];
    name?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ apps: Record<string, unknown>[] }>;
}

export function createKintoneClient(entry: ConnectionEntry, slug: string): KintoneClient {
  const baseUrl = resolveEnvVar(entry, "base-url", slug);
  const username = resolveEnvVar(entry, "username", slug);
  const password = resolveEnvVar(entry, "password", slug);

  return {
    async getRecords(appId, options) {
      const { KintoneRestAPIClient } = await import("@kintone/rest-api-client");
      const client = new KintoneRestAPIClient({
        baseUrl,
        auth: { username, password },
      });

      const result = await client.record.getRecords({
        app: appId,
        query: options?.query,
        fields: options?.fields,
        totalCount: options?.totalCount,
      });

      return {
        records: result.records as Record<string, unknown>[],
        totalCount: result.totalCount,
      };
    },

    async getRecord(appId, recordId) {
      const { KintoneRestAPIClient } = await import("@kintone/rest-api-client");
      const client = new KintoneRestAPIClient({
        baseUrl,
        auth: { username, password },
      });

      const result = await client.record.getRecord({
        app: appId,
        id: recordId,
      });

      return { record: result.record as Record<string, unknown> };
    },

    async listApps(options) {
      const { KintoneRestAPIClient } = await import("@kintone/rest-api-client");
      const client = new KintoneRestAPIClient({
        baseUrl,
        auth: { username, password },
      });

      const result = await client.app.getApps({
        ids: options?.ids,
        name: options?.name,
        limit: options?.limit,
        offset: options?.offset,
      });

      return { apps: result.apps as Record<string, unknown>[] };
    },
  };
}
