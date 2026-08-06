#!/usr/bin/env node
import { watch } from "node:fs";
import { spawn } from "node:child_process";
import { parseArgs } from "node:util";
import { setupDev, copyTemplateFile, vantageBin } from "./dev-setup.mjs";

const { values, positionals } = parseArgs({
  args: process.argv.slice(2),
  options: {
    chart: { type: "string" },
  },
  allowPositionals: true,
});

const { devDir, templateName, chartPreset, files } = setupDev(positionals[0], {
  chartPreset: values.chart,
});

// Template files are copied rather than symlinked (Vantage's route scan skips
// symlinks), so mirror edits back into dev/ to keep HMR working.
for (const { srcPath, destPath } of files) {
  watch(srcPath, { persistent: true }, () => {
    try {
      copyTemplateFile(srcPath, destPath);
    } catch (err) {
      console.error(`  ! failed to sync ${srcPath}: ${err.message}`);
    }
  });
}

console.log(
  `✓ Dev environment ready (template: ${templateName}${chartPreset ? `, chart: ${chartPreset}` : ""})`,
);
console.log(
  `  Edit files in ui-templates/${templateName}/ — changes are mirrored into dev/ and picked up by HMR.`,
);
console.log(`  Adding a new file needs a restart (the manifest is read once).`);

spawn(vantageBin(), ["dev", "--no-overlay"], {
  cwd: devDir,
  stdio: "inherit",
});
