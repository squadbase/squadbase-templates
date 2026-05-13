import type {
  Category,
  CategoryMonthPoint,
  NewExistingDecompPoint,
  HeatmapCell,
  CategorySummary,
  KpiItem,
} from "@/types/product-category-performance"

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

const rng = seededRand(83)
function srand(min: number, max: number): number {
  return min + rng() * (max - min)
}

const CATEGORIES: Category[] = [
  "Apparel",
  "Electronics",
  "Home & Living",
  "Food",
  "Beauty",
  "Sports",
]

const CATEGORY_BASELINE: Record<Category, { base: number; growth: number; newShare: number }> = {
  Apparel: { base: 420_000, growth: 0.04, newShare: 0.18 },
  Electronics: { base: 380_000, growth: 0.09, newShare: 0.28 },
  "Home & Living": { base: 290_000, growth: 0.02, newShare: 0.12 },
  Food: { base: 250_000, growth: -0.03, newShare: 0.08 },
  Beauty: { base: 230_000, growth: 0.14, newShare: 0.32 },
  Sports: { base: 190_000, growth: 0.06, newShare: 0.16 },
}

// ── 12-month stacked category trend ──

function generateCategoryMonthly(): CategoryMonthPoint[] {
  const points: CategoryMonthPoint[] = []
  for (let i = 11; i >= 0; i--) {
    const month = new Date(BASE_DATE)
    month.setDate(1)
    month.setMonth(month.getMonth() - i)
    const seasonal = 0.92 + Math.sin((month.getMonth() / 12) * Math.PI * 2) * 0.08
    const values = {} as Record<Category, number>
    let total = 0
    for (const cat of CATEGORIES) {
      const baseline = CATEGORY_BASELINE[cat]
      const trend = 1 + (11 - i) * baseline.growth * 0.08
      const noise = 0.92 + srand(0, 0.16)
      const v = Math.round(baseline.base * seasonal * trend * noise)
      values[cat] = v
      total += v
    }
    points.push({ yearMonth: ym(i), values, total })
  }
  return points
}

export const categoryMonthly: CategoryMonthPoint[] = generateCategoryMonthly()

// ── New vs Existing decomposition (12 months) ──

function generateNewVsExisting(): NewExistingDecompPoint[] {
  return categoryMonthly.map((point) => {
    let newRevenue = 0
    let existingRevenue = 0
    for (const cat of CATEGORIES) {
      const baseline = CATEGORY_BASELINE[cat]
      const noise = 0.85 + srand(0, 0.3)
      const newPortion = Math.round(point.values[cat] * baseline.newShare * noise)
      newRevenue += newPortion
      existingRevenue += point.values[cat] - newPortion
    }
    const total = newRevenue + existingRevenue
    return {
      yearMonth: point.yearMonth,
      newRevenue,
      existingRevenue,
      newContributionPct: Math.round((newRevenue / total) * 1000) / 10,
    }
  })
}

export const newVsExisting: NewExistingDecompPoint[] = generateNewVsExisting()

// ── Category × month heatmap (YoY %) ──

function generateHeatmap(): HeatmapCell[] {
  const cells: HeatmapCell[] = []
  for (let i = 0; i < categoryMonthly.length; i++) {
    const cur = categoryMonthly[i]
    for (const cat of CATEGORIES) {
      const baseline = CATEGORY_BASELINE[cat]
      const noise = 1 + srand(-0.04, 0.04)
      const lastYear = cur.values[cat] / (1 + baseline.growth) * noise
      const yoyChange =
        Math.round(((cur.values[cat] - lastYear) / lastYear) * 1000) / 10
      cells.push({
        category: cat,
        yearMonth: cur.yearMonth,
        yoyChange,
        revenue: cur.values[cat],
      })
    }
  }
  return cells
}

export const heatmap: HeatmapCell[] = generateHeatmap()

// ── Category summary (current = sum of last 3 months, prev year = scaled by 1+growth) ──

function generateCategorySummary(): CategorySummary[] {
  const last3 = categoryMonthly.slice(-3)
  const total = CATEGORIES.reduce(
    (s, cat) => s + last3.reduce((ss, m) => ss + m.values[cat], 0),
    0,
  )
  return CATEGORIES.map((cat) => {
    const currentRevenue = last3.reduce((s, m) => s + m.values[cat], 0)
    const baseline = CATEGORY_BASELINE[cat]
    const prevYearRevenue = Math.round(currentRevenue / (1 + baseline.growth))
    const yoyChange =
      Math.round(((currentRevenue - prevYearRevenue) / prevYearRevenue) * 1000) /
      10
    const newRevenue = last3.reduce((s, m) => {
      const noise = 0.85 + srand(0, 0.3)
      return s + Math.round(m.values[cat] * baseline.newShare * noise)
    }, 0)
    return {
      category: cat,
      currentRevenue,
      prevYearRevenue,
      yoyChange,
      shareOfTotal: Math.round((currentRevenue / total) * 1000) / 10,
      newProductShare: Math.round((newRevenue / currentRevenue) * 1000) / 10,
    }
  }).sort((a, b) => b.currentRevenue - a.currentRevenue)
}

export const categorySummary: CategorySummary[] = generateCategorySummary()

// ── KPIs ──

function computeKpis(): KpiItem[] {
  const lastMonth = categoryMonthly[categoryMonthly.length - 1]
  const prevMonth = categoryMonthly[categoryMonthly.length - 2]
  const totalLatest = lastMonth.total
  const totalPrev = prevMonth.total

  const fastest = [...categorySummary].sort((a, b) => b.yoyChange - a.yoyChange)[0]
  const newDecomp = newVsExisting[newVsExisting.length - 1]

  return [
    {
      label: "Top Category Share",
      value: `${categorySummary[0].shareOfTotal.toFixed(1)}%`,
      change: categorySummary[0].yoyChange,
      changeLabel: `${categorySummary[0].category}`,
      positiveIsGood: true,
      sparklineData: categoryMonthly.map((m) =>
        Math.round((m.values[categorySummary[0].category] / m.total) * 1000) / 10,
      ),
    },
    {
      label: "Fastest Growing",
      value: `+${fastest.yoyChange.toFixed(1)}%`,
      change: fastest.yoyChange,
      changeLabel: `${fastest.category}`,
      positiveIsGood: true,
      sparklineData: categoryMonthly.map((m) => m.values[fastest.category]),
    },
    {
      label: "New Product Contribution",
      value: `${newDecomp.newContributionPct.toFixed(1)}%`,
      change:
        Math.round(
          (newDecomp.newContributionPct -
            newVsExisting[newVsExisting.length - 2].newContributionPct) *
            10,
        ) / 10,
      changeLabel: "vs prev month",
      positiveIsGood: true,
      sparklineData: newVsExisting.map((p) => p.newContributionPct),
    },
    {
      label: "Total Revenue",
      value: `$${(totalLatest / 1_000_000).toFixed(2)}M`,
      change:
        Math.round(((totalLatest - totalPrev) / totalPrev) * 1000) / 10,
      changeLabel: "MoM",
      positiveIsGood: true,
      sparklineData: categoryMonthly.map((m) => m.total),
    },
  ]
}

export const headerKpis: KpiItem[] = computeKpis()

export const categoryOptions = [
  { label: "All categories", value: "all" },
  ...CATEGORIES.map((c) => ({ label: c, value: c })),
]

export const CATEGORY_LIST = CATEGORIES
