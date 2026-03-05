import type { ConnectionEntry } from "./types.ts";

export function resolveEnvVar(entry: ConnectionEntry, key: string, slug: string): string {
  const envVarName = entry.envVars[key];
  if (!envVarName) {
    throw new Error(`Connector "${slug}" is missing envVars mapping for key "${key}"`);
  }
  const value = process.env[envVarName];
  if (!value) {
    throw new Error(`Environment variable "${envVarName}" (for "${slug}.${key}") is not set`);
  }
  return value;
}
