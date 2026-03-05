import pg from "pg";
import type { DatabaseClient } from "./types.ts";

const { Pool } = pg;

export function createPostgreSQLClient(connectionString: string): DatabaseClient {
  const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
  return {
    async query(sql, params) {
      const result = await pool.query(sql, params);
      return { rows: result.rows as Record<string, unknown>[] };
    },
  };
}
