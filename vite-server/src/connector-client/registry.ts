import { readFileSync, watch as fsWatch } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { ConnectionsMap, DatabaseClient } from "./types.ts";
import { createPostgreSQLClient } from "./postgresql.ts";
import { createBigQueryClient } from "./bigquery.ts";
import { createBigQueryOAuthClient } from "./bigquery-oauth.ts";
import { createSnowflakeClient } from "./snowflake.ts";
import { createMySQLClient } from "./mysql.ts";
import { createAthenaClient } from "./aws-athena.ts";
import { createRedshiftClient } from "./redshift.ts";
import { createDatabricksClient } from "./databricks.ts";


export function createConnectorRegistry() {
  const clientCache = new Map<string, DatabaseClient>();

  function getConnectionsFilePath(): string {
    return (
      process.env.CONNECTIONS_PATH ??
      path.join(process.cwd(), ".squadbase/connections.json")
    );
  }

  async function loadConnections(): Promise<ConnectionsMap> {
    const filePath = getConnectionsFilePath();
    try {
      const raw = await readFile(filePath, "utf-8");
      return JSON.parse(raw) as ConnectionsMap;
    } catch {
      return {};
    }
  }

  async function getClient(connectionId: string): Promise<{ client: DatabaseClient; connectorSlug: string }> {
    const connections = await loadConnections();
    const entry = connections[connectionId];
    if (!entry) {
      throw new Error(`connection '${connectionId}' not found in .squadbase/connections.json`);
    }

    const connectorSlug = entry.connector.slug;

    const cached = clientCache.get(connectionId);
    if (cached) return { client: cached, connectorSlug };

    // Stateless connectors (no caching)
    if (connectorSlug === "snowflake") {
      return { client: createSnowflakeClient(entry, connectionId), connectorSlug };
    }
    if (connectorSlug === "bigquery") {
      if (entry.connector.authType === "oauth") {
        return { client: createBigQueryOAuthClient(entry, connectionId), connectorSlug };
      }
      return { client: createBigQueryClient(entry, connectionId), connectorSlug };
    }
    if (connectorSlug === "athena") {
      return { client: createAthenaClient(entry, connectionId), connectorSlug };
    }
    if (connectorSlug === "redshift") {
      return { client: createRedshiftClient(entry, connectionId), connectorSlug };
    }
    if (connectorSlug === "databricks") {
      return { client: createDatabricksClient(entry, connectionId), connectorSlug };
    }

    // Cached connectors (connection pool / singleton)
    if (connectorSlug === "mysql") {
      const client = createMySQLClient(entry, connectionId);
      clientCache.set(connectionId, client);
      return { client, connectorSlug };
    }

    if (connectorSlug === "postgresql" || connectorSlug === "squadbase-db") {
      const urlEnvName = entry.envVars["connection-url"];
      if (!urlEnvName) {
        throw new Error(`'connection-url' is not defined in envVars for connection '${connectionId}'`);
      }
      const connectionUrl = process.env[urlEnvName];
      if (!connectionUrl) {
        throw new Error(
          `environment variable '${urlEnvName}' (mapped from connection '${connectionId}') is not set`,
        );
      }
      const client = createPostgreSQLClient(connectionUrl);
      clientCache.set(connectionId, client);
      return { client, connectorSlug };
    }

    throw new Error(
      `connector type '${connectorSlug}' is not supported as a SQL connector. ` +
      `Supported SQL types: "postgresql", "squadbase-db", "mysql", "snowflake", "bigquery", "athena", "redshift", "databricks". ` +
      `Non-SQL types (airtable, google-analytics, kintone, wix-store, dbt) should be used via TypeScript handlers.`,
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
    const envPath = path.join(process.cwd(), ".env");
    try {
      fsWatch(filePath, { persistent: false }, () => {
        console.log("[connector-client] connections.json changed, clearing client cache");
        clientCache.clear();
        // Wait with setImmediate because the editor writes connections.json before .env
        setImmediate(() => reloadEnvFile(envPath));
      });
    } catch {
      // Do not watch if the file does not exist
    }
  }

  return { getClient, loadConnections, reloadEnvFile, watchConnectionsFile };
}
