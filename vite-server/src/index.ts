import { Hono } from "hono";
import { contextStorage } from "hono/context-storage";
import { cors } from "hono/cors";
import path from "node:path";
import { initialize, startWatching } from "./registry.ts";
import { watchConnectionsFile, reloadEnvFile } from "./connector-client/index.ts";
import serverLogicRoutes from "./routes/server-logic.ts";
import serverLogicMetaRoutes from "./routes/server-logic-meta.ts";
import cacheRoutes from "./routes/cache.ts";
import pagesRoutes from "./routes/pages.ts";

// Re-export non-SQL client factories and types for TypeScript handlers
export {
  createAirtableClient,
  createGoogleAnalyticsClient,
  createKintoneClient,
  createWixStoreClient,
  createDbtClient,
  getQuery,
  loadConnections,
} from "./connector-client/index.ts";
export type {
  QueryFn,
  ConnectionEntry,
  ConnectionsMap,
  AirtableClient,
  AirtableRecord,
  GoogleAnalyticsClient,
  KintoneClient,
  WixStoreClient,
  DbtClient,
} from "./connector-client/index.ts";
export { connection } from "./connection.ts";
export type { ConnectionFetchOptions } from "./connection.ts";

const apiApp = new Hono();
apiApp.use("/*", contextStorage());
apiApp.use("/*", cors());
apiApp.route("/server-logic", serverLogicRoutes);
apiApp.route("/server-logic-meta", serverLogicMetaRoutes);
apiApp.route("/cache", cacheRoutes);
apiApp.route("/", pagesRoutes);

// Load .env at startup (Vite does not pass env vars without VITE_ prefix to the server)
reloadEnvFile(path.join(process.cwd(), ".env"));
await initialize();
startWatching();
watchConnectionsFile();

const app = new Hono();
app.get("/healthz", (c) => c.json({ status: "ok" }));
app.route("/api", apiApp);

export default app;
