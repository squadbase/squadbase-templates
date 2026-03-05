import type { ConnectionEntry, DatabaseClient } from "./types.ts";
import { resolveEnvVar, resolveEnvVarOptional } from "./env.ts";

export function createRedshiftClient(entry: ConnectionEntry, slug: string): DatabaseClient {
  const region = resolveEnvVar(entry, "aws-region", slug);
  const accessKeyId = resolveEnvVar(entry, "aws-access-key-id", slug);
  const secretAccessKey = resolveEnvVar(entry, "aws-secret-access-key", slug);
  const database = resolveEnvVar(entry, "database", slug);
  const clusterIdentifier = resolveEnvVarOptional(entry, "cluster-identifier");
  const workgroupName = resolveEnvVarOptional(entry, "workgroup-name");
  const secretArn = resolveEnvVarOptional(entry, "secret-arn");
  const dbUser = resolveEnvVarOptional(entry, "db-user");

  return {
    async query(sql) {
      const {
        RedshiftDataClient,
        ExecuteStatementCommand,
        DescribeStatementCommand,
        GetStatementResultCommand,
      } = await import("@aws-sdk/client-redshift-data");

      const client = new RedshiftDataClient({
        region,
        credentials: { accessKeyId, secretAccessKey },
      });

      const executeParams: Record<string, unknown> = {
        Sql: sql,
        Database: database,
      };
      if (clusterIdentifier) executeParams.ClusterIdentifier = clusterIdentifier;
      if (workgroupName) executeParams.WorkgroupName = workgroupName;
      if (secretArn) executeParams.SecretArn = secretArn;
      if (dbUser) executeParams.DbUser = dbUser;

      const { Id } = await client.send(
        new ExecuteStatementCommand(executeParams as never),
      );
      if (!Id) throw new Error("Redshift: failed to start statement execution");

      // Poll until statement completes
      while (true) {
        const desc = await client.send(new DescribeStatementCommand({ Id }));
        const status = desc.Status;
        if (status === "FINISHED") break;
        if (status === "FAILED") {
          throw new Error(`Redshift query failed: ${desc.Error ?? "unknown"}`);
        }
        if (status === "ABORTED") throw new Error("Redshift query was aborted");
        await new Promise((r) => setTimeout(r, 500));
      }

      // Fetch results
      const result = await client.send(new GetStatementResultCommand({ Id }));

      const columns = result.ColumnMetadata?.map((c) => c.name ?? "") ?? [];
      const rows = (result.Records ?? []).map((record) => {
        const obj: Record<string, unknown> = {};
        record.forEach((field, i) => {
          const col = columns[i];
          // Extract value from the Redshift Field union
          const value =
            field.stringValue ??
            field.longValue ??
            field.doubleValue ??
            field.booleanValue ??
            (field.isNull ? null : field.blobValue ?? null);
          obj[col] = value;
        });
        return obj;
      });

      return { rows };
    },
  };
}
