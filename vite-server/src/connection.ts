import { getContext } from "hono/context-storage";
import { getCookie } from "hono/cookie";

const APP_SESSION_COOKIE_NAME = "__Host-squadbase-session";
const PREVIEW_SESSION_COOKIE_NAME = "squadbase-preview-session";
const APP_BASE_DOMAIN = "squadbase.app";
const PREVIEW_BASE_DOMAIN = "preview.app.squadbase.dev";
const SANDBOX_ID_ENV_NAME = "INTERNAL_SQUADBASE_SANDBOX_ID";
const MACHINE_CREDENTIAL_ENV_NAME =
  "INTERNAL_SQUADBASE_OAUTH_MACHINE_CREDENTIAL";

export type ConnectionFetchOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: Record<string, string>;
  body?: unknown;
  timeoutMs?: number;
};

function resolveProxyUrl(connectionId: string): string {
  const connectionPath = `/_sqcore/connections/${connectionId}/request`;
  const sandboxId = process.env[SANDBOX_ID_ENV_NAME];

  if (sandboxId) {
    const baseDomain =
      process.env["SQUADBASE_PREVIEW_BASE_DOMAIN"] ?? PREVIEW_BASE_DOMAIN;
    return `https://${sandboxId}.${baseDomain}${connectionPath}`;
  }

  const projectId = process.env["SQUADBASE_PROJECT_ID"];
  if (!projectId) {
    throw new Error(
      "Project ID is required. Please set SQUADBASE_PROJECT_ID environment variable.",
    );
  }
  const baseDomain =
    process.env["SQUADBASE_APP_BASE_DOMAIN"] ?? APP_BASE_DOMAIN;
  return `https://${projectId}.${baseDomain}${connectionPath}`;
}

function resolveAuthHeaders(): Record<string, string> {
  const machineCredential = process.env[MACHINE_CREDENTIAL_ENV_NAME];
  if (machineCredential) {
    return { Authorization: `Bearer ${machineCredential}` };
  }

  const c = getContext();
  const cookies = getCookie(c);

  const previewSession = cookies[PREVIEW_SESSION_COOKIE_NAME];
  if (previewSession) {
    return {
      Cookie: `${PREVIEW_SESSION_COOKIE_NAME}=${previewSession}`,
    };
  }

  const appSession = cookies[APP_SESSION_COOKIE_NAME];
  if (appSession) {
    return { Authorization: `Bearer ${appSession}` };
  }

  throw new Error(
    "No authentication method available for connection proxy. " +
      "Expected one of: INTERNAL_SQUADBASE_OAUTH_MACHINE_CREDENTIAL env var, " +
      "preview session cookie, or app session cookie.",
  );
}

export function connection(connectionId: string) {
  return {
    async fetch(
      url: string,
      options?: ConnectionFetchOptions,
    ): Promise<Response> {
      const proxyUrl = resolveProxyUrl(connectionId);
      const authHeaders = resolveAuthHeaders();

      return await fetch(proxyUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({
          url,
          method: options?.method,
          headers: options?.headers,
          body: options?.body,
          timeoutMs: options?.timeoutMs,
        }),
      });
    },
  };
}
