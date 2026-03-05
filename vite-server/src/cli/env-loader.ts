import { reloadEnvFile } from "../connector-client/index.ts";
import type { ConnectionsMap } from "../connector-client/types.ts";
import { readFileSync } from "node:fs";

export function loadEnvFile(envPath: string): void {
  reloadEnvFile(envPath);
}

export function loadConnectionsJson(connectionsPath: string): ConnectionsMap | null {
  try {
    const raw = readFileSync(connectionsPath, "utf-8");
    return JSON.parse(raw) as ConnectionsMap;
  } catch {
    return null;
  }
}
