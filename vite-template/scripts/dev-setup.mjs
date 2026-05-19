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
import { execSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const root = join(__dirname, "..");
export const baseTemplateDir = join(root, "base-template");
export const devDir = join(root, "dev");
export const templatesDir = join(root, "templates");
export const chartPresetsDir = join(root, "chart-presets");

export function listTemplateNames() {
  return readdirSync(templatesDir).filter((d) =>
    existsSync(join(templatesDir, d, "manifest.json")),
  );
}

export function listChartPresetNames() {
  if (!existsSync(chartPresetsDir)) return [];
  return readdirSync(chartPresetsDir)
    .filter((f) => f.endsWith(".css"))
    .map((f) => f.replace(/\.css$/, ""))
    .sort();
}

export function setupDev(templateName, { chartPreset } = {}) {
  const name = templateName ?? listTemplateNames()[0];
  if (!name) throw new Error("No template found in templates/");

  if (chartPreset) {
    const available = listChartPresetNames();
    if (!available.includes(chartPreset)) {
      throw new Error(
        `Chart preset "${chartPreset}" not found. Available: ${available.join(", ")}`,
      );
    }
  }

  const manifestPath = join(templatesDir, name, "manifest.json");
  if (!existsSync(manifestPath)) {
    throw new Error(`Template not found: ${name}`);
  }

  execSync(
    "rsync -a --delete --exclude='node_modules' --exclude='dist' --exclude='package-lock.json' --exclude='*.tsbuildinfo' --exclude='*.log' ../vite/ base-template/",
    { cwd: root, stdio: "inherit" },
  );

  if (!existsSync(baseTemplateDir)) {
    throw new Error("base-template/ not found. rsync may have failed.");
  }

  if (existsSync(devDir)) rmSync(devDir, { recursive: true });
  cpSync(baseTemplateDir, devDir, { recursive: true });

  symlinkSync(
    join("..", "..", "vite", "node_modules"),
    join(devDir, "node_modules"),
  );

  const manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));

  for (const file of manifest.files) {
    const destPath = join(devDir, file.dest);
    const srcPath = join(templatesDir, name, file.src);
    mkdirSync(dirname(destPath), { recursive: true });
    if (existsSync(destPath)) unlinkSync(destPath);
    symlinkSync(relative(dirname(destPath), srcPath), destPath);
  }

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
      content.slice(0, closingIndex) +
      entries +
      "\n" +
      content.slice(closingIndex);
    writeFileSync(routesPath, content, "utf-8");
  }

  if (chartPreset) {
    const presetCss = readFileSync(
      join(chartPresetsDir, `${chartPreset}.css`),
      "utf-8",
    );
    const targetPath = join(devDir, "src", "themes", "theme-default.css");
    writeFileSync(targetPath, presetCss, "utf-8");
  }

  return { devDir, templateName: name, chartPreset: chartPreset ?? null };
}
