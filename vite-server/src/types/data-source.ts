import { z } from "zod";

// --- Parameter ---

export const parameterMetaSchema = z.object({
  name: z.string(),
  type: z.enum(["string", "number", "boolean"]),
  description: z.string(),
  required: z.boolean().optional(),
  default: z.union([z.string(), z.number(), z.boolean()]).optional(),
});

export type ParameterMeta = z.infer<typeof parameterMetaSchema>;

// --- Cache configuration ---

export const dataSourceCacheConfigSchema = z.object({
  ttl: z.number(),
  staleWhileRevalidate: z.boolean().optional(),
});

export type DataSourceCacheConfig = z.infer<typeof dataSourceCacheConfigSchema>;

// --- OpenAPI-inspired response types ---

export const dataSourceSchemaObjectSchema: z.ZodType<DataSourceSchemaObject> = z.lazy(() =>
  z.object({
    type: z.enum(["string", "number", "integer", "boolean", "object", "array", "null"]).optional(),
    format: z.string().optional(),
    description: z.string().optional(),
    nullable: z.boolean().optional(),
    enum: z.array(z.union([z.string(), z.number(), z.boolean(), z.null()])).optional(),
    items: dataSourceSchemaObjectSchema.optional(),
    properties: z.record(z.string(), dataSourceSchemaObjectSchema).optional(),
    required: z.array(z.string()).optional(),
    additionalProperties: z.union([z.boolean(), dataSourceSchemaObjectSchema]).optional(),
    minimum: z.number().optional(),
    maximum: z.number().optional(),
    minLength: z.number().optional(),
    maxLength: z.number().optional(),
    pattern: z.string().optional(),
  }),
);

export interface DataSourceSchemaObject {
  type?: "string" | "number" | "integer" | "boolean" | "object" | "array" | "null";
  format?: string;
  description?: string;
  nullable?: boolean;
  enum?: (string | number | boolean | null)[];
  items?: DataSourceSchemaObject;
  properties?: Record<string, DataSourceSchemaObject>;
  required?: string[];
  additionalProperties?: boolean | DataSourceSchemaObject;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}

export const dataSourceMediaTypeSchema = z.object({
  schema: dataSourceSchemaObjectSchema.optional(),
  example: z.unknown().optional(),
});

export type DataSourceMediaType = z.infer<typeof dataSourceMediaTypeSchema>;

export const dataSourceResponseSchema = z.object({
  description: z.string().optional(),
  defaultContentType: z.string().optional(),
  content: z.record(z.string(), dataSourceMediaTypeSchema).optional(),
});

export type DataSourceResponse = z.infer<typeof dataSourceResponseSchema>;

// --- JSON data source definitions (what's read from .json files) ---

const jsonBaseFields = {
  description: z.string(),
  parameters: z.array(parameterMetaSchema).optional(),
  response: dataSourceResponseSchema.optional(),
  cache: dataSourceCacheConfigSchema.optional(),
};

export const jsonSqlDataSourceSchema = z.object({
  ...jsonBaseFields,
  type: z.literal("sql").optional(),
  query: z.string(),
  connectionId: z.string(),
});

export type JsonSqlDataSourceDefinition = z.infer<typeof jsonSqlDataSourceSchema>;

export const jsonTypeScriptDataSourceSchema = z.object({
  ...jsonBaseFields,
  type: z.literal("typescript"),
  handlerPath: z.string(),
});

export type JsonTypeScriptDataSourceDefinition = z.infer<typeof jsonTypeScriptDataSourceSchema>;

export const anyJsonDataSourceSchema = z.union([
  jsonTypeScriptDataSourceSchema,
  jsonSqlDataSourceSchema,
]);

export type AnyJsonDataSourceDefinition = z.infer<typeof anyJsonDataSourceSchema>;

// --- Internal data source definitions (runtime, stored in registry Map) ---

interface BaseDataSourceDefinition {
  description: string;
  parameters: ParameterMeta[];
  response?: DataSourceResponse;
  cacheConfig?: DataSourceCacheConfig;
  handler: (params: Record<string, unknown>) => Promise<unknown> | unknown;
}

export interface SqlDataSourceDefinition extends BaseDataSourceDefinition {
  connectionId: string;
  _query: string;
  _isTypescript?: false;
  _tsHandlerPath?: undefined;
}

export interface TypeScriptDataSourceDefinition extends BaseDataSourceDefinition {
  _isTypescript: true;
  _tsHandlerPath: string;
  connectionId?: undefined;
  _query?: undefined;
}

export type DataSourceDefinition = SqlDataSourceDefinition | TypeScriptDataSourceDefinition;

// --- Metadata (returned by API) ---

interface BaseDataSourceMeta {
  slug: string;
  description: string;
  parameters: ParameterMeta[];
  response?: DataSourceResponse;
  cache?: DataSourceCacheConfig;
}

export interface SqlDataSourceMeta extends BaseDataSourceMeta {
  type: "sql";
  connectionId: string;
  query: string;
  handlerPath?: undefined;
}

export interface TypeScriptDataSourceMeta extends BaseDataSourceMeta {
  type: "typescript";
  handlerPath: string;
  connectionId?: undefined;
  query?: undefined;
}

export type DataSourceMeta = SqlDataSourceMeta | TypeScriptDataSourceMeta;

// --- Backward-compatible re-exports ---

/** @deprecated Use JsonSqlDataSourceDefinition */
export type JsonDataSourceDefinition = JsonSqlDataSourceDefinition;
