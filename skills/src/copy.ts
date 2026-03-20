import { cpSync, existsSync, readdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import type { Framework } from "./framework.js";
import { log } from "./logger.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

function getSkillsSourceDir(framework: Framework): string {
  return join(__dirname, "..", "skills", framework);
}

export function listSkills(framework: Framework): string[] {
  const sourceDir = getSkillsSourceDir(framework);
  if (!existsSync(sourceDir)) {
    return [];
  }
  return readdirSync(sourceDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
}

export function copySkills(
  framework: Framework,
  destDir: string,
  clean: boolean,
): void {
  const sourceDir = getSkillsSourceDir(framework);

  if (!existsSync(sourceDir)) {
    log("yellow", `No skills available for framework "${framework}" yet.`);
    return;
  }

  const skills = listSkills(framework);
  if (skills.length === 0) {
    log("yellow", `No skills available for framework "${framework}" yet.`);
    return;
  }

  if (clean && existsSync(destDir)) {
    rmSync(destDir, { recursive: true, force: true });
    log("yellow", `Cleaned ${destDir}`);
  }

  cpSync(sourceDir, destDir, { recursive: true, force: true });

  log("green", `Copied ${skills.length} skill(s) to ${destDir}:`);
  for (const skill of skills) {
    log("cyan", `  - ${skill}`);
  }
}
