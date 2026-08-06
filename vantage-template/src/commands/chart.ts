import { existsSync } from "node:fs";
import { relative } from "node:path";

import {
  applyChartPreset,
  getChartPresetDescription,
  listChartPresetNames,
} from "../chart-presets.js";
import { log } from "../logger.js";
import { resolveStylesPath } from "../project.js";

export interface ChartCommandOptions {
  dryRun: boolean;
}

export function setChartPreset(presetName: string, options: ChartCommandOptions): void {
  const projectRoot = process.cwd();

  // `styles.css` lives beside the pages, so a `src/` project keeps it there.
  const stylesPath = resolveStylesPath(projectRoot);
  const stylesLabel = relative(projectRoot, stylesPath);
  if (!existsSync(stylesPath)) {
    log("red", `${stylesLabel} not found. Are you in a Squadbase Vantage project?`);
    process.exit(1);
  }

  const available = listChartPresetNames();
  if (!available.includes(presetName)) {
    log("red", `Chart preset "${presetName}" not found.`);
    if (available.length > 0) {
      log("yellow", `Available presets: ${available.join(", ")}`);
    }
    process.exit(1);
  }

  log("green", `Applying chart preset: ${presetName}`);
  const description = getChartPresetDescription(presetName);
  if (description) {
    log("dim", `  ${description}`);
  }

  if (options.dryRun) {
    log("yellow", "(dry run — no files will be changed)");
    const { content } = applyChartPreset(projectRoot, presetName, { dryRun: true });
    log("dim", `\n--- ${stylesLabel} (preview) ---`);
    console.log(content);
    return;
  }

  applyChartPreset(projectRoot, presetName);
  log("cyan", `  updated: ${stylesLabel}`);
  log("green", "\nChart preset applied successfully!");
}
