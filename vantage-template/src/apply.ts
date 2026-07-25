import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

import { log } from "./logger.js";
import type { FileEntry, TemplateManifest, TemplateSource } from "./manifest.js";
import { getTemplateDir } from "./manifest.js";

export interface ApplyOptions {
  force: boolean;
  dryRun: boolean;
  source?: TemplateSource;
}

export function applyTemplate(
  projectRoot: string,
  manifest: TemplateManifest,
  options: ApplyOptions,
): void {
  const templateDir = getTemplateDir(manifest.name, options.source ?? "ui-templates");

  // Check for conflicts before making any changes
  const conflicts = checkConflicts(projectRoot, manifest.files, options.force);
  if (conflicts.length > 0) {
    log("red", "File conflicts detected (use --force to overwrite):");
    for (const c of conflicts) {
      log("red", `  ${c}`);
    }
    process.exit(1);
  }

  // Copy files
  for (const file of manifest.files) {
    const src = join(templateDir, file.src);
    const dest = join(projectRoot, file.dest);

    if (options.dryRun) {
      const label = file.action === "replace" ? "replace" : "add";
      log("dim", `  [dry-run] ${label}: ${file.dest}`);
      continue;
    }

    mkdirSync(dirname(dest), { recursive: true });
    copyFileSync(src, dest);

    const label = file.action === "replace" ? "replaced" : "added";
    log("cyan", `  ${label}: ${file.dest}`);
  }
}

function checkConflicts(projectRoot: string, files: FileEntry[], force: boolean): string[] {
  if (force) return [];

  return files
    .filter((f) => f.action === "add" && existsSync(join(projectRoot, f.dest)))
    .map((f) => f.dest);
}
