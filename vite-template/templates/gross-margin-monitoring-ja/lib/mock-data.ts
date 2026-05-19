import type {
  Category,
  MarginTrendPoint,
  CategoryMarginRow,
  ProductMarginScatterPoint,
  KpiItem,
} from "@/types/gross-margin-monitoring"

// ── Helpers ──

const BASE_DATE = new Date("2024-03-31")

function ym(monthsAgo: number): string {
  const d = new Date(BASE_DATE)
  d.setDate(1)
  d.setMonth(d.getMonth() - monthsAgo)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

function seededRand(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const rng = seededRand(37)
function srand(min: number, max: number): number {
  return min + rng() * (max - min)
}

// ── Categories with baseline characteristics (JPY) ──

const CATEGORIES: Category[] = [
  "アパレル",
  "家電",
  "ホーム&リビング",
  "食品",
  "ビューティー",
  "スポーツ",
]

interface CategoryBaseline {
  baseMargin: number
  baseRevenue: number
}

const CATEGORY_BASELINE: Record<Category, CategoryBaseline> = {
  アパレル: { baseMargin: 0.48, baseRevenue: 42_000_000 },
  家電: { baseMargin: 0.22, baseRevenue: 36_000_000 },
  "ホーム&リビング": { baseMargin: 0.41, baseRevenue: 28_000_000 },
  食品: { baseMargin: 0.32, baseRevenue: 24_000_000 },
  ビューティー: { baseMargin: 0.58, baseRevenue: 22_000_000 },
  スポーツ: { baseMargin: 0.39, baseRevenue: 18_000_000 },
}

// ── Margin trend (12 months) ──

function generateMarginTrend(): MarginTrendPoint[] {
  const points: MarginTrendPoint[] = []
  for (let i = 11; i >= 0; i--) {
    let revenue = 0
    let cogs = 0
    for (const cat of CATEGORIES) {
      const baseline = CATEGORY_BASELINE[cat]
      const trend = 1 + (11 - i) * 0.0035
      const noise = 0.9 + srand(0, 0.2)
      const catRevenue = baseline.baseRevenue * trend * noise
      const marginNoise = 1 + srand(-0.04, 0.04)
      const catMargin = baseline.baseMargin * marginNoise
      revenue += catRevenue
      cogs += catRevenue * (1 - catMargin)
    }
    const grossProfit = revenue - cogs
    const marginPct = (grossProfit / revenue) * 100
    points.push({
      month: ym(i),
      revenue: Math.round(revenue),
      cogs: Math.round(cogs),
      grossProfit: Math.round(grossProfit),
      marginPct: Math.round(marginPct * 10) / 10,
    })
  }
  return points
}

export const marginTrend: MarginTrendPoint[] = generateMarginTrend()

// ── Category ranking (latest month) ──

function generateCategoryRanking(): CategoryMarginRow[] {
  const rows = CATEGORIES.map((cat) => {
    const baseline = CATEGORY_BASELINE[cat]
    const revenue = Math.round(baseline.baseRevenue * (1 + srand(-0.08, 0.16)))
    const marginPct = baseline.baseMargin * 100 * (1 + srand(-0.06, 0.06))
    const grossProfit = Math.round((revenue * marginPct) / 100)
    const cogs = revenue - grossProfit
    const vsPrevMonth = Math.round(srand(-3.2, 4.5) * 10) / 10
    return {
      category: cat,
      revenue,
      cogs,
      grossProfit,
      marginPct: Math.round(marginPct * 10) / 10,
      vsPrevMonth,
    }
  })
  const sorted = rows
    .slice()
    .sort((a, b) => b.marginPct - a.marginPct)
    .map((r, i) => ({ rank: i + 1, ...r }))
  return sorted
}

export const categoryRanking: CategoryMarginRow[] = generateCategoryRanking()

// ── Product scatter (signature element) ──

const PRODUCT_NAMES: Record<Category, string[]> = {
  アパレル: ["定番Tシャツ", "スリムジーンズ", "レザージャケット", "ニットセーター", "サマードレス", "ポロシャツ"],
  家電: ["ワイヤレスイヤホン", "スマートウォッチ", "USB-Cハブ", "Bluetoothスピーカー", "ノートPCスタンド", "4Kウェブカム"],
  "ホーム&リビング": ["アロマディフューザー", "ブランケット", "セラミックマグセット", "リネン寝具", "ウォールクロック", "フロアランプ"],
  食品: ["シングルオリジンコーヒー", "オリーブオイル500ml", "グラノーラミックス", "ダークチョコレート", "パスタソース", "スパイスパック"],
  ビューティー: ["ナイアシンアミド美容液", "リップバーム", "フェイスマスク", "ヘアオイル", "ボディウォッシュ", "ハンドクリーム"],
  スポーツ: ["ヨガマット", "ランニングショーツ", "レジスタンスバンド", "トレイルバックパック", "フォームローラー", "スポーツボトル"],
}

function generateProductScatter(): ProductMarginScatterPoint[] {
  const out: ProductMarginScatterPoint[] = []
  let productCounter = 0
  for (const cat of CATEGORIES) {
    const baseline = CATEGORY_BASELINE[cat]
    const names = PRODUCT_NAMES[cat]
    for (let i = 0; i < 6; i++) {
      productCounter += 1
      const marginNoise = 1 + srand(-0.3, 0.3)
      const marginPct = Math.max(
        2,
        Math.min(78, baseline.baseMargin * 100 * marginNoise),
      )
      const revenueNoise = 0.45 + srand(0, 1.4)
      const revenue = Math.round((baseline.baseRevenue / 6) * revenueNoise)
      const grossProfit = Math.round((revenue * marginPct) / 100)
      out.push({
        productId: `P-${String(productCounter).padStart(4, "0")}`,
        productName: names[i],
        category: cat,
        revenue,
        grossProfit,
        marginPct: Math.round(marginPct * 10) / 10,
      })
    }
  }
  return out
}

export const productScatter: ProductMarginScatterPoint[] = generateProductScatter()

// ── KPIs (latest month) ──

function computeKpis(): KpiItem[] {
  const latest = marginTrend[marginTrend.length - 1]
  const prev = marginTrend[marginTrend.length - 2]
  const pct = (now: number, prev: number) =>
    prev === 0 ? 0 : Math.round(((now - prev) / prev) * 1000) / 10

  return [
    {
      label: "売上総額",
      value: `¥${(latest.revenue / 100_000_000).toFixed(2)}億`,
      change: pct(latest.revenue, prev.revenue),
      changeLabel: "前月比",
      positiveIsGood: true,
      sparklineData: marginTrend.map((m) => m.revenue),
    },
    {
      label: "原価",
      value: `¥${(latest.cogs / 100_000_000).toFixed(2)}億`,
      change: pct(latest.cogs, prev.cogs),
      changeLabel: "前月比",
      positiveIsGood: false,
      sparklineData: marginTrend.map((m) => m.cogs),
    },
    {
      label: "粗利額",
      value: `¥${(latest.grossProfit / 100_000_000).toFixed(2)}億`,
      change: pct(latest.grossProfit, prev.grossProfit),
      changeLabel: "前月比",
      positiveIsGood: true,
      sparklineData: marginTrend.map((m) => m.grossProfit),
    },
    {
      label: "粗利率",
      value: `${latest.marginPct.toFixed(1)}%`,
      change: Math.round((latest.marginPct - prev.marginPct) * 10) / 10,
      changeLabel: "前月比 (pp)",
      positiveIsGood: true,
      sparklineData: marginTrend.map((m) => m.marginPct),
    },
    {
      label: "粗利率の前月比",
      value: `${latest.marginPct - prev.marginPct >= 0 ? "+" : ""}${(latest.marginPct - prev.marginPct).toFixed(1)}pp`,
      change: Math.round((latest.marginPct - prev.marginPct) * 10) / 10,
      changeLabel: "前月比",
      positiveIsGood: true,
      sparklineData: marginTrend.map((m, i, arr) =>
        i === 0 ? 0 : m.marginPct - arr[i - 1].marginPct,
      ),
    },
  ]
}

export const headerKpis: KpiItem[] = computeKpis()

// ── Filter options ──

export const categoryOptions = [
  { label: "全カテゴリ", value: "all" },
  ...CATEGORIES.map((c) => ({ label: c, value: c })),
]

export const CATEGORY_LIST = CATEGORIES
