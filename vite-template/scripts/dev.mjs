#!/usr/bin/env node
import { spawn } from "node:child_process";
import { parseArgs } from "node:util";
import { setupDev } from "./dev-setup.mjs";

const { values, positionals } = parseArgs({
  args: process.argv.slice(2),
  options: {
    chart: { type: "string" },
    ui: { type: "boolean" },
  },
  allowPositionals: true,
});

const { devDir, templateName, chartPreset, source } = setupDev(positionals[0], {
  chartPreset: values.chart,
  ui: values.ui,
});

console.log(
  `✓ Dev environment ready (template: ${templateName}${chartPreset ? `, chart: ${chartPreset}` : ""})`,
);
console.log(`  Edit files in ${source}/${templateName}/ to see live changes.`);

spawn("npx", ["vite"], { cwd: devDir, stdio: "inherit" });
