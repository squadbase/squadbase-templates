import type { RunResult } from "./runner.ts";

const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";
const DIM = "\x1b[2m";

function truncate(value: string, maxLen: number): string {
  return value.length > maxLen ? value.slice(0, maxLen - 1) + "…" : value;
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return DIM + "null" + RESET;
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function displayTable(rows: Record<string, unknown>[], limit: number): void {
  if (rows.length === 0) {
    console.log(DIM + "  (no rows)" + RESET);
    return;
  }

  const display = rows.slice(0, limit);
  const columns = Object.keys(display[0] ?? {});
  const colWidths = columns.map((col) => {
    const maxData = Math.max(...display.map((r) => formatValue(r[col]).replace(/\x1b\[[0-9;]*m/g, "").length));
    return Math.min(40, Math.max(col.length, maxData));
  });

  const header = columns.map((c, i) => BOLD + CYAN + c.padEnd(colWidths[i] ?? 0) + RESET).join("  ");
  const divider = colWidths.map((w) => "-".repeat(w)).join("--");

  console.log("  " + header);
  console.log("  " + DIM + divider + RESET);

  for (const row of display) {
    const line = columns
      .map((c, i) => {
        const raw = formatValue(row[c]);
        const plain = raw.replace(/\x1b\[[0-9;]*m/g, "");
        const padded = truncate(plain, colWidths[i] ?? 40).padEnd(colWidths[i] ?? 0);
        return raw.startsWith(DIM) ? DIM + padded + RESET : padded;
      })
      .join("  ");
    console.log("  " + line);
  }

  if (rows.length > limit) {
    console.log(DIM + `  … and ${rows.length - limit} more rows (use --limit to show more)` + RESET);
  }
}

export function displaySummary(result: RunResult): void {
  const status = result.error
    ? RED + "✗ FAIL" + RESET
    : GREEN + "✓ OK" + RESET;
  const duration = DIM + `(${result.durationMs}ms)` + RESET;

  console.log(`\n${BOLD}[${result.slug}]${RESET} ${status} ${duration}`);

  if (result.error) {
    console.log(RED + `  Error: ${result.error.message}` + RESET);
    return;
  }

  console.log(DIM + `  ${result.rowCount} row(s)` + RESET);
}

export function displayDebug(result: RunResult): void {
  if (result.query) {
    console.log(YELLOW + "  Query:" + RESET);
    console.log(DIM + `    ${result.query.replace(/\n/g, "\n    ")}` + RESET);
  }
  if (result.queryValues && result.queryValues.length > 0) {
    console.log(YELLOW + "  Params:" + RESET, result.queryValues);
  }
}

export function displayJson(results: RunResult[]): void {
  const output = results.map((r) => ({
    slug: r.slug,
    rowCount: r.rowCount,
    durationMs: r.durationMs,
    rows: r.rows,
    error: r.error?.message,
  }));
  console.log(JSON.stringify(output, null, 2));
}

export function displayError(error: Error): void {
  console.error(RED + "Error: " + error.message + RESET);
}
