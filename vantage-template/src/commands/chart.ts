import { existsSync } from "node:fs";
import { join } from "node:path";

import {
  applyChartPreset,
  getChartPresetDescription,
  listChartPresetNames,
} from "../chart-presets.js";
import { log } from "../logger.js";

export interface ChartCommandOptions {
  dryRun: boolean;
}

export function setChartPreset(presetName: string, options: ChartCommandOptions): void {
  const projectRoot = process.cwd();

  const stylesPath = join(projectRoot, "styles.css");
  if (!existsSync(stylesPath)) {
    log("red", "styles.css not found. Are you in a Squadbase Vantage project?");
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
    log("dim", "\n--- styles.css (preview) ---");
    console.log(content);
    return;
  }

  applyChartPreset(projectRoot, presetName);
  log("cyan", "  updated: styles.css");
  log("green", "\nChart preset applied successfully!");
}
