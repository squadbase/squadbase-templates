export interface ConnectionEntry {
  connector: {
    slug: string;
    authType?: string | null;
  };
  envVars: Record<string, string>;
}

export type ConnectionsMap = Record<string, ConnectionEntry>;
