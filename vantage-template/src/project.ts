import { existsSync } from "node:fs";
import { join } from "node:path";

import type { FileEntry } from "./manifest.js";

/**
 * Files that only make sense at the page-scan root. Their presence at the
 * project root tells us the project keeps its pages there.
 */
const ROOT_LAYOUT_MARKERS = ["index.tsx", "_layout.tsx", "_404.tsx", "_error.tsx", "styles.css"];

/**
 * The prefix templates are authored against. Every `dest` in a manifest is
 * written relative to the page-scan root, and the templates themselves are
 * written as if that root were `src/` — which is what `dev/` and the base
 * template use.
 */
export const AUTHORED_PAGE_PREFIX = "src/";

/**
 * How the project addresses its page-scan root, as a `dest` prefix: `"src/"`
 * for the nested layout, `""` when pages live at the project root.
 *
 * `@squadbase/vantage` v0.3.0 decides this by looking for `src/` and nothing
 * else — it is not configurable. An empty project gets `src/`, matching the
 * base template.
 *
 * `server/` and `public/` are *not* affected: they always sit at the project
 * root, and `src/server/` is never scanned.
 */
export function resolvePagePrefix(projectRoot: string): string {
  if (existsSync(join(projectRoot, "src"))) return AUTHORED_PAGE_PREFIX;
  return findRootLayoutFiles(projectRoot).length > 0 ? "" : AUTHORED_PAGE_PREFIX;
}

/** Where Vantage scans for pages: `src/` when it exists, the project root otherwise. */
export function resolvePageRoot(projectRoot: string): string {
  return join(projectRoot, resolvePagePrefix(projectRoot));
}

/** `styles.css` is read from the page-scan root, so it follows the same rule. */
export function resolveStylesPath(projectRoot: string): string {
  return join(resolvePageRoot(projectRoot), "styles.css");
}

/**
 * A manifest entry's project-root-relative destination.
 *
 * `scope: "root"` entries (`server/`, `public/`) are already project-root
 * relative and never move. Everything else is relative to the page-scan root,
 * so it picks up whichever prefix this project uses.
 */
export function resolveDest(entry: FileEntry, pagePrefix: string): string {
  return entry.scope === "root" ? entry.dest : pagePrefix + entry.dest;
}

/** Where a manifest entry sits in the layout the templates are authored in. */
export function authoredDest(entry: FileEntry): string {
  return resolveDest(entry, AUTHORED_PAGE_PREFIX);
}

/** Page files sitting at the project root. */
export function findRootLayoutFiles(projectRoot: string): string[] {
  return ROOT_LAYOUT_MARKERS.filter((name) => existsSync(join(projectRoot, name)));
}

/**
 * Page files stranded at the project root of a project that *also* has `src/`.
 *
 * Vantage scans only `src/` once it exists, so these files are invisible to the
 * router and `vantage check` reports `SRC_DIR_SPLIT`. The project is already
 * broken before we touch it; reporting the files lets the caller name exactly
 * what has to move.
 */
export function findSplitLayoutFiles(projectRoot: string): string[] {
  if (!existsSync(join(projectRoot, "src"))) return [];
  return findRootLayoutFiles(projectRoot);
}
