import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export interface FileEntry {
  src: string;
  dest: string;
  action: "add" | "replace";
}

export interface RouteEntry {
  name: string;
  path: string;
  title: string;
  page: string;
}

export interface TemplateManifest {
  name: string;
  description: string;
  version: string;
  files: FileEntry[];
  routes: RouteEntry[];
}

const __dirname = dirname(fileURLToPath(import.meta.url));

export function getTemplatesDir(): string {
  return join(__dirname, "..", "templates");
}

export function getTemplateDir(templateName: string): string {
  return join(getTemplatesDir(), templateName);
}

export function listTemplateNames(): string[] {
  const templatesDir = getTemplatesDir();
  if (!existsSync(templatesDir)) {
    return [];
  }
  return readdirSync(templatesDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
}

export function loadManifest(templateName: string): TemplateManifest {
  const templateDir = getTemplateDir(templateName);
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
