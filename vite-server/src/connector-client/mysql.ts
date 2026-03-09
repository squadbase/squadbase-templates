import type { ConnectionEntry, DatabaseClient } from "./types.ts";
import { resolveEnvVar } from "./env.ts";

export function createMySQLClient(entry: ConnectionEntry, connectionId: string): DatabaseClient {
  const connectionUrl = resolveEnvVar(entry, "connection-url", connectionId);

  let poolPromise: Promise<import("mysql2/promise").Pool> | null = null;

  function getPool(): Promise<import("mysql2/promise").Pool> {
    if (!poolPromise) {
      poolPromise = import("mysql2/promise").then((mysql) =>
        mysql.default.createPool(connectionUrl),
      );
    }
    return poolPromise;
  }

  return {
    async query(sql, params) {
      const pool = await getPool();
      const [rows] = await pool.execute(sql, params as never);
      return { rows: rows as Record<string, unknown>[] };
    },
  };
}
