import { Hono } from "hono";
import { cors } from "hono/cors";
import { initialize, startWatching } from "./registry.ts";
import { watchConnectionsFile } from "./connector-client.ts";
import dataSourceRoutes from "./routes/data-source.ts";
import dataSourceMetaRoutes from "./routes/data-source-meta.ts";
import cacheRoutes from "./routes/cache.ts";
import pagesRoutes from "./routes/pages.ts";

const apiApp = new Hono();
apiApp.use("/*", cors());
apiApp.route("/data-source", dataSourceRoutes);
apiApp.route("/data-source-meta", dataSourceMetaRoutes);
apiApp.route("/cache", cacheRoutes);
apiApp.route("/", pagesRoutes);

await initialize();
if (process.env.NODE_ENV !== "production") {
  startWatching();
  watchConnectionsFile();
}

const app = new Hono();
app.get("/healthz", (c) => c.json({ status: "ok" }));
app.route("/api", apiApp);

export default app;
