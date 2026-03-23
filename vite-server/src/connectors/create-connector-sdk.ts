import { readFileSync } from "node:fs";
import path from "node:path";
import { resolveEnvVar, resolveEnvVarOptional } from "../connector-client/env.ts";
import type { ConnectionsMap } from "../connector-client/types.ts";

interface ConnectorPluginLike {
  slug: string;
  parameters: Record<string, { slug: string; required: boolean }>;
}

function loadConnectionsSync(): ConnectionsMap {
  const filePath =
    process.env.CONNECTIONS_PATH ??
    path.join(process.cwd(), ".squadbase/connections.json");
  try {
    const raw = readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as ConnectionsMap;
  } catch {
    return {};
  }
}

/**
 * Create a `connection(id)` function for a non-SQL connector SDK.
 */
export function createConnectorSdk<T>(
  plugin: ConnectorPluginLike,
  createClient: (params: Record<string, string>) => T,
): (connectionId: string) => T {
  return (connectionId: string) => {
    const connections = loadConnectionsSync();
    const entry = connections[connectionId];
    if (!entry) {
      throw new Error(
        `Connection "${connectionId}" not found in .squadbase/connections.json`,
      );
    }
    if (entry.connector.slug !== plugin.slug) {
      throw new Error(
        `Connection "${connectionId}" is not a ${plugin.slug} connection (got "${entry.connector.slug}")`,
      );
    }
    const params: Record<string, string> = {};
    for (const param of Object.values(plugin.parameters)) {
      if (param.required) {
        params[param.slug] = resolveEnvVar(entry, param.slug, connectionId);
      } else {
        const val = resolveEnvVarOptional(entry, param.slug);
        if (val !== undefined) params[param.slug] = val;
      }
    }
    return createClient(params);
  };
}
