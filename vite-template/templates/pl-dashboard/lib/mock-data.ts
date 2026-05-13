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

// Slug-unique seed for pl-dashboard (en)
const rng = seededRand(20251)

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
  "Personnel",
  "Marketing",
  "Rent",
  "Outsourcing",
  "Utilities",
  "Other",
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
    const revenue = Math.round(380_000_000 * trend * seasonal * noise)
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

// ── Raw rows (per ticket's expected input data) ──

function generatePlRows(): PlAccountRow[] {
  const rows: PlAccountRow[] = []
  for (const m of monthlyPl) {
    rows.push({ month: m.month, account: "Revenue", amount: m.revenue })
    rows.push({ month: m.month, account: "COGS", amount: m.cogs })
    rows.push({ month: m.month, account: "Gross Profit", amount: m.grossProfit })
    rows.push({ month: m.month, account: "SG&A", amount: m.sga })
    rows.push({ month: m.month, account: "Operating Income", amount: m.operatingIncome })
    rows.push({ month: m.month, account: "Non-operating Income", amount: m.nonOpIncome })
    rows.push({ month: m.month, account: "Ordinary Income", amount: m.ordinaryIncome })
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

  push("Revenue", latest.revenue, "revenue")
  push("COGS", -latest.cogs, "cost")
  push("Gross Profit", latest.grossProfit, "subtotal")
  push("SG&A", -latest.sga, "cost")
  push("Operating Income", latest.operatingIncome, "subtotal")
  push("Non-operating Income", latest.nonOpIncome, "cost")
  push("Ordinary Income", latest.ordinaryIncome, "subtotal")
  return steps
}

export const plWaterfall: WaterfallStep[] = generateWaterfall()

// ── Expense category monthly trend ──

const baseShares: Record<ExpenseCategory, number> = {
  Personnel: 0.46,
  Marketing: 0.18,
  Rent: 0.1,
  Outsourcing: 0.13,
  Utilities: 0.04,
  Other: 0.09,
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
  // Synthesize "previous year" by damping current values
  const dampen = (n: number, factor: number) => Math.round(n * factor)
  const prev = {
    Revenue: dampen(latest.revenue, 0.88),
    COGS: dampen(latest.cogs, 0.89),
    "Gross Profit": dampen(latest.grossProfit, 0.86),
    "SG&A": dampen(latest.sga, 0.92),
    "Operating Income": dampen(latest.operatingIncome, 0.81),
    "Non-operating Income": dampen(latest.nonOpIncome, 1.04),
    "Ordinary Income": dampen(latest.ordinaryIncome, 0.82),
  } as Record<PlAccount, number>

  const current: Record<PlAccount, number> = {
    Revenue: latest.revenue,
    COGS: latest.cogs,
    "Gross Profit": latest.grossProfit,
    "SG&A": latest.sga,
    "Operating Income": latest.operatingIncome,
    "Non-operating Income": latest.nonOpIncome,
    "Ordinary Income": latest.ordinaryIncome,
  }

  const order: PlAccount[] = [
    "Revenue",
    "COGS",
    "Gross Profit",
    "SG&A",
    "Operating Income",
    "Non-operating Income",
    "Ordinary Income",
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
  const grossMarginPrev = (yoyBase.grossProfit / yoyBase.revenue) * 100
  const opMargin = (latest.operatingIncome / latest.revenue) * 100
  const opMarginPrev = (yoyBase.operatingIncome / yoyBase.revenue) * 100

  const yoyDelta = (cur: number, prev: number) =>
    prev === 0 ? 0 : Math.round(((cur - prev) / prev) * 1000) / 10

  return [
    {
      id: "revenue",
      label: "Revenue",
      value: shortCurrency(latest.revenue),
      rawValue: latest.revenue,
      change: yoyDelta(latest.revenue, yoyBase.revenue),
      changeLabel: "YoY",
      positiveIsGood: true,
      spark: monthlyPl.map((m) => m.revenue),
    },
    {
      id: "gross-profit",
      label: "Gross Profit",
      value: shortCurrency(latest.grossProfit),
      rawValue: latest.grossProfit,
      change: yoyDelta(latest.grossProfit, yoyBase.grossProfit),
      changeLabel: "YoY",
      positiveIsGood: true,
      spark: monthlyPl.map((m) => m.grossProfit),
    },
    {
      id: "operating-income",
      label: "Operating Income",
      value: shortCurrency(latest.operatingIncome),
      rawValue: latest.operatingIncome,
      change: yoyDelta(latest.operatingIncome, yoyBase.operatingIncome),
      changeLabel: "YoY",
      positiveIsGood: true,
      spark: monthlyPl.map((m) => m.operatingIncome),
    },
    {
      id: "ordinary-income",
      label: "Ordinary Income",
      value: shortCurrency(latest.ordinaryIncome),
      rawValue: latest.ordinaryIncome,
      change: yoyDelta(latest.ordinaryIncome, yoyBase.ordinaryIncome),
      changeLabel: "YoY",
      positiveIsGood: true,
      spark: monthlyPl.map((m) => m.ordinaryIncome),
    },
    {
      id: "operating-margin",
      label: "Operating Margin",
      value: `${(Math.round(opMargin * 10) / 10).toFixed(1)}%`,
      rawValue: opMargin,
      change: Math.round((opMargin - opMarginPrev) * 10) / 10,
      changeLabel: `Gross ${(Math.round(grossMargin * 10) / 10).toFixed(1)}%`,
      positiveIsGood: true,
      spark: monthlyPl.map((m) => (m.operatingIncome / m.revenue) * 100),
    },
  ]

  function shortCurrency(n: number): string {
    const abs = Math.abs(n)
    const sign = n < 0 ? "-" : ""
    if (abs >= 1_000_000_000) return `${sign}$${(abs / 1_000_000_000).toFixed(2)}B`
    if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`
    return `${sign}$${abs.toLocaleString("en-US")}`
  }
}

export const plKpis: KpiItem[] = computeKpis()

// ── Filter options ──

export const viewOptions = [
  { label: "All accounts", value: "all" },
  { label: "Profit lines only", value: "profit" },
  { label: "Expense lines only", value: "expense" },
]

export const CURRENT_PERIOD = latest.month
