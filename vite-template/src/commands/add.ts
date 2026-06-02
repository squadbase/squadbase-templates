import { existsSync } from "node:fs";
import { join } from "node:path";

import { customizeWithAI, type CustomizeOptions } from "../ai/index.js";
import { applyTemplate, type ApplyOptions } from "../apply.js";
import { log } from "../logger.js";
import { getTemplateDir, listTemplateNames, loadManifest } from "../manifest.js";

export interface AddOptions extends ApplyOptions {
  ai?: CustomizeOptions;
}

export async function addTemplate(templateName: string, options: AddOptions): Promise<void> {
  const projectRoot = process.cwd();
  const source = options.source ?? "templates";

  // Validate this is a Squadbase Vite project
  const routesPath = join(projectRoot, "src", "routes.tsx");
  if (!existsSync(routesPath)) {
    log("red", "src/routes.tsx not found. Are you in a Squadbase Vite project?");
    process.exit(1);
  }

  // Validate template exists
  const available = listTemplateNames(source);
  if (!available.includes(templateName)) {
    log("red", `Template "${templateName}" not found in ${source}/.`);
    if (available.length > 0) {
      log("yellow", `Available templates: ${available.join(", ")}`);
    }
    process.exit(1);
  }

  const manifest = loadManifest(templateName, source);
  const templateDir = getTemplateDir(templateName, source);

  if (!options.ai?.json) {
    log("green", `Applying template: ${manifest.name}`);
    if (options.dryRun) {
      log("yellow", "(dry run — no files will be changed)");
    }
  }

  applyTemplate(projectRoot, manifest, options);

  if (options.ai) {
    const result = await customizeWithAI(projectRoot, manifest, templateDir, options.ai);

    if (options.ai.json) {
      console.log(
        JSON.stringify(
          {
            provider: result.provider,
            model: result.model,
            edits: result.edits.map((e) => ({
              path: e.path,
              rationale: e.rationale,
              added: e.added,
              removed: e.removed,
            })),
            unchanged: result.unchanged,
            skipped: result.skipped,
            failedVerification: result.failedVerification,
            aiError: result.aiError,
            notes: result.notes,
            dryRun: options.dryRun,
          },
          null,
          2,
        ),
      );
      return;
    }

    log("green", `\nAI customization complete (${result.provider}:${result.model})`);
    log("dim", `  edited: ${result.edits.length}, unchanged: ${result.unchanged.length}, skipped: ${result.skipped.length}, failed: ${result.failedVerification.length}, aiError: ${result.aiError.length}`);
    if (result.skipped.length > 0) {
      log("yellow", `  skipped paths (not in manifest): ${result.skipped.join(", ")}`);
    }
    if (result.failedVerification.length > 0) {
      log("yellow", `  failed verification (left unchanged): ${result.failedVerification.join(", ")}`);
    }
    if (result.aiError.length > 0) {
      log("yellow", `  AI call failed (left unchanged): ${result.aiError.join(", ")}`);
    }
    if (result.notes) {
      log("cyan", `\nNotes from AI:`);
      log("dim", `  ${result.notes}`);
    }
    if (!options.dryRun && result.edits.length > 0) {
      log("dim", `\nRun "git diff" to review the AI changes.`);
    }
    return;
  }

  if (!options.dryRun) {
    log("green", "\nTemplate applied successfully!");
  }
}
