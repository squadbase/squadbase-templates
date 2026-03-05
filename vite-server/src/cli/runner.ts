import { pathToFileURL } from "node:url";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { getClient } from "../connector-client/index.ts";
import { buildQuery } from "../registry.ts";
import type {
  AnyJsonDataSourceDefinition,
  JsonDataSourceDefinition,
  ParameterMeta,
} from "../types/data-source.ts";

export interface RunResult {
  slug: string;
  rows: Record<string, unknown>[];
  rowCount: number;
  durationMs: number;
  query?: string;
  queryValues?: unknown[];
  error?: Error;
}

function createStubContext(params: Record<string, unknown>): import("hono").Context {
  const stub = {
    req: {
      json: () => Promise.resolve(params),
      query: (name?: string) => {
        if (name === undefined) {
          return Object.fromEntries(
            Object.entries(params).map(([k, v]) => [k, String(v)]),
          );
        }
        const v = params[name];
        return v !== undefined ? String(v) : "";
      },
      param: (_name?: string) => undefined,
      header: (_name?: string) => undefined,
      raw: new Request("http://localhost/cli"),
    },
    json: (data: unknown) => data,
    text: (data: string) => data,
    body: (data: unknown) => data,
    env: {},
    var: {},
    get: (_key: string) => undefined,
    set: () => {},
  };
  return stub as unknown as import("hono").Context;
}

async function runSqlDataSource(
  slug: string,
  def: JsonDataSourceDefinition,
  params: Record<string, unknown>,
  limit: number,
): Promise<RunResult> {
  const start = Date.now();
  try {
    const client = await getClient(def.connectorSlug, def.connectorType);
    const isExternal =
      def.connectorType === "snowflake" || def.connectorType === "bigquery";

    let queryText: string;
    let queryValues: unknown[];

    if (isExternal) {
      const defaults = new Map(
        (def.parameters ?? []).map((p: ParameterMeta) => [p.name, p.default ?? null]),
      );
      queryText = def.query.replace(/\{\{(\w+)\}\}/g, (_match, name: string) => {
        const value = Object.prototype.hasOwnProperty.call(params, name)
          ? params[name]
          : (defaults.get(name) ?? "");
        if (typeof value === "string") return `'${value.replace(/'/g, "''")}'`;
        if (value === null || value === undefined) return "NULL";
        return String(value);
      });
      queryValues = [];
    } else {
      const built = buildQuery(def.query, def.parameters ?? [], params);
      queryText = built.text;
      queryValues = built.values;
    }

    const result = await client.query(queryText, queryValues);
    const rows = result.rows.slice(0, limit);

    return {
      slug,
      rows,
      rowCount: result.rows.length,
      durationMs: Date.now() - start,
      query: queryText,
      queryValues,
    };
  } catch (error) {
    return {
      slug,
      rows: [],
      rowCount: 0,
      durationMs: Date.now() - start,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

async function runTypescriptDataSource(
  slug: string,
  handlerPath: string,
  params: Record<string, unknown>,
): Promise<RunResult> {
  const start = Date.now();
  try {
    const mod = (await import(pathToFileURL(handlerPath).href)) as Record<string, unknown>;
    const handler = mod.default;
    if (typeof handler !== "function") {
      throw new Error(`Handler must export a default function: ${handlerPath}`);
    }

    const ctx = createStubContext(params);
    const raw = await (handler as (c: import("hono").Context) => Promise<unknown>)(ctx);

    let rows: Record<string, unknown>[];
    if (Array.isArray(raw)) {
      rows = raw as Record<string, unknown>[];
    } else if (raw !== null && typeof raw === "object") {
      rows = [raw as Record<string, unknown>];
    } else {
      rows = [{ result: raw }];
    }

    return {
      slug,
      rows,
      rowCount: rows.length,
      durationMs: Date.now() - start,
    };
  } catch (error) {
    return {
      slug,
      rows: [],
      rowCount: 0,
      durationMs: Date.now() - start,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

export async function runDataSource(
  slug: string,
  dirPath: string,
  params: Record<string, unknown>,
  limit: number,
): Promise<RunResult> {
  const jsonPath = path.join(dirPath, `${slug}.json`);
  let def: AnyJsonDataSourceDefinition;
  try {
    const raw = await readFile(jsonPath, "utf-8");
    def = JSON.parse(raw) as AnyJsonDataSourceDefinition;
  } catch {
    return {
      slug,
      rows: [],
      rowCount: 0,
      durationMs: 0,
      error: new Error(`Data source not found: ${jsonPath}`),
    };
  }

  if (def.type === "typescript") {
    const absolutePath = path.resolve(dirPath, def.handlerPath);
    return runTypescriptDataSource(slug, absolutePath, params);
  }

  return runSqlDataSource(slug, def as JsonDataSourceDefinition, params, limit);
}

export async function listSlugs(dirPath: string): Promise<string[]> {
  try {
    const files = await readdir(dirPath);
    return files
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(/\.json$/, ""));
  } catch {
    return [];
  }
}

export async function runAll(
  dirPath: string,
  params: Record<string, unknown>,
  limit: number,
): Promise<RunResult[]> {
  const slugs = await listSlugs(dirPath);
  return Promise.all(slugs.map((slug) => runDataSource(slug, dirPath, params, limit)));
}
