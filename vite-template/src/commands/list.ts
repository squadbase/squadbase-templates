import { getChartPresetDescription, listChartPresetNames } from "../chart-presets.js";
import { log } from "../logger.js";
import { listTemplateNames, loadManifest } from "../manifest.js";

export function listTemplates(): void {
  const names = listTemplateNames();

  if (names.length === 0) {
    log("yellow", "No templates available.");
  } else {
    log("green", "Available templates:");
    for (const name of names) {
      try {
        const manifest = loadManifest(name);
        log("cyan", `  ${manifest.name} — ${manifest.description}`);
      } catch {
        log("dim", `  ${name} (invalid manifest)`);
      }
    }
  }

  const presets = listChartPresetNames();
  if (presets.length > 0) {
    log("green", "\nAvailable chart presets:");
    for (const name of presets) {
      const description = getChartPresetDescription(name);
      if (description) {
        log("cyan", `  ${name} — ${description}`);
      } else {
        log("cyan", `  ${name}`);
      }
    }
  }
}
