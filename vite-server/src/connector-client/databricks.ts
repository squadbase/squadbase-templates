import type { ConnectionEntry, DatabaseClient } from "./types.ts";
import { resolveEnvVar } from "./env.ts";

export function createDatabricksClient(entry: ConnectionEntry, slug: string): DatabaseClient {
  const host = resolveEnvVar(entry, "host", slug);
  const httpPath = resolveEnvVar(entry, "http-path", slug);
  const token = resolveEnvVar(entry, "token", slug);

  return {
    async query(sql) {
      const { DBSQLClient } = await import("@databricks/sql");

      const client = new DBSQLClient();
      await client.connect({ host, path: httpPath, token });

      try {
        const session = await client.openSession();
        try {
          const operation = await session.executeStatement(sql);
          const result = await operation.fetchAll();
          await operation.close();
          return { rows: result as Record<string, unknown>[] };
        } finally {
          await session.close();
        }
      } finally {
        await client.close();
      }
    },
  };
}
