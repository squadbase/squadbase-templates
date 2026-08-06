import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, posix } from "node:path";

import { log } from "./logger.js";
import type { FileEntry, TemplateManifest, TemplateSource } from "./manifest.js";
import { getTemplateDir } from "./manifest.js";
import { AUTHORED_PAGE_PREFIX, authoredDest, resolveDest, resolvePagePrefix } from "./project.js";

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
  const pagePrefix = resolvePagePrefix(projectRoot);

  // Check for conflicts before making any changes
  const conflicts = checkConflicts(projectRoot, manifest.files, pagePrefix, options.force);
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
    const destRel = resolveDest(file, pagePrefix);
    const dest = join(projectRoot, destRel);

    if (options.dryRun) {
      const label = file.action === "replace" ? "replace" : "add";
      log("dim", `  [dry-run] ${label}: ${destRel}`);
      continue;
    }

    mkdirSync(dirname(dest), { recursive: true });

    const authored = isRewritable(file.src) ? readFileSync(src, "utf-8") : null;
    const retargeted = authored === null ? null : retargetRelativeImports(authored, file, pagePrefix);
    if (retargeted === null) {
      copyFileSync(src, dest);
    } else {
      writeFileSync(dest, retargeted, "utf-8");
    }

    const label = file.action === "replace" ? "replaced" : "added";
    const note = retargeted !== null && retargeted !== authored ? " (imports retargeted)" : "";
    log("cyan", `  ${label}: ${destRel}${note}`);
  }
}

function checkConflicts(
  projectRoot: string,
  files: FileEntry[],
  pagePrefix: string,
  force: boolean,
): string[] {
  if (force) return [];

  return files
    .filter((f) => f.action === "add")
    .map((f) => resolveDest(f, pagePrefix))
    .filter((dest) => existsSync(join(projectRoot, dest)));
}

const REWRITABLE_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".mts", ".mjs", ".cts", ".cjs"];

function isRewritable(srcPath: string): boolean {
  return REWRITABLE_EXTENSIONS.some((ext) => srcPath.endsWith(ext));
}

// `from "…"`, bare `import "…"`, `import("…")` and `require("…")`, restricted to
// relative specifiers — package subpaths (`@squadbase/vantage/ui`) never move.
const RELATIVE_SPECIFIER =
  /(\bfrom\s*|\bimport\s*\(\s*|\brequire\s*\(\s*|\bimport\s+)(["'])(\.{1,2}\/[^"']*)\2/g;

/**
 * Rewrite relative specifiers that cross the page-scan root.
 *
 * Templates are authored against the `src/` layout, so `server/api/x.ts` reaches
 * a shared type at `../../src/lib/<slug>/types`. Applied to a project that keeps
 * its pages at the project root, that path has to become `../../lib/<slug>/types`
 * — the file it points at moved, the file doing the importing may have moved too.
 * Recomputing the specifier from both endpoints handles either case, including
 * pages importing out to `server/`.
 *
 * Specifiers that stay on one side of the boundary come out byte-identical.
 */
function retargetRelativeImports(source: string, entry: FileEntry, pagePrefix: string): string {
  if (pagePrefix === AUTHORED_PAGE_PREFIX) return source;

  const fromAuthored = posix.dirname(authoredDest(entry));
  const fromActual = posix.dirname(resolveDest(entry, pagePrefix));

  return source.replace(RELATIVE_SPECIFIER, (match, head: string, quote: string, spec: string) => {
    const authoredTarget = posix.normalize(posix.join(fromAuthored, spec));
    const actualTarget = retargetPath(authoredTarget, pagePrefix);
    if (actualTarget === authoredTarget && fromActual === fromAuthored) return match;

    let next = posix.relative(fromActual, actualTarget);
    if (!next.startsWith(".")) next = `./${next}`;
    return `${head}${quote}${next}${quote}`;
  });
}

/** Move a project-root-relative path from the authored layout into this project's. */
function retargetPath(authoredPath: string, pagePrefix: string): string {
  if (!authoredPath.startsWith(AUTHORED_PAGE_PREFIX)) return authoredPath;
  return pagePrefix + authoredPath.slice(AUTHORED_PAGE_PREFIX.length);
}
