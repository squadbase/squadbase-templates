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
  failedVerification: string[];
  notes?: string;
  provider: string;
  model: string;
}

type AIRawEdit = {
  path: string;
  old_content: string;
  new_content: string;
  rationale: string;
};
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
          required: ["path", "old_content", "new_content", "rationale"],
          properties: {
            path: { type: "string", enum: allowedPaths },
            old_content: { type: "string" },
            new_content: { type: "string" },
            rationale: { type: "string" },
          },
        },
      },
      notes: { type: "string" },
    },
  };
}

function buildUserPrompt(
  intent: string,
  files: Map<string, string>,
): string {
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

function applyEditsToFile(before: string, edits: AIRawEdit[]): string {
  let text = before;
  for (const edit of edits) {
    const idx = text.indexOf(edit.old_content);
    if (idx === -1) {
      throw new Error(`old_content not found in file:\n${edit.old_content}`);
    }
    if (text.indexOf(edit.old_content, idx + 1) !== -1) {
      throw new Error(
        `old_content is not unique (matched more than once); include more surrounding context:\n${edit.old_content}`,
      );
    }
    text = text.slice(0, idx) + edit.new_content + text.slice(idx + edit.old_content.length);
  }
  return text;
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
      maxTokens: 20000,
    });
    object = result.object;
    if (process.env.SQUADBASE_AI_DEBUG) {
      const r = result as { usage?: unknown; finishReason?: string };
      log("dim", `[debug] finishReason=${r.finishReason ?? "?"} usage=${JSON.stringify(r.usage ?? {})}`);
      log("dim", `[debug] raw object: ${JSON.stringify(object, null, 2).slice(0, 4000)}`);
    }
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

  let editsArray: AIRawEdit[] = [];
  const rawEdits: unknown = object.edits;
  if (typeof rawEdits === "string") {
    try {
      editsArray = parseEditsString(rawEdits);
      if (process.env.SQUADBASE_AI_DEBUG) {
        log("dim", `[debug] recovered edits from JSON string (length=${rawEdits.length})`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(
        `AI returned \`edits\` as a JSON-escaped string but it could not be parsed as an array: ${msg}`,
      );
    }
  } else if (Array.isArray(rawEdits)) {
    editsArray = rawEdits as AIRawEdit[];
  } else if (rawEdits != null) {
    throw new Error(`AI returned \`edits\` as ${typeof rawEdits}, expected array.`);
  }

  const allowedSet = new Set(allowedPaths);
  const skipped: string[] = [];
  const editsByPath = new Map<string, AIRawEdit[]>();
  for (const raw of editsArray) {
    if (!allowedSet.has(raw.path)) {
      skipped.push(raw.path);
      continue;
    }
    const arr = editsByPath.get(raw.path) ?? [];
    arr.push(raw);
    editsByPath.set(raw.path, arr);
  }

  const edits: CustomizeEdit[] = [];
  const failedVerification: string[] = [];

  for (const [path, rawForPath] of editsByPath) {
    const before = inputFiles.get(path) ?? "";
    try {
      const after = applyEditsToFile(before, rawForPath);
      if (after === before) continue;
      const { added, removed } = diffStats(before, after);
      const rationale = rawForPath
        .map((e) => e.rationale)
        .filter((s) => s && s.trim().length > 0)
        .join("; ");
      edits.push({
        path,
        rationale,
        before,
        after,
        added,
        removed,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      failedVerification.push(path);
      if (!options.json) {
        log("red", `\n${path}: edit verification failed`);
        log("dim", `  ${msg.split("\n")[0]}`);
        if (process.env.SQUADBASE_AI_DEBUG) {
          log("dim", msg);
        }
      }
    }
  }

  const editedPaths = new Set(edits.map((e) => e.path));
  const failedSet = new Set(failedVerification);
  const unchanged = allowedPaths.filter(
    (p) => !editedPaths.has(p) && !failedSet.has(p),
  );

  if (options.dryRun) {
    if (!options.json) {
      for (const edit of edits) {
        log("cyan", `\n${edit.path}  (+${edit.added} -${edit.removed})`);
        if (edit.rationale) log("dim", `  ${edit.rationale}`);
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
    failedVerification,
    notes: object.notes,
    provider: providerName,
    model: modelId,
  };
}

function truncate(s: string, n: number): string {
  if (s.length <= n) return s;
  return s.slice(0, n - 1) + "…";
}

function stripTrailingCommas(s: string): string {
  // Remove trailing commas before `]` or `}` outside of strings. Naive scan that
  // tracks whether we're inside a string literal so we don't touch commas in content.
  const out: string[] = [];
  let inString = false;
  let escape = false;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (inString) {
      out.push(ch);
      if (escape) {
        escape = false;
      } else if (ch === "\\") {
        escape = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }
    if (ch === '"') {
      inString = true;
      out.push(ch);
      continue;
    }
    if (ch === ",") {
      // Look ahead past whitespace for next non-space char.
      let j = i + 1;
      while (j < s.length && /\s/.test(s[j])) j++;
      if (j < s.length && (s[j] === "]" || s[j] === "}")) {
        // skip this comma
        continue;
      }
    }
    out.push(ch);
  }
  return out.join("");
}

function parseEditsString(raw: string): AIRawEdit[] {
  let lastErr: unknown = null;
  for (const candidate of [raw, stripTrailingCommas(raw)]) {
    try {
      const parsed = JSON.parse(candidate);
      if (Array.isArray(parsed)) return parsed as AIRawEdit[];
      throw new Error(`Parsed edits is ${typeof parsed}, expected array.`);
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}
