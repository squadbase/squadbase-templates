#!/usr/bin/env node

const { readdirSync, rmSync, mkdirSync, copyFileSync, existsSync } = require("fs");
const { join } = require("path");

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

const repoRoot = join(__dirname, "..");
const skillsDir = join(repoRoot, "vite", "skills");

// 1. Clean up vite/skills/
if (existsSync(skillsDir)) {
  for (const file of readdirSync(skillsDir)) {
    rmSync(join(skillsDir, file), { recursive: true, force: true });
  }
  log("yellow", "Cleaned vite/skills/");
} else {
  mkdirSync(skillsDir, { recursive: true });
  log("yellow", "Created vite/skills/");
}

// 2. vite/AGENTS.md → vite/skills/frontend-development.md
copyFileSync(join(repoRoot, "vite", "AGENTS.md"), join(skillsDir, "frontend-development.md"));
log("green", "Copied vite/AGENTS.md → vite/skills/frontend-development.md");

// 3. vite-server/AGENTS.md → vite/skills/data-source-development.md
copyFileSync(join(repoRoot, "vite-server", "AGENTS.md"), join(skillsDir, "data-source-development.md"));
log("green", "Copied vite-server/AGENTS.md → vite/skills/data-source-development.md");

log("green", "vite-prepublish complete.");
