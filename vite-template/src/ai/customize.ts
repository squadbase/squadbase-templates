import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { log } from "../logger.js";
import type { TemplateManifest } from "../manifest.js";
import { diffStats, unifiedDiff } from "./diff.js";
import { resolveModel } from "./provider.js";
import { SYSTEM_PROMPT } from "./system-prompt.js";

export interface CustomizeOptions {
  prompt: string;
  provider: string;
  model?: string;
  apiKey?: string;
  baseUrl?: string;
  dryRun: boolean;
  json: boolean;
}

export interface CustomizeEdit {
  path: string;
  rationale: string;
  before: string;
  after: string;
  added: number;
  removed: number;
}

export interface CustomizeResult {
  edits: CustomizeEdit[];
  unchanged: string[];
  skipped: string[];
  notes?: string;
  provider: string;
  model: string;
}

type AIRawEdit = { path: string; content: string; rationale: string };
type AIResponse = { edits: AIRawEdit[]; notes?: string };

async function importAI(): Promise<{
  generateObject: (args: Record<string, unknown>) => Promise<{ object: AIResponse }>;
  jsonSchema: (schema: unknown) => unknown;
}> {
  try {
    const mod = (await import("ai")) as unknown as {
      generateObject: (args: Record<string, unknown>) => Promise<{ object: AIResponse }>;
      jsonSchema: (schema: unknown) => unknown;
    };
    return mod;
  } catch {
    throw new Error(
      [
        `AI SDK package "ai" is not installed.`,
        `Run: npm install ai`,
      ].join("\n"),
    );
  }
}

function buildSchema(allowedPaths: string[]): unknown {
  return {
    type: "object",
    additionalProperties: false,
    required: ["edits", "notes"],
    properties: {
      edits: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["path", "content", "rationale"],
          properties: {
            path: { type: "string", enum: allowedPaths },
            content: { type: "string" },
            rationale: { type: "string" },
          },
        },
      },
      notes: { type: "string" },
    },
  };
}

function buildUserPrompt(intent: string, files: Map<string, string>): string {
  const parts: string[] = [];
  parts.push(`<USER_INTENT>`);
  parts.push(intent);
  parts.push(`</USER_INTENT>`);
  parts.push("");
  parts.push(`<FILES_TO_CUSTOMIZE>`);
  for (const [path, content] of files) {
    parts.push(`--- FILE: ${path} ---`);
    parts.push(content);
    parts.push("");
  }
  parts.push(`</FILES_TO_CUSTOMIZE>`);
  return parts.join("\n");
}

function readInputFiles(
  projectRoot: string,
  templateDir: string,
  manifest: TemplateManifest,
  fromTemplate: boolean,
): Map<string, string> {
  const files = new Map<string, string>();
  for (const entry of manifest.files) {
    const path = fromTemplate
      ? join(templateDir, entry.src)
      : join(projectRoot, entry.dest);
    try {
      files.set(entry.dest, readFileSync(path, "utf-8"));
    } catch (err) {
      throw new Error(
        `Failed to read ${path}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }
  return files;
}

export async function customizeWithAI(
  projectRoot: string,
  manifest: TemplateManifest,
  templateDir: string,
  options: CustomizeOptions,
): Promise<CustomizeResult> {
  const allowedPaths = manifest.files.map((f) => f.dest);
  const inputFiles = readInputFiles(
    projectRoot,
    templateDir,
    manifest,
    options.dryRun,
  );

  if (!options.json) {
    log("cyan", `\nCustomizing with AI (${options.provider}${options.model ? `:${options.model}` : ""})...`);
    log("dim", `  files: ${allowedPaths.length}, intent: ${truncate(options.prompt, 80)}`);
  }

  const { generateObject, jsonSchema } = await importAI();
  const { model, providerName, modelId } = await resolveModel({
    provider: options.provider,
    model: options.model,
    apiKey: options.apiKey,
    baseUrl: options.baseUrl,
  });

  const schema = jsonSchema(buildSchema(allowedPaths));
  const userPrompt = buildUserPrompt(options.prompt, inputFiles);

  let object: AIResponse;
  try {
    const result = await generateObject({
      model,
      schema,
      system: SYSTEM_PROMPT,
      prompt: userPrompt,
      temperature: 0.3,
    });
    object = result.object;
  } catch (err) {
    const e = err as {
      message?: string;
      text?: string;
      cause?: unknown;
      usage?: unknown;
      finishReason?: string;
      response?: { body?: unknown };
    };
    const parts: string[] = [];
    parts.push(`AI did not return a valid object (model=${modelId}).`);
    if (e.message) parts.push(`Message: ${e.message}`);
    if (e.finishReason) parts.push(`finishReason: ${e.finishReason}`);
    if (typeof e.text === "string" && e.text.length > 0) {
      const snippet = e.text.length > 800 ? `${e.text.slice(0, 800)}…(${e.text.length} chars)` : e.text;
      parts.push(`Raw response text:\n${snippet}`);
    }
    if (e.cause) {
      const causeMsg = e.cause instanceof Error ? e.cause.message : String(e.cause);
      parts.push(`Cause: ${causeMsg}`);
    }
    if (e.usage) parts.push(`Usage: ${JSON.stringify(e.usage)}`);
    throw new Error(parts.join("\n"));
  }

  const allowedSet = new Set(allowedPaths);
  const editedPaths = new Set<string>();
  const edits: CustomizeEdit[] = [];
  const skipped: string[] = [];

  for (const raw of object.edits ?? []) {
    if (!allowedSet.has(raw.path)) {
      skipped.push(raw.path);
      continue;
    }
    if (editedPaths.has(raw.path)) {
      skipped.push(raw.path);
      continue;
    }
    editedPaths.add(raw.path);
    const before = inputFiles.get(raw.path) ?? "";
    const after = raw.content;
    const { added, removed } = diffStats(before, after);
    edits.push({
      path: raw.path,
      rationale: raw.rationale,
      before,
      after,
      added,
      removed,
    });
  }

  const unchanged = allowedPaths.filter((p) => !editedPaths.has(p));

  if (options.dryRun) {
    if (!options.json) {
      for (const edit of edits) {
        log("cyan", `\n${edit.path}  (+${edit.added} -${edit.removed})`);
        log("dim", `  ${edit.rationale}`);
        console.log(unifiedDiff(edit.before, edit.after, edit.path));
      }
    }
  } else {
    for (const edit of edits) {
      writeFileSync(join(projectRoot, edit.path), edit.after, "utf-8");
      if (!options.json) {
        log("cyan", `  rewrote: ${edit.path} (+${edit.added} -${edit.removed})`);
      }
    }
  }

  return {
    edits,
    unchanged,
    skipped,
    notes: object.notes,
    provider: providerName,
    model: modelId,
  };
}

function truncate(s: string, n: number): string {
  if (s.length <= n) return s;
  return s.slice(0, n - 1) + "…";
}
