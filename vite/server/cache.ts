// packages/app-template/server/cache.ts

export interface CacheEntry {
  data: unknown;
  cachedAt: number;   // Unix ミリ秒
  ttl: number;        // 秒 (0 = キャッシュなし)
  hits: number;       // キャッシュヒット回数（統計用）
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

// Map はキーの挿入順序を保持する。
// get 時に delete→set を行うことで、最近アクセスしたものが末尾に来る。
// エビクション時は先頭（最も古くアクセスされた）キーを削除する。
const cache = new Map<string, CacheEntry>();

let totalHits = 0;
let totalMisses = 0;

/**
 * キャッシュからエントリを取得する。
 * TTL が切れていても staleWhileRevalidate のためにエントリは返す（呼び出し側が判断）。
 */
export function cacheGet(key: string): CacheEntry | undefined {
  const entry = cache.get(key);
  if (!entry) {
    totalMisses++;
    return undefined;
  }

  // LRU: アクセスされたエントリを末尾に移動する
  cache.delete(key);
  cache.set(key, entry);

  return entry;
}

/**
 * エントリが有効（TTL 範囲内）かどうかを判定する。
 */
export function isFresh(entry: CacheEntry): boolean {
  if (entry.ttl <= 0) return false;
  const ageMs = Date.now() - entry.cachedAt;
  return ageMs < entry.ttl * 1000;
}

/**
 * キャッシュにエントリを保存する。
 * MAX_SIZE を超える場合は最も古いエントリ（Map の先頭）を削除する（LRU エビクション）。
 */
export function cacheSet(key: string, data: unknown, ttl: number): void {
  if (ttl <= 0) return; // ttl=0 はキャッシュしない

  // 既存エントリを更新する場合は一度削除して末尾に再挿入する
  if (cache.has(key)) {
    cache.delete(key);
  } else if (cache.size >= MAX_SIZE) {
    // LRU エビクション: Map の最初のキー（最も古くアクセス）を削除
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
 * キャッシュヒット数をインクリメントする（統計用）。
 */
export function recordHit(key: string): void {
  totalHits++;
  const entry = cache.get(key);
  if (entry) {
    entry.hits++;
  }
}

/**
 * 特定スラッグに関連する全エントリを削除する。
 * キーの形式は "{slug}:{paramsJson}" なので、プレフィックス一致で削除する。
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
 * キャッシュ全体を削除する。
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
 * キャッシュの統計情報を取得する。
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
 * キャッシュキーを生成する。
 * params は JSON.stringify でシリアライズする。
 * オブジェクトのキー順序による不整合を避けるため、ソートしてからシリアライズする。
 */
export function buildCacheKey(slug: string, params: Record<string, unknown>): string {
  // キー順序を正規化して同じパラメータが異なるキーにならないようにする
  const sortedParams = Object.fromEntries(
    Object.entries(params).sort(([a], [b]) => a.localeCompare(b)),
  );
  return `${slug}:${JSON.stringify(sortedParams)}`;
}
