import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export interface FileEntry {
  src: string;
  // Relative to the *page-scan root* — `index.tsx`, `components/<slug>/x.tsx`.
  // `@squadbase/vantage` v0.3.0 puts that root at `src/` when the directory
  // exists and at the project root otherwise, so the prefix is decided per
  // project at apply time (`resolveDest`), not written here.
  dest: string;
  // `"root"` pins the entry to the project root regardless of layout. Use it
  // for `server/` and `public/`, which are never part of the page scan
  // (`src/server/` is not scanned at all). Defaults to `"page"`.
  scope?: "page" | "root";
  action: "add" | "replace";
  // When false, the file is still copied/applied but excluded from the AI
  // relabel pass. Use for data files (mock data, types) whose dense literals
  // the AI must not edit. Defaults to true (relabeled).
  relabel?: boolean;
}

/**
 * Templates only declare files. Vantage derives routes from the filesystem and
 * the base template's nav from `useRoutes()`, so copying a page file is the
 * whole of "registering" it — there is no route table or nav list to patch.
 */
export interface TemplateManifest {
  name: string;
  description: string;
  version: string;
  files: FileEntry[];
}

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Only UI-pattern templates exist for Vantage today, but the indirection is
 * kept so use-case templates can be added as a second source later.
 */
export type TemplateSource = "ui-templates";

export function getTemplatesDir(source: TemplateSource = "ui-templates"): string {
  return join(__dirname, "..", source);
}

export function getTemplateDir(
  templateName: string,
  source: TemplateSource = "ui-templates",
): string {
  return join(getTemplatesDir(source), templateName);
}

export function listTemplateNames(source: TemplateSource = "ui-templates"): string[] {
  const templatesDir = getTemplatesDir(source);
  if (!existsSync(templatesDir)) {
    return [];
  }
  return readdirSync(templatesDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
}

export function loadManifest(
  templateName: string,
  source: TemplateSource = "ui-templates",
): TemplateManifest {
  const templateDir = getTemplateDir(templateName, source);
  if (!existsSync(templateDir)) {
    throw new Error(`Template "${templateName}" not found.`);
  }

  const manifestPath = join(templateDir, "manifest.json");
  if (!existsSync(manifestPath)) {
    throw new Error(`Template "${templateName}" is missing manifest.json.`);
  }

  const raw = JSON.parse(readFileSync(manifestPath, "utf-8")) as TemplateManifest;

  if (!raw.name || !raw.files || !Array.isArray(raw.files)) {
    throw new Error(`Invalid manifest.json in template "${templateName}".`);
  }

  return raw;
}
