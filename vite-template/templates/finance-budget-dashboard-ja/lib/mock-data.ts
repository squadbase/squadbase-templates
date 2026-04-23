import type {
  AccountCategory,
  AlertEvent,
  BsCompositionItem,
  BudgetHierarchyRow,
  BudgetRow,
  BudgetVarianceRow,
  CostCategory,
  CostCategoryShare,
  CostHeatmapCell,
  Department,
  DepartmentAchievement,
  ExpenseRow,
  ExpenseStackPoint,
  KpiItem,
  KpiMetricRow,
  MonthlyCostPoint,
  PlMonthlyPoint,
  VarianceTrendPoint,
  WaterfallStep,
} from "@/types/finance-budget"

// ── Helpers ──

const BASE_DATE = new Date("2024-12-20")

function seededRand(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

const rng = seededRand(1337)

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

export const DEPARTMENTS: Department[] = [
  "営業本部",
  "マーケティング",
  "プロダクト",
  "エンジニアリング",
  "コーポレート",
  "カスタマーサクセス",
]

export const COST_CATEGORIES: CostCategory[] = [
  "人件費",
  "旅費交通費",
  "会議費",
  "広告宣伝費",
  "地代家賃",
  "水道光熱費",
  "通信費",
  "業務委託費",
  "減価償却費",
  "その他",
]

export const budgetHierarchy: BudgetHierarchyRow[] = [
  { department_id: "hq", department_name: "コーポレート", parent_id: null },
  { department_id: "sales", department_name: "営業本部", parent_id: "hq" },
  { department_id: "mkt", department_name: "マーケティング", parent_id: "sales" },
  { department_id: "cs", department_name: "カスタマーサクセス", parent_id: "sales" },
  { department_id: "product", department_name: "プロダクト", parent_id: "hq" },
  { department_id: "eng", department_name: "エンジニアリング", parent_id: "product" },
]

// ── PL monthly (12ヶ月 ・ 全社ベース) ──

function generatePlMonthly(): PlMonthlyPoint[] {
  const data: PlMonthlyPoint[] = []
  for (let i = 11; i >= 0; i--) {
    const trend = 1 + (11 - i) * 0.012
    const seasonalBoost =
      i === 0 || i === 11 || i === 6 ? 1.08 : i === 3 || i === 9 ? 0.94 : 1.0
    const noise = 0.93 + srand(0, 14) / 100
    const revenue = Math.round(420_000_000 * trend * seasonalBoost * noise)
    const cogs = Math.round(revenue * (0.54 + srand(-2, 2) / 100))
    const sga = Math.round(revenue * (0.28 + srand(-2, 2) / 100))
    const operatingIncome = revenue - cogs - sga
    data.push({
      month: monthStr(i),
      revenue,
      cogs,
      sga,
      operatingIncome,
    })
  }
  return data
}

export const plMonthly: PlMonthlyPoint[] = generatePlMonthly()

// ── Waterfall (当月 PL) ──

function generateWaterfall(): WaterfallStep[] {
  const latest = plMonthly[plMonthly.length - 1]
  const { revenue, cogs, sga, operatingIncome } = latest
  const grossProfit = revenue - cogs
  const nonOpIncome = -Math.round(operatingIncome * 0.04)
  const ordinaryIncome = operatingIncome + nonOpIncome
  const tax = -Math.round(ordinaryIncome * 0.3)
  const netIncome = ordinaryIncome + tax

  let cumulative = 0
  const steps: WaterfallStep[] = []
  const push = (
    label: string,
    value: number,
    type: WaterfallStep["type"],
  ) => {
    steps.push({
      label,
      value,
      type,
      cumulative: type === "subtotal" || type === "profit" ? value : cumulative,
    })
    if (type === "revenue" || type === "cost") cumulative += value
    else cumulative = value
  }

  push("売上高", revenue, "revenue")
  push("売上原価", -cogs, "cost")
  push("粗利", grossProfit, "subtotal")
  push("販管費", -sga, "cost")
  push("営業利益", operatingIncome, "subtotal")
  push("営業外損益", nonOpIncome, "cost")
  push("経常利益", ordinaryIncome, "subtotal")
  push("法人税等", tax, "cost")
  push("当期純利益", netIncome, "profit")

  return steps
}

export const plWaterfall: WaterfallStep[] = generateWaterfall()

// ── BS snapshot ──

export const bsAssets: BsCompositionItem[] = [
  { label: "現金・預金", amount: 1_820_000_000, percentage: 28.4 },
  { label: "売掛金", amount: 960_000_000, percentage: 15.0 },
  { label: "棚卸資産", amount: 480_000_000, percentage: 7.5 },
  { label: "その他流動資産", amount: 220_000_000, percentage: 3.4 },
  { label: "有形固定資産", amount: 1_450_000_000, percentage: 22.6 },
  { label: "無形固定資産", amount: 780_000_000, percentage: 12.2 },
  { label: "投資その他", amount: 700_000_000, percentage: 10.9 },
]

export const bsLiabilities: BsCompositionItem[] = [
  { label: "買掛金", amount: 620_000_000, percentage: 9.7 },
  { label: "短期借入金", amount: 480_000_000, percentage: 7.5 },
  { label: "その他流動負債", amount: 340_000_000, percentage: 5.3 },
  { label: "長期借入金", amount: 1_080_000_000, percentage: 16.8 },
  { label: "その他固定負債", amount: 280_000_000, percentage: 4.4 },
  { label: "資本金", amount: 1_500_000_000, percentage: 23.4 },
  { label: "利益剰余金", amount: 2_110_000_000, percentage: 32.9 },
]

export const TOTAL_ASSETS = bsAssets.reduce((s, a) => s + a.amount, 0)
export const TOTAL_EQUITY =
  bsLiabilities.find((l) => l.label === "資本金")!.amount +
  bsLiabilities.find((l) => l.label === "利益剰余金")!.amount
export const EQUITY_RATIO = (TOTAL_EQUITY / TOTAL_ASSETS) * 100

// ── Expense stacked bar (月次 費目別) ──

function generateExpenseStack(): ExpenseStackPoint[] {
  const baseShares: Record<CostCategory, number> = {
    人件費: 0.48,
    旅費交通費: 0.04,
    会議費: 0.02,
    広告宣伝費: 0.14,
    地代家賃: 0.08,
    水道光熱費: 0.02,
    通信費: 0.025,
    業務委託費: 0.11,
    減価償却費: 0.06,
    その他: 0.035,
  }
  return plMonthly.map((m) => {
    const base = m.cogs + m.sga
    const values = {} as Record<CostCategory, number>
    COST_CATEGORIES.forEach((c) => {
      const noise = 0.92 + srand(0, 16) / 100
      values[c] = Math.round(base * baseShares[c] * noise)
    })
    return { month: m.month, values }
  })
}

export const expenseStack: ExpenseStackPoint[] = generateExpenseStack()

// ── Budget / Actual (当月) ──

const deptBudgetShares: Record<Department, number> = {
  営業本部: 0.18,
  マーケティング: 0.22,
  プロダクト: 0.12,
  エンジニアリング: 0.26,
  コーポレート: 0.14,
  カスタマーサクセス: 0.08,
}

function generateBudgetsAndActuals() {
  const latest = plMonthly[plMonthly.length - 1]
  const totalCost = latest.cogs + latest.sga
  const totalBudget = Math.round(totalCost * 0.96)
  const budgets: BudgetRow[] = []
  const actuals: Record<Department, number> = {} as Record<Department, number>

  DEPARTMENTS.forEach((dept) => {
    const share = deptBudgetShares[dept]
    const budgetAmount = Math.round(totalBudget * share)
    const variance = 0.88 + srand(0, 28) / 100
    const actualAmount = Math.round(budgetAmount * variance)
    budgets.push({
      budget_id: `BG-${dept}-${latest.month}`,
      department: dept,
      account: "販管費" as AccountCategory,
      period: latest.month,
      budget_amount: budgetAmount,
    })
    actuals[dept] = actualAmount
  })

  return { budgets, actuals }
}

const { budgets: _budgets, actuals: departmentActuals } = generateBudgetsAndActuals()

export const budgets = _budgets

// ── Budget variance rows ──

function generateBudgetVariance(): BudgetVarianceRow[] {
  return DEPARTMENTS.map((dept) => {
    const budget = budgets.find((b) => b.department === dept)!.budget_amount
    const actual = departmentActuals[dept]
    const variance = actual - budget
    const varianceRate = (variance / budget) * 100
    const absRate = Math.abs(varianceRate)
    const status: BudgetVarianceRow["status"] =
      absRate <= 3 ? "achieved" : absRate <= 8 ? "warning" : "unmet"
    return { department: dept, budget, actual, variance, varianceRate, status }
  })
}

export const budgetVariance: BudgetVarianceRow[] = generateBudgetVariance()

// ── Department achievement (全社) ──

export const departmentAchievement: DepartmentAchievement[] =
  budgetVariance.map((v) => ({
    department: v.department,
    budget: v.budget,
    actual: v.actual,
    achievementRate: (v.actual / v.budget) * 100,
  }))

export const TOTAL_BUDGET = budgetVariance.reduce((s, v) => s + v.budget, 0)
export const TOTAL_ACTUAL = budgetVariance.reduce((s, v) => s + v.actual, 0)
export const OVERALL_ACHIEVEMENT_RATE = (TOTAL_ACTUAL / TOTAL_BUDGET) * 100
export const OVERALL_VARIANCE = TOTAL_ACTUAL - TOTAL_BUDGET

// ── Variance trend (月次) ──

function generateVarianceTrend(): VarianceTrendPoint[] {
  return plMonthly.map((m) => {
    const budgetM = Math.round((m.cogs + m.sga) * 0.96)
    const actualM = m.cogs + m.sga
    const variance = actualM - budgetM
    const varianceRate = (variance / budgetM) * 100
    return { period: m.month, variance, varianceRate }
  })
}

export const varianceTrend: VarianceTrendPoint[] = generateVarianceTrend()

// ── Cost heatmap (費目 × 部門) ──

const deptCostProfile: Record<Department, Partial<Record<CostCategory, number>>> = {
  営業本部: { 人件費: 1.3, 旅費交通費: 2.4, 会議費: 1.6, 広告宣伝費: 0.3, 通信費: 1.1 },
  マーケティング: { 人件費: 1.1, 旅費交通費: 1.2, 広告宣伝費: 3.8, 業務委託費: 1.8, 会議費: 1.3 },
  プロダクト: { 人件費: 1.2, 業務委託費: 1.6, 通信費: 1.0, 会議費: 1.0 },
  エンジニアリング: { 人件費: 1.6, 業務委託費: 2.0, 通信費: 1.6, 減価償却費: 1.4 },
  コーポレート: { 人件費: 0.9, 地代家賃: 2.2, 水道光熱費: 2.4, 減価償却費: 1.5, その他: 1.6 },
  カスタマーサクセス: { 人件費: 1.0, 旅費交通費: 1.1, 通信費: 1.2 },
}

function generateCostHeatmap(): CostHeatmapCell[] {
  const latest = expenseStack[expenseStack.length - 1]
  const cells: CostHeatmapCell[] = []
  DEPARTMENTS.forEach((dept) => {
    const share = deptBudgetShares[dept]
    COST_CATEGORIES.forEach((cat) => {
      const baseAmount = latest.values[cat] * share
      const factor = deptCostProfile[dept]?.[cat] ?? 0.7
      const noise = 0.9 + srand(0, 20) / 100
      cells.push({
        department: dept,
        costCategory: cat,
        amount: Math.round(baseAmount * factor * noise),
      })
    })
  })
  return cells
}

export const costHeatmap: CostHeatmapCell[] = generateCostHeatmap()

// ── Cost category share ──

function generateCostCategoryShare(): CostCategoryShare[] {
  const latest = expenseStack[expenseStack.length - 1]
  const total = COST_CATEGORIES.reduce((s, c) => s + latest.values[c], 0)
  return COST_CATEGORIES.map((c) => ({
    category: c,
    amount: latest.values[c],
    percentage: (latest.values[c] / total) * 100,
  })).sort((a, b) => b.amount - a.amount)
}

export const costCategoryShare: CostCategoryShare[] = generateCostCategoryShare()

// ── Monthly cost trend (前年比較) ──

function generateMonthlyCostTrend(): MonthlyCostPoint[] {
  return expenseStack.map((e) => {
    const current = COST_CATEGORIES.reduce((s, c) => s + e.values[c], 0)
    const previous = Math.round(current * (0.88 + srand(0, 12) / 100))
    return { month: e.month, currentYear: current, previousYear: previous }
  })
}

export const monthlyCostTrend: MonthlyCostPoint[] = generateMonthlyCostTrend()

// ── Expense rows (詳細明細 — 参考) ──

function generateExpenseRows(): ExpenseRow[] {
  const rows: ExpenseRow[] = []
  const latestCells = costHeatmap
  latestCells.forEach((cell, i) => {
    rows.push({
      expense_id: `EXP-${String(10000 + i)}`,
      department: cell.department,
      cost_category: cell.costCategory,
      amount: cell.amount,
      expense_date: `${plMonthly[plMonthly.length - 1].month}-15`,
    })
  })
  return rows
}

export const expenses: ExpenseRow[] = generateExpenseRows()

// ── KPIs ──

function computeKpis(): KpiItem[] {
  const latest = plMonthly[plMonthly.length - 1]
  const yoyBase = plMonthly[0]

  const grossMargin = ((latest.revenue - latest.cogs) / latest.revenue) * 100
  const grossMarginPrev = ((yoyBase.revenue - yoyBase.cogs) / yoyBase.revenue) * 100
  const opMargin = (latest.operatingIncome / latest.revenue) * 100
  const opMarginPrev = (yoyBase.operatingIncome / yoyBase.revenue) * 100

  const grossMarginSpark = plMonthly.map((m) => ((m.revenue - m.cogs) / m.revenue) * 100)
  const opMarginSpark = plMonthly.map((m) => (m.operatingIncome / m.revenue) * 100)

  const GROSS_MARGIN_TARGET = 45.0
  const OP_MARGIN_TARGET = 16.0
  const EQUITY_RATIO_TARGET = 55.0
  const OVERALL_ACHIEVE_TARGET = 100.0
  const BUDGET_BURN_TARGET = 100.0

  const equityRatioSpark = Array.from({ length: 12 }, (_, i) => {
    return EQUITY_RATIO - 4 + i * 0.35 + srand(-2, 2) / 10
  })

  const achievementSpark = varianceTrend.map((v) => 100 + v.varianceRate)
  const burnRate = (TOTAL_ACTUAL / TOTAL_BUDGET) * 100

  const statusOf = (rate: number, positiveIsGood: boolean): KpiItem["status"] => {
    if (positiveIsGood) {
      if (rate >= 100) return "achieved"
      if (rate >= 92) return "warning"
      return "unmet"
    } else {
      // low is good (for burn rate)
      if (rate <= 102) return "achieved"
      if (rate <= 108) return "warning"
      return "unmet"
    }
  }

  const round1 = (n: number) => Math.round(n * 10) / 10

  return [
    {
      id: "gross-margin",
      label: "売上総利益率",
      value: `${round1(grossMargin)}%`,
      rawValue: grossMargin,
      target: GROSS_MARGIN_TARGET,
      unit: "%",
      change: round1(grossMargin - grossMarginPrev),
      changeLabel: "前年同月比",
      positiveIsGood: true,
      achievementRate: (grossMargin / GROSS_MARGIN_TARGET) * 100,
      status: statusOf((grossMargin / GROSS_MARGIN_TARGET) * 100, true),
      spark: grossMarginSpark,
    },
    {
      id: "operating-margin",
      label: "営業利益率",
      value: `${round1(opMargin)}%`,
      rawValue: opMargin,
      target: OP_MARGIN_TARGET,
      unit: "%",
      change: round1(opMargin - opMarginPrev),
      changeLabel: "前年同月比",
      positiveIsGood: true,
      achievementRate: (opMargin / OP_MARGIN_TARGET) * 100,
      status: statusOf((opMargin / OP_MARGIN_TARGET) * 100, true),
      spark: opMarginSpark,
    },
    {
      id: "equity-ratio",
      label: "自己資本比率",
      value: `${round1(EQUITY_RATIO)}%`,
      rawValue: EQUITY_RATIO,
      target: EQUITY_RATIO_TARGET,
      unit: "%",
      change: 2.1,
      changeLabel: "前年同月比",
      positiveIsGood: true,
      achievementRate: (EQUITY_RATIO / EQUITY_RATIO_TARGET) * 100,
      status: statusOf((EQUITY_RATIO / EQUITY_RATIO_TARGET) * 100, true),
      spark: equityRatioSpark,
    },
    {
      id: "overall-achievement",
      label: "予実達成率(全社)",
      value: `${round1(OVERALL_ACHIEVEMENT_RATE)}%`,
      rawValue: OVERALL_ACHIEVEMENT_RATE,
      target: OVERALL_ACHIEVE_TARGET,
      unit: "%",
      change: round1(OVERALL_ACHIEVEMENT_RATE - 98.2),
      changeLabel: "前月比",
      positiveIsGood: false,
      achievementRate: OVERALL_ACHIEVEMENT_RATE,
      status: statusOf(OVERALL_ACHIEVEMENT_RATE, false),
      spark: achievementSpark.map((v) => Math.round(v * 10) / 10),
    },
    {
      id: "budget-burn",
      label: "予算消化率",
      value: `${round1(burnRate)}%`,
      rawValue: burnRate,
      target: BUDGET_BURN_TARGET,
      unit: "%",
      change: round1(burnRate - 95.4),
      changeLabel: "前月比",
      positiveIsGood: false,
      achievementRate: burnRate,
      status: statusOf(burnRate, false),
      spark: plMonthly.map((m) => {
        const b = (m.cogs + m.sga) * 0.96
        const a = m.cogs + m.sga
        return Math.round((a / b) * 1000) / 10
      }),
    },
  ]
}

export const financeKpis: KpiItem[] = computeKpis()

// ── KPI metric raw rows (参考) ──

export const kpiMetrics: KpiMetricRow[] = financeKpis.map((k) => ({
  metric_id: k.id,
  metric_name: k.label,
  value: k.rawValue,
  target: k.target,
  unit: k.unit,
  measured_at: `${plMonthly[plMonthly.length - 1].month}-01`,
  department: "全社",
}))

// ── Alerts (閾値超過件数 と一覧) ──

export const alertEvents: AlertEvent[] = [
  {
    id: "alert-1",
    firedAt: `${plMonthly[plMonthly.length - 1].month}-18T09:12:00`,
    severity: "critical",
    title: "マーケティング部門の予算乖離が閾値を超過",
    description: "当月広告宣伝費が予算比 +18.4%。四半期着地を再計算推奨",
    metric: "department_variance_rate",
    threshold: 10,
    observed: 18.4,
  },
  {
    id: "alert-2",
    firedAt: `${plMonthly[plMonthly.length - 1].month}-16T16:38:00`,
    severity: "warning",
    title: "営業利益率が目標を下回る",
    description: "営業利益率が目標 16.0% に対して当月 14.2%、原価率の上昇が主因",
    metric: "operating_margin",
    threshold: 16.0,
    observed: 14.2,
  },
  {
    id: "alert-3",
    firedAt: `${plMonthly[plMonthly.length - 1].month}-14T11:02:00`,
    severity: "warning",
    title: "エンジニアリング部門の業務委託費が急増",
    description: "前月比 +24%、契約更新の一時的影響か継続トレンドか要確認",
    metric: "cost_anomaly",
    threshold: 15,
    observed: 24.0,
  },
  {
    id: "alert-4",
    firedAt: `${plMonthly[plMonthly.length - 1].month}-12T08:45:00`,
    severity: "info",
    title: "粗利率は目標水準を維持",
    description: "当月 45.6%、目標 45.0% を上回っています",
    metric: "gross_margin",
    threshold: 45.0,
    observed: 45.6,
  },
]

export const ALERT_COUNT = alertEvents.filter(
  (a) => a.severity !== "info",
).length

// ── Filter options ──

export const departmentOptions = [
  { label: "すべての部門", value: "all" },
  ...DEPARTMENTS.map((d) => ({ label: d, value: d })),
]

export const comparisonOptions = [
  { label: "前年同期", value: "yoy" },
  { label: "前期", value: "pop" },
]

export const CURRENT_PERIOD = plMonthly[plMonthly.length - 1].month
