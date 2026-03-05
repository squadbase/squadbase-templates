import pg from "pg";
import { readFileSync } from "node:fs";
import { watch as fsWatch } from "node:fs";
import path from "node:path";

const { Pool } = pg;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DatabaseClient {
  query(sql: string, params?: unknown[]): Promise<{ rows: Record<string, unknown>[] }>;
}

interface ConnectionEntry {
  connectorType: string;
  envVars: Record<string, string>;
}

type ConnectionsMap = Record<string, ConnectionEntry>;

// ---------------------------------------------------------------------------
// connections.json cache
// ---------------------------------------------------------------------------

let connectionsCache: ConnectionsMap | null = null;

function getConnectionsFilePath(): string {
  return (
    process.env.CONNECTIONS_PATH ??
    path.join(process.cwd(), ".squadbase", "connections.json")
  );
}

function loadConnections(): ConnectionsMap {
  if (connectionsCache !== null) return connectionsCache;

  const filePath = getConnectionsFilePath();
  try {
    const raw = readFileSync(filePath, "utf-8");
    connectionsCache = JSON.parse(raw) as ConnectionsMap;
  } catch {
    connectionsCache = {};
  }
  return connectionsCache;
}

// ---------------------------------------------------------------------------
// Environment variable resolution helper
// ---------------------------------------------------------------------------

function resolveEnvVar(entry: ConnectionEntry, key: string, slug: string): string {
  const envVarName = entry.envVars[key];
  if (!envVarName) {
    throw new Error(
      `Connector "${slug}" is missing envVars mapping for key "${key}"`,
    );
  }
  const value = process.env[envVarName];
  if (!value) {
    throw new Error(
      `Environment variable "${envVarName}" (for "${slug}.${key}") is not set`,
    );
  }
  return value;
}

// ---------------------------------------------------------------------------
// Snowflake client factory
// ---------------------------------------------------------------------------

function createSnowflakeClient(entry: ConnectionEntry, slug: string): DatabaseClient {
  const accountIdentifier = resolveEnvVar(entry, "account", slug);
  const user = resolveEnvVar(entry, "user", slug);
  const role = resolveEnvVar(entry, "role", slug);
  const warehouse = resolveEnvVar(entry, "warehouse", slug);
  const privateKeyBase64 = resolveEnvVar(entry, "private-key-base64", slug);
  const privateKey = Buffer.from(privateKeyBase64, "base64").toString("utf-8");

  return {
    async query(sql: string, _params?: unknown[]) {
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

// ---------------------------------------------------------------------------
// BigQuery client factory
// ---------------------------------------------------------------------------

function createBigQueryClient(entry: ConnectionEntry, slug: string): DatabaseClient {
  const projectId = resolveEnvVar(entry, "project-id", slug);
  const serviceAccountJsonBase64 = resolveEnvVar(entry, "service-account-json-base64", slug);

  const serviceAccountJson = Buffer.from(serviceAccountJsonBase64, "base64").toString("utf-8");
  let gcpCredentials: Record<string, unknown>;
  try {
    gcpCredentials = JSON.parse(serviceAccountJson) as Record<string, unknown>;
  } catch {
    throw new Error(
      `BigQuery service account JSON (decoded from base64) is not valid JSON for slug "${slug}"`,
    );
  }

  return {
    async query(sql: string, _params?: unknown[]) {
      const { BigQuery } = await import("@google-cloud/bigquery");
      const bq = new BigQuery({ projectId, credentials: gcpCredentials });

      const [job] = await bq.createQueryJob({ query: sql });
      const [allRows] = await job.getQueryResults({ timeoutMs: 30_000 });
      return { rows: allRows as Record<string, unknown>[] };
    },
  };
}

// ---------------------------------------------------------------------------
// Client cache & factory
// ---------------------------------------------------------------------------

const clientCache = new Map<string, DatabaseClient>();

function createPgClient(connectionString: string): DatabaseClient {
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
  return {
    async query(sql: string, params?: unknown[]) {
      const result = await pool.query(sql, params);
      return { rows: result.rows as Record<string, unknown>[] };
    },
  };
}

export async function getClient(
  connectorSlug?: string,
  connectorType?: string,
): Promise<DatabaseClient> {
  // Squadbase DB (default): always use Squadbase DB when connectorSlug is not specified
  if (!connectorSlug) {
    const cacheKey = "__squadbase-db__";
    const cached = clientCache.get(cacheKey);
    if (cached) return cached;

    const url = process.env.SQUADBASE_POSTGRESQL_URL;
    if (!url) {
      throw new Error("SQUADBASE_POSTGRESQL_URL environment variable is not set");
    }
    const client = createPgClient(url);
    clientCache.set(cacheKey, client);
    return client;
  }

  // Cached client for this slug
  const cached = clientCache.get(connectorSlug);
  if (cached) return cached;

  // Resolve from connections.json
  const connections = loadConnections();
  const entry = connections[connectorSlug];

  if (!entry) {
    throw new Error(
      `connector slug '${connectorSlug}' not found in .squadbase/connections.json`,
    );
  }

  const resolvedType = connectorType ?? entry.connectorType;

  if (!resolvedType) {
    throw new Error(
      `connector type could not be determined for slug '${connectorSlug}'. ` +
      `Specify connectorType in the data-source JSON or in .squadbase/connections.json.`,
    );
  }

  let client: DatabaseClient;

  if (resolvedType === "snowflake") {
    // Snowflake: stateless (per-connection), so do not cache
    client = createSnowflakeClient(entry, connectorSlug);
    return client;
  } else if (resolvedType === "bigquery") {
    // BigQuery: stateless (per-request), so do not cache
    client = createBigQueryClient(entry, connectorSlug);
    return client;
  } else if (resolvedType === "postgresql" || resolvedType === "squadbase-db") {
    const urlEnvName = entry.envVars["connection-url"];
    if (!urlEnvName) {
      throw new Error(
        `'connection-url' is not defined in envVars for connector '${connectorSlug}'`,
      );
    }
    const connectionUrl = process.env[urlEnvName];
    if (!connectionUrl) {
      throw new Error(
        `environment variable '${urlEnvName}' (mapped from connector '${connectorSlug}') is not set`,
      );
    }
    client = createPgClient(connectionUrl);
    clientCache.set(connectorSlug, client);
    return client;
  } else {
    throw new Error(
      `connector type '${resolvedType}' is not supported. ` +
      `Supported: "snowflake", "bigquery", "postgresql", "squadbase-db"`,
    );
  }
}

// ---------------------------------------------------------------------------
// connections.json file watcher
// ---------------------------------------------------------------------------

function reloadEnvFile(envPath: string): void {
  try {
    const raw = readFileSync(envPath, "utf-8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const value = trimmed.slice(eqIdx + 1).trim();
      if (key) process.env[key] = value;
    }
    console.log("[connector-client] .env reloaded");
  } catch {
    // Ignore if .env does not exist
  }
}

export function watchConnectionsFile(): void {
  const filePath = getConnectionsFilePath();
  const envPath = path.join(process.cwd(), "..", "..", ".env");
  try {
    fsWatch(filePath, { persistent: false }, () => {
      console.log("[connector-client] connections.json changed, clearing cache");
      connectionsCache = null;
      clientCache.clear();
      // Wait with setImmediate because the editor writes connections.json before .env
      setImmediate(() => reloadEnvFile(envPath));
    });
  } catch {
    // Do not watch if the file does not exist
  }
}
