import { Hono } from "hono";
import { getDataSource } from "../registry.ts";
import {
  buildCacheKey,
  cacheGet,
  cacheSet,
  isFresh,
  recordHit,
} from "../cache.ts";

const app = new Hono();

app.post("/:slug", async (c) => {
  const slug = c.req.param("slug");
  const ds = getDataSource(slug);

  if (!ds) {
    return c.json({ error: `Data source '${slug}' not found` }, 404);
  }

  try {
    const body = await c.req.json().catch(() => ({}));
    const params: Record<string, unknown> = body.params ?? {};

    const cacheConfig = ds.cacheConfig;
    const ttl = cacheConfig?.ttl ?? 0;

    // --- キャッシュが無効な場合（ttl=0 またはキャッシュ未設定）---
    // 後方互換性: 既存の動作と完全に同一。
    if (ttl <= 0) {
      const result = await ds.handler(params);
      return c.json({ data: result });
    }

    // --- キャッシュが有効な場合 ---
    const cacheKey = buildCacheKey(slug, params);
    const cached = cacheGet(cacheKey);

    if (cached) {
      if (isFresh(cached)) {
        // キャッシュヒット（TTL 有効）: そのまま返す
        recordHit(cacheKey);
        const ageSeconds = Math.floor((Date.now() - cached.cachedAt) / 1000);
        c.header("X-Cache", "HIT");
        c.header("X-Cache-Age", String(ageSeconds));
        c.header("Cache-Control", `max-age=${ttl - ageSeconds}`);
        return c.json({ data: cached.data });
      }

      // キャッシュヒット（TTL 期限切れ）
      if (cacheConfig?.staleWhileRevalidate) {
        // staleWhileRevalidate: 古いデータを即座に返し、バックグラウンドでリフレッシュ
        recordHit(cacheKey);
        const ageSeconds = Math.floor((Date.now() - cached.cachedAt) / 1000);
        c.header("X-Cache", "STALE");
        c.header("X-Cache-Age", String(ageSeconds));
        c.header("Cache-Control", `max-age=0, stale-while-revalidate=${ttl}`);

        // バックグラウンドでリフレッシュ（レスポンスをブロックしない）
        void (async () => {
          try {
            const freshData = await ds.handler(params);
            cacheSet(cacheKey, freshData, ttl);
            console.log(`[cache] background revalidated: ${cacheKey}`);
          } catch (e) {
            console.error(`[cache] background revalidation failed for ${slug}:`, e);
          }
        })();

        return c.json({ data: cached.data });
      }

      // staleWhileRevalidate=false: 期限切れなのでブロッキングで再取得
      // （MISS と同じフローへ落ちる）
    }

    // キャッシュミス（またはキャッシュ有効だが TTL 期限切れかつ staleWhileRevalidate=false）
    const result = await ds.handler(params);
    cacheSet(cacheKey, result, ttl);

    c.header("X-Cache", "MISS");
    c.header("X-Cache-Age", "0");
    c.header("Cache-Control", `max-age=${ttl}`);

    return c.json({ data: result });
  } catch (e) {
    console.error(`[data-source] ${slug} error:`, e);
    return c.json(
      { error: e instanceof Error ? e.message : "Internal error" },
      500,
    );
  }
});

export default app;
