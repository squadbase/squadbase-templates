export interface DatabaseClient {
  query(sql: string, params?: unknown[]): Promise<{ rows: Record<string, unknown>[] }>;
}

export interface ConnectionEntry {
  connectorType: string;
  envVars: Record<string, string>;
}

export type ConnectionsMap = Record<string, ConnectionEntry>;
