import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, dirname } from "node:path";

const NAMED_EXPORT_RE =
  /^export\s+(?:async\s+)?(?:function|const|let|var|class|type|interface|enum)\s+([A-Za-z_$][\w$]*)/gm;
const REEXPORT_RE = /^export\s+\{([^}]+)\}/gm;

function readSourceSafe(filePath: string): string | null {
  try {
    return readFileSync(filePath, "utf-8");
  } catch {
    return null;
  }
}

function listNamedExports(source: string): string[] {
  const names = new Set<string>();
  let m: RegExpExecArray | null;
  NAMED_EXPORT_RE.lastIndex = 0;
  while ((m = NAMED_EXPORT_RE.exec(source))) {
    names.add(m[1]);
  }
  REEXPORT_RE.lastIndex = 0;
  while ((m = REEXPORT_RE.exec(source))) {
    for (const piece of m[1].split(",")) {
      const cleaned = piece.trim().split(/\s+as\s+/)[0];
      if (cleaned && /^[A-Za-z_$][\w$]*$/.test(cleaned)) names.add(cleaned);
    }
  }
  return [...names].sort();
}

function listDirEntries(dirPath: string): string[] {
  try {
    return readdirSync(dirPath).sort();
  } catch {
    return [];
  }
}

function fileStemsIn(dirPath: string): string[] {
  return listDirEntries(dirPath)
    .filter((f) => /\.(ts|tsx)$/.test(f))
    .map((f) => f.replace(/\.(ts|tsx)$/, ""));
}

function summarizeModuleGroup(
  srcRoot: string,
  subdir: string,
  aliasPrefix: string,
  symbolFilter?: (aliasPath: string) => Set<string> | null,
): string[] {
  const lines: string[] = [];
  const dirPath = join(srcRoot, subdir);
  let entries: string[] = [];
  try {
    entries = readdirSync(dirPath);
  } catch {
    return lines;
  }
  for (const entry of entries.sort()) {
    const full = join(dirPath, entry);
    const isDir = (() => {
      try {
        return statSync(full).isDirectory();
      } catch {
        return false;
      }
    })();
    if (isDir) continue;
    if (!/\.(ts|tsx)$/.test(entry)) continue;
    const stem = entry.replace(/\.(ts|tsx)$/, "");
    const aliasPath = `${aliasPrefix}/${stem}`;
    let allowedSet: Set<string> | null | undefined;
    if (symbolFilter) {
      allowedSet = symbolFilter(aliasPath);
      if (!allowedSet) continue;
    }
    const source = readSourceSafe(full);
    if (!source) continue;
    let names = listNamedExports(source);
    if (allowedSet) {
      names = names.filter((n) => allowedSet.has(n));
    }
    if (names.length === 0) continue;
    lines.push(`- ${aliasPath}: ${names.join(", ")}`);
  }
  return lines;
}

function readJsonSafe(path: string): unknown {
  try {
    return JSON.parse(readFileSync(path, "utf-8"));
  } catch {
    return null;
  }
}

export interface ComponentCatalogOptions {
  baseTemplateDir: string;
  /**
   * Map from `@/...` alias path to the set of named symbols actually imported
   * from that module in the input files. When provided, the catalog filters
   * `@/components/common/*` and `@/components/data/*` to only show modules on
   * this allowlist, AND only lists the specific symbols already imported.
   * Every other Squadbase composable / data component (and every undemonstrated
   * symbol within a demonstrated module) is omitted entirely, so the AI cannot
   * guess at their APIs. `@/components/ui/*` (shadcn primitives) and `@/lib/*`
   * are always listed in full since they are training-known or trivially
   * typed.
   */
  demonstratedImports?: Map<string, Set<string>>;
}

export function buildComponentCatalog(opts: ComponentCatalogOptions): string {
  const srcRoot = join(opts.baseTemplateDir, "src");
  const demo = opts.demonstratedImports;
  const restrict = demo !== undefined;
  const symbolFilter = restrict ? (path: string) => demo.get(path) ?? null : undefined;
  const commonLines = summarizeModuleGroup(srcRoot, "components/common", "@/components/common", symbolFilter);
  const dataLines = summarizeModuleGroup(srcRoot, "components/data", "@/components/data", symbolFilter);
  const uiStems = fileStemsIn(join(srcRoot, "components", "ui"));
  const libLines = summarizeModuleGroup(srcRoot, "lib", "@/lib");

  const pkgJson = readJsonSafe(join(opts.baseTemplateDir, "package.json")) as
    | { dependencies?: Record<string, string> }
    | null;
  const deps = pkgJson?.dependencies ? Object.keys(pkgJson.dependencies).sort() : [];

  const parts: string[] = [];
  parts.push(`<COMPONENT_CATALOG>`);
  parts.push(`# What you may import`);
  parts.push(``);
  if (restrict) {
    parts.push(`## Squadbase composables — ONLY these (already demonstrated in your input files)`);
    if (commonLines.length || dataLines.length) {
      if (commonLines.length) parts.push(...commonLines);
      if (dataLines.length) parts.push(...dataLines);
    } else {
      parts.push(`(none — your input files do not import any @/components/common/* or @/components/data/*)`);
    }
    parts.push(``);
    parts.push(`Any \`@/components/common/*\` or \`@/components/data/*\` module not listed above is OFF-LIMITS. Their APIs are not exposed to you, so you cannot guess. Use plain HTML + Tailwind, or shadcn primitives below, instead.`);
    parts.push(``);
  } else {
    if (commonLines.length) {
      parts.push(`## @/components/common/* (Squadbase composables)`);
      parts.push(...commonLines);
      parts.push(``);
    }
    if (dataLines.length) {
      parts.push(`## @/components/data/* (charts, tables, filters)`);
      parts.push(...dataLines);
      parts.push(``);
    }
  }
  if (uiStems.length) {
    parts.push(`## @/components/ui/* (shadcn primitives — training knowledge is sufficient)`);
    parts.push(`Files: ${uiStems.join(", ")}`);
    parts.push(`Import form: \`import { ComponentName } from "@/components/ui/<file>"\``);
    parts.push(``);
  }
  if (libLines.length) {
    parts.push(`## @/lib/* (utilities, mock data)`);
    parts.push(...libLines);
    parts.push(``);
  }
  if (deps.length) {
    parts.push(`## npm dependencies installed (safe to import)`);
    parts.push(deps.join(", "));
    parts.push(``);
  }
  parts.push(`# Hard constraints`);
  parts.push(`- Do NOT invent module paths. Import only modules listed above or already imported in the input files.`);
  if (restrict) {
    parts.push(`- The "Squadbase composables" section is intentionally narrow: it lists ONLY the @/components/* modules whose usage you can study in the input files. If you need a UI piece (KPI tile, table, chart, date filter, etc.) and it is NOT in that section, you do NOT have its API. Build it with plain HTML elements (\`<div>\`, \`<table>\`, \`<span>\`, etc.) + Tailwind classes, or with shadcn primitives.`);
    parts.push(`- shadcn primitives (\`@/components/ui/*\`) and lib utilities are always available — your training knowledge of shadcn/Radix is the source of truth for them.`);
  }
  parts.push(`- Charts: if no chart wrapper is demonstrated above, render a chart by importing \`echarts-for-react\` directly (it's in the dependency list), or skip the chart and render a styled HTML placeholder. Never import Recharts.`);
  parts.push(`- A simple HTML+Tailwind layout that compiles is strictly better than a fancy component with invented props that fails the build.`);
  parts.push(`</COMPONENT_CATALOG>`);
  return parts.join("\n");
}

export function findBaseTemplateDir(templateDir: string): string | null {
  let dir = templateDir;
  for (let i = 0; i < 6; i++) {
    const candidate = join(dir, "base-template");
    try {
      if (statSync(candidate).isDirectory() && statSync(join(candidate, "src")).isDirectory()) {
        return candidate;
      }
    } catch {
      // continue up
    }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

