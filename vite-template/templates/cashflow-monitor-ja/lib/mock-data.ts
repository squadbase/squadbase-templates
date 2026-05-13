import type {
  CashflowRow,
  CashBalancePoint,
  CategoryRow,
  KpiItem,
  WaterfallStep,
  CfType,
} from "@/types/cashflow-monitor"

// ── ヘルパー ──

const BASE_DATE = new Date("2024-03-15")

function seededRand(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

// cashflow-monitor 専用シード
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
  return `${parseInt(m, 10)}月`
}

// ── カテゴリ定義 ──

interface CategoryDef {
  category: string
  cfType: CfType
  direction: "inflow" | "outflow"
  baseAmount: number // 月次の典型的な絶対額（円）
  variability: number // 0..1
  trend: number // 月次トレンド係数
}

const CATEGORY_CATALOG: CategoryDef[] = [
  // 営業CF
  { category: "顧客回収", cfType: "operating", direction: "inflow", baseAmount: 420_000_000, variability: 0.12, trend: 1.012 },
  { category: "その他営業収入", cfType: "operating", direction: "inflow", baseAmount: 32_000_000, variability: 0.25, trend: 1.005 },
  { category: "人件費", cfType: "operating", direction: "outflow", baseAmount: 165_000_000, variability: 0.06, trend: 1.008 },
  { category: "仕入・外注費", cfType: "operating", direction: "outflow", baseAmount: 128_000_000, variability: 0.14, trend: 1.011 },
  { category: "賃料・光熱費", cfType: "operating", direction: "outflow", baseAmount: 41_000_000, variability: 0.04, trend: 1.003 },
  { category: "税金等支払", cfType: "operating", direction: "outflow", baseAmount: 28_500_000, variability: 0.32, trend: 1.006 },
  // 投資CF
  { category: "資産売却", cfType: "investing", direction: "inflow", baseAmount: 9_000_000, variability: 0.6, trend: 1.0 },
  { category: "設備投資（有形固定資産）", cfType: "investing", direction: "outflow", baseAmount: 52_000_000, variability: 0.4, trend: 1.015 },
  { category: "ソフトウェア・無形資産", cfType: "investing", direction: "outflow", baseAmount: 17_500_000, variability: 0.35, trend: 1.02 },
  // 財務CF
  { category: "新規借入", cfType: "financing", direction: "inflow", baseAmount: 26_000_000, variability: 0.8, trend: 1.0 },
  { category: "借入返済", cfType: "financing", direction: "outflow", baseAmount: 22_000_000, variability: 0.1, trend: 1.0 },
  { category: "配当支払", cfType: "financing", direction: "outflow", baseAmount: 14_000_000, variability: 0.25, trend: 1.0 },
]

// ── Raw rows: 12ヶ月 × カテゴリ ──

const MONTHS_BACK = 12
const STARTING_CASH = 680_000_000

function generateRows(): CashflowRow[] {
  const rows: CashflowRow[] = []
  let balance = STARTING_CASH
  for (let i = MONTHS_BACK - 1; i >= 0; i--) {
    const month = monthStr(i)
    const monthIndex = MONTHS_BACK - 1 - i
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
        cash_balance: 0,
      })
    }
    balance += netForMonth
    for (const r of rows) {
      if (r.month === month) r.cash_balance = balance
    }
  }
  return rows
}

export const cashflowRows: CashflowRow[] = generateRows()

export const months: string[] = Array.from(new Set(cashflowRows.map((r) => r.month))).sort()

// ── 月次集計 ──

interface MonthlyTotals {
  month: string
  operating: number
  investing: number
  financing: number
  netCashFlow: number
  cashBalance: number
  freeCashFlow: number
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

// ── 現金残高トレンド ──

export const cashBalanceTrend: CashBalancePoint[] = monthlyTotals.map((m) => ({
  month: monthLabel(m.month),
  cashBalance: m.cashBalance,
  netCashFlow: m.netCashFlow,
}))

// ── ウォーターフォール（最新月） ──

function buildWaterfall(): WaterfallStep[] {
  const latest = monthlyTotals[monthlyTotals.length - 1]
  const prev = monthlyTotals[monthlyTotals.length - 2]
  const startCash = prev?.cashBalance ?? STARTING_CASH
  const endCash = latest.cashBalance

  const steps: WaterfallStep[] = []
  let cumulative = startCash
  steps.push({ label: "期首現金", type: "start", value: startCash, cumulative })

  cumulative += latest.operating
  steps.push({
    label: "営業CF",
    type: "operating",
    value: latest.operating,
    cumulative,
  })

  cumulative += latest.investing
  steps.push({
    label: "投資CF",
    type: "investing",
    value: latest.investing,
    cumulative,
  })

  cumulative += latest.financing
  steps.push({
    label: "財務CF",
    type: "financing",
    value: latest.financing,
    cumulative,
  })

  steps.push({ label: "期末現金", type: "end", value: endCash, cumulative: endCash })
  return steps
}

export const waterfallSteps: WaterfallStep[] = buildWaterfall()

// ── カテゴリ別テーブル（当月 vs 前月） ──

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

// ── トップライン KPI ──

function pct(now: number, prev: number): number {
  if (prev === 0) return 0
  return Math.round(((now - prev) / Math.abs(prev)) * 1000) / 10
}

function fmtJpy(n: number): string {
  const sign = n < 0 ? "-" : ""
  const abs = Math.abs(n)
  if (abs >= 100_000_000) return `${sign}¥${(abs / 100_000_000).toFixed(2)}億`
  if (abs >= 10_000) return `${sign}¥${(abs / 10_000).toFixed(0)}万`
  return `${sign}¥${abs.toLocaleString("ja-JP")}`
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
      label: "営業CF",
      value: fmtJpy(latest.operating),
      change: pct(latest.operating, prev.operating),
      changeLabel: "前月比",
      positiveIsGood: true,
      sparklineData: operatingSpark,
    },
    {
      id: "investing-cf",
      label: "投資CF",
      value: fmtJpy(latest.investing),
      change: pct(latest.investing, prev.investing),
      changeLabel: "前月比",
      positiveIsGood: false,
      sparklineData: investingSpark,
    },
    {
      id: "financing-cf",
      label: "財務CF",
      value: fmtJpy(latest.financing),
      change: pct(latest.financing, prev.financing),
      changeLabel: "前月比",
      positiveIsGood: true,
      sparklineData: financingSpark,
    },
    {
      id: "cash-balance",
      label: "現金残高",
      value: fmtJpy(latest.cashBalance),
      change: pct(latest.cashBalance, prev.cashBalance),
      changeLabel: "前月比",
      positiveIsGood: true,
      sparklineData: balanceSpark,
    },
    {
      id: "free-cf",
      label: "フリーCF",
      value: fmtJpy(latest.freeCashFlow),
      change: pct(latest.freeCashFlow, prev.freeCashFlow),
      changeLabel: "前月比",
      positiveIsGood: true,
      sparklineData: fcfSpark,
    },
  ]
}

export const headerKpis: KpiItem[] = computeKpis()

// ── フィルタ選択肢 ──

export const cfTypeOptions = [
  { label: "すべてのCF区分", value: "all" },
  { label: "営業CF", value: "operating" },
  { label: "投資CF", value: "investing" },
  { label: "財務CF", value: "financing" },
]

export const directionOptions = [
  { label: "入出金すべて", value: "all" },
  { label: "入金", value: "inflow" },
  { label: "出金", value: "outflow" },
]
