import type { ConnectionEntry, DatabaseClient } from "./types.ts";
import { resolveEnvVar } from "./env.ts";
import { resolveEnvVarOptional } from "./env.ts";

export function createAthenaClient(entry: ConnectionEntry, connectionId: string): DatabaseClient {
  const region = resolveEnvVar(entry, "aws-region", connectionId);
  const accessKeyId = resolveEnvVar(entry, "aws-access-key-id", connectionId);
  const secretAccessKey = resolveEnvVar(entry, "aws-secret-access-key", connectionId);
  const workgroup = resolveEnvVarOptional(entry, "workgroup") ?? "primary";
  const outputLocation = resolveEnvVarOptional(entry, "output-location");

  return {
    async query(sql) {
      const {
        AthenaClient,
        StartQueryExecutionCommand,
        GetQueryExecutionCommand,
        GetQueryResultsCommand,
      } = await import("@aws-sdk/client-athena");

      const client = new AthenaClient({
        region,
        credentials: { accessKeyId, secretAccessKey },
      });

      const startParams: Record<string, unknown> = {
        QueryString: sql,
        WorkGroup: workgroup,
      };
      if (outputLocation) {
        startParams.ResultConfiguration = { OutputLocation: outputLocation };
      }

      const { QueryExecutionId } = await client.send(
        new StartQueryExecutionCommand(startParams as never),
      );
      if (!QueryExecutionId) throw new Error("Athena: failed to start query execution");

      // Poll until query completes
      while (true) {
        const { QueryExecution } = await client.send(
          new GetQueryExecutionCommand({ QueryExecutionId }),
        );
        const state = QueryExecution?.Status?.State;
        if (state === "SUCCEEDED") break;
        if (state === "FAILED") {
          throw new Error(
            `Athena query failed: ${QueryExecution?.Status?.StateChangeReason ?? "unknown"}`,
          );
        }
        if (state === "CANCELLED") throw new Error("Athena query was cancelled");
        await new Promise((r) => setTimeout(r, 500));
      }

      // Fetch results
      const { ResultSet } = await client.send(
        new GetQueryResultsCommand({ QueryExecutionId }),
      );

      const resultRows = ResultSet?.Rows ?? [];
      if (resultRows.length === 0) return { rows: [] };

      // First row is column headers
      const headers = resultRows[0].Data?.map((d) => d.VarCharValue ?? "") ?? [];
      const rows = resultRows.slice(1).map((row) => {
        const obj: Record<string, unknown> = {};
        row.Data?.forEach((d, i) => {
          obj[headers[i]] = d.VarCharValue ?? null;
        });
        return obj;
      });

      return { rows };
    },
  };
}
