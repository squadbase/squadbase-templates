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

const rng = seededRand(4244)

function srand(min: number, max: number): number {
  return min + rng() * (max - min)
}

function monthStr(monthsAgo: number): string {
  const d = new Date(BASE_DATE)
  d.setDate(1)
  d.setMonth(d.getMonth() - monthsAgo)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

// ── 勘定科目辞書 (JPY) ──

const MONTHS = 12

const ASSET_ACCOUNTS = [
  { account: "現金及び預金", weight: 0.22 },
  { account: "売掛金", weight: 0.18 },
  { account: "棚卸資産", weight: 0.14 },
  { account: "その他流動資産", weight: 0.06 },
  { account: "有形固定資産", weight: 0.24 },
  { account: "無形固定資産", weight: 0.08 },
  { account: "投資その他の資産", weight: 0.08 },
] as const

const LIABILITY_ACCOUNTS = [
  { account: "買掛金", weight: 0.14 },
  { account: "短期借入金", weight: 0.1 },
  { account: "その他流動負債", weight: 0.06 },
  { account: "長期借入金", weight: 0.18 },
  { account: "その他固定負債", weight: 0.04 },
] as const

const EQUITY_ACCOUNTS = [
  { account: "資本金", weight: 0.16 },
  { account: "資本剰余金", weight: 0.08 },
  { account: "利益剰余金", weight: 0.24 },
] as const

const BASE_TOTAL_ASSETS = 12_000_000_000 // 約120億円

// ── Raw rows (BsRow schema) ──

function generateRows(): BsRow[] {
  const rows: BsRow[] = []
  for (let i = MONTHS - 1; i >= 0; i--) {
    const monthsAgo = i
    const month = monthStr(monthsAgo)
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

// ── BS Structure (最新月) ──

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

// ── 主要勘定科目の月次推移 ──

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
    cash: pickAmount(month, "現金及び預金"),
    receivable: pickAmount(month, "売掛金"),
    inventory: pickAmount(month, "棚卸資産"),
    fixedAssets:
      pickAmount(month, "有形固定資産") + pickAmount(month, "無形固定資産"),
    shortTermDebt: pickAmount(month, "短期借入金"),
    longTermDebt: pickAmount(month, "長期借入金"),
    equity: pickAccountTypeTotal(month, "equity"),
  }))
}

export const accountTrend: AccountTrendPoint[] = generateAccountTrend()

// ── 財務比率トレンド ──

function generateRatioTrend(): RatioTrendPoint[] {
  return ALL_MONTHS.map((month) => {
    const totalAssets = pickAccountTypeTotal(month, "asset")
    const totalLiabilities = pickAccountTypeTotal(month, "liability")
    const totalEquity = pickAccountTypeTotal(month, "equity")

    const currentAssets =
      pickAmount(month, "現金及び預金") +
      pickAmount(month, "売掛金") +
      pickAmount(month, "棚卸資産") +
      pickAmount(month, "その他流動資産")

    const quickAssets =
      pickAmount(month, "現金及び預金") + pickAmount(month, "売掛金")

    const currentLiabilities =
      pickAmount(month, "買掛金") +
      pickAmount(month, "短期借入金") +
      pickAmount(month, "その他流動負債")

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

// ── 主要 KPI ──

function computeKpis(): KpiItem[] {
  const latestAssets = pickAccountTypeTotal(LATEST_MONTH, "asset")
  const prevAssets = sumBy(
    (r) => r.month === PREV_MONTH && r.account_type === "asset",
  )

  const latestRatios = ratioTrend[ratioTrend.length - 1]
  const prevRatios = ratioTrend[ratioTrend.length - 2]

  const latestCash = pickAmount(LATEST_MONTH, "現金及び預金")
  const prevCash = pickAmount(PREV_MONTH, "現金及び預金")

  const pct = (now: number, prev: number) =>
    prev === 0 ? 0 : Math.round(((now - prev) / prev) * 1000) / 10

  return [
    {
      label: "総資産",
      value: `¥${(latestAssets / 100_000_000).toFixed(1)}億`,
      change: pct(latestAssets, prevAssets),
      changeLabel: "前月比",
      positiveIsGood: true,
      sparklineData: accountTrend.map(
        (p) => p.cash + p.receivable + p.inventory + p.fixedAssets,
      ),
    },
    {
      label: "自己資本比率",
      value: `${latestRatios.equityRatio.toFixed(1)}%`,
      change:
        Math.round((latestRatios.equityRatio - prevRatios.equityRatio) * 10) /
        10,
      changeLabel: "前月比",
      positiveIsGood: true,
      sparklineData: ratioTrend.map((p) => p.equityRatio),
    },
    {
      label: "流動比率",
      value: `${latestRatios.currentRatio.toFixed(1)}%`,
      change:
        Math.round((latestRatios.currentRatio - prevRatios.currentRatio) * 10) /
        10,
      changeLabel: "前月比",
      positiveIsGood: true,
      sparklineData: ratioTrend.map((p) => p.currentRatio),
    },
    {
      label: "現預金",
      value: `¥${(latestCash / 100_000_000).toFixed(1)}億`,
      change: pct(latestCash, prevCash),
      changeLabel: "前月比",
      positiveIsGood: true,
      sparklineData: accountTrend.map((p) => p.cash),
    },
  ]
}

export const headerKpis: KpiItem[] = computeKpis()

// ── フィルター選択肢 ──

export const scopeOptions = [
  { label: "連結", value: "all" },
  { label: "親会社単体", value: "parent" },
  { label: "国内子会社", value: "domestic" },
  { label: "海外子会社", value: "overseas" },
]
