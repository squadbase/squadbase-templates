import pg from "pg";

const { Pool } = pg;

// 環境変数からSQUADBASE_POSTGRESQL_URLを取得
const SQUADBASE_POSTGRESQL_URL = process.env.SQUADBASE_POSTGRESQL_URL;

if (!SQUADBASE_POSTGRESQL_URL) {
  throw new Error("SQUADBASE_POSTGRESQL_URL environment variable is not set");
}

// PostgreSQL接続プール
export const pool = new Pool({
  connectionString: SQUADBASE_POSTGRESQL_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// 接続テスト
pool.query("SELECT NOW()")
  .then(() => console.log("✅ PostgreSQL connected successfully"))
  .catch((err) => console.error("❌ PostgreSQL connection error:", err));
