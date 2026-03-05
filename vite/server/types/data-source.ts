export interface ParameterMeta {
  name: string;
  type: "string" | "number" | "boolean";
  description: string;
  required?: boolean;
  default?: string | number | boolean;
}

export interface SchemaField {
  name: string;
  type: "string" | "number" | "boolean" | "object" | "array";
  description?: string;
  fields?: SchemaField[];
  items?: SchemaField[];
}

// --- Cache configuration ---
export interface DataSourceCacheConfig {
  /**
   * Cache TTL in seconds.
   * 0 or unset means no caching (default behavior for backward compatibility).
   */
  ttl: number;
  /**
   * When true, stale data is returned immediately after TTL expiry
   * while fresh data is fetched asynchronously in the background to update the cache.
   * Default: false
   */
  staleWhileRevalidate?: boolean;
}

export interface DataSourceDefinition {
  description: string;
  parameters: ParameterMeta[];
  schema: SchemaField[];
  connectorSlug?: string;
  cacheConfig?: DataSourceCacheConfig;
  handler: (params: Record<string, unknown>) => Promise<unknown> | unknown;
}

export interface DataSourceMeta {
  slug: string;
  description: string;
  parameters: ParameterMeta[];
  schema: SchemaField[];
  connectorSlug?: string;
}

export interface JsonDataSourceDefinition {
  description: string;
  parameters: ParameterMeta[];
  schema: SchemaField[];
  query: string;
  connectorType?: string;
  connectorSlug?: string;
  cache?: DataSourceCacheConfig;
}
