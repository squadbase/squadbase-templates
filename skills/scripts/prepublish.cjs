#!/usr/bin/env node

const { rmSync, mkdirSync, existsSync, cpSync } = require("fs");
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

const packageRoot = __dirname.replace(/[/\\]scripts$/, "");
const sourceDir = join(packageRoot, "source");
const skillsOutDir = join(packageRoot, "skills");

// Frameworks with skills in source/
const FRAMEWORKS = ["squadbase-vite-react"];

// 1. Clean and recreate framework output directories
for (const framework of FRAMEWORKS) {
  const frameworkDir = join(skillsOutDir, framework);
  if (existsSync(frameworkDir)) {
    rmSync(frameworkDir, { recursive: true, force: true });
  }
  mkdirSync(frameworkDir, { recursive: true });
  log("yellow", `Cleaned skills/${framework}/`);
}

// 2. Copy skills from source/
for (const framework of FRAMEWORKS) {
  const frameworkSourceDir = join(sourceDir, framework);
  if (!existsSync(frameworkSourceDir)) {
    log("red", `WARNING: source/${framework}/ not found`);
    continue;
  }

  const frameworkOutDir = join(skillsOutDir, framework);
  cpSync(frameworkSourceDir, frameworkOutDir, { recursive: true });
  log("green", `Copied skills from source/${framework}/`);
}

// 3. Copy general skills into each framework's output
const generalSourceDir = join(sourceDir, "general");
if (existsSync(generalSourceDir)) {
  for (const framework of FRAMEWORKS) {
    const frameworkOutDir = join(skillsOutDir, framework);
    cpSync(generalSourceDir, frameworkOutDir, { recursive: true });
    log("green", `Copied general skills into skills/${framework}/`);
  }
}

// 4. Create nextjs placeholder directory
const nextjsDir = join(skillsOutDir, "nextjs");
if (!existsSync(nextjsDir)) {
  mkdirSync(nextjsDir, { recursive: true });
}

log("green", "skills prepublish complete.");
