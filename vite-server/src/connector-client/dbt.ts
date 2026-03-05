import type { ConnectionEntry } from "./types.ts";
import { resolveEnvVar } from "./env.ts";

export interface DbtClient {
  query(graphqlQuery: string, variables?: Record<string, unknown>): Promise<Record<string, unknown>>;
  getModels(options?: { limit?: number }): Promise<Record<string, unknown>[]>;
  getModelByName(uniqueId: string): Promise<Record<string, unknown> | null>;
}

export function createDbtClient(entry: ConnectionEntry, slug: string): DbtClient {
  const host = resolveEnvVar(entry, "host", slug);
  const prodEnvId = resolveEnvVar(entry, "prod-env-id", slug);
  const token = resolveEnvVar(entry, "token", slug);

  const discoveryUrl = `https://${host}/graphql`;
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  async function gqlRequest(
    query: string,
    variables?: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const res = await fetch(discoveryUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({ query, variables }),
    });
    if (!res.ok) throw new Error(`dbt Discovery API error: ${res.status} ${await res.text()}`);
    const json = (await res.json()) as { data?: Record<string, unknown>; errors?: unknown[] };
    if (json.errors) {
      throw new Error(`dbt Discovery API GraphQL error: ${JSON.stringify(json.errors)}`);
    }
    return json.data ?? {};
  }

  return {
    query: gqlRequest,

    async getModels(options) {
      const limit = options?.limit ?? 100;
      const data = await gqlRequest(
        `query ($environmentId: BigInt!, $first: Int) {
          environment(id: $environmentId) {
            applied {
              models(first: $first) {
                edges {
                  node {
                    uniqueId
                    name
                    description
                    materializedType
                    database
                    schema
                    alias
                  }
                }
              }
            }
          }
        }`,
        { environmentId: Number(prodEnvId), first: limit },
      );
      const env = data.environment as Record<string, unknown> | undefined;
      const applied = env?.applied as Record<string, unknown> | undefined;
      const models = applied?.models as { edges: { node: Record<string, unknown> }[] } | undefined;
      return models?.edges.map((e) => e.node) ?? [];
    },

    async getModelByName(uniqueId) {
      const data = await gqlRequest(
        `query ($environmentId: BigInt!, $uniqueId: String!) {
          environment(id: $environmentId) {
            applied {
              modelByUniqueId(uniqueId: $uniqueId) {
                uniqueId
                name
                description
                materializedType
                database
                schema
                alias
                columns {
                  name
                  description
                  type
                }
              }
            }
          }
        }`,
        { environmentId: Number(prodEnvId), uniqueId },
      );
      const env = data.environment as Record<string, unknown> | undefined;
      const applied = env?.applied as Record<string, unknown> | undefined;
      return (applied?.modelByUniqueId as Record<string, unknown>) ?? null;
    },
  };
}
