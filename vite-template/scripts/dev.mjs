#!/usr/bin/env node
import { spawn } from "node:child_process";
import { setupDev } from "./dev-setup.mjs";

const { devDir, templateName } = setupDev(process.argv[2]);

console.log(`✓ Dev environment ready (template: ${templateName})`);
console.log(`  Edit files in templates/${templateName}/ to see live changes.`);

spawn("npx", ["vite"], { cwd: devDir, stdio: "inherit" });
