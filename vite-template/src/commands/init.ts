import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { applyChartPreset, listChartPresetNames } from "../chart-presets.js";
import { log } from "../logger.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

function getBaseTemplateDir(): string {
  return join(__dirname, "..", "base-template");
}

export function initProject(options: {
  force: boolean;
  skipInstall: boolean;
  chart?: string;
}): void {
  const targetDir = process.cwd();
  const baseTemplateDir = getBaseTemplateDir();

  if (!existsSync(baseTemplateDir)) {
    log("red", "Base template not found. The package may be corrupted.");
    process.exit(1);
  }

  if (options.chart) {
    const available = listChartPresetNames();
    if (!available.includes(options.chart)) {
      log("red", `Chart preset "${options.chart}" not found.`);
      if (available.length > 0) {
        log("yellow", `Available presets: ${available.join(", ")}`);
      }
      process.exit(1);
    }
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

  if (options.chart) {
    applyChartPreset(targetDir, options.chart);
    log("cyan", `  chart preset: ${options.chart}`);
  }

  if (options.skipInstall) {
    log("green", "\nProject initialized successfully!");
    log("dim", "\nNext steps:");
    log("dim", "  npm install");
    log("dim", "  npm run dev");
    return;
  }

  log("green", "\nInstalling dependencies...");
  const install = spawnSync("npm", ["install"], {
    cwd: targetDir,
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  if (install.error || install.status !== 0) {
    log("red", "\nDependency installation failed.");
    log("yellow", "Run 'npm install' manually in the project directory.");
    process.exit(1);
  }

  log("green", "\nProject initialized successfully!");
  log("dim", "\nNext steps:");
  log("dim", "  npm run dev");
}
