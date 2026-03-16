import type { ConnectionEntry } from "./types.ts";
import { resolveEnvVar } from "./env.ts";

export interface GoogleAnalyticsClient {
  runReport(request: {
    dateRanges: { startDate: string; endDate: string }[];
    dimensions?: { name: string }[];
    metrics: { name: string }[];
    limit?: number;
    offset?: number;
    orderBys?: unknown[];
  }): Promise<{
    rows: { dimensionValues: { value: string }[]; metricValues: { value: string }[] }[];
    rowCount: number;
  }>;
}

export function createGoogleAnalyticsClient(
  entry: ConnectionEntry,
  slug: string,
): GoogleAnalyticsClient {
  const serviceAccountJsonBase64 = resolveEnvVar(entry, "service-account-key-json-base64", slug);
  const propertyId = resolveEnvVar(entry, "property-id", slug);

  const serviceAccountJson = Buffer.from(serviceAccountJsonBase64, "base64").toString("utf-8");
  let credentials: Record<string, unknown>;
  try {
    credentials = JSON.parse(serviceAccountJson) as Record<string, unknown>;
  } catch {
    throw new Error(
      `Google Analytics service account JSON (decoded from base64) is not valid JSON for slug "${slug}"`,
    );
  }

  return {
    async runReport(request) {
      const { BetaAnalyticsDataClient } = await import("@google-analytics/data");
      const client = new BetaAnalyticsDataClient({
        credentials: {
          client_email: credentials.client_email as string,
          private_key: credentials.private_key as string,
        },
      });

      const response = await client.runReport({
        property: `properties/${propertyId}`,
        dateRanges: request.dateRanges,
        dimensions: request.dimensions,
        metrics: request.metrics,
        limit: request.limit != null ? String(request.limit) : undefined,
        offset: request.offset != null ? String(request.offset) : undefined,
      });

      const reportResponse = Array.isArray(response) ? response[0] : response;
      const rawRows = (reportResponse as Record<string, unknown>).rows as
        | { dimensionValues?: { value?: string }[]; metricValues?: { value?: string }[] }[]
        | undefined;

      const rows = (rawRows ?? []).map((row: { dimensionValues?: { value?: string }[]; metricValues?: { value?: string }[] }) => ({
        dimensionValues: (row.dimensionValues ?? []).map((d: { value?: string }) => ({
          value: d.value ?? "",
        })),
        metricValues: (row.metricValues ?? []).map((m: { value?: string }) => ({
          value: m.value ?? "",
        })),
      }));

      return {
        rows,
        rowCount: Number((reportResponse as Record<string, unknown>).rowCount ?? 0),
      };
    },
  };
}
