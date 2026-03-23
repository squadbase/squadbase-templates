import type { ConnectionEntry } from "./types.ts";

export function resolveEnvVar(entry: ConnectionEntry, key: string, connectionId: string): string {
  const envVarName = entry.envVars[key];
  if (!envVarName) {
    throw new Error(`Connection "${connectionId}" is missing envVars mapping for key "${key}"`);
  }
  const value = process.env[envVarName];
  if (!value) {
    throw new Error(`Environment variable "${envVarName}" (for connection "${connectionId}", key "${key}") is not set`);
  }
  return value;
}

export function resolveEnvVarOptional(entry: ConnectionEntry, key: string): string | undefined {
  const envVarName = entry.envVars[key];
  if (!envVarName) return undefined;
  return process.env[envVarName] || undefined;
}
