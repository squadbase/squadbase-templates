import { parseArgs } from "node:util";

import { addTemplate } from "./commands/add.js";
import { setChartPreset } from "./commands/chart.js";
import { initProject } from "./commands/init.js";
import { listTemplates } from "./commands/list.js";
import { log } from "./logger.js";

const HELP = `
Usage: npx @squadbase/vantage-template <command> [options]

Commands:
  init                  Initialize a new Squadbase Vantage project
  add <template-name>   Apply a UI template to the current project
  chart <preset-name>   Switch the chart color preset
  list                  List available templates and chart presets

Options:
  --force              Overwrite existing files
  --dry-run            Show what would be done without making changes
  --skip-install       Skip dependency installation after init
  --chart <preset>     Apply a chart preset during init (e.g. --chart sunset)
  --json               Output as JSON (for the list / add commands)
  --lang <code>        Filter list by language (e.g. --lang ja)
  --help               Show this help message

AI customization (add only):
  --prompt <text>      Customize the applied template with AI. Triggers AI mode.
  --provider <name>    AI provider name (openai, anthropic, google, mistral, xai, groq, ...)
  --model <id>         Model id. Defaults per provider (e.g. gpt-5.4-mini-2026-03-17, claude-sonnet-4-5).
  --apiKey <key>       API key. Falls back to provider-specific env var if omitted.
  --env-file <path>    Load env vars from a .env file before invoking AI (existing process.env wins).
  --base-url <url>     Optional OpenAI-compatible endpoint.

Examples:
  npx @squadbase/vantage-template init
  npx @squadbase/vantage-template list --lang ja
  npx @squadbase/vantage-template add kpi-chart-simple \\
    --prompt "SaaS MRR/ARR dashboard" --provider openai --apiKey $OPENAI_API_KEY
  npx @squadbase/vantage-template add funnel --prompt "..." \\
    --provider anthropic --apiKey $ANTHROPIC_API_KEY --dry-run
`.trim();

async function main(): Promise<void> {
  const { values, positionals } = parseArgs({
    options: {
      force: { type: "boolean", default: false },
      "dry-run": { type: "boolean", default: false },
      "skip-install": { type: "boolean", default: false },
      chart: { type: "string" },
      json: { type: "boolean", default: false },
      lang: { type: "string" },
      help: { type: "boolean", default: false },
      prompt: { type: "string" },
      provider: { type: "string" },
      model: { type: "string" },
      apiKey: { type: "string" },
      "base-url": { type: "string" },
      "env-file": { type: "string" },
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
    listTemplates({
      json: values.json ?? false,
      lang: values.lang,
    });
  } else if (command === "add") {
    const templateName = positionals[1];
    if (!templateName) {
      log("red", "Missing template name.");
      log("dim", "Usage: npx @squadbase/vantage-template add <template-name>");
      process.exit(1);
    }

    const envFile = values["env-file"];
    if (envFile !== undefined) {
      if (!values.prompt) {
        log("red", "--env-file requires --prompt (it only affects AI customization).");
        process.exit(1);
      }
      if (typeof process.loadEnvFile !== "function") {
        log("red", "--env-file requires Node.js 20.12.0 or later (process.loadEnvFile).");
        log("dim", `Current version: ${process.version}`);
        process.exit(1);
      }
      try {
        process.loadEnvFile(envFile);
      } catch (err) {
        const reason = err instanceof Error ? err.message : String(err);
        log("red", `Failed to load env file "${envFile}": ${reason}`);
        process.exit(1);
      }
    }

    const ai = values.prompt
      ? (() => {
          if (!values.provider) {
            log("red", "--prompt requires --provider (e.g. --provider openai).");
            process.exit(1);
          }
          return {
            prompt: values.prompt,
            provider: values.provider,
            model: values.model,
            apiKey: values.apiKey,
            baseUrl: values["base-url"],
            dryRun: values["dry-run"] ?? false,
            json: values.json ?? false,
          };
        })()
      : undefined;
    await addTemplate(templateName, {
      force: values.force ?? false,
      dryRun: values["dry-run"] ?? false,
      source: "ui-templates",
      ai,
    });
  } else if (command === "chart") {
    const presetName = positionals[1];
    if (!presetName) {
      log("red", "Missing chart preset name.");
      log("dim", "Usage: npx @squadbase/vantage-template chart <preset-name>");
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

main().catch((err: unknown) => {
  log("red", err instanceof Error ? err.message : String(err));
  process.exit(1);
});
