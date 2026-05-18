interface ProviderEntry {
  pkg: string;
  factory: string;
  defaultModel: string;
  envKey: string;
}

const PROVIDER_MAP: Record<string, ProviderEntry> = {
  openai: {
    pkg: "@ai-sdk/openai",
    factory: "createOpenAI",
    defaultModel: "gpt-5.4-mini-2026-03-17",
    envKey: "OPENAI_API_KEY",
  },
  anthropic: {
    pkg: "@ai-sdk/anthropic",
    factory: "createAnthropic",
    defaultModel: "claude-sonnet-4-5",
    envKey: "ANTHROPIC_API_KEY",
  },
  google: {
    pkg: "@ai-sdk/google",
    factory: "createGoogleGenerativeAI",
    defaultModel: "gemini-2.0-flash",
    envKey: "GOOGLE_GENERATIVE_AI_API_KEY",
  },
  mistral: {
    pkg: "@ai-sdk/mistral",
    factory: "createMistral",
    defaultModel: "mistral-large-latest",
    envKey: "MISTRAL_API_KEY",
  },
  xai: {
    pkg: "@ai-sdk/xai",
    factory: "createXai",
    defaultModel: "grok-2-latest",
    envKey: "XAI_API_KEY",
  },
  groq: {
    pkg: "@ai-sdk/groq",
    factory: "createGroq",
    defaultModel: "llama-3.3-70b-versatile",
    envKey: "GROQ_API_KEY",
  },
};

function normalizeProvider(provider: string): string {
  return provider.toLowerCase().replace(/[-_\s]/g, "");
}

export interface ResolveModelOptions {
  provider: string;
  model?: string;
  apiKey?: string;
  baseUrl?: string;
}

export interface ResolvedModel {
  // unknown so the customize layer treats the model as an opaque handle
  model: unknown;
  providerName: string;
  modelId: string;
}

export async function resolveModel(opts: ResolveModelOptions): Promise<ResolvedModel> {
  const normalized = normalizeProvider(opts.provider);
  const entry: ProviderEntry =
    PROVIDER_MAP[normalized] ??
    ({
      pkg: `@ai-sdk/${normalized}`,
      factory: normalized,
      defaultModel: "",
      envKey: `${normalized.toUpperCase()}_API_KEY`,
    } satisfies ProviderEntry);

  const apiKey = opts.apiKey ?? process.env[entry.envKey];
  if (!apiKey) {
    throw new Error(
      `Missing API key for provider "${opts.provider}". Pass --apiKey, or set ${entry.envKey}.`,
    );
  }

  const modelId = opts.model ?? entry.defaultModel;
  if (!modelId) {
    throw new Error(
      `No default model is known for provider "${opts.provider}". Pass --model <model-id>.`,
    );
  }

  let mod: Record<string, unknown>;
  try {
    mod = (await import(entry.pkg)) as Record<string, unknown>;
  } catch {
    throw new Error(
      [
        `AI SDK provider package "${entry.pkg}" is not installed.`,
        `Run: npm install ai ${entry.pkg}`,
      ].join("\n"),
    );
  }

  const factory = (mod[entry.factory] ?? (mod.default as Record<string, unknown> | undefined)?.[entry.factory]) as
    | ((config: { apiKey: string; baseURL?: string }) => (modelId: string) => unknown)
    | undefined;
  if (typeof factory !== "function") {
    throw new Error(
      `Could not find factory "${entry.factory}" in "${entry.pkg}". The provider package layout may have changed.`,
    );
  }

  const providerInstance = factory({ apiKey, baseURL: opts.baseUrl });
  const model = providerInstance(modelId);

  return { model, providerName: normalized, modelId };
}
