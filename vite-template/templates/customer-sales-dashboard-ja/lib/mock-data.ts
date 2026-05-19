import type {
  CustomerRankingItem,
  ParetoPoint,
  ChurnCandidate,
  KpiItem,
  AbcClass,
  ChurnRiskLevel,
} from "@/types/customer-sales-dashboard"

// ── Helpers ──

const BASE_DATE = new Date("2024-03-15")

function dateStr(daysAgo: number): string {
  const d = new Date(BASE_DATE)
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString().slice(0, 10)
}

function seededRand(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

// 同一スラグ用シード — customer-sales-dashboard
const rng = seededRand(23)

function srand(min: number, max: number): number {
  return min + rng() * (max - min)
}

// ── 得意先マスタ (シード固定モック) ──

const SEGMENTS = ["大口", "中堅", "小口", "戦略"] as const

const CUSTOMER_NAMES = [
  "あけぼの商事",
  "イーストロジ",
  "卯月フーズ",
  "栄光リテール",
  "笑顔ヘルス",
  "扇屋サプライ",
  "花南インダストリアル",
  "北星アパレル",
  "雲海ホテル",
  "ケヤキ通信",
  "光州製薬",
  "彩都スタジオ",
  "三鶴マニュファクチャ",
  "明星エネルギー",
  "オリオン産機",
  "パイオニア食品",
  "クオンタムマテリアル",
  "赤松ビバレッジ",
  "サミット建設",
  "ツンドラアウトドア",
  "ユニティソフト",
  "ヴァロー保険",
  "ウエストフィールド不動産",
]

// ── ランキング生成 ──

function generateRanking(): CustomerRankingItem[] {
  // パレート的な分布 — 上位少数が売上の大半を占める
  const raw = CUSTOMER_NAMES.map((name, i) => {
    const seg = SEGMENTS[i % SEGMENTS.length]
    // インデックス 0 が最大、減衰しながら下る
    const base = 48_000_000 * Math.pow(0.85, i)
    const noise = 0.78 + srand(0, 0.44)
    const currentRevenue = Math.round(base * noise)
    const yoyDelta = -0.18 + srand(0, 0.42)
    const prevYearRevenue = Math.round(currentRevenue / (1 + yoyDelta))
    const orderCount = Math.max(1, Math.round(currentRevenue / (320_000 + srand(0, 180_000))))
    const daysSinceLastOrder = Math.max(
      1,
      Math.round(srand(2, 14) + (i > 14 ? srand(20, 110) : 0)),
    )
    const lastOrderDate = dateStr(daysSinceLastOrder)
    const yoyChange = Math.round(yoyDelta * 1000) / 10
    const churnRisk: ChurnRiskLevel =
      daysSinceLastOrder > 90
        ? "high"
        : daysSinceLastOrder > 45
          ? "watch"
          : "low"
    return {
      customerId: `C-${1000 + i}`,
      customerName: name,
      segment: seg,
      currentRevenue,
      prevYearRevenue,
      yoyChange,
      orderCount,
      lastOrderDate,
      daysSinceLastOrder,
      churnRisk,
    }
  })

  // 売上降順にソートし ABC を付与
  const sorted = [...raw].sort((a, b) => b.currentRevenue - a.currentRevenue)
  const total = sorted.reduce((s, r) => s + r.currentRevenue, 0)

  let cum = 0
  return sorted.map((r, i) => {
    cum += r.currentRevenue
    const pct = (cum / total) * 100
    const abcClass: AbcClass = pct <= 70 ? "A" : pct <= 90 ? "B" : "C"
    return {
      rank: i + 1,
      customerId: r.customerId,
      customerName: r.customerName,
      segment: r.segment,
      currentRevenue: r.currentRevenue,
      prevYearRevenue: r.prevYearRevenue,
      yoyChange: r.yoyChange,
      orderCount: r.orderCount,
      lastOrderDate: r.lastOrderDate,
      daysSinceLastOrder: r.daysSinceLastOrder,
      abcClass,
      churnRisk: r.churnRisk,
    }
  })
}

export const customerRanking: CustomerRankingItem[] = generateRanking()

// ── パレート点列 ──

function generatePareto(): ParetoPoint[] {
  const total = customerRanking.reduce((s, r) => s + r.currentRevenue, 0)
  let cum = 0
  return customerRanking.map((r) => {
    cum += r.currentRevenue
    return {
      customerId: r.customerId,
      customerName: r.customerName,
      revenue: r.currentRevenue,
      cumulativeRevenue: cum,
      cumulativePct: Math.round((cum / total) * 1000) / 10,
      abcClass: r.abcClass,
    }
  })
}

export const paretoSeries: ParetoPoint[] = generatePareto()

// ── 離反候補 (経過日数の降順) ──

function generateChurnCandidates(): ChurnCandidate[] {
  return customerRanking
    .filter((r) => r.churnRisk !== "low")
    .map((r) => ({
      customerId: r.customerId,
      customerName: r.customerName,
      segment: r.segment,
      lastOrderDate: r.lastOrderDate,
      daysSinceLastOrder: r.daysSinceLastOrder,
      prevYearRevenue: r.prevYearRevenue,
      riskLevel: r.churnRisk,
    }))
    .sort((a, b) => b.daysSinceLastOrder - a.daysSinceLastOrder)
}

export const churnCandidates: ChurnCandidate[] = generateChurnCandidates()

// ── 主要 KPI (ヘッダー直下) ──

function computeKpis(): KpiItem[] {
  const totalRevenue = customerRanking.reduce((s, r) => s + r.currentRevenue, 0)
  const totalPrev = customerRanking.reduce((s, r) => s + r.prevYearRevenue, 0)
  const yoy = ((totalRevenue - totalPrev) / totalPrev) * 100

  // 上位 5 社のシェア
  const top5Revenue = customerRanking
    .slice(0, 5)
    .reduce((s, r) => s + r.currentRevenue, 0)
  const top5Share = (top5Revenue / totalRevenue) * 100

  const churnFlagCount = customerRanking.filter(
    (r) => r.churnRisk !== "low",
  ).length

  return [
    {
      label: "得意先売上 (期間計)",
      value: `¥${(totalRevenue / 100_000_000).toFixed(2)}億`,
      change: Math.round(yoy * 10) / 10,
      changeLabel: "前年比",
      positiveIsGood: true,
      sparklineData: customerRanking.slice(0, 14).map((r) => r.currentRevenue),
    },
    {
      label: "前年比",
      value: `${yoy >= 0 ? "+" : ""}${yoy.toFixed(1)}%`,
      change: Math.round(yoy * 10) / 10,
      changeLabel: "前年比",
      positiveIsGood: true,
      sparklineData: customerRanking
        .slice(0, 14)
        .map((r) =>
          r.prevYearRevenue === 0
            ? 0
            : ((r.currentRevenue - r.prevYearRevenue) / r.prevYearRevenue) * 100,
        ),
    },
    {
      label: "上位5社シェア",
      value: `${top5Share.toFixed(1)}%`,
      change: 0,
      changeLabel: "売上集中度",
      positiveIsGood: false,
      sparklineData: customerRanking
        .slice(0, 10)
        .map((r) => (r.currentRevenue / totalRevenue) * 100),
    },
    {
      label: "離反フラグ件数",
      value: `${churnFlagCount}`,
      change: 0,
      changeLabel: `全 ${customerRanking.length} 社中`,
      positiveIsGood: false,
      sparklineData: customerRanking.map((r) => r.daysSinceLastOrder),
    },
  ]
}

export const headerKpis: KpiItem[] = computeKpis()

// ── フィルター選択肢 ──

export const segmentOptions = [
  { label: "全セグメント", value: "all" },
  ...SEGMENTS.map((s, i) => ({ label: s, value: `seg-${i + 1}` })),
]
