import type { ConnectionEntry, DatabaseClient } from "./types.ts";
import { resolveEnvVar } from "./env.ts";

export function createBigQueryClient(entry: ConnectionEntry, slug: string): DatabaseClient {
  const projectId = resolveEnvVar(entry, "project-id", slug);
  const serviceAccountJsonBase64 = resolveEnvVar(entry, "service-account-json-base64", slug);

  const serviceAccountJson = Buffer.from(serviceAccountJsonBase64, "base64").toString("utf-8");
  let gcpCredentials: Record<string, unknown>;
  try {
    gcpCredentials = JSON.parse(serviceAccountJson) as Record<string, unknown>;
  } catch {
    throw new Error(
      `BigQuery service account JSON (decoded from base64) is not valid JSON for slug "${slug}"`,
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
