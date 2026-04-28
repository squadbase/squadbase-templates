import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const PRESET_DESCRIPTIONS: Record<string, string> = {
  blue: "Default — blue, teal, fuchsia, violet, gray",
  sunset: "Warm — orange, rose, amber, pink, stone",
  forest: "Natural — emerald, lime, teal, green, stone",
  ocean: "Cool — sky, cyan, indigo, teal, slate",
  berry: "Vibrant — purple, pink, fuchsia, violet, rose",
  mono: "Minimal — zinc monochrome",
};

export function getChartPresetsDir(): string {
  return join(__dirname, "..", "chart-presets");
}

export function listChartPresetNames(): string[] {
  const dir = getChartPresetsDir();
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".css"))
    .map((f) => f.replace(/\.css$/, ""))
    .sort();
}

export function getChartPresetDescription(name: string): string {
  return PRESET_DESCRIPTIONS[name] ?? "";
}

export function getChartPresetPath(name: string): string {
  return join(getChartPresetsDir(), `${name}.css`);
}

export interface ApplyChartPresetOptions {
  dryRun?: boolean;
}

export interface ApplyChartPresetResult {
  targetPath: string;
  content: string;
}

export function applyChartPreset(
  projectRoot: string,
  presetName: string,
  options: ApplyChartPresetOptions = {},
): ApplyChartPresetResult {
  const presetPath = getChartPresetPath(presetName);
  if (!existsSync(presetPath)) {
    throw new Error(`Chart preset "${presetName}" not found.`);
  }

  const targetPath = join(projectRoot, "src", "themes", "theme-default.css");
  if (!existsSync(targetPath)) {
    throw new Error("src/themes/theme-default.css not found in project.");
  }

  const content = readFileSync(presetPath, "utf-8");

  if (!options.dryRun) {
    writeFileSync(targetPath, content, "utf-8");
  }

  return { targetPath, content };
}
