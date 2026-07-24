import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export interface FileEntry {
  src: string;
  dest: string;
  action: "add" | "replace";
  // When false, the file is still copied/applied but excluded from the AI
  // relabel pass. Use for data files (mock data, types) whose dense literals
  // the AI must not edit. Defaults to true (relabeled).
  relabel?: boolean;
}

/**
 * A navigation entry to append to `lib/navigation.ts`.
 *
 * Vantage derives routes from the filesystem, so — unlike the Vite template —
 * there is no route table to patch. What a template *can* contribute is the
 * label/order/icon of the page in the app shell nav.
 */
export interface NavEntry {
  label: string;
  href: string;
  /** A `lucide-react` icon name, e.g. "BarChart3". Omitted entries render without an icon. */
  icon?: string;
}

export interface TemplateManifest {
  name: string;
  description: string;
  version: string;
  files: FileEntry[];
  nav?: NavEntry[];
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
