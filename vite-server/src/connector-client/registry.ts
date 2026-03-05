import { readFileSync, watch as fsWatch } from "node:fs";
import path from "node:path";
import type { ConnectionsMap, DatabaseClient } from "./types.ts";
import { createPostgreSQLClient } from "./postgresql.ts";
import { createBigQueryClient } from "./bigquery.ts";
import { createSnowflakeClient } from "./snowflake.ts";

export function createConnectorRegistry() {
  let connectionsCache: ConnectionsMap | null = null;
  const clientCache = new Map<string, DatabaseClient>();

  function getConnectionsFilePath(): string {
    return (
      process.env.CONNECTIONS_PATH ??
      path.join(process.cwd(), "../../.squadbase/connections.json")
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

  async function getClient(connectorSlug?: string, connectorType?: string): Promise<DatabaseClient> {
    if (!connectorSlug) {
      const cacheKey = "__squadbase-db__";
      const cached = clientCache.get(cacheKey);
      if (cached) return cached;

      const url = process.env.SQUADBASE_POSTGRESQL_URL;
      if (!url) throw new Error("SQUADBASE_POSTGRESQL_URL environment variable is not set");

      const client = createPostgreSQLClient(url);
      clientCache.set(cacheKey, client);
      return client;
    }

    const cached = clientCache.get(connectorSlug);
    if (cached) return cached;

    const connections = loadConnections();
    const entry = connections[connectorSlug];
    if (!entry) {
      throw new Error(`connector slug '${connectorSlug}' not found in .squadbase/connections.json`);
    }

    const resolvedType = connectorType ?? entry.connectorType;

    if (!resolvedType) {
      throw new Error(
        `connector type could not be determined for slug '${connectorSlug}'. ` +
        `Specify connectorType in the data-source JSON or in .squadbase/connections.json.`,
      );
    }

    if (resolvedType === "snowflake") {
      // Stateless, so do not cache
      return createSnowflakeClient(entry, connectorSlug);
    }

    if (resolvedType === "bigquery") {
      // Stateless, so do not cache
      return createBigQueryClient(entry, connectorSlug);
    }

    if (resolvedType === "postgresql" || resolvedType === "squadbase-db") {
      const urlEnvName = entry.envVars["connection-url"];
      if (!urlEnvName) {
        throw new Error(`'connection-url' is not defined in envVars for connector '${connectorSlug}'`);
      }
      const connectionUrl = process.env[urlEnvName];
      if (!connectionUrl) {
        throw new Error(
          `environment variable '${urlEnvName}' (mapped from connector '${connectorSlug}') is not set`,
        );
      }
      const client = createPostgreSQLClient(connectionUrl);
      clientCache.set(connectorSlug, client);
      return client;
    }

    throw new Error(
      `connector type '${resolvedType}' is not supported. ` +
      `Supported: "snowflake", "bigquery", "postgresql", "squadbase-db"`,
    );
  }

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

  function watchConnectionsFile(): void {
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

  return { getClient, reloadEnvFile, watchConnectionsFile };
}
