export type { DatabaseClient, ConnectionEntry, ConnectionsMap } from "./types.ts";
export { createConnectorRegistry } from "./registry.ts";

// Non-SQL client factories for TypeScript handlers
export { createAirtableClient } from "./airtable.ts";
export type { AirtableClient, AirtableRecord } from "./airtable.ts";

export { createGoogleAnalyticsClient } from "./google-analytics.ts";
export type { GoogleAnalyticsClient } from "./google-analytics.ts";

export { createKintoneClient } from "./kintone.ts";
export type { KintoneClient } from "./kintone.ts";

export { createWixStoreClient } from "./wix-store.ts";
export type { WixStoreClient } from "./wix-store.ts";

export { createDbtClient } from "./dbt.ts";
export type { DbtClient } from "./dbt.ts";

import { createConnectorRegistry } from "./registry.ts";

// State is held in closure, so destructuring works without bind()
export const { getClient, loadConnections, reloadEnvFile, watchConnectionsFile } =
  createConnectorRegistry();
