import { readFileSync } from "node:fs";
import { join } from "node:path";

const SUPPORTED_FRAMEWORKS = ["squadbase-vite-react", "nextjs"] as const;
export type Framework = (typeof SUPPORTED_FRAMEWORKS)[number];

export function isSupportedFramework(value: string): value is Framework {
  return (SUPPORTED_FRAMEWORKS as readonly string[]).includes(value);
}

export function getSupportedFrameworks(): readonly string[] {
  return SUPPORTED_FRAMEWORKS;
}

export function detectFramework(cwd: string): Framework {
  const ymlPath = join(cwd, "squadbase.yml");

  let content: string;
  try {
    content = readFileSync(ymlPath, "utf-8");
  } catch {
    throw new Error(
      `squadbase.yml not found in ${cwd}\n` +
        `Run this command from the project root, or use --framework <name> to specify manually.`,
    );
  }

  const match = content.match(/^\s*framework:\s*(.+)$/m);
  if (!match) {
    throw new Error(
      `No "framework:" field found in squadbase.yml\n` +
        `Use --framework <name> to specify manually.\n` +
        `Supported frameworks: ${SUPPORTED_FRAMEWORKS.join(", ")}`,
    );
  }

  const framework = match[1].trim();
  if (!isSupportedFramework(framework)) {
    throw new Error(
      `Unknown framework "${framework}"\n` +
        `Supported frameworks: ${SUPPORTED_FRAMEWORKS.join(", ")}`,
    );
  }

  return framework;
}
