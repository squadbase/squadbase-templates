#!/usr/bin/env node

const { spawn } = require("child_process");
const { existsSync, readdirSync } = require("fs");
const { join, basename } = require("path");

// Colors for output
const colors = {
  red: "\x1b[0;31m",
  green: "\x1b[0;32m",
  yellow: "\x1b[1;33m",
  reset: "\x1b[0m",
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Get repository root
const repoRoot = join(__dirname, "..");

// Build target directories
const templateDirs = [];

// Add core if it exists
const corePath = join(repoRoot, "core");
if (existsSync(join(corePath, "package.json"))) {
  templateDirs.push(corePath);
}

// Dynamically detect templates/*
const templatesPath = join(repoRoot, "templates");
if (existsSync(templatesPath)) {
  const templates = readdirSync(templatesPath, { withFileTypes: true });
  for (const template of templates) {
    if (template.isDirectory()) {
      const templatePath = join(templatesPath, template.name);
      if (existsSync(join(templatePath, "package.json"))) {
        templateDirs.push(templatePath);
      }
    }
  }
}

if (templateDirs.length === 0) {
  log("yellow", "No templates found to build.");
  process.exit(0);
}

log("yellow", `Running build checks on ${templateDirs.length} templates...`);

async function runBuild(dir) {
  const templateName = basename(dir);

  // Install dependencies if needed
  if (!existsSync(join(dir, "node_modules"))) {
    log("yellow", `[${templateName}] Installing dependencies...`);
    await runCommand("npm", ["ci"], dir);
  }

  log("yellow", `[${templateName}] Building...`);
  try {
    await runCommand("npm", ["run", "build"], dir);
    log("green", `[${templateName}] Build succeeded`);
    return { templateName, success: true };
  } catch {
    log("red", `[${templateName}] Build failed`);
    return { templateName, success: false };
  }
}

function runCommand(command, args, cwd) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      cwd,
      stdio: "inherit",
      shell: true,
    });

    proc.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });

    proc.on("error", reject);
  });
}

async function main() {
  // Run all builds in parallel
  const results = await Promise.all(templateDirs.map(runBuild));

  const failed = results.filter((r) => !r.success);

  if (failed.length > 0) {
    log("red", "One or more builds failed. Commit aborted.");
    process.exit(1);
  }

  log("green", "All builds passed!");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
