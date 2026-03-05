import { readdir, readFile, mkdir } from "node:fs/promises";
import { watch as fsWatch } from "node:fs";
import { fileURLToPath } from "node:url";
import { getClient } from "./connector-client.ts";
import type {
  DataSourceDefinition,
  DataSourceMeta,
  JsonDataSourceDefinition,
  ParameterMeta,
} from "./types/data-source.ts";

const dataSources = new Map<string, DataSourceDefinition>();

function buildQuery(
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

const defaultDataSourceDir = fileURLToPath(
  new URL("./data-source/", import.meta.url),
);

export async function initialize(): Promise<void> {
  console.log(
    `[registry] loading data sources from ${defaultDataSourceDir}...`,
  );
  dataSources.clear();
  const dirPath = process.env.DATA_SOURCE_DIR || defaultDataSourceDir;

  // Create directory if it doesn't exist (so the watcher can function)
  await mkdir(dirPath, { recursive: true });
  const files = await readdir(dirPath);

  const jsonFiles = files.filter((f) => f.endsWith(".json"));

  const results = await Promise.allSettled(
    jsonFiles.map(async (file) => {
      const slug = file.replace(/\.json$/, "");
      const raw = await readFile(`${dirPath}/${file}`, "utf-8");
      const def: JsonDataSourceDefinition = JSON.parse(raw);

      if (!def.description || !def.query) {
        console.warn(
          `[registry] Skipping ${file}: missing description or query`,
        );
        return;
      }

      const dataSourceDef: DataSourceDefinition = {
        description: def.description,
        parameters: def.parameters ?? [],
        schema: def.schema ?? [],
        connectorSlug: def.connectorSlug,
        cacheConfig: def.cache,
        handler: async (runtimeParams: Record<string, unknown>) => {
          const client = await getClient(def.connectorSlug, def.connectorType);

          const isExternalConnector =
            def.connectorType === "snowflake" ||
            def.connectorType === "bigquery";

          let queryText: string;
          let queryValues: unknown[];

          if (isExternalConnector) {
            // Snowflake/BigQuery: replace {{paramName}} with literal values (parameter binding not supported)
            const defaults = new Map(
              (def.parameters ?? []).map((p) => [p.name, p.default ?? null]),
            );
            queryText = def.query.replace(
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
          } else {
            // PostgreSQL: $1, $2 parameter binding (existing logic)
            const built = buildQuery(
              def.query,
              def.parameters ?? [],
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
      if (!filename?.endsWith(".json")) return;
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

export function getAllMeta(): DataSourceMeta[] {
  return Array.from(dataSources.entries()).map(([slug, def]) => ({
    slug,
    description: def.description,
    parameters: def.parameters,
    schema: def.schema,
    connectorSlug: def.connectorSlug,
  }));
}

export function getMeta(slug: string): DataSourceMeta | undefined {
  const def = dataSources.get(slug);
  if (!def) return undefined;
  return {
    slug,
    description: def.description,
    parameters: def.parameters,
    schema: def.schema,
    connectorSlug: def.connectorSlug,
  };
}
