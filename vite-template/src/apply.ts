import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { log } from "./logger.js";
import type { FileEntry, RouteEntry, TemplateManifest } from "./manifest.js";
import { getTemplateDir } from "./manifest.js";

export interface ApplyOptions {
  force: boolean;
  dryRun: boolean;
}

export function applyTemplate(
  projectRoot: string,
  manifest: TemplateManifest,
  options: ApplyOptions,
): void {
  const templateDir = getTemplateDir(manifest.name);

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

  // Patch routes.tsx
  if (manifest.routes.length > 0) {
    if (options.dryRun) {
      for (const route of manifest.routes) {
        log("dim", `  [dry-run] add route: ${route.name} (${route.path})`);
      }
    } else {
      patchRoutes(projectRoot, manifest.routes);
    }
  }
}

function checkConflicts(
  projectRoot: string,
  files: FileEntry[],
  force: boolean,
): string[] {
  if (force) return [];

  return files
    .filter((f) => f.action === "add" && existsSync(join(projectRoot, f.dest)))
    .map((f) => f.dest);
}

function patchRoutes(projectRoot: string, newRoutes: RouteEntry[]): void {
  const routesPath = join(projectRoot, "src", "routes.tsx");

  if (!existsSync(routesPath)) {
    log("yellow", "  src/routes.tsx not found, skipping route patching.");
    return;
  }

  let content = readFileSync(routesPath, "utf-8");

  // Filter out routes that already exist
  const routesToAdd = newRoutes.filter((r) => {
    const namePattern = new RegExp(`name:\\s*["']${r.name}["']`);
    return !namePattern.test(content);
  });

  if (routesToAdd.length === 0) {
    log("dim", "  All routes already exist in routes.tsx, skipping.");
    return;
  }

  // Find the closing of the routes array
  const closingIndex = content.lastIndexOf("];");
  if (closingIndex === -1) {
    log("yellow", "  Could not find routes array closing '];' in routes.tsx, skipping.");
    return;
  }

  // Generate new route entries
  const entries = routesToAdd
    .map(
      (r) =>
        `  {\n    name: "${r.name}",\n    path: "${r.path}",\n    title: "${r.title}",\n    component: lazy(() => import("${r.page}")),\n  },`,
    )
    .join("\n");

  content = content.slice(0, closingIndex) + entries + "\n" + content.slice(closingIndex);

  writeFileSync(routesPath, content, "utf-8");

  for (const route of routesToAdd) {
    log("cyan", `  added route: ${route.name} (${route.path})`);
  }
}
