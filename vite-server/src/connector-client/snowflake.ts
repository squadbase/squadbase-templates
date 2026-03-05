import type { ConnectionEntry, DatabaseClient } from "./types.ts";
import { resolveEnvVar } from "./env.ts";

export function createSnowflakeClient(entry: ConnectionEntry, slug: string): DatabaseClient {
  const accountIdentifier = resolveEnvVar(entry, "account", slug);
  const user = resolveEnvVar(entry, "user", slug);
  const role = resolveEnvVar(entry, "role", slug);
  const warehouse = resolveEnvVar(entry, "warehouse", slug);
  const privateKeyBase64 = resolveEnvVar(entry, "private-key-base64", slug);
  const privateKey = Buffer.from(privateKeyBase64, "base64").toString("utf-8");

  return {
    async query(sql) {
      const snowflake = (await import("snowflake-sdk")).default;
      snowflake.configure({ logLevel: "ERROR" });

      const connection = snowflake.createConnection({
        account: accountIdentifier,
        username: user,
        role,
        warehouse,
        authenticator: "SNOWFLAKE_JWT",
        privateKey,
      });

      await new Promise<void>((resolve, reject) => {
        connection.connect((err) => {
          if (err) reject(new Error(`Snowflake connect failed: ${err.message}`));
          else resolve();
        });
      });

      const rows = await new Promise<Record<string, unknown>[]>((resolve, reject) => {
        connection.execute({
          sqlText: sql,
          complete: (err, _stmt, rows) => {
            if (err) reject(new Error(`Snowflake query failed: ${err.message}`));
            else resolve((rows ?? []) as Record<string, unknown>[]);
          },
        });
      });

      connection.destroy((err) => {
        if (err) console.warn(`[connector-client] Snowflake destroy error: ${err.message}`);
      });

      return { rows };
    },
  };
}
