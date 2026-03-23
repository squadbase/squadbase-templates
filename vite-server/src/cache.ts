// packages/app-template/server/cache.ts

export interface CacheEntry {
  data: unknown;
  cachedAt: number;   // Unix milliseconds
  ttl: number;        // seconds (0 = no cache)
  hits: number;       // cache hit count (for stats)
}

interface CacheStats {
  size: number;
  maxSize: number;
  totalHits: number;
  totalMisses: number;
  entries: {
    key: string;
    cachedAt: number;
    ttl: number;
    ageSeconds: number;
    hits: number;
    expired: boolean;
  }[];
}

const MAX_SIZE = 100;

// Map preserves insertion order of keys.
// On get, delete→set moves the accessed entry to the end.
// On eviction, the first (least recently accessed) key is deleted.
const cache = new Map<string, CacheEntry>();

let totalHits = 0;
let totalMisses = 0;

/**
 * Get an entry from the cache.
 * Returns the entry even if TTL has expired (caller decides what to do for staleWhileRevalidate).
 */
export function cacheGet(key: string): CacheEntry | undefined {
  const entry = cache.get(key);
  if (!entry) {
    totalMisses++;
    return undefined;
  }

  // LRU: move accessed entry to the end
  cache.delete(key);
  cache.set(key, entry);

  return entry;
}

/**
 * Check whether an entry is still valid (within TTL).
 */
export function isFresh(entry: CacheEntry): boolean {
  if (entry.ttl <= 0) return false;
  const ageMs = Date.now() - entry.cachedAt;
  return ageMs < entry.ttl * 1000;
}

/**
 * Store an entry in the cache.
 * If MAX_SIZE is exceeded, evicts the oldest entry (front of Map) via LRU.
 */
export function cacheSet(key: string, data: unknown, ttl: number): void {
  if (ttl <= 0) return; // ttl=0 means do not cache

  // When updating an existing entry, delete and re-insert at the end
  if (cache.has(key)) {
    cache.delete(key);
  } else if (cache.size >= MAX_SIZE) {
    // LRU eviction: delete the first key in Map (least recently accessed)
    const oldestKey = cache.keys().next().value;
    if (oldestKey !== undefined) {
      cache.delete(oldestKey);
      console.log(`[cache] evicted: ${oldestKey}`);
    }
  }

  cache.set(key, {
    data,
    cachedAt: Date.now(),
    ttl,
    hits: 0,
  });
}

/**
 * Increment the hit count for a cache entry (for stats).
 */
export function recordHit(key: string): void {
  totalHits++;
  const entry = cache.get(key);
  if (entry) {
    entry.hits++;
  }
}

/**
 * Delete all entries associated with a specific slug.
 * Keys have the format "{slug}:{paramsJson}", so deletion is done by prefix match.
 */
export function invalidateSlug(slug: string): number {
  const prefix = `${slug}:`;
  let count = 0;
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
      count++;
    }
  }
  console.log(`[cache] invalidated ${count} entries for slug: ${slug}`);
  return count;
}

/**
 * Clear the entire cache.
 */
export function invalidateAll(): number {
  const count = cache.size;
  cache.clear();
  totalHits = 0;
  totalMisses = 0;
  console.log(`[cache] invalidated all ${count} entries`);
  return count;
}

/**
 * Get cache statistics.
 */
export function getStats(): CacheStats {
  const now = Date.now();
  const entries = Array.from(cache.entries()).map(([key, entry]) => ({
    key,
    cachedAt: entry.cachedAt,
    ttl: entry.ttl,
    ageSeconds: Math.floor((now - entry.cachedAt) / 1000),
    hits: entry.hits,
    expired: !isFresh(entry),
  }));

  return {
    size: cache.size,
    maxSize: MAX_SIZE,
    totalHits,
    totalMisses,
    entries,
  };
}

/**
 * Build a cache key from slug and params.
 * Params are serialized with JSON.stringify.
 * Keys are sorted before serialization to avoid inconsistencies due to object key ordering.
 */
export function buildCacheKey(slug: string, params: Record<string, unknown>): string {
  // Normalize key order so the same params never produce different keys
  const sortedParams = Object.fromEntries(
    Object.entries(params).sort(([a], [b]) => a.localeCompare(b)),
  );
  return `${slug}:${JSON.stringify(sortedParams)}`;
}
