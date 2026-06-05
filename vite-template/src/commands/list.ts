import { getChartPresetDescription, listChartPresetNames } from "../chart-presets.js";
import { log } from "../logger.js";
import {
  listTemplateNames,
  loadManifest,
  type TemplateSource,
} from "../manifest.js";

const PREVIEW_BRANCH = "main";

function previewUrls(
  templateName: string,
  source: TemplateSource,
): { image: string; imageSquare: string } {
  const base = `https://raw.githubusercontent.com/squadbase/squadbase-templates/refs/heads/${PREVIEW_BRANCH}/vite-template/${source}`;
  return {
    image: `${base}/${templateName}/preview-wide.png`,
    imageSquare: `${base}/${templateName}/preview-square.png`,
  };
}

export interface ListTemplatesOptions {
  json?: boolean;
  lang?: string;
  ui?: boolean;
}

export function listTemplates(options: ListTemplatesOptions = {}): void {
  const source: TemplateSource = options.ui ? "ui-templates" : "templates";
  const names = listTemplateNames(source);
  const isJa = options.lang === "ja";
  const filtered = names.filter((name) =>
    isJa ? name.endsWith("-ja") : !name.endsWith("-ja"),
  );

  if (options.json) {
    const items: {
      name: string;
      description: string;
      image: string;
      imageSquare: string;
    }[] = [];
    for (const name of filtered) {
      try {
        const manifest = loadManifest(name, source);
        items.push({
          name: manifest.name,
          description: manifest.description,
          ...previewUrls(name, source),
        });
      } catch {
        // skip invalid manifests
      }
    }
    console.log(JSON.stringify(items, null, 2));
    return;
  }

  const heading = options.ui ? "Available UI templates:" : "Available templates:";
  if (filtered.length === 0) {
    log("yellow", options.ui ? "No UI templates available." : "No templates available.");
  } else {
    log("green", heading);
    for (const name of filtered) {
      try {
        const manifest = loadManifest(name, source);
        const urls = previewUrls(name, source);
        log("cyan", `  ${manifest.name} — ${manifest.description}`);
        log("dim", `    image:       ${urls.image}`);
        log("dim", `    imageSquare: ${urls.imageSquare}`);
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
