import type {
  AccountTrendPoint,
  BsRow,
  BsStructure,
  BsStructureItem,
  KpiItem,
  RatioTrendPoint,
} from "@/types/bs-dashboard"

// ── Helpers ──

const BASE_DATE = new Date("2024-12-20")

function seededRand(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const rng = seededRand(4243)

function srand(min: number, max: number): number {
  return min + rng() * (max - min)
}

function monthStr(monthsAgo: number): string {
  const d = new Date(BASE_DATE)
  d.setDate(1)
  d.setMonth(d.getMonth() - monthsAgo)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

// ── Account dictionaries (USD, millions in raw values) ──

const MONTHS = 12

// Base account weights — relative shares (will be scaled by total assets)
const ASSET_ACCOUNTS = [
  { account: "Cash & Deposits", weight: 0.22 },
  { account: "Accounts Receivable", weight: 0.18 },
  { account: "Inventory", weight: 0.14 },
  { account: "Other Current Assets", weight: 0.06 },
  { account: "Tangible Fixed Assets", weight: 0.24 },
  { account: "Intangible Fixed Assets", weight: 0.08 },
  { account: "Investments & Other", weight: 0.08 },
] as const

const LIABILITY_ACCOUNTS = [
  { account: "Accounts Payable", weight: 0.14 },
  { account: "Short-term Debt", weight: 0.1 },
  { account: "Other Current Liabilities", weight: 0.06 },
  { account: "Long-term Debt", weight: 0.18 },
  { account: "Other Long-term Liabilities", weight: 0.04 },
] as const

const EQUITY_ACCOUNTS = [
  { account: "Capital Stock", weight: 0.16 },
  { account: "Capital Surplus", weight: 0.08 },
  { account: "Retained Earnings", weight: 0.24 },
] as const

const BASE_TOTAL_ASSETS = 850_000_000 // ~$850M

// ── Raw rows (BsRow schema: month, account_type, account, amount) ──

function generateRows(): BsRow[] {
  const rows: BsRow[] = []
  for (let i = MONTHS - 1; i >= 0; i--) {
    const monthsAgo = i
    const month = monthStr(monthsAgo)
    // Total assets grows modestly month-over-month
    const trend = 1 + (MONTHS - 1 - i) * 0.008
    const noise = 0.97 + srand(0, 0.06)
    const total = BASE_TOTAL_ASSETS * trend * noise

    for (const a of ASSET_ACCOUNTS) {
      const accountNoise = 0.92 + srand(0, 0.16)
      rows.push({
        month,
        account_type: "asset",
        account: a.account,
        amount: Math.round(total * a.weight * accountNoise),
      })
    }
    for (const l of LIABILITY_ACCOUNTS) {
      const accountNoise = 0.9 + srand(0, 0.2)
      rows.push({
        month,
        account_type: "liability",
        account: l.account,
        amount: Math.round(total * l.weight * accountNoise),
      })
    }
    for (const e of EQUITY_ACCOUNTS) {
      const accountNoise = 0.94 + srand(0, 0.12)
      rows.push({
        month,
        account_type: "equity",
        account: e.account,
        amount: Math.round(total * e.weight * accountNoise),
      })
    }
  }
  return rows
}

export const bsRows: BsRow[] = generateRows()

// ── Derived helpers ──

function sumBy(predicate: (r: BsRow) => boolean): number {
  return bsRows.filter(predicate).reduce((s, r) => s + r.amount, 0)
}

function monthsSorted(): string[] {
  return Array.from(new Set(bsRows.map((r) => r.month))).sort()
}

const ALL_MONTHS = monthsSorted()
const LATEST_MONTH = ALL_MONTHS[ALL_MONTHS.length - 1]
const PREV_MONTH = ALL_MONTHS[ALL_MONTHS.length - 2]

// ── BS Structure (latest month) ──

function buildStructure(): BsStructure {
  const latest = bsRows.filter((r) => r.month === LATEST_MONTH)
  const totalAssets = latest
    .filter((r) => r.account_type === "asset")
    .reduce((s, r) => s + r.amount, 0)
  const totalLiabilities = latest
    .filter((r) => r.account_type === "liability")
    .reduce((s, r) => s + r.amount, 0)
  const totalEquity = latest
    .filter((r) => r.account_type === "equity")
    .reduce((s, r) => s + r.amount, 0)

  const build = (type: "asset" | "liability" | "equity"): BsStructureItem[] => {
    const totalSide =
      type === "asset"
        ? totalAssets
        : type === "liability"
          ? totalLiabilities
          : totalEquity
    return latest
      .filter((r) => r.account_type === type)
      .map((r) => ({
        label: r.account,
        amount: r.amount,
        share: totalSide === 0 ? 0 : (r.amount / totalSide) * 100,
        side: type,
      }))
      .sort((a, b) => b.amount - a.amount)
  }

  return {
    assets: build("asset"),
    liabilities: build("liability"),
    equity: build("equity"),
    totalAssets,
    totalLiabilities,
    totalEquity,
  }
}

export const bsStructure: BsStructure = buildStructure()

// ── Account trend (monthly, major accounts) ──

function pickAmount(month: string, account: string): number {
  return bsRows
    .filter((r) => r.month === month && r.account === account)
    .reduce((s, r) => s + r.amount, 0)
}

function pickAccountTypeTotal(
  month: string,
  type: "asset" | "liability" | "equity",
): number {
  return bsRows
    .filter((r) => r.month === month && r.account_type === type)
    .reduce((s, r) => s + r.amount, 0)
}

function generateAccountTrend(): AccountTrendPoint[] {
  return ALL_MONTHS.map((month) => ({
    month,
    cash: pickAmount(month, "Cash & Deposits"),
    receivable: pickAmount(month, "Accounts Receivable"),
    inventory: pickAmount(month, "Inventory"),
    fixedAssets:
      pickAmount(month, "Tangible Fixed Assets") +
      pickAmount(month, "Intangible Fixed Assets"),
    shortTermDebt: pickAmount(month, "Short-term Debt"),
    longTermDebt: pickAmount(month, "Long-term Debt"),
    equity: pickAccountTypeTotal(month, "equity"),
  }))
}

export const accountTrend: AccountTrendPoint[] = generateAccountTrend()

// ── Ratio trend (monthly) ──

function generateRatioTrend(): RatioTrendPoint[] {
  return ALL_MONTHS.map((month) => {
    const totalAssets = pickAccountTypeTotal(month, "asset")
    const totalLiabilities = pickAccountTypeTotal(month, "liability")
    const totalEquity = pickAccountTypeTotal(month, "equity")

    const currentAssets =
      pickAmount(month, "Cash & Deposits") +
      pickAmount(month, "Accounts Receivable") +
      pickAmount(month, "Inventory") +
      pickAmount(month, "Other Current Assets")

    const quickAssets =
      pickAmount(month, "Cash & Deposits") +
      pickAmount(month, "Accounts Receivable")

    const currentLiabilities =
      pickAmount(month, "Accounts Payable") +
      pickAmount(month, "Short-term Debt") +
      pickAmount(month, "Other Current Liabilities")

    return {
      month,
      equityRatio: totalAssets === 0 ? 0 : (totalEquity / totalAssets) * 100,
      currentRatio:
        currentLiabilities === 0 ? 0 : (currentAssets / currentLiabilities) * 100,
      quickRatio:
        currentLiabilities === 0 ? 0 : (quickAssets / currentLiabilities) * 100,
      debtToEquity:
        totalEquity === 0 ? 0 : totalLiabilities / totalEquity,
    }
  })
}

export const ratioTrend: RatioTrendPoint[] = generateRatioTrend()

// ── Header KPIs ──

function computeKpis(): KpiItem[] {
  const latestAssets = pickAccountTypeTotal(LATEST_MONTH, "asset")
  const prevAssets = sumBy(
    (r) => r.month === PREV_MONTH && r.account_type === "asset",
  )

  const latestRatios = ratioTrend[ratioTrend.length - 1]
  const prevRatios = ratioTrend[ratioTrend.length - 2]

  const latestCash = pickAmount(LATEST_MONTH, "Cash & Deposits")
  const prevCash = pickAmount(PREV_MONTH, "Cash & Deposits")

  const pct = (now: number, prev: number) =>
    prev === 0 ? 0 : Math.round(((now - prev) / prev) * 1000) / 10

  return [
    {
      label: "Total Assets",
      value: `$${(latestAssets / 1_000_000).toFixed(1)}M`,
      change: pct(latestAssets, prevAssets),
      changeLabel: "vs last month",
      positiveIsGood: true,
      sparklineData: accountTrend.map(
        (p) => p.cash + p.receivable + p.inventory + p.fixedAssets,
      ),
    },
    {
      label: "Equity Ratio",
      value: `${latestRatios.equityRatio.toFixed(1)}%`,
      change:
        Math.round((latestRatios.equityRatio - prevRatios.equityRatio) * 10) /
        10,
      changeLabel: "vs last month",
      positiveIsGood: true,
      sparklineData: ratioTrend.map((p) => p.equityRatio),
    },
    {
      label: "Current Ratio",
      value: `${latestRatios.currentRatio.toFixed(1)}%`,
      change:
        Math.round((latestRatios.currentRatio - prevRatios.currentRatio) * 10) /
        10,
      changeLabel: "vs last month",
      positiveIsGood: true,
      sparklineData: ratioTrend.map((p) => p.currentRatio),
    },
    {
      label: "Cash & Deposits",
      value: `$${(latestCash / 1_000_000).toFixed(1)}M`,
      change: pct(latestCash, prevCash),
      changeLabel: "vs last month",
      positiveIsGood: true,
      sparklineData: accountTrend.map((p) => p.cash),
    },
  ]
}

export const headerKpis: KpiItem[] = computeKpis()

// ── Filter options ──

export const scopeOptions = [
  { label: "Consolidated", value: "all" },
  { label: "Parent company", value: "parent" },
  { label: "Domestic subsidiaries", value: "domestic" },
  { label: "Overseas subsidiaries", value: "overseas" },
]
