import { cpSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { log } from "../logger.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

function getBaseTemplateDir(): string {
  return join(__dirname, "..", "base-template");
}

export function initProject(options: { force: boolean }): void {
  const targetDir = process.cwd();
  const baseTemplateDir = getBaseTemplateDir();

  if (!existsSync(baseTemplateDir)) {
    log("red", "Base template not found. The package may be corrupted.");
    process.exit(1);
  }

  // Check target directory is not already a Squadbase project
  if (!options.force && existsSync(join(targetDir, "squadbase.yml"))) {
    log("red", "This directory already contains a Squadbase project (squadbase.yml exists).");
    log("yellow", "Use --force to overwrite.");
    process.exit(1);
  }

  // Check for existing src/ directory
  if (!options.force && existsSync(join(targetDir, "src"))) {
    log("red", "This directory already contains a src/ directory.");
    log("yellow", "Use --force to overwrite.");
    process.exit(1);
  }

  log("green", "Initializing Squadbase Vite project...");

  // Copy all files from base-template to target
  const entries = readdirSync(baseTemplateDir, { withFileTypes: true });

  for (const entry of entries) {
    const src = join(baseTemplateDir, entry.name);
    const dest = join(targetDir, entry.name);

    if (entry.isDirectory()) {
      mkdirSync(dest, { recursive: true });
      cpSync(src, dest, { recursive: true, force: options.force });
    } else {
      if (!options.force && existsSync(dest)) {
        log("yellow", `  skipped (exists): ${entry.name}`);
        continue;
      }
      cpSync(src, dest);
    }

    log("cyan", `  ${entry.name}`);
  }

  log("green", "\nProject initialized successfully!");
  log("dim", "\nNext steps:");
  log("dim", "  npm install");
  log("dim", "  npm run dev");
}
