// packages/app-template/server/routes/cache.ts

import { Hono } from "hono";
import {
  getStats,
  invalidateAll,
  invalidateSlug,
} from "../cache.ts";

const app = new Hono();

/**
 * GET /cache/stats
 * キャッシュの統計情報を返す。
 */
app.get("/stats", (c) => {
  const stats = getStats();
  const total = stats.totalHits + stats.totalMisses;
  const hitRate = total > 0
    ? `${((stats.totalHits / total) * 100).toFixed(2)}%`
    : "N/A";

  return c.json({ ...stats, hitRate });
});

/**
 * POST /cache/invalidate
 * キャッシュ全体を削除する。
 */
app.post("/invalidate", (c) => {
  const count = invalidateAll();
  return c.json({ invalidated: count, message: "All cache entries cleared" });
});

/**
 * POST /cache/invalidate/:slug
 * 特定スラッグのキャッシュエントリをすべて削除する。
 */
app.post("/invalidate/:slug", (c) => {
  const slug = c.req.param("slug");
  const count = invalidateSlug(slug);
  return c.json({ slug, invalidated: count });
});

export default app;
