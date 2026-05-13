import { getChartPresetDescription, listChartPresetNames } from "../chart-presets.js";
import { log } from "../logger.js";
import { listTemplateNames, loadManifest } from "../manifest.js";

export interface ListTemplatesOptions {
  json?: boolean;
  lang?: string;
}

export function listTemplates(options: ListTemplatesOptions = {}): void {
  const names = listTemplateNames();
  const isJa = options.lang === "ja";
  const filtered = names.filter((name) =>
    isJa ? name.endsWith("-ja") : !name.endsWith("-ja"),
  );

  if (options.json) {
    const items: { name: string; description: string }[] = [];
    for (const name of filtered) {
      try {
        const manifest = loadManifest(name);
        items.push({ name: manifest.name, description: manifest.description });
      } catch {
        // skip invalid manifests
      }
    }
    console.log(JSON.stringify(items, null, 2));
    return;
  }

  if (filtered.length === 0) {
    log("yellow", "No templates available.");
  } else {
    log("green", "Available templates:");
    for (const name of filtered) {
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
