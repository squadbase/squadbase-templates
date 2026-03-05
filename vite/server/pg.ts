import pg from "pg";

const { Pool } = pg;

// Read SQUADBASE_POSTGRESQL_URL from environment variables
const SQUADBASE_POSTGRESQL_URL = process.env.SQUADBASE_POSTGRESQL_URL;

if (!SQUADBASE_POSTGRESQL_URL) {
  throw new Error("SQUADBASE_POSTGRESQL_URL environment variable is not set");
}

// PostgreSQL connection pool
export const pool = new Pool({
  connectionString: SQUADBASE_POSTGRESQL_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Connection test
pool.query("SELECT NOW()")
  .then(() => console.log("✅ PostgreSQL connected successfully"))
  .catch((err) => console.error("❌ PostgreSQL connection error:", err));
