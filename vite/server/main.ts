import app from "./index.ts";
import { serveStatic } from "@hono/node-server/serve-static";
import path from "node:path";
import fs from "node:fs";

// import.meta.dirname = dist/server/ → ../client = dist/client/
const STATIC_DIR =
  process.env.STATIC_DIR ?? path.join(import.meta.dirname, "../client");

// ハッシュ付きアセット（長期キャッシュ）
app.use(
  "/assets/*",
  serveStatic({
    root: STATIC_DIR,
    onFound: (_path, c) => {
      c.header("Cache-Control", "public, max-age=31536000, immutable");
    },
  }),
);

// その他の静的ファイル
app.use("/*", serveStatic({ root: STATIC_DIR }));

// SPA フォールバック
app.get("*", (c) => {
  const indexPath = path.join(STATIC_DIR, "index.html");
  if (!fs.existsSync(indexPath)) return c.text("index.html not found", 404);
  return c.html(fs.readFileSync(indexPath, "utf-8"));
});

export default app;
// @hono/vite-build/node が serve({ fetch: app.fetch, port: 3280 }) を自動注入
