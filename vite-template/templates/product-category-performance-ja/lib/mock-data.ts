import type {
  Category,
  CategoryMonthPoint,
  NewExistingDecompPoint,
  HeatmapCell,
  CategorySummary,
  KpiItem,
} from "@/types/product-category-performance"

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
  "アパレル",
  "家電",
  "ホーム&リビング",
  "食品",
  "ビューティー",
  "スポーツ",
]

const CATEGORY_BASELINE: Record<Category, { base: number; growth: number; newShare: number }> = {
  アパレル: { base: 42_000_000, growth: 0.04, newShare: 0.18 },
  家電: { base: 38_000_000, growth: 0.09, newShare: 0.28 },
  "ホーム&リビング": { base: 29_000_000, growth: 0.02, newShare: 0.12 },
  食品: { base: 25_000_000, growth: -0.03, newShare: 0.08 },
  ビューティー: { base: 23_000_000, growth: 0.14, newShare: 0.32 },
  スポーツ: { base: 19_000_000, growth: 0.06, newShare: 0.16 },
}

function generateCategoryMonthly(): CategoryMonthPoint[] {
  const points: CategoryMonthPoint[] = []
  for (let i = 11; i >= 0; i--) {
    const month = new Date(BASE_DATE)
    month.setDate(1)
    month.setMonth(month.getMonth() - i)
    const seasonal =
      0.92 + Math.sin((month.getMonth() / 12) * Math.PI * 2) * 0.08
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

function generateHeatmap(): HeatmapCell[] {
  const cells: HeatmapCell[] = []
  for (let i = 0; i < categoryMonthly.length; i++) {
    const cur = categoryMonthly[i]
    for (const cat of CATEGORIES) {
      const baseline = CATEGORY_BASELINE[cat]
      const noise = 1 + srand(-0.04, 0.04)
      const lastYear = (cur.values[cat] / (1 + baseline.growth)) * noise
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

function computeKpis(): KpiItem[] {
  const lastMonth = categoryMonthly[categoryMonthly.length - 1]
  const prevMonth = categoryMonthly[categoryMonthly.length - 2]
  const totalLatest = lastMonth.total
  const totalPrev = prevMonth.total

  const fastest = [...categorySummary].sort((a, b) => b.yoyChange - a.yoyChange)[0]
  const newDecomp = newVsExisting[newVsExisting.length - 1]

  return [
    {
      label: "首位カテゴリ構成比",
      value: `${categorySummary[0].shareOfTotal.toFixed(1)}%`,
      change: categorySummary[0].yoyChange,
      changeLabel: `${categorySummary[0].category}`,
      positiveIsGood: true,
      sparklineData: categoryMonthly.map((m) =>
        Math.round((m.values[categorySummary[0].category] / m.total) * 1000) / 10,
      ),
    },
    {
      label: "最も成長中",
      value: `+${fastest.yoyChange.toFixed(1)}%`,
      change: fastest.yoyChange,
      changeLabel: `${fastest.category}`,
      positiveIsGood: true,
      sparklineData: categoryMonthly.map((m) => m.values[fastest.category]),
    },
    {
      label: "新商品寄与",
      value: `${newDecomp.newContributionPct.toFixed(1)}%`,
      change:
        Math.round(
          (newDecomp.newContributionPct -
            newVsExisting[newVsExisting.length - 2].newContributionPct) *
            10,
        ) / 10,
      changeLabel: "前月比",
      positiveIsGood: true,
      sparklineData: newVsExisting.map((p) => p.newContributionPct),
    },
    {
      label: "総売上",
      value: `¥${(totalLatest / 100_000_000).toFixed(2)}億`,
      change: Math.round(((totalLatest - totalPrev) / totalPrev) * 1000) / 10,
      changeLabel: "前月比",
      positiveIsGood: true,
      sparklineData: categoryMonthly.map((m) => m.total),
    },
  ]
}

export const headerKpis: KpiItem[] = computeKpis()

export const categoryOptions = [
  { label: "全カテゴリ", value: "all" },
  ...CATEGORIES.map((c) => ({ label: c, value: c })),
]

export const CATEGORY_LIST = CATEGORIES
