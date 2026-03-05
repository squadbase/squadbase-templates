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

    // --- Cache disabled (ttl=0 or no cache config) ---
    // Backward-compatible: identical to the existing behavior.
    if (ttl <= 0) {
      const result = await ds.handler(params);
      return c.json({ data: result });
    }

    // --- Cache enabled ---
    const cacheKey = buildCacheKey(slug, params);
    const cached = cacheGet(cacheKey);

    if (cached) {
      if (isFresh(cached)) {
        // Cache hit (TTL valid): return as-is
        recordHit(cacheKey);
        const ageSeconds = Math.floor((Date.now() - cached.cachedAt) / 1000);
        c.header("X-Cache", "HIT");
        c.header("X-Cache-Age", String(ageSeconds));
        c.header("Cache-Control", `max-age=${ttl - ageSeconds}`);
        return c.json({ data: cached.data });
      }

      // Cache hit (TTL expired)
      if (cacheConfig?.staleWhileRevalidate) {
        // staleWhileRevalidate: return stale data immediately and refresh in the background
        recordHit(cacheKey);
        const ageSeconds = Math.floor((Date.now() - cached.cachedAt) / 1000);
        c.header("X-Cache", "STALE");
        c.header("X-Cache-Age", String(ageSeconds));
        c.header("Cache-Control", `max-age=0, stale-while-revalidate=${ttl}`);

        // Background refresh (does not block the response)
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

      // staleWhileRevalidate=false: expired, so fetch synchronously
      // (falls through to the MISS flow below)
    }

    // Cache miss (or cache enabled but TTL expired and staleWhileRevalidate=false)
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
