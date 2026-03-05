import { Hono } from "hono";
import { cors } from "hono/cors";
import path from "node:path";
import { initialize, startWatching } from "./registry.ts";
import { watchConnectionsFile, reloadEnvFile } from "./connector-client/index.ts";
import dataSourceRoutes from "./routes/data-source.ts";
import dataSourceMetaRoutes from "./routes/data-source-meta.ts";
import cacheRoutes from "./routes/cache.ts";
import pagesRoutes from "./routes/pages.ts";

// Re-export non-SQL client factories and types for TypeScript handlers
export {
  createAirtableClient,
  createGoogleAnalyticsClient,
  createKintoneClient,
  createWixStoreClient,
  createDbtClient,
  getClient,
  loadConnections,
} from "./connector-client/index.ts";
export type {
  DatabaseClient,
  ConnectionEntry,
  ConnectionsMap,
  AirtableClient,
  AirtableRecord,
  GoogleAnalyticsClient,
  KintoneClient,
  WixStoreClient,
  DbtClient,
} from "./connector-client/index.ts";

const apiApp = new Hono();
apiApp.use("/*", cors());
apiApp.route("/data-source", dataSourceRoutes);
apiApp.route("/data-source-meta", dataSourceMetaRoutes);
apiApp.route("/cache", cacheRoutes);
apiApp.route("/", pagesRoutes);

// Load .env at startup (Vite does not pass env vars without VITE_ prefix to the server)
reloadEnvFile(path.join(process.cwd(), "..", "..", ".env"));
await initialize();
startWatching();
watchConnectionsFile();

const app = new Hono();
app.get("/healthz", (c) => c.json({ status: "ok" }));
app.route("/api", apiApp);

export default app;
