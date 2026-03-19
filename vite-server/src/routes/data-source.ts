import { Hono, type Context } from "hono";
import { getDataSource, loadTypeScriptHandler } from "../registry.ts";
import {
  buildCacheKey,
  cacheGet,
  cacheSet,
  isFresh,
  recordHit,
} from "../cache.ts";

const app = new Hono();

function buildSqlResponse(c: Context, result: unknown): Response {
  return c.json({ data: result });
}

function buildTypescriptResponse(result: unknown): Response {
  return result as Response;
}

// Also accessible via GET without params (for browser inspection and debugging)
app.get("/:slug", async (c) => {
  const slug = c.req.param("slug");
  const ds = getDataSource(slug);

  if (!ds) {
    return c.json({ error: `Data source '${slug}' not found` }, 404);
  }

  try {
    if (ds._isTypescript && ds._tsHandlerPath) {
      const handler = await loadTypeScriptHandler(ds._tsHandlerPath);
      const result = await handler(c);
      return buildTypescriptResponse(result);
    } else {
      const result = await ds.handler({});
      return buildSqlResponse(c, result);
    }
  } catch (e) {
    console.error(`[data-source] ${slug} error:`, e);
    return c.json(
      { error: e instanceof Error ? e.message : "Internal error" },
      500,
    );
  }
});

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
    if (ttl <= 0) {
      if (ds._isTypescript && ds._tsHandlerPath) {
        const handler = await loadTypeScriptHandler(ds._tsHandlerPath);
        const result = await handler(c);
        return buildTypescriptResponse(result);
      } else {
        const result = await ds.handler(params);
        return buildSqlResponse(c, result);
      }
    }

    // --- Cache enabled ---
    const cacheKey = buildCacheKey(slug, params);
    const cached = cacheGet(cacheKey);

    const buildResponse = ds._isTypescript
      ? (r: unknown) => buildTypescriptResponse(r)
      : (r: unknown) => buildSqlResponse(c, r);

    if (cached) {
      if (isFresh(cached)) {
        // Cache hit (TTL valid): return as-is
        recordHit(cacheKey);
        const ageSeconds = Math.floor((Date.now() - cached.cachedAt) / 1000);
        c.header("X-Cache", "HIT");
        c.header("X-Cache-Age", String(ageSeconds));
        c.header("Cache-Control", `max-age=${ttl - ageSeconds}`);
        return buildResponse(cached.data);
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
            let freshData: unknown;
            if (ds._isTypescript && ds._tsHandlerPath) {
              const tsHandler = await loadTypeScriptHandler(ds._tsHandlerPath);
              freshData = await tsHandler(c);
            } else {
              freshData = await ds.handler(params);
            }
            cacheSet(cacheKey, freshData, ttl);
            console.log(`[cache] background revalidated: ${cacheKey}`);
          } catch (e) {
            console.error(`[cache] background revalidation failed for ${slug}:`, e);
          }
        })();

        return buildResponse(cached.data);
      }

      // staleWhileRevalidate=false: expired, so fetch synchronously
      // (falls through to the MISS flow below)
    }

    // Cache miss (or cache enabled but TTL expired and staleWhileRevalidate=false)
    let result: unknown;
    if (ds._isTypescript && ds._tsHandlerPath) {
      const handler = await loadTypeScriptHandler(ds._tsHandlerPath);
      result = await handler(c);
    } else {
      result = await ds.handler(params);
    }
    cacheSet(cacheKey, result, ttl);

    c.header("X-Cache", "MISS");
    c.header("X-Cache-Age", "0");
    c.header("Cache-Control", `max-age=${ttl}`);

    return buildResponse(result);
  } catch (e) {
    console.error(`[data-source] ${slug} error:`, e);
    return c.json(
      { error: e instanceof Error ? e.message : "Internal error" },
      500,
    );
  }
});

export default app;
