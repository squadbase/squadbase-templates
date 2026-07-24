import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { customizeWithAI, type CustomizeOptions } from "../ai/index.js";
import { applyTemplate, type ApplyOptions } from "../apply.js";
import { log } from "../logger.js";
import { getTemplateDir, listTemplateNames, loadManifest } from "../manifest.js";

export interface AddOptions extends ApplyOptions {
  ai?: CustomizeOptions;
}

/**
 * A Vantage project has no route table to look for, so identify it by its
 * dependency on the framework — that is the one thing every Vantage app has and
 * no other Squadbase template does.
 */
function isVantageProject(projectRoot: string): boolean {
  const pkgPath = join(projectRoot, "package.json");
  if (!existsSync(pkgPath)) return false;
  try {
    const pkg = JSON.parse(readFileSync(pkgPath, "utf-8")) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    return Boolean(pkg.dependencies?.["@squadbase/vantage"] ?? pkg.devDependencies?.["@squadbase/vantage"]);
  } catch {
    return false;
  }
}

export async function addTemplate(templateName: string, options: AddOptions): Promise<void> {
  const projectRoot = process.cwd();
  const source = options.source ?? "ui-templates";

  if (!isVantageProject(projectRoot)) {
    log("red", "@squadbase/vantage is not a dependency here. Are you in a Squadbase Vantage project?");
    log("dim", "Run 'npx @squadbase/vantage-template init' first.");
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
    log(
      "dim",
      `  edited: ${result.edits.length}, unchanged: ${result.unchanged.length}, skipped: ${result.skipped.length}, failed: ${result.failedVerification.length}, aiError: ${result.aiError.length}`,
    );
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
    log("dim", 'Run "npx vantage check" to confirm the project still builds.');
  }
}
