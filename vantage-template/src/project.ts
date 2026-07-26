import { existsSync } from "node:fs";
import { join } from "node:path";

/**
 * Files that only make sense at the page-scan root. Their presence at the
 * project root, with no `src/` alongside, means the project predates the
 * `src/` layout.
 */
const ROOT_LAYOUT_MARKERS = ["index.tsx", "_layout.tsx", "_404.tsx", "_error.tsx", "styles.css"];

/**
 * Where Vantage scans for pages: `src/` when it exists, the project root
 * otherwise. `@squadbase/vantage` v0.3.0 detects it exactly this way — it is
 * not configurable, and keeping pages on both sides is a `SRC_DIR_SPLIT` error.
 *
 * `server/` and `public/` are *not* affected: they always sit at the project
 * root, and `src/server/` is never scanned.
 */
export function resolvePageRoot(projectRoot: string): string {
  const srcDir = join(projectRoot, "src");
  return existsSync(srcDir) ? srcDir : projectRoot;
}

/** `styles.css` is read from the page-scan root, so it follows the same rule. */
export function resolveStylesPath(projectRoot: string): string {
  return join(resolvePageRoot(projectRoot), "styles.css");
}

/**
 * Page files stranded at the project root of a `src/`-less project.
 *
 * Every template writes to `src/`, so applying one here would leave the
 * project split across both layouts. Reporting the files lets the caller name
 * exactly what has to move.
 */
export function findRootLayoutFiles(projectRoot: string): string[] {
  if (existsSync(join(projectRoot, "src"))) return [];
  return ROOT_LAYOUT_MARKERS.filter((name) => existsSync(join(projectRoot, name)));
}
