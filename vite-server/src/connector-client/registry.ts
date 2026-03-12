import { readFileSync, watch as fsWatch } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { connectors } from "@squadbase/connectors";
import type { ConnectionEntry, ConnectionsMap } from "./types.ts";
import { resolveEnvVar, resolveEnvVarOptional } from "./env.ts";

export type QueryFn = (
  sql: string,
  namedParams?: Record<string, unknown>,
) => Promise<{ rows: Record<string, unknown>[] }>;

export function createConnectorRegistry() {
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

  async function getQuery(connectionId: string): Promise<QueryFn> {
    const connections = await loadConnections();
    const entry = connections[connectionId];
    if (!entry) {
      throw new Error(
        `connection '${connectionId}' not found in .squadbase/connections.json`,
      );
    }

    const { slug, authType } = entry.connector;
    const plugin = connectors.findByKey(slug, authType);

    if (!plugin) {
      throw new Error(
        `connector "${slug}" (authType: ${authType ?? "none"}) is not registered in @squadbase/connectors`,
      );
    }

    if (!plugin.query) {
      throw new Error(
        `connector "${plugin.connectorKey}" does not support SQL queries. ` +
          `Non-SQL connectors (airtable, google-analytics, kintone, wix-store, dbt) should be used via TypeScript handlers.`,
      );
    }

    const params = resolveParams(entry, connectionId, plugin);

    const context = { proxyFetch: createProxyFetch(connectionId) };

    return (sql, namedParams) => plugin.query!(params, sql, namedParams, context);
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
        console.log(
          "[connector-client] connections.json changed",
        );
        // Wait with setImmediate because the editor writes connections.json before .env
        setImmediate(() => reloadEnvFile(envPath));
      });
    } catch {
      // Do not watch if the file does not exist
    }
  }

  return { getQuery, loadConnections, reloadEnvFile, watchConnectionsFile };
}

function createProxyFetch(connectionId: string): typeof fetch {
  return async (input, init) => {
    const token = process.env.INTERNAL_SQUADBASE_OAUTH_MACHINE_CREDENTIAL;
    const sandboxId = process.env.INTERNAL_SQUADBASE_SANDBOX_ID;

    if (!token || !sandboxId) {
      throw new Error(
        "OAuth proxy requires INTERNAL_SQUADBASE_OAUTH_MACHINE_CREDENTIAL and INTERNAL_SQUADBASE_SANDBOX_ID",
      );
    }

    const originalUrl = typeof input === "string" ? input : input instanceof URL ? input.href : (input as Request).url;
    const originalMethod = init?.method ?? "GET";
    const originalBody = init?.body ? JSON.parse(init.body as string) : undefined;

    const envPrefix = process.env.SQUADBASE_ENV === "prod" ? "" : `${process.env.SQUADBASE_ENV ?? "dev1"}-`;
    const proxyUrl = `https://${sandboxId}.preview.${envPrefix}app.squadbase.dev/_sqcore/connections/${connectionId}/request`;

    return fetch(proxyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        url: originalUrl,
        method: originalMethod,
        body: originalBody,
      }),
    });
  };
}

function resolveParams(
  entry: ConnectionEntry,
  connectionId: string,
  plugin: { parameters: Record<string, { slug: string; required: boolean }> },
): Record<string, string> {
  const params: Record<string, string> = {};
  for (const param of Object.values(plugin.parameters)) {
    if (param.required) {
      params[param.slug] = resolveEnvVar(entry, param.slug, connectionId);
    } else {
      const val = resolveEnvVarOptional(entry, param.slug);
      if (val !== undefined) params[param.slug] = val;
    }
  }
  return params;
}
