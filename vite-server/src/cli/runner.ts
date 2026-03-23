import { pathToFileURL } from "node:url";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { getQuery } from "../connector-client/index.ts";
import { applyDefaults } from "../registry.ts";
import { anyJsonServerLogicSchema } from "../types/server-logic.ts";
import type {
  AnyJsonServerLogicDefinition,
  JsonSqlServerLogicDefinition,
} from "../types/server-logic.ts";

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

async function runSqlServerLogic(
  slug: string,
  def: JsonSqlServerLogicDefinition,
  params: Record<string, unknown>,
  limit: number,
): Promise<RunResult> {
  const start = Date.now();
  try {
    const query = await getQuery(def.connectionId);
    const namedParams = applyDefaults(def.parameters ?? [], params);
    const result = await query(def.query, namedParams);
    const rows = result.rows.slice(0, limit);

    return {
      slug,
      rows,
      rowCount: result.rows.length,
      durationMs: Date.now() - start,
      query: def.query,
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

async function runTypescriptServerLogic(
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

export async function runServerLogic(
  slug: string,
  dirPath: string,
  params: Record<string, unknown>,
  limit: number,
): Promise<RunResult> {
  const jsonPath = path.join(dirPath, `${slug}.json`);
  let def: AnyJsonServerLogicDefinition;
  try {
    const raw = await readFile(jsonPath, "utf-8");
    const parsed = anyJsonServerLogicSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      return {
        slug,
        rows: [],
        rowCount: 0,
        durationMs: 0,
        error: new Error(`Invalid server logic definition: ${parsed.error.message}`),
      };
    }
    def = parsed.data;
  } catch {
    return {
      slug,
      rows: [],
      rowCount: 0,
      durationMs: 0,
      error: new Error(`Server logic not found: ${jsonPath}`),
    };
  }

  if (def.type === "typescript") {
    const absolutePath = path.resolve(dirPath, def.handlerPath);
    return runTypescriptServerLogic(slug, absolutePath, params);
  }

  return runSqlServerLogic(slug, def as JsonSqlServerLogicDefinition, params, limit);
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
  return Promise.all(slugs.map((slug) => runServerLogic(slug, dirPath, params, limit)));
}
