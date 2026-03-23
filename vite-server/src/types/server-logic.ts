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

export const serverLogicCacheConfigSchema = z.object({
  ttl: z.number(),
  staleWhileRevalidate: z.boolean().optional(),
});

export type ServerLogicCacheConfig = z.infer<typeof serverLogicCacheConfigSchema>;

// --- OpenAPI-inspired response types ---

export const serverLogicSchemaObjectSchema: z.ZodType<ServerLogicSchemaObject> = z.lazy(() =>
  z.object({
    type: z.enum(["string", "number", "integer", "boolean", "object", "array", "null"]).optional(),
    format: z.string().optional(),
    description: z.string().optional(),
    nullable: z.boolean().optional(),
    enum: z.array(z.union([z.string(), z.number(), z.boolean(), z.null()])).optional(),
    items: serverLogicSchemaObjectSchema.optional(),
    properties: z.record(z.string(), serverLogicSchemaObjectSchema).optional(),
    required: z.array(z.string()).optional(),
    additionalProperties: z.union([z.boolean(), serverLogicSchemaObjectSchema]).optional(),
    minimum: z.number().optional(),
    maximum: z.number().optional(),
    minLength: z.number().optional(),
    maxLength: z.number().optional(),
    pattern: z.string().optional(),
  }),
);

export interface ServerLogicSchemaObject {
  type?: "string" | "number" | "integer" | "boolean" | "object" | "array" | "null";
  format?: string;
  description?: string;
  nullable?: boolean;
  enum?: (string | number | boolean | null)[];
  items?: ServerLogicSchemaObject;
  properties?: Record<string, ServerLogicSchemaObject>;
  required?: string[];
  additionalProperties?: boolean | ServerLogicSchemaObject;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}

export const serverLogicMediaTypeSchema = z.object({
  schema: serverLogicSchemaObjectSchema.optional(),
  example: z.unknown().optional(),
});

export type ServerLogicMediaType = z.infer<typeof serverLogicMediaTypeSchema>;

export const serverLogicResponseSchema = z.object({
  description: z.string().optional(),
  content: z.record(z.string(), serverLogicMediaTypeSchema).optional(),
});

export type ServerLogicResponse = z.infer<typeof serverLogicResponseSchema>;

// --- JSON server logic definitions (what's read from .json files) ---

const jsonBaseFields = {
  description: z.string(),
  parameters: z.array(parameterMetaSchema).optional(),
  response: serverLogicResponseSchema.optional(),
  cache: serverLogicCacheConfigSchema.optional(),
};

export const jsonSqlServerLogicSchema = z.object({
  ...jsonBaseFields,
  type: z.literal("sql").optional(),
  query: z.string(),
  connectionId: z.string(),
});

export type JsonSqlServerLogicDefinition = z.infer<typeof jsonSqlServerLogicSchema>;

export const jsonTypeScriptServerLogicSchema = z.object({
  ...jsonBaseFields,
  type: z.literal("typescript"),
  handlerPath: z.string(),
});

export type JsonTypeScriptServerLogicDefinition = z.infer<typeof jsonTypeScriptServerLogicSchema>;

export const anyJsonServerLogicSchema = z.union([
  jsonTypeScriptServerLogicSchema,
  jsonSqlServerLogicSchema,
]);

export type AnyJsonServerLogicDefinition = z.infer<typeof anyJsonServerLogicSchema>;

// --- Internal server logic definitions (runtime, stored in registry Map) ---

interface BaseServerLogicDefinition {
  description: string;
  parameters: ParameterMeta[];
  response?: ServerLogicResponse;
  cacheConfig?: ServerLogicCacheConfig;
  handler: (params: Record<string, unknown>) => Promise<unknown> | unknown;
}

export interface SqlServerLogicDefinition extends BaseServerLogicDefinition {
  connectionId: string;
  _query: string;
  _isTypescript?: false;
  _tsHandlerPath?: undefined;
}

export interface TypeScriptServerLogicDefinition extends BaseServerLogicDefinition {
  _isTypescript: true;
  _tsHandlerPath: string;
  connectionId?: undefined;
  _query?: undefined;
}

export type ServerLogicDefinition = SqlServerLogicDefinition | TypeScriptServerLogicDefinition;

// --- Metadata (returned by API) ---

interface BaseServerLogicMeta {
  slug: string;
  description: string;
  parameters: ParameterMeta[];
  response?: ServerLogicResponse;
  cache?: ServerLogicCacheConfig;
}

export interface SqlServerLogicMeta extends BaseServerLogicMeta {
  type: "sql";
  connectionId: string;
  query: string;
  handlerPath?: undefined;
}

export interface TypeScriptServerLogicMeta extends BaseServerLogicMeta {
  type: "typescript";
  handlerPath: string;
  connectionId?: undefined;
  query?: undefined;
}

export type ServerLogicMeta = SqlServerLogicMeta | TypeScriptServerLogicMeta;

// --- Backward-compatible re-exports ---

/** @deprecated Use JsonSqlServerLogicDefinition */
export type JsonServerLogicDefinition = JsonSqlServerLogicDefinition;
