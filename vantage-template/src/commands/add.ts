import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { customizeWithAI, type CustomizeOptions } from "../ai/index.js";
import { applyTemplate, type ApplyOptions } from "../apply.js";
import { log } from "../logger.js";
import {
  getTemplateDir,
  listTemplateNames,
  loadManifest,
  type TemplateSource,
} from "../manifest.js";
import { findSplitLayoutFiles, resolveDest, resolvePagePrefix } from "../project.js";

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

/**
 * Templates follow whichever layout the project already uses — `resolveDest`
 * puts pages under `src/` when it exists and at the project root otherwise. The
 * one case we cannot follow is a project with pages on *both* sides: Vantage
 * scans only `src/`, so the root files are already dead and `vantage check`
 * reports `SRC_DIR_SPLIT`. Writing a template on top would bury the problem
 * under a working-looking page, so stop and name the files that have to move.
 *
 * An empty project (no `src/`, no root pages) is fine: applying a template
 * creates `src/` and that becomes the page root.
 */
function refuseSplitLayout(projectRoot: string): void {
  const rootPages = findSplitLayoutFiles(projectRoot);
  if (rootPages.length === 0) return;

  log("red", "This project has pages both in src/ and at the project root.");
  log("yellow", "  Vantage scans only src/ once it exists. Move these into src/, then re-run:");
  for (const name of rootPages) log("dim", `    ${name}`);
  log("dim", "  Any components/ hooks/ lib/ directories holding page code move with them.");
  log("dim", "  server/ and public/ stay at the project root.");
  log("dim", "  Leaving both sides in place fails `vantage check` with SRC_DIR_SPLIT.");
  process.exit(1);
}

/**
 * Files a *previously applied* template left behind.
 *
 * `apply` only ever copies, and every template overwrites `src/index.tsx`, so
 * switching templates orphans the earlier one's `src/components/<slug>/` and
 * `server/api/*` files: nothing imports them, `vantage check` is happy, and an
 * agent reading the project has to work out that they are dead. Reporting them
 * is enough — deleting files the user may have edited is not ours to decide.
 */
function findStaleTemplateFiles(
  projectRoot: string,
  appliedTemplate: string,
  source: TemplateSource,
  pagePrefix: string,
): string[] {
  const stale: string[] = [];
  for (const name of listTemplateNames(source)) {
    // EN/JA pairs share every dest, so the counterpart is not leftovers.
    if (name === appliedTemplate) continue;
    if (name.replace(/-ja$/, "") === appliedTemplate.replace(/-ja$/, "")) continue;

    let manifest;
    try {
      manifest = loadManifest(name, source);
    } catch {
      continue;
    }
    for (const file of manifest.files) {
      if (file.action !== "add") continue;
      const dest = resolveDest(file, pagePrefix);
      if (existsSync(join(projectRoot, dest))) stale.push(dest);
    }
  }
  return [...new Set(stale)].sort();
}

export async function addTemplate(templateName: string, options: AddOptions): Promise<void> {
  const projectRoot = process.cwd();
  const source = options.source ?? "ui-templates";

  if (!isVantageProject(projectRoot)) {
    log("red", "@squadbase/vantage is not a dependency here. Are you in a Squadbase Vantage project?");
    log("dim", "Run 'npx @squadbase/vantage-template init' first.");
    process.exit(1);
  }

  refuseSplitLayout(projectRoot);

  // Resolved once, before anything is written: applying a template can create
  // `src/`, and every dest reported afterwards has to name where files actually
  // went, not where a re-detection would put them.
  const pagePrefix = resolvePagePrefix(projectRoot);

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

    // The entry page is declared `replace`, so it is not treated as a conflict
    // and goes even without --force. Say so before it happens.
    const entry = manifest.files.find((f) => f.action === "replace");
    const entryDest = entry ? resolveDest(entry, pagePrefix) : undefined;
    if (entryDest && existsSync(join(projectRoot, entryDest))) {
      log("yellow", `  ${entryDest} will be overwritten — commit first if it holds your work.`);
    }
  }

  applyTemplate(projectRoot, manifest, options);

  if (!options.ai?.json) {
    const stale = findStaleTemplateFiles(projectRoot, templateName, source, pagePrefix);
    if (stale.length > 0) {
      log("yellow", "\nLeftovers from a previously applied template (nothing imports them):");
      for (const dest of stale) log("dim", `  ${dest}`);
      log("dim", "  Delete them so they stop showing up in searches.");
    }
  }

  if (options.ai) {
    const result = await customizeWithAI(
      projectRoot,
      manifest,
      templateDir,
      options.ai,
      pagePrefix,
    );

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
