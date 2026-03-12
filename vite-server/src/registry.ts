import { readdir, readFile, mkdir } from "node:fs/promises";
import { watch as fsWatch } from "node:fs";
import path from "node:path";
import { getQuery } from "./connector-client/index.ts";
import { anyJsonDataSourceSchema } from "./types/data-source.ts";
import type {
  DataSourceDefinition,
  DataSourceMeta,
  JsonSqlDataSourceDefinition,
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

export function applyDefaults(
  parameterMeta: ParameterMeta[],
  runtimeParams: Record<string, unknown>,
): Record<string, unknown> {
  const defaults = new Map(
    parameterMeta.map((p) => [p.name, p.default ?? null]),
  );
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(runtimeParams)) {
    result[key] = value;
  }
  for (const [key, defaultVal] of defaults) {
    if (!(key in result)) {
      result[key] = defaultVal;
    }
  }
  return result;
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
      const parsed = anyJsonDataSourceSchema.safeParse(JSON.parse(raw));

      if (!parsed.success) {
        console.warn(`[registry] Skipping ${file}: ${parsed.error.message}`);
        return;
      }

      const def = parsed.data;

      if (def.type === "typescript") {
        // TypeScript function data source
        const absoluteHandlerPath = validateHandlerPath(dirPath, def.handlerPath);

        const dataSourceDef: DataSourceDefinition = {
          description: def.description,
          parameters: def.parameters ?? [],
          response: def.response,
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
        // SQL data source
        const sqlDef = def as JsonSqlDataSourceDefinition;

        const dataSourceDef: DataSourceDefinition = {
          description: sqlDef.description,
          parameters: sqlDef.parameters ?? [],
          response: sqlDef.response,
          connectionId: sqlDef.connectionId,
          cacheConfig: sqlDef.cache,
          _query: sqlDef.query,
          handler: async (runtimeParams: Record<string, unknown>) => {
            const query = await getQuery(sqlDef.connectionId);
            const namedParams = applyDefaults(
              sqlDef.parameters ?? [],
              runtimeParams,
            );
            const result = await query(sqlDef.query, namedParams);
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
  const base = {
    slug,
    description: def.description,
    parameters: def.parameters,
    response: def.response,
    cache: def.cacheConfig,
  };

  if (def._isTypescript) {
    return {
      ...base,
      type: "typescript" as const,
      handlerPath: path.relative(currentDirPath, def._tsHandlerPath),
    };
  }

  return {
    ...base,
    type: "sql" as const,
    connectionId: def.connectionId,
    query: def._query,
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
