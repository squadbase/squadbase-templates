import type { ParameterMeta } from "../types/server-logic.ts";

// Dynamic import so missing @clack/prompts doesn't crash non-interactive usage
async function getPrompts() {
  try {
    const mod = await import("@clack/prompts");
    return mod;
  } catch {
    throw new Error(
      "@clack/prompts is not installed. Run: npm install @clack/prompts --save-dev",
    );
  }
}

export async function selectServerLogic(slugs: string[]): Promise<string | null> {
  const { select, isCancel } = await getPrompts();

  const result = await select({
    message: "Select a server logic to test:",
    options: slugs.map((s) => ({ value: s, label: s })),
  });

  if (isCancel(result)) return null;
  return result as string;
}

export async function inputParameters(
  params: ParameterMeta[],
): Promise<Record<string, unknown>> {
  if (params.length === 0) return {};

  const { text, isCancel } = await getPrompts();

  const result: Record<string, unknown> = {};

  for (const p of params) {
    const defaultHint = p.default !== undefined ? ` (default: ${p.default})` : "";
    const requiredHint = p.required ? " *required*" : "";
    const value = await text({
      message: `${p.name}${requiredHint} [${p.type}]${defaultHint}: ${p.description}`,
      placeholder: p.default !== undefined ? String(p.default) : "",
      validate: (v: string) => {
        if (p.required && !v && p.default === undefined) {
          return `${p.name} is required`;
        }
      },
    });

    if (isCancel(value)) {
      process.exit(0);
    }

    const strValue = value as string;
    if (!strValue && p.default !== undefined) {
      result[p.name] = p.default;
    } else if (strValue) {
      if (p.type === "number") result[p.name] = Number(strValue);
      else if (p.type === "boolean") result[p.name] = strValue === "true";
      else result[p.name] = strValue;
    }
  }

  return result;
}

export async function confirmRunAll(): Promise<boolean> {
  const { confirm, isCancel } = await getPrompts();

  const result = await confirm({
    message: "Run all server logics?",
  });

  if (isCancel(result)) return false;
  return result as boolean;
}
