import { readdir, readFile, mkdir } from "node:fs/promises";
import { watch as fsWatch } from "node:fs";
import path from "node:path";
import { getClient } from "./connector-client/index.ts";
import type {
  AnyJsonDataSourceDefinition,
  DataSourceDefinition,
  DataSourceMeta,
  JsonDataSourceDefinition,
  ParameterMeta,
} from "./types/data-source.ts";

const dataSources = new Map<string, DataSourceDefinition>();
let currentDirPath: string = "";

let viteServer: import("vite").ViteDevServer | null = null;

export function setViteServer(server: import("vite").ViteDevServer): void {
  viteServer = server;
}

function validateHandlerPath(dirPath: string, handlerPath: string): string {
  const absolute = path.resolve(dirPath, handlerPath);
  const normalizedDir = path.resolve(dirPath);
  if (!absolute.startsWith(normalizedDir + path.sep)) {
    throw new Error(`Handler path escapes data-source directory: ${handlerPath}`);
  }
  if (!absolute.endsWith(".ts")) {
    throw new Error(`Handler must be a .ts file: ${handlerPath}`);
  }
  return absolute;
}

export async function loadTypeScriptHandler(
  absolutePath: string,
): Promise<(c: import("hono").Context) => Promise<unknown>> {
  let mod: Record<string, unknown>;

  if (viteServer) {
    // Development: invalidate module cache and reload (HMR support)
    const module = viteServer.moduleGraph.getModuleById(absolutePath);
    if (module) viteServer.moduleGraph.invalidateModule(module);
    mod = (await viteServer.ssrLoadModule(absolutePath)) as Record<string, unknown>;
  } else {
    // Production: standard ES dynamic import (expects pre-built JS)
    const { pathToFileURL } = await import("node:url");
    mod = (await import(pathToFileURL(absolutePath).href)) as Record<string, unknown>;
  }

  const handler = mod.default;
  if (typeof handler !== "function") {
    throw new Error(`Handler must export a default function: ${absolutePath}`);
  }
  return handler as (c: import("hono").Context) => Promise<unknown>;
}

export function buildQuery(
  queryTemplate: string,
  parameterMeta: ParameterMeta[],
  runtimeParams: Record<string, unknown>,
): { text: string; values: unknown[] } {
  const defaults = new Map(
    parameterMeta.map((p) => [p.name, p.default ?? null]),
  );
  const placeholderToIndex = new Map<string, number>();
  const values: unknown[] = [];

  const text = queryTemplate.replace(
    /\{\{(\w+)\}\}/g,
    (_match, name: string) => {
      if (!placeholderToIndex.has(name)) {
        const value = Object.prototype.hasOwnProperty.call(runtimeParams, name)
          ? runtimeParams[name]
          : (defaults.get(name) ?? null);
        values.push(value);
        placeholderToIndex.set(name, values.length);
      }
      return `$${placeholderToIndex.get(name)}`;
    },
  );

  return { text, values };
}

const defaultDataSourceDir = path.join(process.cwd(), "data-source");

export async function initialize(): Promise<void> {
  console.log(
    `[registry] loading data sources from ${defaultDataSourceDir}...`,
  );
  dataSources.clear();
  const dirPath = process.env.DATA_SOURCE_DIR || defaultDataSourceDir;
  currentDirPath = dirPath;

  // Create directory if it doesn't exist (so the watcher can function)
  await mkdir(dirPath, { recursive: true });
  const files = await readdir(dirPath);

  const jsonFiles = files.filter((f) => f.endsWith(".json"));

  const results = await Promise.allSettled(
    jsonFiles.map(async (file) => {
      const slug = file.replace(/\.json$/, "");
      const raw = await readFile(`${dirPath}/${file}`, "utf-8");
      const def: AnyJsonDataSourceDefinition = JSON.parse(raw);

      if (!def.description) {
        console.warn(`[registry] Skipping ${file}: missing description`);
        return;
      }

      if (!def.connectionId) {
        console.warn(`[registry] Skipping ${file}: missing connectionId`);
        return;
      }

      if (def.type === "typescript") {
        // TypeScript function data source
        if (!def.handlerPath) {
          console.warn(`[registry] Skipping ${file}: missing handlerPath`);
          return;
        }

        const absoluteHandlerPath = validateHandlerPath(dirPath, def.handlerPath);

        const dataSourceDef: DataSourceDefinition = {
          description: def.description,
          parameters: def.parameters ?? [],
          response: def.response,
          connectionId: def.connectionId,
          cacheConfig: def.cache,
          handler: async () => {
            throw new Error("TypeScript handler must be called via _tsHandlerPath");
          },
          _isTypescript: true,
          _tsHandlerPath: absoluteHandlerPath,
        };

        dataSources.set(slug, dataSourceDef);
        console.log(`[registry] registered (typescript): ${slug}`);
      } else {
        // SQL data source (existing logic)
        const sqlDef = def as JsonDataSourceDefinition;

        if (!sqlDef.query) {
          console.warn(`[registry] Skipping ${file}: missing query`);
          return;
        }

        const dataSourceDef: DataSourceDefinition = {
          description: sqlDef.description,
          parameters: sqlDef.parameters ?? [],
          response: sqlDef.response,
          connectionId: sqlDef.connectionId,
          cacheConfig: sqlDef.cache,
          _query: sqlDef.query,
          handler: async (runtimeParams: Record<string, unknown>) => {
            const { client, connectorSlug } = await getClient(sqlDef.connectionId);

            // Connectors that do not support parameterized queries
            const isLiteralConnector =
              connectorSlug === "snowflake" ||
              connectorSlug === "bigquery" ||
              connectorSlug === "athena" ||
              connectorSlug === "redshift" ||
              connectorSlug === "databricks";

            let queryText: string;
            let queryValues: unknown[];

            if (isLiteralConnector) {
              // Replace {{paramName}} with literal values (parameter binding not supported)
              const defaults = new Map(
                (sqlDef.parameters ?? []).map((p) => [p.name, p.default ?? null]),
              );
              queryText = sqlDef.query.replace(
                /\{\{(\w+)\}\}/g,
                (_match, name: string) => {
                  const value = Object.prototype.hasOwnProperty.call(
                    runtimeParams,
                    name,
                  )
                    ? runtimeParams[name]
                    : (defaults.get(name) ?? "");
                  if (typeof value === "string")
                    return `'${value.replace(/'/g, "''")}'`;
                  if (value === null || value === undefined) return "NULL";
                  return String(value);
                },
              );
              queryValues = [];
            } else if (connectorSlug === "mysql") {
              // MySQL: use ? style parameter binding
              const built = buildQuery(
                sqlDef.query,
                sqlDef.parameters ?? [],
                runtimeParams,
              );
              queryText = built.text.replace(/\$(\d+)/g, "?");
              queryValues = built.values;
            } else {
              // PostgreSQL/squadbase-db: $1, $2 parameter binding (existing logic)
              const built = buildQuery(
                sqlDef.query,
                sqlDef.parameters ?? [],
                runtimeParams,
              );
              queryText = built.text;
              queryValues = built.values;
            }

            const result = await client.query(queryText, queryValues);
            return result.rows;
          },
        };

        dataSources.set(slug, dataSourceDef);
        console.log(`[registry] registered: ${slug}`);
      }
    }),
  );

  results.forEach((result, i) => {
    if (result.status === "rejected") {
      console.error(
        `[registry] Failed to load ${jsonFiles[i]}:`,
        result.reason,
      );
    }
  });

  console.log(`[registry] ${dataSources.size} data source(s) ready`);
}

let reloadTimer: ReturnType<typeof setTimeout> | null = null;

export function startWatching(): void {
  const dirPath = process.env.DATA_SOURCE_DIR || defaultDataSourceDir;
  try {
    fsWatch(dirPath, { persistent: false }, (_event, filename) => {
      if (!filename?.endsWith(".json") && !filename?.endsWith(".ts")) return;
      if (reloadTimer) clearTimeout(reloadTimer);
      reloadTimer = setTimeout(async () => {
        console.log("[registry] data-source changed, reloading...");
        await initialize();
      }, 300);
    });
    console.log("[registry] watching data-source directory");
  } catch {
    console.warn(
      "[registry] could not watch data-source directory (static load only)",
    );
  }
}

export function getDataSource(slug: string): DataSourceDefinition | undefined {
  return dataSources.get(slug);
}

function buildMeta(slug: string, def: DataSourceDefinition): DataSourceMeta {
  return {
    slug,
    description: def.description,
    type: def._isTypescript ? "typescript" : "sql",
    parameters: def.parameters,
    response: def.response,
    query: def._query,
    connectionId: def.connectionId,
    handlerPath: def._tsHandlerPath
      ? path.relative(currentDirPath, def._tsHandlerPath)
      : undefined,
    cache: def.cacheConfig,
  };
}

export function getAllMeta(): DataSourceMeta[] {
  return Array.from(dataSources.entries()).map(([slug, def]) =>
    buildMeta(slug, def),
  );
}

export function getMeta(slug: string): DataSourceMeta | undefined {
  const def = dataSources.get(slug);
  if (!def) return undefined;
  return buildMeta(slug, def);
}
