import type { ConnectionEntry } from "./types.ts";
import { resolveEnvVar } from "./env.ts";

export interface WixStoreClient {
  queryProducts(options?: {
    query?: Record<string, unknown>;
    limit?: number;
    offset?: number;
  }): Promise<{ products: Record<string, unknown>[]; totalResults: number }>;
  queryOrders(options?: {
    query?: Record<string, unknown>;
    limit?: number;
    offset?: number;
  }): Promise<{ orders: Record<string, unknown>[]; totalResults: number }>;
}

export function createWixStoreClient(entry: ConnectionEntry, slug: string): WixStoreClient {
  const siteId = resolveEnvVar(entry, "site-id", slug);
  const apiKey = resolveEnvVar(entry, "api-key", slug);

  const headers = {
    Authorization: apiKey,
    "wix-site-id": siteId,
    "Content-Type": "application/json",
  };

  return {
    async queryProducts(options) {
      const body: Record<string, unknown> = {};
      if (options?.query) body.query = options.query;
      if (options?.limit) {
        body.query = { ...(body.query as Record<string, unknown> ?? {}), paging: { limit: options.limit, offset: options?.offset ?? 0 } };
      }

      const res = await fetch(
        "https://www.wixapis.com/stores/v1/products/query",
        { method: "POST", headers, body: JSON.stringify(body) },
      );
      if (!res.ok) throw new Error(`Wix Store API error: ${res.status} ${await res.text()}`);
      const data = (await res.json()) as { products: Record<string, unknown>[]; totalResults: number };
      return { products: data.products ?? [], totalResults: data.totalResults ?? 0 };
    },

    async queryOrders(options) {
      const body: Record<string, unknown> = {};
      if (options?.query) body.query = options.query;
      if (options?.limit) {
        body.query = { ...(body.query as Record<string, unknown> ?? {}), paging: { limit: options.limit, offset: options?.offset ?? 0 } };
      }

      const res = await fetch(
        "https://www.wixapis.com/stores/v2/orders/query",
        { method: "POST", headers, body: JSON.stringify(body) },
      );
      if (!res.ok) throw new Error(`Wix Store API error: ${res.status} ${await res.text()}`);
      const data = (await res.json()) as { orders: Record<string, unknown>[]; totalResults: number };
      return { orders: data.orders ?? [], totalResults: data.totalResults ?? 0 };
    },
  };
}
