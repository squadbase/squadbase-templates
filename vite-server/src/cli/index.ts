#!/usr/bin/env node
import { parseArgs } from "node:util";
import path from "node:path";
import { readFile } from "node:fs/promises";
import { loadEnvFile } from "./env-loader.ts";
import { runDataSource, runAll, listSlugs } from "./runner.ts";
import {
  displayTable,
  displaySummary,
  displayDebug,
  displayJson,
  displayError,
} from "./display.ts";
import type { AnyJsonDataSourceDefinition } from "../types/data-source.ts";

const HELP = `
Usage: squadbase-ds-test [options]

Options:
  --slug <slug>     Run a specific data source
  --all             Run all data sources
  --params k=v,...  Comma-separated key=value parameters
  --env <path>      Path to .env file (default: ../../.env)
  --dir <path>      Data source directory (default: ./data-source)
  --format table|json  Output format (default: table)
  --limit <n>       Max rows to display (default: 50)
  --debug           Show SQL query and parameter values
  --help            Show this help

Examples:
  npx tsx src/cli/index.ts --slug sales-summary
  npx tsx src/cli/index.ts --slug sales-summary --params year=2024,limit=10
  npx tsx src/cli/index.ts --all --format json
  npx tsx src/cli/index.ts  # interactive mode
`;

async function main() {
  const { values } = parseArgs({
    options: {
      slug: { type: "string" },
      all: { type: "boolean", default: false },
      params: { type: "string" },
      env: { type: "string" },
      dir: { type: "string" },
      format: { type: "string", default: "table" },
      limit: { type: "string", default: "50" },
      debug: { type: "boolean", default: false },
      help: { type: "boolean", default: false },
    },
    allowPositionals: false,
  });

  if (values.help) {
    console.log(HELP);
    process.exit(0);
  }

  // Resolve paths
  const cwd = process.cwd();
  const dirPath = values.dir
    ? path.resolve(cwd, values.dir)
    : path.join(cwd, "data-source");
  const envPath = values.env
    ? path.resolve(cwd, values.env)
    : path.join(cwd, "../../.env");
  const limit = parseInt(values.limit ?? "50", 10);
  const format = values.format ?? "table";

  // Load env
  loadEnvFile(envPath);

  // Parse params
  const params: Record<string, unknown> = {};
  if (values.params) {
    for (const pair of values.params.split(",")) {
      const eqIdx = pair.indexOf("=");
      if (eqIdx === -1) continue;
      const key = pair.slice(0, eqIdx).trim();
      const val = pair.slice(eqIdx + 1).trim();
      params[key] = val;
    }
  }

  // Determine mode
  if (values.slug) {
    // Single data source run
    const result = await runDataSource(values.slug, dirPath, params, limit);

    if (format === "json") {
      displayJson([result]);
    } else {
      displaySummary(result);
      if (values.debug) displayDebug(result);
      if (!result.error) displayTable(result.rows, limit);
    }

    if (result.error) process.exit(1);
  } else if (values.all) {
    // Run all data sources
    const results = await runAll(dirPath, params, limit);

    if (format === "json") {
      displayJson(results);
    } else {
      for (const r of results) {
        displaySummary(r);
        if (values.debug) displayDebug(r);
        if (!r.error) displayTable(r.rows, limit);
      }
      const failed = results.filter((r) => r.error).length;
      console.log(`\nTotal: ${results.length}, Failed: ${failed}`);
    }

    const anyFailed = results.some((r) => r.error);
    if (anyFailed) process.exit(1);
  } else {
    // Interactive mode
    const slugs = await listSlugs(dirPath);

    if (slugs.length === 0) {
      displayError(new Error(`No data sources found in ${dirPath}`));
      process.exit(1);
    }

    try {
      const { selectDataSource, inputParameters } = await import("./interactive.ts");

      const slug = await selectDataSource(slugs);
      if (!slug) {
        console.log("Cancelled.");
        process.exit(0);
      }

      // Load parameter definitions for the selected slug
      const jsonPath = path.join(dirPath, `${slug}.json`);
      let paramMeta: import("../types/data-source.ts").ParameterMeta[] = [];
      try {
        const raw = await readFile(jsonPath, "utf-8");
        const def = JSON.parse(raw) as AnyJsonDataSourceDefinition;
        paramMeta = def.parameters ?? [];
      } catch {
        // ignore — run with empty params
      }

      const interactiveParams = await inputParameters(paramMeta);
      const merged = { ...interactiveParams, ...params };

      const result = await runDataSource(slug, dirPath, merged, limit);
      displaySummary(result);
      if (values.debug) displayDebug(result);
      if (!result.error) displayTable(result.rows, limit);

      if (result.error) process.exit(1);
    } catch (err) {
      displayError(err instanceof Error ? err : new Error(String(err)));
      process.exit(1);
    }
  }
}

main().catch((err: unknown) => {
  displayError(err instanceof Error ? err : new Error(String(err)));
  process.exit(1);
});
