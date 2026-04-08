import { log } from "../logger.js";
import { listTemplateNames, loadManifest } from "../manifest.js";

export function listTemplates(): void {
  const names = listTemplateNames();

  if (names.length === 0) {
    log("yellow", "No templates available.");
    return;
  }

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
