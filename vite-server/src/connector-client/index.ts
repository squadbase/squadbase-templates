export type { DatabaseClient } from "./types.ts";
export { createConnectorRegistry } from "./registry.ts";

import { createConnectorRegistry } from "./registry.ts";

// State is held in closure, so destructuring works without bind()
export const { getClient, reloadEnvFile, watchConnectionsFile } = createConnectorRegistry();
