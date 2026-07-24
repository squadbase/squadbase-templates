import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { log } from "./logger.js";
import type { FileEntry, NavEntry, TemplateManifest, TemplateSource } from "./manifest.js";
import { getTemplateDir } from "./manifest.js";

export interface ApplyOptions {
  force: boolean;
  dryRun: boolean;
  source?: TemplateSource;
}

export function applyTemplate(
  projectRoot: string,
  manifest: TemplateManifest,
  options: ApplyOptions,
): void {
  const templateDir = getTemplateDir(manifest.name, options.source ?? "ui-templates");

  // Check for conflicts before making any changes
  const conflicts = checkConflicts(projectRoot, manifest.files, options.force);
  if (conflicts.length > 0) {
    log("red", "File conflicts detected (use --force to overwrite):");
    for (const c of conflicts) {
      log("red", `  ${c}`);
    }
    process.exit(1);
  }

  // Copy files
  for (const file of manifest.files) {
    const src = join(templateDir, file.src);
    const dest = join(projectRoot, file.dest);

    if (options.dryRun) {
      const label = file.action === "replace" ? "replace" : "add";
      log("dim", `  [dry-run] ${label}: ${file.dest}`);
      continue;
    }

    mkdirSync(dirname(dest), { recursive: true });
    copyFileSync(src, dest);

    const label = file.action === "replace" ? "replaced" : "added";
    log("cyan", `  ${label}: ${file.dest}`);
  }

  // Patch lib/navigation.ts
  const nav = manifest.nav ?? [];
  if (nav.length > 0) {
    if (options.dryRun) {
      for (const entry of nav) {
        log("dim", `  [dry-run] add nav: ${entry.label} (${entry.href})`);
      }
    } else {
      patchNavigation(projectRoot, nav);
    }
  }
}

function checkConflicts(projectRoot: string, files: FileEntry[], force: boolean): string[] {
  if (force) return [];

  return files
    .filter((f) => f.action === "add" && existsSync(join(projectRoot, f.dest)))
    .map((f) => f.dest);
}

/**
 * Append nav entries to `lib/navigation.ts`.
 *
 * Like the Vite template's route patching this is string surgery, not an AST
 * rewrite — safe because `navigation.ts` is a fixed-shape file the base
 * template owns. Templates that only replace `index.tsx` (all of the current
 * ui-templates) declare an empty `nav` and never reach here.
 */
function patchNavigation(projectRoot: string, newEntries: NavEntry[]): void {
  const navPath = join(projectRoot, "lib", "navigation.ts");

  if (!existsSync(navPath)) {
    log("yellow", "  lib/navigation.ts not found, skipping nav patching.");
    return;
  }

  let content = readFileSync(navPath, "utf-8");

  const toAdd = newEntries.filter((entry) => !content.includes(`href: "${entry.href}"`));
  if (toAdd.length === 0) {
    log("dim", "  All nav entries already exist in navigation.ts, skipping.");
    return;
  }

  const closingIndex = content.lastIndexOf("]");
  if (closingIndex === -1) {
    log("yellow", "  Could not find the NAV_ITEMS array in navigation.ts, skipping.");
    return;
  }

  // Icons are named imports from lucide-react; add the ones not already there.
  const icons = [...new Set(toAdd.map((e) => e.icon).filter((i): i is string => Boolean(i)))];
  const missingIcons = icons.filter((icon) => !new RegExp(`\\b${icon}\\b`).test(content));
  if (missingIcons.length > 0) {
    content = content.replace(
      /import \{([^}]*)\} from "lucide-react"/,
      (_match, existing: string) =>
        `import {${existing.trimEnd()}, ${missingIcons.join(", ")} } from "lucide-react"`,
    );
  }

  const entries = toAdd
    .map((e) => {
      const icon = e.icon ? `, icon: ${e.icon}` : "";
      return `  { label: ${JSON.stringify(e.label)}, href: ${JSON.stringify(e.href)}${icon} },`;
    })
    .join("\n");

  // Re-locate the closing bracket: the icon import rewrite above may have moved it.
  const insertAt = content.lastIndexOf("]");
  content = content.slice(0, insertAt) + entries + "\n" + content.slice(insertAt);

  writeFileSync(navPath, content, "utf-8");

  for (const entry of toAdd) {
    log("cyan", `  added nav: ${entry.label} (${entry.href})`);
  }
}
