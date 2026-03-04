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

// --- キャッシュ設定 ---
export interface DataSourceCacheConfig {
  /**
   * キャッシュの有効期間（秒）。
   * 0 または未指定の場合はキャッシュしない（後方互換性を保つデフォルト動作）。
   */
  ttl: number;
  /**
   * true の場合、TTL 期限切れ後も古いデータを即座に返しつつ、
   * バックグラウンドで新しいデータを非同期取得してキャッシュを更新する。
   * デフォルト: false
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
