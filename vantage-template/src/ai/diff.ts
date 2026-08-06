const ANSI = {
  reset: "\x1b[0m",
  red: "\x1b[0;31m",
  green: "\x1b[0;32m",
  cyan: "\x1b[0;36m",
  dim: "\x1b[2m",
} as const;

interface DiffOp {
  type: "equal" | "delete" | "insert";
  value: string;
}

function computeOps(before: string[], after: string[]): DiffOp[] {
  const n = before.length;
  const m = after.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      if (before[i] === after[j]) {
        dp[i][j] = dp[i + 1][j + 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }
  const ops: DiffOp[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (before[i] === after[j]) {
      ops.push({ type: "equal", value: before[i] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      ops.push({ type: "delete", value: before[i] });
      i++;
    } else {
      ops.push({ type: "insert", value: after[j] });
      j++;
    }
  }
  while (i < n) ops.push({ type: "delete", value: before[i++] });
  while (j < m) ops.push({ type: "insert", value: after[j++] });
  return ops;
}

export interface UnifiedDiffOptions {
  context?: number;
}

export function unifiedDiff(
  before: string,
  after: string,
  filename: string,
  options: UnifiedDiffOptions = {},
): string {
  const beforeLines = before.split("\n");
  const afterLines = after.split("\n");
  const ops = computeOps(beforeLines, afterLines);
  const context = options.context ?? 2;

  const lines: string[] = [];
  lines.push(`${ANSI.cyan}--- ${filename}${ANSI.reset}`);
  lines.push(`${ANSI.cyan}+++ ${filename}${ANSI.reset}`);

  const hasChange = ops.some((o) => o.type !== "equal");
  if (!hasChange) {
    lines.push(`${ANSI.dim}(no change)${ANSI.reset}`);
    return lines.join("\n");
  }

  // Group ops into hunks separated by long runs of "equal".
  const hunks: DiffOp[][] = [];
  let current: DiffOp[] = [];
  let trailingEqual = 0;
  for (const op of ops) {
    if (op.type === "equal") {
      trailingEqual++;
      current.push(op);
      if (trailingEqual > context * 2 && current.some((o) => o.type !== "equal")) {
        // close hunk, trimming trailing equals to context
        const trimmed = current.slice(0, current.length - (trailingEqual - context));
        hunks.push(trimmed);
        current = current.slice(current.length - context);
        trailingEqual = context;
      }
    } else {
      trailingEqual = 0;
      current.push(op);
    }
  }
  if (current.some((o) => o.type !== "equal")) {
    hunks.push(current);
  }

  // Trim leading equals on the first hunk to context.
  for (const hunk of hunks) {
    let leading = 0;
    while (leading < hunk.length && hunk[leading].type === "equal") leading++;
    if (leading > context) {
      hunk.splice(0, leading - context);
    }
  }

  for (const hunk of hunks) {
    for (const op of hunk) {
      if (op.type === "equal") {
        lines.push(` ${op.value}`);
      } else if (op.type === "delete") {
        lines.push(`${ANSI.red}-${op.value}${ANSI.reset}`);
      } else {
        lines.push(`${ANSI.green}+${op.value}${ANSI.reset}`);
      }
    }
    lines.push(`${ANSI.dim}...${ANSI.reset}`);
  }
  // drop trailing separator
  if (lines[lines.length - 1] === `${ANSI.dim}...${ANSI.reset}`) lines.pop();

  return lines.join("\n");
}

export interface DiffStats {
  added: number;
  removed: number;
}

export function diffStats(before: string, after: string): DiffStats {
  const ops = computeOps(before.split("\n"), after.split("\n"));
  let added = 0;
  let removed = 0;
  for (const op of ops) {
    if (op.type === "insert") added++;
    else if (op.type === "delete") removed++;
  }
  return { added, removed };
}
