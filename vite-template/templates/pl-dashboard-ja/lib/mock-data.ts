import type {
  ExpenseCategory,
  ExpenseMonthlyPoint,
  KpiItem,
  PlAccount,
  PlAccountRow,
  WaterfallStep,
  YoyCompareRow,
} from "@/types/pl-dashboard"

// ── Helpers ──

const BASE_DATE = new Date("2024-12-20")

function seededRand(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

// Slug-unique seed for pl-dashboard-ja (different from EN)
const rng = seededRand(20252)

function srand(min: number, max: number): number {
  return Math.round(min + rng() * (max - min))
}

function monthStr(monthsAgo: number): string {
  const d = new Date(BASE_DATE)
  d.setDate(1)
  d.setMonth(d.getMonth() - monthsAgo)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

// ── Constants ──

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "人件費",
  "広告宣伝費",
  "賃借料",
  "外注費",
  "水道光熱費",
  "その他",
]

// ── Monthly PL line (12 months, company-wide) ──

interface MonthlyPl {
  month: string
  revenue: number
  cogs: number
  grossProfit: number
  sga: number
  operatingIncome: number
  nonOpIncome: number
  ordinaryIncome: number
}

function generateMonthlyPl(): MonthlyPl[] {
  const data: MonthlyPl[] = []
  for (let i = 11; i >= 0; i--) {
    const trend = 1 + (11 - i) * 0.011
    const seasonal =
      i === 0 || i === 11 ? 1.07 : i === 5 || i === 6 ? 0.95 : 1.0
    const noise = 0.94 + srand(0, 12) / 100
    // Yen base ~ ¥4.2B/月
    const revenue = Math.round(4_200_000_000 * trend * seasonal * noise)
    const cogs = Math.round(revenue * (0.55 + srand(-2, 2) / 100))
    const grossProfit = revenue - cogs
    const sga = Math.round(revenue * (0.27 + srand(-2, 2) / 100))
    const operatingIncome = grossProfit - sga
    const nonOpIncome = Math.round(operatingIncome * (-0.03 + srand(-1, 2) / 100))
    const ordinaryIncome = operatingIncome + nonOpIncome
    data.push({
      month: monthStr(i),
      revenue,
      cogs,
      grossProfit,
      sga,
      operatingIncome,
      nonOpIncome,
      ordinaryIncome,
    })
  }
  return data
}

const monthlyPl = generateMonthlyPl()
const latest = monthlyPl[monthlyPl.length - 1]
const yoyBase = monthlyPl[0]

// ── Raw rows (matches ticket's expected input data) ──

function generatePlRows(): PlAccountRow[] {
  const rows: PlAccountRow[] = []
  for (const m of monthlyPl) {
    rows.push({ month: m.month, account: "売上高", amount: m.revenue })
    rows.push({ month: m.month, account: "売上原価", amount: m.cogs })
    rows.push({ month: m.month, account: "売上総利益", amount: m.grossProfit })
    rows.push({ month: m.month, account: "販管費", amount: m.sga })
    rows.push({ month: m.month, account: "営業利益", amount: m.operatingIncome })
    rows.push({ month: m.month, account: "営業外損益", amount: m.nonOpIncome })
    rows.push({ month: m.month, account: "経常利益", amount: m.ordinaryIncome })
  }
  return rows
}

export const plRows: PlAccountRow[] = generatePlRows()

// ── Waterfall (latest month) ──

function generateWaterfall(): WaterfallStep[] {
  let cumulative = 0
  const steps: WaterfallStep[] = []
  const push = (label: string, value: number, type: WaterfallStep["type"]) => {
    steps.push({
      label,
      value,
      type,
      cumulative: type === "subtotal" ? value : cumulative,
    })
    if (type === "revenue" || type === "cost") cumulative += value
    else cumulative = value
  }

  push("売上高", latest.revenue, "revenue")
  push("売上原価", -latest.cogs, "cost")
  push("売上総利益", latest.grossProfit, "subtotal")
  push("販管費", -latest.sga, "cost")
  push("営業利益", latest.operatingIncome, "subtotal")
  push("営業外損益", latest.nonOpIncome, "cost")
  push("経常利益", latest.ordinaryIncome, "subtotal")
  return steps
}

export const plWaterfall: WaterfallStep[] = generateWaterfall()

// ── Expense category monthly trend ──

const baseShares: Record<ExpenseCategory, number> = {
  人件費: 0.46,
  広告宣伝費: 0.18,
  賃借料: 0.1,
  外注費: 0.13,
  水道光熱費: 0.04,
  その他: 0.09,
}

function generateExpenseTrend(): ExpenseMonthlyPoint[] {
  return monthlyPl.map((m) => {
    const total = m.cogs + m.sga
    const values = {} as Record<ExpenseCategory, number>
    EXPENSE_CATEGORIES.forEach((c) => {
      const noise = 0.92 + srand(0, 16) / 100
      values[c] = Math.round(total * baseShares[c] * noise)
    })
    return { month: m.month, values }
  })
}

export const expenseTrend: ExpenseMonthlyPoint[] = generateExpenseTrend()

// ── YoY comparison table (latest month vs same month previous year) ──

function generateYoyTable(): YoyCompareRow[] {
  const dampen = (n: number, factor: number) => Math.round(n * factor)
  const prev = {
    売上高: dampen(latest.revenue, 0.88),
    売上原価: dampen(latest.cogs, 0.89),
    売上総利益: dampen(latest.grossProfit, 0.86),
    販管費: dampen(latest.sga, 0.92),
    営業利益: dampen(latest.operatingIncome, 0.81),
    営業外損益: dampen(latest.nonOpIncome, 1.04),
    経常利益: dampen(latest.ordinaryIncome, 0.82),
  } as Record<PlAccount, number>

  const current: Record<PlAccount, number> = {
    売上高: latest.revenue,
    売上原価: latest.cogs,
    売上総利益: latest.grossProfit,
    販管費: latest.sga,
    営業利益: latest.operatingIncome,
    営業外損益: latest.nonOpIncome,
    経常利益: latest.ordinaryIncome,
  }

  const order: PlAccount[] = [
    "売上高",
    "売上原価",
    "売上総利益",
    "販管費",
    "営業利益",
    "営業外損益",
    "経常利益",
  ]

  return order.map((a) => {
    const cur = current[a]
    const prv = prev[a]
    const delta = cur - prv
    const rate = prv === 0 ? 0 : (delta / Math.abs(prv)) * 100
    return {
      account: a,
      currentYear: cur,
      previousYear: prv,
      yoyDelta: delta,
      yoyRate: rate,
    }
  })
}

export const yoyTable: YoyCompareRow[] = generateYoyTable()

// ── KPIs (header summary) ──

function computeKpis(): KpiItem[] {
  const grossMargin = (latest.grossProfit / latest.revenue) * 100
  const opMargin = (latest.operatingIncome / latest.revenue) * 100
  const opMarginPrev = (yoyBase.operatingIncome / yoyBase.revenue) * 100

  const yoyDelta = (cur: number, prev: number) =>
    prev === 0 ? 0 : Math.round(((cur - prev) / prev) * 1000) / 10

  return [
    {
      id: "revenue",
      label: "売上高",
      value: shortYen(latest.revenue),
      rawValue: latest.revenue,
      change: yoyDelta(latest.revenue, yoyBase.revenue),
      changeLabel: "前年同月比",
      positiveIsGood: true,
      spark: monthlyPl.map((m) => m.revenue),
    },
    {
      id: "gross-profit",
      label: "売上総利益",
      value: shortYen(latest.grossProfit),
      rawValue: latest.grossProfit,
      change: yoyDelta(latest.grossProfit, yoyBase.grossProfit),
      changeLabel: "前年同月比",
      positiveIsGood: true,
      spark: monthlyPl.map((m) => m.grossProfit),
    },
    {
      id: "operating-income",
      label: "営業利益",
      value: shortYen(latest.operatingIncome),
      rawValue: latest.operatingIncome,
      change: yoyDelta(latest.operatingIncome, yoyBase.operatingIncome),
      changeLabel: "前年同月比",
      positiveIsGood: true,
      spark: monthlyPl.map((m) => m.operatingIncome),
    },
    {
      id: "ordinary-income",
      label: "経常利益",
      value: shortYen(latest.ordinaryIncome),
      rawValue: latest.ordinaryIncome,
      change: yoyDelta(latest.ordinaryIncome, yoyBase.ordinaryIncome),
      changeLabel: "前年同月比",
      positiveIsGood: true,
      spark: monthlyPl.map((m) => m.ordinaryIncome),
    },
    {
      id: "operating-margin",
      label: "営業利益率",
      value: `${(Math.round(opMargin * 10) / 10).toFixed(1)}%`,
      rawValue: opMargin,
      change: Math.round((opMargin - opMarginPrev) * 10) / 10,
      changeLabel: `売上総利益率 ${(Math.round(grossMargin * 10) / 10).toFixed(1)}%`,
      positiveIsGood: true,
      spark: monthlyPl.map((m) => (m.operatingIncome / m.revenue) * 100),
    },
  ]

  function shortYen(n: number): string {
    const abs = Math.abs(n)
    const sign = n < 0 ? "-" : ""
    if (abs >= 100_000_000) return `${sign}¥${(abs / 100_000_000).toFixed(2)}億`
    if (abs >= 10_000) return `${sign}¥${(abs / 10_000).toFixed(1)}万`
    return `${sign}¥${abs.toLocaleString("ja-JP")}`
  }
}

export const plKpis: KpiItem[] = computeKpis()

// ── Filter options ──

export const viewOptions = [
  { label: "全て", value: "all" },
  { label: "利益項目のみ", value: "profit" },
  { label: "費用項目のみ", value: "expense" },
]

export const CURRENT_PERIOD = latest.month
