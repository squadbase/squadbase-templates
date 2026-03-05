export interface ParameterMeta {
  name: string;
  type: "string" | "number" | "boolean";
  description: string;
  required?: boolean;
  default?: string | number | boolean;
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

// --- OpenAPI-inspired response types ---

export interface DataSourceSchemaObject {
  type?: "string" | "number" | "integer" | "boolean" | "object" | "array" | "null";
  format?: string;           // "date" | "date-time" | "uri" | "email" | "uuid" etc.
  description?: string;
  nullable?: boolean;
  enum?: (string | number | boolean | null)[];
  items?: DataSourceSchemaObject;                          // for array
  properties?: Record<string, DataSourceSchemaObject>;    // for object
  required?: string[];
  additionalProperties?: boolean | DataSourceSchemaObject;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}

export interface DataSourceMediaType {
  schema?: DataSourceSchemaObject;
  example?: unknown;
}

export interface DataSourceResponse {
  description?: string;
  defaultContentType?: string;   // "application/json" | "text/csv" etc.
  content?: Record<string, DataSourceMediaType>;
}

export interface DataSourceDefinition {
  description: string;
  parameters: ParameterMeta[];
  response?: DataSourceResponse;
  connectorSlug?: string;
  cacheConfig?: DataSourceCacheConfig;
  handler: (params: Record<string, unknown>) => Promise<unknown> | unknown;
  _isTypescript?: boolean;
  _tsHandlerPath?: string;
}

export interface DataSourceMeta {
  slug: string;
  description: string;
  parameters: ParameterMeta[];
  response?: DataSourceResponse;
  connectorSlug?: string;
}

export interface JsonDataSourceDefinition {
  description: string;
  type?: "sql";
  parameters?: ParameterMeta[];
  response?: DataSourceResponse;   // if omitted, returns { data: result }
  query: string;
  connectorType?: string;
  connectorSlug?: string;
  cache?: DataSourceCacheConfig;
}

export interface JsonTypeScriptDataSourceDefinition {
  description: string;
  type: "typescript";
  handlerPath: string;
  parameters?: ParameterMeta[];
  response?: DataSourceResponse;
  cache?: DataSourceCacheConfig;
}

export type AnyJsonDataSourceDefinition =
  | JsonDataSourceDefinition
  | JsonTypeScriptDataSourceDefinition;
