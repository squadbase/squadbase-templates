#!/usr/bin/env node
import { spawn } from "node:child_process";
import { parseArgs } from "node:util";
import { setupDev } from "./dev-setup.mjs";

const { values, positionals } = parseArgs({
  args: process.argv.slice(2),
  options: { chart: { type: "string" } },
  allowPositionals: true,
});

const { devDir, templateName, chartPreset } = setupDev(positionals[0], {
  chartPreset: values.chart,
});

console.log(
  `✓ Dev environment ready (template: ${templateName}${chartPreset ? `, chart: ${chartPreset}` : ""})`,
);
console.log(`  Edit files in templates/${templateName}/ to see live changes.`);

spawn("npx", ["vite"], { cwd: devDir, stdio: "inherit" });
