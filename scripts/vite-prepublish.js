#!/usr/bin/env node

const { readdirSync, rmSync, mkdirSync, readFileSync, writeFileSync, existsSync } = require("fs");
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
const frontendFrontmatter = `---
name: frontend-development
description: Component TSX generation rules — allowed/forbidden imports, data fetching patterns (useQuery), export conventions, layout constraints
---

`;
const frontendContent = readFileSync(join(repoRoot, "vite", "AGENTS.md"), "utf-8");
writeFileSync(join(skillsDir, "frontend-development.md"), frontendFrontmatter + frontendContent);
log("green", "Copied vite/AGENTS.md → vite/skills/frontend-development.md (with frontmatter)");

// 3. vite-server/AGENTS.md → vite/skills/data-source-development.md
const dataSourceFrontmatter = `---
name: data-source-development
description: Data source creation and editing workflows — SQL/TypeScript data source patterns, connection setup, testing procedures
---

`;
const dataSourceContent = readFileSync(join(repoRoot, "vite-server", "AGENTS.md"), "utf-8");
writeFileSync(join(skillsDir, "data-source-development.md"), dataSourceFrontmatter + dataSourceContent);
log("green", "Copied vite-server/AGENTS.md → vite/skills/data-source-development.md (with frontmatter)");

log("green", "vite-prepublish complete.");
