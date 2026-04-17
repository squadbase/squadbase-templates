import { existsSync } from "node:fs";
import { join } from "node:path";

import { applyTemplate, type ApplyOptions } from "../apply.js";
import { log } from "../logger.js";
import { listTemplateNames, loadManifest } from "../manifest.js";

export function addTemplate(templateName: string, options: ApplyOptions): void {
  const projectRoot = process.cwd();

  // Validate this is a Squadbase Vite project
  const routesPath = join(projectRoot, "src", "routes.tsx");
  if (!existsSync(routesPath)) {
    log("red", "src/routes.tsx not found. Are you in a Squadbase Vite project?");
    process.exit(1);
  }

  // Validate template exists
  const available = listTemplateNames();
  if (!available.includes(templateName)) {
    log("red", `Template "${templateName}" not found.`);
    if (available.length > 0) {
      log("yellow", `Available templates: ${available.join(", ")}`);
    }
    process.exit(1);
  }

  const manifest = loadManifest(templateName);

  log("green", `Applying template: ${manifest.name}`);
  if (options.dryRun) {
    log("yellow", "(dry run — no files will be changed)");
  }

  applyTemplate(projectRoot, manifest, options);

  if (!options.dryRun) {
    log("green", "\nTemplate applied successfully!");
  }
}
