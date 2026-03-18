#!/usr/bin/env node

const { rmSync, mkdirSync, readFileSync, writeFileSync, existsSync } = require("fs");
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

// 1. Clean up managed skill directories only
const managedSkills = ["frontend-development", "data-source-development"];
if (!existsSync(skillsDir)) {
  mkdirSync(skillsDir, { recursive: true });
}
for (const skill of managedSkills) {
  const dir = join(skillsDir, skill);
  if (existsSync(dir)) {
    rmSync(dir, { recursive: true, force: true });
  }
  mkdirSync(dir, { recursive: true });
}
log("yellow", "Cleaned managed skill directories");

// 2. vite/AGENTS.md → vite/skills/frontend-development.md
const frontendFrontmatter = `---
name: frontend-development
description: Component TSX generation rules — allowed/forbidden imports, data fetching patterns (useQuery), export conventions, layout constraints
---

`;
const frontendContent = readFileSync(join(repoRoot, "vite", "AGENTS.md"), "utf-8");
writeFileSync(join(skillsDir, "frontend-development", "SKILL.md"), frontendFrontmatter + frontendContent);
log("green", "Copied vite/AGENTS.md → vite/skills/frontend-development/SKILL.md (with frontmatter)");

// 3. vite-server/AGENTS.md → vite/skills/data-source-development.md
const dataSourceFrontmatter = `---
name: data-source-development
description: Data source creation and editing workflows — SQL/TypeScript data source patterns, connection setup, testing procedures
---

`;
const dataSourceContent = readFileSync(join(repoRoot, "vite-server", "AGENTS.md"), "utf-8");
writeFileSync(join(skillsDir, "data-source-development", "SKILL.md"), dataSourceFrontmatter + dataSourceContent);
log("green", "Copied vite-server/AGENTS.md → vite/skills/data-source-development/SKILL.md (with frontmatter)");

log("green", "vite-prepublish complete.");
