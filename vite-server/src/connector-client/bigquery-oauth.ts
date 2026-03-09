import type { ConnectionEntry, DatabaseClient } from "./types.ts";
import { connection } from "../connection.ts";
import { resolveEnvVar } from "./env.ts";

const MAX_RESULTS = 10_000;
const POLL_INTERVAL_MS = 1_000;
const POLL_TIMEOUT_MS = 120_000;

interface BigQueryField {
  name: string;
  type: string;
}

interface BigQueryCell {
  v: unknown;
}

interface BigQueryRow {
  f: BigQueryCell[];
}

interface BigQueryQueryResponse {
  jobComplete: boolean;
  jobReference: { projectId: string; jobId: string; location?: string };
  schema?: { fields: BigQueryField[] };
  rows?: BigQueryRow[];
  totalRows?: string;
  errors?: { message: string }[];
}

function flattenRows(
  fields: BigQueryField[],
  rows: BigQueryRow[],
): Record<string, unknown>[] {
  return rows.map((row) => {
    const obj: Record<string, unknown> = {};
    for (let i = 0; i < fields.length; i++) {
      obj[fields[i].name] = row.f[i].v;
    }
    return obj;
  });
}

export function createBigQueryOAuthClient(
  entry: ConnectionEntry,
  connectionId: string,
): DatabaseClient {
  const projectId = resolveEnvVar(entry, "project-id", connectionId);
  const baseUrl = `https://bigquery.googleapis.com/bigquery/v2/projects/${projectId}`;

  return {
    async query(sql: string): Promise<{ rows: Record<string, unknown>[] }> {
      const conn = connection(connectionId);

      // Execute query
      const res = await conn.fetch(`${baseUrl}/queries`, {
        method: "POST",
        body: {
          query: sql,
          useLegacySql: false,
          maxResults: MAX_RESULTS,
        },
      });

      if (!res.ok) {
        const text = await res.text().catch(() => res.statusText);
        throw new Error(`BigQuery query failed: HTTP ${res.status} ${text}`);
      }

      let data = (await res.json()) as BigQueryQueryResponse;

      if (data.errors?.length) {
        throw new Error(
          `BigQuery query error: ${data.errors.map((e) => e.message).join("; ")}`,
        );
      }

      // Poll until job completes
      if (!data.jobComplete) {
        const jobId = data.jobReference.jobId;
        const location = data.jobReference.location;
        const deadline = Date.now() + POLL_TIMEOUT_MS;

        while (!data.jobComplete) {
          if (Date.now() > deadline) {
            throw new Error(
              `BigQuery query timed out after ${POLL_TIMEOUT_MS / 1000}s (jobId: ${jobId})`,
            );
          }

          await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));

          const params = new URLSearchParams({
            maxResults: String(MAX_RESULTS),
          });
          if (location) params.set("location", location);

          const pollRes = await conn.fetch(
            `${baseUrl}/queries/${jobId}?${params}`,
            { method: "GET" },
          );

          if (!pollRes.ok) {
            const text = await pollRes.text().catch(() => pollRes.statusText);
            throw new Error(
              `BigQuery poll failed: HTTP ${pollRes.status} ${text}`,
            );
          }

          data = (await pollRes.json()) as BigQueryQueryResponse;

          if (data.errors?.length) {
            throw new Error(
              `BigQuery query error: ${data.errors.map((e) => e.message).join("; ")}`,
            );
          }
        }
      }

      const fields = data.schema?.fields ?? [];
      const rawRows = data.rows ?? [];
      return { rows: flattenRows(fields, rawRows) };
    },
  };
}
