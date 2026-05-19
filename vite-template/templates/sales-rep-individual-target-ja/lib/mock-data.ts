import type {
  SalesRepMonthlyRow,
  KpiItem,
  RepAttainment,
  RepPaceRow,
  RepMonthlyTrend,
  RepPaceStatus,
  CurrentMonthMeta,
} from "@/types/sales-rep-individual-target"

// ── Seeded RNG ──

function seededRand(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const rng = seededRand(73)

function srand(min: number, max: number): number {
  return min + rng() * (max - min)
}

// ── 営業担当者プロフィール ──

interface RepProfile {
  name: string
  team: string
  baseQuota: number // 月間目標 (円)
  performance: number // 通期での目標達成倍率
  variability: number // 0..1 — 月次の振れ幅
}

const REPS: RepProfile[] = [
  { name: "田中 太郎",   team: "east",    baseQuota: 12_000_000, performance: 1.06, variability: 0.18 },
  { name: "佐藤 花子",   team: "east",    baseQuota: 11_000_000, performance: 0.96, variability: 0.22 },
  { name: "鈴木 健一",   team: "west",    baseQuota: 13_000_000, performance: 1.12, variability: 0.14 },
  { name: "高橋 美咲",   team: "west",    baseQuota: 12_500_000, performance: 0.88, variability: 0.20 },
  { name: "山本 拓海",   team: "central", baseQuota: 11_500_000, performance: 1.02, variability: 0.16 },
  { name: "中村 あかり", team: "central", baseQuota: 10_500_000, performance: 0.78, variability: 0.24 },
  { name: "小林 翼",     team: "east",    baseQuota: 10_000_000, performance: 1.18, variability: 0.12 },
  { name: "渡辺 大輔",   team: "west",    baseQuota: 14_000_000, performance: 0.94, variability: 0.18 },
]

// ── カレンダー初期化 ──
// "当月" は決定的に固定 — 同じデータが毎回描画されるようにする

const BASE_DATE = new Date("2024-03-18")

function monthKey(year: number, month: number): string {
  const m = (month + 1).toString().padStart(2, "0")
  return `${year}-${m}-01`
}

function getMonthSequence(anchor: Date, monthsBack: number): string[] {
  const out: string[] = []
  for (let i = monthsBack; i >= 0; i--) {
    const d = new Date(anchor.getFullYear(), anchor.getMonth() - i, 1)
    out.push(monthKey(d.getFullYear(), d.getMonth()))
  }
  return out
}

const MONTHS = getMonthSequence(BASE_DATE, 11) // 当月を含む 12 ヶ月

// ── 営業日カウンター (月〜金) ──

function countBusinessDays(year: number, month: number, untilDay?: number): number {
  const lastDay = new Date(year, month + 1, 0).getDate()
  const end = untilDay ? Math.min(untilDay, lastDay) : lastDay
  let count = 0
  for (let d = 1; d <= end; d++) {
    const dow = new Date(year, month, d).getDay()
    if (dow !== 0 && dow !== 6) count += 1
  }
  return count
}

const currentMonthYear = BASE_DATE.getFullYear()
const currentMonthMonth = BASE_DATE.getMonth()
const BUSINESS_DAYS_TOTAL = countBusinessDays(currentMonthYear, currentMonthMonth)
const BUSINESS_DAYS_ELAPSED = countBusinessDays(
  currentMonthYear,
  currentMonthMonth,
  BASE_DATE.getDate(),
)
const BUSINESS_DAYS_REMAINING = BUSINESS_DAYS_TOTAL - BUSINESS_DAYS_ELAPSED

export const currentMonthMeta: CurrentMonthMeta = {
  monthLabel: BASE_DATE.toLocaleDateString("ja-JP", { year: "numeric", month: "long" }),
  businessDaysTotal: BUSINESS_DAYS_TOTAL,
  businessDaysElapsed: BUSINESS_DAYS_ELAPSED,
  businessDaysRemaining: BUSINESS_DAYS_REMAINING,
}

// ── 生データ (sales_rep, target, actual, month) ──

function generateRows(): SalesRepMonthlyRow[] {
  const rows: SalesRepMonthlyRow[] = []
  const currentMonthKey = MONTHS[MONTHS.length - 1]
  const elapsedShare = BUSINESS_DAYS_ELAPSED / BUSINESS_DAYS_TOTAL

  for (const rep of REPS) {
    for (const month of MONTHS) {
      const monthIdx = MONTHS.indexOf(month)
      const quotaTrend = 1 + monthIdx * 0.004
      const target = Math.round(rep.baseQuota * quotaTrend)

      const noise = 1 - rep.variability + srand(0, rep.variability * 2)
      let actual = rep.performance * target * noise

      // 当月 (進行中) は経過率 + ノイズ
      if (month === currentMonthKey) {
        const paceNoise = 0.85 + srand(0, 0.30)
        actual = rep.performance * target * elapsedShare * paceNoise
      }

      rows.push({
        sales_rep: rep.name,
        target,
        actual: Math.max(0, Math.round(actual)),
        month,
      })
    }
  }
  return rows
}

export const salesRepRows: SalesRepMonthlyRow[] = generateRows()

// ── 派生: 当月の達成率 ──

function getStatus(attainmentPct: number, paceDeltaPct: number): RepPaceStatus {
  if (paceDeltaPct >= 5 || attainmentPct >= 100) return "ahead"
  if (paceDeltaPct >= -5) return "on-track"
  return "behind"
}

function currentMonthRows(): SalesRepMonthlyRow[] {
  const currentMonth = MONTHS[MONTHS.length - 1]
  return salesRepRows.filter((r) => r.month === currentMonth)
}

function deriveRepAttainments(): RepAttainment[] {
  const elapsedShare = BUSINESS_DAYS_ELAPSED / BUSINESS_DAYS_TOTAL
  return currentMonthRows()
    .map((r) => {
      const attainmentPct = (r.actual / r.target) * 100
      const expectedToDatePct = elapsedShare * 100
      const paceDeltaPct = attainmentPct - expectedToDatePct
      return {
        salesRep: r.sales_rep,
        target: r.target,
        actual: r.actual,
        remaining: Math.max(0, r.target - r.actual),
        attainmentPct,
        status: getStatus(attainmentPct, paceDeltaPct),
      }
    })
    .sort((a, b) => b.attainmentPct - a.attainmentPct)
}

export const repAttainments: RepAttainment[] = deriveRepAttainments()

// ── 派生: ペース判定 ──

function derivePaceRows(): RepPaceRow[] {
  return currentMonthRows()
    .map((r) => {
      const attainmentPct = (r.actual / r.target) * 100
      const actualDailyAvg =
        BUSINESS_DAYS_ELAPSED > 0 ? r.actual / BUSINESS_DAYS_ELAPSED : 0
      const requiredDailyAvg =
        BUSINESS_DAYS_REMAINING > 0
          ? Math.max(0, (r.target - r.actual) / BUSINESS_DAYS_REMAINING)
          : 0
      const denominatorDailyAvg =
        BUSINESS_DAYS_TOTAL > 0 ? r.target / BUSINESS_DAYS_TOTAL : 0
      const paceDeltaPct =
        denominatorDailyAvg > 0
          ? ((actualDailyAvg - denominatorDailyAvg) / denominatorDailyAvg) * 100
          : 0
      return {
        salesRep: r.sales_rep,
        target: r.target,
        actual: r.actual,
        remaining: Math.max(0, r.target - r.actual),
        attainmentPct,
        requiredDailyAvg,
        actualDailyAvg,
        paceDeltaPct,
        status: getStatus(attainmentPct, paceDeltaPct),
      }
    })
    .sort((a, b) => a.paceDeltaPct - b.paceDeltaPct)
}

export const repPaceRows: RepPaceRow[] = derivePaceRows()

// ── 派生: 個人別の月次トレンド ──

function deriveMonthlyTrends(): RepMonthlyTrend[] {
  const elapsedShare = BUSINESS_DAYS_ELAPSED / BUSINESS_DAYS_TOTAL
  return REPS.map((rep) => {
    const repRows = salesRepRows.filter((r) => r.sales_rep === rep.name)
    const points = repRows.map((r) => ({
      month: r.month.slice(0, 7),
      target: r.target,
      actual: r.actual,
    }))
    const last = repRows[repRows.length - 1]
    const attainmentPct = (last.actual / last.target) * 100
    const paceDeltaPct = attainmentPct - elapsedShare * 100
    return {
      salesRep: rep.name,
      points,
      latestAttainmentPct: attainmentPct,
      status: getStatus(attainmentPct, paceDeltaPct),
    }
  }).sort((a, b) => b.latestAttainmentPct - a.latestAttainmentPct)
}

export const repMonthlyTrends: RepMonthlyTrend[] = deriveMonthlyTrends()

// ── トップライン KPI (ヘッダーサマリー) ──

function pct(now: number, prev: number): number {
  return prev === 0 ? 0 : Math.round(((now - prev) / prev) * 1000) / 10
}

function computeKpis(): KpiItem[] {
  const totalTarget = repAttainments.reduce((s, r) => s + r.target, 0)
  const totalActual = repAttainments.reduce((s, r) => s + r.actual, 0)
  const teamAttainment = (totalActual / totalTarget) * 100
  const totalRemaining = Math.max(0, totalTarget - totalActual)

  const prevMonth = MONTHS[MONTHS.length - 2]
  const prevRows = salesRepRows.filter((r) => r.month === prevMonth)
  const prevTarget = prevRows.reduce((s, r) => s + r.target, 0)
  const prevActual = prevRows.reduce((s, r) => s + r.actual, 0)
  const prevAttainment = (prevActual / prevTarget) * 100

  const trend: number[] = MONTHS.map((m) => {
    const rows = salesRepRows.filter((r) => r.month === m)
    const t = rows.reduce((s, r) => s + r.target, 0)
    const a = rows.reduce((s, r) => s + r.actual, 0)
    return t === 0 ? 0 : (a / t) * 100
  })

  const actualTrend: number[] = MONTHS.map((m) => {
    return salesRepRows.filter((r) => r.month === m).reduce((s, r) => s + r.actual, 0)
  })
  const targetTrend: number[] = MONTHS.map((m) => {
    return salesRepRows.filter((r) => r.month === m).reduce((s, r) => s + r.target, 0)
  })
  const remainingTrend: number[] = MONTHS.map((m) => {
    const rows = salesRepRows.filter((r) => r.month === m)
    const t = rows.reduce((s, r) => s + r.target, 0)
    const a = rows.reduce((s, r) => s + r.actual, 0)
    return Math.max(0, t - a)
  })

  return [
    {
      label: "個人別目標 (合計)",
      value: `¥${Math.round(totalTarget).toLocaleString("ja-JP")}`,
      change: pct(totalTarget, prevTarget),
      changeLabel: "前月比",
      positiveIsGood: true,
      sparklineData: targetTrend,
    },
    {
      label: "個人別実績 (合計)",
      value: `¥${Math.round(totalActual).toLocaleString("ja-JP")}`,
      change: pct(totalActual, prevActual),
      changeLabel: "前月比",
      positiveIsGood: true,
      sparklineData: actualTrend,
    },
    {
      label: "達成率",
      value: `${teamAttainment.toFixed(1)}%`,
      change: Math.round((teamAttainment - prevAttainment) * 10) / 10,
      changeLabel: "前月比 pt",
      positiveIsGood: true,
      sparklineData: trend,
    },
    {
      label: "残目標",
      value: `¥${Math.round(totalRemaining).toLocaleString("ja-JP")}`,
      change: 0,
      changeLabel: `100% 未達 ${repAttainments.filter((r) => r.attainmentPct < 100).length} 名`,
      positiveIsGood: false,
      sparklineData: remainingTrend,
    },
    {
      label: "残営業日数",
      value: `${BUSINESS_DAYS_REMAINING} / ${BUSINESS_DAYS_TOTAL}`,
      change: 0,
      changeLabel: `当月 ${BUSINESS_DAYS_ELAPSED} / ${BUSINESS_DAYS_TOTAL} 日経過`,
      positiveIsGood: false,
      sparklineData: [],
    },
  ]
}

export const headerKpis: KpiItem[] = computeKpis()

// ── フィルタオプション ──

export const teamOptions = [
  { label: "全チーム", value: "all" },
  { label: "東日本", value: "east" },
  { label: "西日本", value: "west" },
  { label: "中部", value: "central" },
]

export const repOptions = [
  { label: "全担当者", value: "all" },
  ...REPS.map((r) => ({ label: r.name, value: r.name })),
]
