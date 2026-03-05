import app from "./index.ts";
import { serveStatic } from "@hono/node-server/serve-static";
import path from "node:path";
import fs from "node:fs";

// import.meta.dirname = dist/server/ → ../client = dist/client/
const STATIC_DIR =
  process.env.STATIC_DIR ?? path.join(import.meta.dirname, "../client");

// Hashed assets (long-term cache)
app.use(
  "/assets/*",
  serveStatic({
    root: STATIC_DIR,
    onFound: (_path, c) => {
      c.header("Cache-Control", "public, max-age=31536000, immutable");
    },
  }),
);

// Other static files
app.use("/*", serveStatic({ root: STATIC_DIR }));

// SPA fallback
app.get("*", (c) => {
  const indexPath = path.join(STATIC_DIR, "index.html");
  if (!fs.existsSync(indexPath)) return c.text("index.html not found", 404);
  return c.html(fs.readFileSync(indexPath, "utf-8"));
});

export default app;
// @hono/vite-build/node automatically injects serve({ fetch: app.fetch, port: 3280 })
