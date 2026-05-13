import type {
  CashflowRow,
  CashBalancePoint,
  CategoryRow,
  KpiItem,
  WaterfallStep,
  CfType,
} from "@/types/cashflow-monitor"

// ── Helpers ──

const BASE_DATE = new Date("2024-03-15")

function seededRand(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

// Unique seed for cashflow-monitor template
const rng = seededRand(2901)

function srand(min: number, max: number): number {
  return min + rng() * (max - min)
}

function monthStr(monthsAgo: number): string {
  const d = new Date(BASE_DATE)
  d.setDate(1)
  d.setMonth(d.getMonth() - monthsAgo)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

function monthLabel(month: string): string {
  const [, m] = month.split("-")
  return `${parseInt(m, 10)}/${month.slice(2, 4)}`
}

// ── Category catalog ──

interface CategoryDef {
  category: string
  cfType: CfType
  direction: "inflow" | "outflow"
  baseAmount: number // typical absolute amount per month
  variability: number // 0..1 (range of monthly noise)
  trend: number // multiplicative monthly trend factor
}

const CATEGORY_CATALOG: CategoryDef[] = [
  // Operating
  { category: "Customer receipts", cfType: "operating", direction: "inflow", baseAmount: 4_200_000, variability: 0.12, trend: 1.012 },
  { category: "Other operating income", cfType: "operating", direction: "inflow", baseAmount: 320_000, variability: 0.25, trend: 1.005 },
  { category: "Payroll & benefits", cfType: "operating", direction: "outflow", baseAmount: 1_650_000, variability: 0.06, trend: 1.008 },
  { category: "Supplier payments", cfType: "operating", direction: "outflow", baseAmount: 1_280_000, variability: 0.14, trend: 1.011 },
  { category: "Rent & utilities", cfType: "operating", direction: "outflow", baseAmount: 410_000, variability: 0.04, trend: 1.003 },
  { category: "Taxes paid", cfType: "operating", direction: "outflow", baseAmount: 285_000, variability: 0.32, trend: 1.006 },
  // Investing
  { category: "Asset sales", cfType: "investing", direction: "inflow", baseAmount: 90_000, variability: 0.6, trend: 1.0 },
  { category: "Capex (PP&E)", cfType: "investing", direction: "outflow", baseAmount: 520_000, variability: 0.4, trend: 1.015 },
  { category: "Software / intangibles", cfType: "investing", direction: "outflow", baseAmount: 175_000, variability: 0.35, trend: 1.02 },
  // Financing
  { category: "New borrowings", cfType: "financing", direction: "inflow", baseAmount: 260_000, variability: 0.8, trend: 1.0 },
  { category: "Debt repayments", cfType: "financing", direction: "outflow", baseAmount: 220_000, variability: 0.1, trend: 1.0 },
  { category: "Dividends paid", cfType: "financing", direction: "outflow", baseAmount: 140_000, variability: 0.25, trend: 1.0 },
]

// ── Raw rows: 12 months × categories ──

const MONTHS_BACK = 12
const STARTING_CASH = 6_800_000

function generateRows(): CashflowRow[] {
  const rows: CashflowRow[] = []
  // Compute trailing balance month by month
  let balance = STARTING_CASH
  // We iterate oldest -> newest so the running balance is correct.
  for (let i = MONTHS_BACK - 1; i >= 0; i--) {
    const month = monthStr(i)
    const monthIndex = MONTHS_BACK - 1 - i // 0 = oldest
    let netForMonth = 0
    for (const def of CATEGORY_CATALOG) {
      const trendMultiplier = Math.pow(def.trend, monthIndex)
      const noise = 1 - def.variability + srand(0, def.variability * 2)
      const amount = Math.round(def.baseAmount * trendMultiplier * noise)
      const signed = def.direction === "inflow" ? amount : -amount
      netForMonth += signed
      rows.push({
        month,
        cf_type: def.cfType,
        category: def.category,
        amount: signed,
        cash_balance: 0, // backfilled below
      })
    }
    balance += netForMonth
    // Backfill cash_balance for this month's rows
    for (const r of rows) {
      if (r.month === month) r.cash_balance = balance
    }
  }
  return rows
}

export const cashflowRows: CashflowRow[] = generateRows()

export const months: string[] = Array.from(new Set(cashflowRows.map((r) => r.month))).sort()

// ── Monthly aggregates ──

interface MonthlyTotals {
  month: string
  operating: number
  investing: number
  financing: number
  netCashFlow: number
  cashBalance: number
  freeCashFlow: number // operating + investing capex/asset (we approximate FCF = operating + investing)
}

function computeMonthly(): MonthlyTotals[] {
  return months.map((month) => {
    const monthRows = cashflowRows.filter((r) => r.month === month)
    const operating = monthRows
      .filter((r) => r.cf_type === "operating")
      .reduce((s, r) => s + r.amount, 0)
    const investing = monthRows
      .filter((r) => r.cf_type === "investing")
      .reduce((s, r) => s + r.amount, 0)
    const financing = monthRows
      .filter((r) => r.cf_type === "financing")
      .reduce((s, r) => s + r.amount, 0)
    const cashBalance = monthRows[0]?.cash_balance ?? 0
    return {
      month,
      operating,
      investing,
      financing,
      netCashFlow: operating + investing + financing,
      cashBalance,
      freeCashFlow: operating + investing,
    }
  })
}

export const monthlyTotals: MonthlyTotals[] = computeMonthly()

// ── Cash balance trend ──

export const cashBalanceTrend: CashBalancePoint[] = monthlyTotals.map((m) => ({
  month: monthLabel(m.month),
  cashBalance: m.cashBalance,
  netCashFlow: m.netCashFlow,
}))

// ── Waterfall (latest month) ──

function buildWaterfall(): WaterfallStep[] {
  const latest = monthlyTotals[monthlyTotals.length - 1]
  const prev = monthlyTotals[monthlyTotals.length - 2]
  const startCash = prev?.cashBalance ?? STARTING_CASH
  const endCash = latest.cashBalance

  const steps: WaterfallStep[] = []
  let cumulative = startCash
  steps.push({ label: "Opening cash", type: "start", value: startCash, cumulative })

  cumulative += latest.operating
  steps.push({
    label: "Operating CF",
    type: "operating",
    value: latest.operating,
    cumulative,
  })

  cumulative += latest.investing
  steps.push({
    label: "Investing CF",
    type: "investing",
    value: latest.investing,
    cumulative,
  })

  cumulative += latest.financing
  steps.push({
    label: "Financing CF",
    type: "financing",
    value: latest.financing,
    cumulative,
  })

  steps.push({ label: "Closing cash", type: "end", value: endCash, cumulative: endCash })
  return steps
}

export const waterfallSteps: WaterfallStep[] = buildWaterfall()

// ── Category table (latest month vs previous month) ──

function buildCategoryRows(): CategoryRow[] {
  const latest = months[months.length - 1]
  const previous = months[months.length - 2]

  const grouped = new Map<string, { current: number; previous: number; cfType: CfType; direction: "inflow" | "outflow" }>()
  for (const def of CATEGORY_CATALOG) {
    grouped.set(def.category, {
      current: 0,
      previous: 0,
      cfType: def.cfType,
      direction: def.direction,
    })
  }
  for (const r of cashflowRows) {
    const target = grouped.get(r.category)
    if (!target) continue
    if (r.month === latest) target.current += Math.abs(r.amount)
    if (r.month === previous) target.previous += Math.abs(r.amount)
  }

  // Compute share of flow within direction (inflow or outflow)
  const currentInflow = Array.from(grouped.values())
    .filter((g) => g.direction === "inflow")
    .reduce((s, g) => s + g.current, 0)
  const currentOutflow = Array.from(grouped.values())
    .filter((g) => g.direction === "outflow")
    .reduce((s, g) => s + g.current, 0)

  const rows: CategoryRow[] = Array.from(grouped.entries()).map(([category, g]) => {
    const delta = g.current - g.previous
    const deltaRate = g.previous === 0 ? 0 : (delta / g.previous) * 100
    const denom = g.direction === "inflow" ? currentInflow : currentOutflow
    const shareOfFlow = denom === 0 ? 0 : g.current / denom
    return {
      category,
      cfType: g.cfType,
      direction: g.direction,
      current: g.current,
      previous: g.previous,
      delta,
      deltaRate,
      shareOfFlow,
    }
  })

  return rows.sort((a, b) => b.current - a.current)
}

export const categoryRows: CategoryRow[] = buildCategoryRows()

// ── Top-line KPIs ──

function pct(now: number, prev: number): number {
  if (prev === 0) return 0
  return Math.round(((now - prev) / Math.abs(prev)) * 1000) / 10
}

function fmtUsdK(n: number): string {
  const sign = n < 0 ? "-" : ""
  const abs = Math.abs(n)
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`
  return `${sign}$${(abs / 1_000).toFixed(0)}K`
}

function computeKpis(): KpiItem[] {
  const latest = monthlyTotals[monthlyTotals.length - 1]
  const prev = monthlyTotals[monthlyTotals.length - 2]

  const operatingSpark = monthlyTotals.slice(-6).map((m) => m.operating)
  const investingSpark = monthlyTotals.slice(-6).map((m) => m.investing)
  const financingSpark = monthlyTotals.slice(-6).map((m) => m.financing)
  const balanceSpark = monthlyTotals.slice(-6).map((m) => m.cashBalance)
  const fcfSpark = monthlyTotals.slice(-6).map((m) => m.freeCashFlow)

  return [
    {
      id: "operating-cf",
      label: "Operating CF",
      value: fmtUsdK(latest.operating),
      change: pct(latest.operating, prev.operating),
      changeLabel: "vs prev month",
      positiveIsGood: true,
      sparklineData: operatingSpark,
    },
    {
      id: "investing-cf",
      label: "Investing CF",
      value: fmtUsdK(latest.investing),
      change: pct(latest.investing, prev.investing),
      changeLabel: "vs prev month",
      positiveIsGood: false,
      sparklineData: investingSpark,
    },
    {
      id: "financing-cf",
      label: "Financing CF",
      value: fmtUsdK(latest.financing),
      change: pct(latest.financing, prev.financing),
      changeLabel: "vs prev month",
      positiveIsGood: true,
      sparklineData: financingSpark,
    },
    {
      id: "cash-balance",
      label: "Cash Balance",
      value: fmtUsdK(latest.cashBalance),
      change: pct(latest.cashBalance, prev.cashBalance),
      changeLabel: "vs prev month",
      positiveIsGood: true,
      sparklineData: balanceSpark,
    },
    {
      id: "free-cf",
      label: "Free Cash Flow",
      value: fmtUsdK(latest.freeCashFlow),
      change: pct(latest.freeCashFlow, prev.freeCashFlow),
      changeLabel: "vs prev month",
      positiveIsGood: true,
      sparklineData: fcfSpark,
    },
  ]
}

export const headerKpis: KpiItem[] = computeKpis()

// ── Filter options ──

export const cfTypeOptions = [
  { label: "All CF types", value: "all" },
  { label: "Operating", value: "operating" },
  { label: "Investing", value: "investing" },
  { label: "Financing", value: "financing" },
]

export const directionOptions = [
  { label: "All directions", value: "all" },
  { label: "Inflow", value: "inflow" },
  { label: "Outflow", value: "outflow" },
]
