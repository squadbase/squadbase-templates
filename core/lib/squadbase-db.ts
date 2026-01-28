import { Pool } from "pg";

let pool: Pool | undefined;

export function createSquadbaseDbClient() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.SQUADBASE_POSTGRESQL_URL!,
      ssl: { rejectUnauthorized: false },
    });
  }
  return pool;
}
