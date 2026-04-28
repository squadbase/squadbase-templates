import { parseArgs } from "node:util";

import { addTemplate } from "./commands/add.js";
import { setChartPreset } from "./commands/chart.js";
import { initProject } from "./commands/init.js";
import { listTemplates } from "./commands/list.js";
import { log } from "./logger.js";

const HELP = `
Usage: npx @squadbase/vite-template <command> [options]

Commands:
  init                  Initialize a new Squadbase Vite project
  add <template-name>   Apply a template to the current project
  chart <preset-name>   Switch the chart color preset
  list                  List available templates and chart presets

Options:
  --force              Overwrite existing files
  --dry-run            Show what would be done without making changes
  --skip-install       Skip dependency installation after init
  --chart <preset>     Apply a chart preset during init (e.g. --chart sunset)
  --help               Show this help message
`.trim();

function main(): void {
  const { values, positionals } = parseArgs({
    options: {
      force: { type: "boolean", default: false },
      "dry-run": { type: "boolean", default: false },
      "skip-install": { type: "boolean", default: false },
      chart: { type: "string" },
      help: { type: "boolean", default: false },
    },
    allowPositionals: true,
    strict: true,
  });

  if (values.help || positionals.length === 0) {
    console.log(HELP);
    return;
  }

  const command = positionals[0];

  if (command === "init") {
    initProject({
      force: values.force ?? false,
      skipInstall: values["skip-install"] ?? false,
      chart: values.chart,
    });
  } else if (command === "list") {
    listTemplates();
  } else if (command === "add") {
    const templateName = positionals[1];
    if (!templateName) {
      log("red", "Missing template name.");
      log("dim", "Usage: npx @squadbase/vite-template add <template-name>");
      process.exit(1);
    }
    addTemplate(templateName, {
      force: values.force ?? false,
      dryRun: values["dry-run"] ?? false,
    });
  } else if (command === "chart") {
    const presetName = positionals[1];
    if (!presetName) {
      log("red", "Missing chart preset name.");
      log("dim", "Usage: npx @squadbase/vite-template chart <preset-name>");
      process.exit(1);
    }
    setChartPreset(presetName, {
      dryRun: values["dry-run"] ?? false,
    });
  } else {
    log("red", `Unknown command: "${command}"`);
    console.log(HELP);
    process.exit(1);
  }
}

try {
  main();
} catch (err) {
  log("red", err instanceof Error ? err.message : String(err));
  process.exit(1);
}
