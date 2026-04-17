#!/usr/bin/env node
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync, spawn } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const baseTemplateDir = join(root, "base-template");
const devDir = join(root, "dev");
const templatesDir = join(root, "templates");

// 1. sync-base (rsync)
execSync(
  "rsync -a --delete --exclude='node_modules' --exclude='dist' --exclude='package-lock.json' --exclude='*.tsbuildinfo' --exclude='*.log' ../vite/ base-template/",
  { cwd: root, stdio: "inherit" },
);

// 2. テンプレート名: 引数 or templates/ の最初のディレクトリ
const templateName =
  process.argv[2] ??
  readdirSync(templatesDir).find((d) =>
    existsSync(join(templatesDir, d, "manifest.json")),
  );

if (!templateName) {
  console.error("No template found in templates/");
  process.exit(1);
}

if (!existsSync(baseTemplateDir)) {
  console.error("base-template/ not found. rsync may have failed.");
  process.exit(1);
}

// 3. dev/ を base-template/ のコピーで初期化
if (existsSync(devDir)) rmSync(devDir, { recursive: true });
cpSync(baseTemplateDir, devDir, { recursive: true });

// 4. node_modules を vite/ から symlink
symlinkSync(
  join("..", "..", "vite", "node_modules"),
  join(devDir, "node_modules"),
);

// 5. manifest を読み込み、各テンプレートファイルを symlink に置換
const manifest = JSON.parse(
  readFileSync(join(templatesDir, templateName, "manifest.json"), "utf-8"),
);

for (const file of manifest.files) {
  const destPath = join(devDir, file.dest);
  const srcPath = join(templatesDir, templateName, file.src);
  mkdirSync(dirname(destPath), { recursive: true });
  if (existsSync(destPath)) unlinkSync(destPath);
  symlinkSync(relative(dirname(destPath), srcPath), destPath);
}

// 6. routes.tsx にテンプレートのルートを追加
const routesPath = join(devDir, "src", "routes.tsx");
let content = readFileSync(routesPath, "utf-8");

const routesToAdd = manifest.routes.filter(
  (r) => !new RegExp(`name:\\s*["']${r.name}["']`).test(content),
);

if (routesToAdd.length > 0) {
  const closingIndex = content.lastIndexOf("];");
  const entries = routesToAdd
    .map(
      (r) =>
        `  {\n    name: "${r.name}",\n    path: "${r.path}",\n    title: "${r.title}",\n    component: lazy(() => import("${r.page}")),\n  },`,
    )
    .join("\n");
  content =
    content.slice(0, closingIndex) + entries + "\n" + content.slice(closingIndex);
  writeFileSync(routesPath, content, "utf-8");
}

console.log(`✓ Dev environment ready (template: ${templateName})`);
console.log(`  Edit files in templates/${templateName}/ to see live changes.`);

// 7. vite 起動
spawn("npx", ["vite"], { cwd: devDir, stdio: "inherit" });
