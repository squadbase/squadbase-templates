import type { ConnectionEntry, DatabaseClient } from "./types.ts";
import { resolveEnvVar } from "./env.ts";

export function createBigQueryClient(entry: ConnectionEntry, connectionId: string): DatabaseClient {
  const projectId = resolveEnvVar(entry, "project-id", connectionId);
  const serviceAccountJsonBase64 = resolveEnvVar(entry, "service-account-key-json-base64", connectionId);

  const serviceAccountJson = Buffer.from(serviceAccountJsonBase64, "base64").toString("utf-8");
  let gcpCredentials: Record<string, unknown>;
  try {
    gcpCredentials = JSON.parse(serviceAccountJson) as Record<string, unknown>;
  } catch {
    throw new Error(
      `BigQuery service account JSON (decoded from base64) is not valid JSON for connectionId "${connectionId}"`,
    );
  }

  return {
    async query(sql) {
      const { BigQuery } = await import("@google-cloud/bigquery");
      const bq = new BigQuery({ projectId, credentials: gcpCredentials });
      const [job] = await bq.createQueryJob({ query: sql });
      const [allRows] = await job.getQueryResults({ timeoutMs: 30_000 });
      return { rows: allRows as Record<string, unknown>[] };
    },
  };
}
