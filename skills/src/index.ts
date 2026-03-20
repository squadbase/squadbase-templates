import { join } from "node:path";
import { parseArgs } from "node:util";

import { copySkills, listSkills } from "./copy.js";
import { detectFramework, getSupportedFrameworks, isSupportedFramework } from "./framework.js";
import { log } from "./logger.js";

const HELP = `
Usage: npx @squadbase/skills [options]

Copy AI agent skills into your project's skills/ directory.

Options:
  --framework <name>  Override auto-detection (from squadbase.yml)
  --list              List available skills for the detected framework
  --clean             Remove existing skills/ before copying
  --help              Show this help message

Supported frameworks: ${getSupportedFrameworks().join(", ")}
`.trim();

function main(): void {
  const { values } = parseArgs({
    options: {
      framework: { type: "string" },
      list: { type: "boolean", default: false },
      clean: { type: "boolean", default: false },
      help: { type: "boolean", default: false },
    },
    strict: true,
  });

  if (values.help) {
    console.log(HELP);
    return;
  }

  let framework: string;
  if (values.framework) {
    if (!isSupportedFramework(values.framework)) {
      log("red", `Unknown framework "${values.framework}"`);
      log("red", `Supported frameworks: ${getSupportedFrameworks().join(", ")}`);
      process.exit(1);
    }
    framework = values.framework;
  } else {
    framework = detectFramework(process.cwd());
  }

  if (values.list) {
    const skills = listSkills(framework);
    if (skills.length === 0) {
      log("yellow", `No skills available for framework "${framework}" yet.`);
    } else {
      log("green", `Skills for "${framework}":`);
      for (const skill of skills) {
        log("cyan", `  - ${skill}`);
      }
    }
    return;
  }

  const destDir = join(process.cwd(), "skills");
  copySkills(framework, destDir, values.clean ?? false);
}

try {
  main();
} catch (err) {
  log("red", err instanceof Error ? err.message : String(err));
  process.exit(1);
}
