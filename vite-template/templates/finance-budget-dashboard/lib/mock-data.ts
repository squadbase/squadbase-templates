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
  "Sales",
  "Marketing",
  "Product",
  "Engineering",
  "Corporate",
  "Customer Success",
]

export const COST_CATEGORIES: CostCategory[] = [
  "Personnel",
  "Travel",
  "Meetings",
  "Advertising",
  "Rent",
  "Utilities",
  "Communications",
  "Outsourcing",
  "Depreciation",
  "Other",
]

export const budgetHierarchy: BudgetHierarchyRow[] = [
  { department_id: "hq", department_name: "Corporate", parent_id: null },
  { department_id: "sales", department_name: "Sales", parent_id: "hq" },
  { department_id: "mkt", department_name: "Marketing", parent_id: "sales" },
  { department_id: "cs", department_name: "Customer Success", parent_id: "sales" },
  { department_id: "product", department_name: "Product", parent_id: "hq" },
  { department_id: "eng", department_name: "Engineering", parent_id: "product" },
]

// ── PL monthly (12 months, company-wide) ──

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

// ── Waterfall (current month PL) ──

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

  push("Revenue", revenue, "revenue")
  push("COGS", -cogs, "cost")
  push("Gross Profit", grossProfit, "subtotal")
  push("SG&A", -sga, "cost")
  push("Operating Income", operatingIncome, "subtotal")
  push("Non-operating Income", nonOpIncome, "cost")
  push("Ordinary Income", ordinaryIncome, "subtotal")
  push("Income Tax", tax, "cost")
  push("Net Income", netIncome, "profit")

  return steps
}

export const plWaterfall: WaterfallStep[] = generateWaterfall()

// ── BS snapshot ──

export const bsAssets: BsCompositionItem[] = [
  { label: "Cash & Deposits", amount: 1_820_000_000, percentage: 28.4 },
  { label: "Accounts Receivable", amount: 960_000_000, percentage: 15.0 },
  { label: "Inventory", amount: 480_000_000, percentage: 7.5 },
  { label: "Other Current Assets", amount: 220_000_000, percentage: 3.4 },
  { label: "Tangible Fixed Assets", amount: 1_450_000_000, percentage: 22.6 },
  { label: "Intangible Fixed Assets", amount: 780_000_000, percentage: 12.2 },
  { label: "Investments & Other", amount: 700_000_000, percentage: 10.9 },
]

export const bsLiabilities: BsCompositionItem[] = [
  { label: "Accounts Payable", amount: 620_000_000, percentage: 9.7 },
  { label: "Short-term Debt", amount: 480_000_000, percentage: 7.5 },
  { label: "Other Current Liabilities", amount: 340_000_000, percentage: 5.3 },
  { label: "Long-term Debt", amount: 1_080_000_000, percentage: 16.8 },
  { label: "Other Long-term Liabilities", amount: 280_000_000, percentage: 4.4 },
  { label: "Capital Stock", amount: 1_500_000_000, percentage: 23.4 },
  { label: "Retained Earnings", amount: 2_110_000_000, percentage: 32.9 },
]

export const TOTAL_ASSETS = bsAssets.reduce((s, a) => s + a.amount, 0)
export const TOTAL_EQUITY =
  bsLiabilities.find((l) => l.label === "Capital Stock")!.amount +
  bsLiabilities.find((l) => l.label === "Retained Earnings")!.amount
export const EQUITY_RATIO = (TOTAL_EQUITY / TOTAL_ASSETS) * 100

// ── Expense stacked bar (monthly by category) ──

function generateExpenseStack(): ExpenseStackPoint[] {
  const baseShares: Record<CostCategory, number> = {
    Personnel: 0.48,
    Travel: 0.04,
    Meetings: 0.02,
    Advertising: 0.14,
    Rent: 0.08,
    Utilities: 0.02,
    Communications: 0.025,
    Outsourcing: 0.11,
    Depreciation: 0.06,
    Other: 0.035,
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

// ── Budget / Actual (current month) ──

const deptBudgetShares: Record<Department, number> = {
  Sales: 0.18,
  Marketing: 0.22,
  Product: 0.12,
  Engineering: 0.26,
  Corporate: 0.14,
  "Customer Success": 0.08,
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
      account: "SG&A" as AccountCategory,
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

// ── Department achievement (company-wide) ──

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

// ── Variance trend (monthly) ──

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

// ── Cost heatmap (category × department) ──

const deptCostProfile: Record<Department, Partial<Record<CostCategory, number>>> = {
  Sales: { Personnel: 1.3, Travel: 2.4, Meetings: 1.6, Advertising: 0.3, Communications: 1.1 },
  Marketing: { Personnel: 1.1, Travel: 1.2, Advertising: 3.8, Outsourcing: 1.8, Meetings: 1.3 },
  Product: { Personnel: 1.2, Outsourcing: 1.6, Communications: 1.0, Meetings: 1.0 },
  Engineering: { Personnel: 1.6, Outsourcing: 2.0, Communications: 1.6, Depreciation: 1.4 },
  Corporate: { Personnel: 0.9, Rent: 2.2, Utilities: 2.4, Depreciation: 1.5, Other: 1.6 },
  "Customer Success": { Personnel: 1.0, Travel: 1.1, Communications: 1.2 },
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

// ── Monthly cost trend (YoY comparison) ──

function generateMonthlyCostTrend(): MonthlyCostPoint[] {
  return expenseStack.map((e) => {
    const current = COST_CATEGORIES.reduce((s, c) => s + e.values[c], 0)
    const previous = Math.round(current * (0.88 + srand(0, 12) / 100))
    return { month: e.month, currentYear: current, previousYear: previous }
  })
}

export const monthlyCostTrend: MonthlyCostPoint[] = generateMonthlyCostTrend()

// ── Expense rows (line-item detail, for reference) ──

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
      label: "Gross Margin",
      value: `${round1(grossMargin)}%`,
      rawValue: grossMargin,
      target: GROSS_MARGIN_TARGET,
      unit: "%",
      change: round1(grossMargin - grossMarginPrev),
      changeLabel: "YoY",
      positiveIsGood: true,
      achievementRate: (grossMargin / GROSS_MARGIN_TARGET) * 100,
      status: statusOf((grossMargin / GROSS_MARGIN_TARGET) * 100, true),
      spark: grossMarginSpark,
    },
    {
      id: "operating-margin",
      label: "Operating Margin",
      value: `${round1(opMargin)}%`,
      rawValue: opMargin,
      target: OP_MARGIN_TARGET,
      unit: "%",
      change: round1(opMargin - opMarginPrev),
      changeLabel: "YoY",
      positiveIsGood: true,
      achievementRate: (opMargin / OP_MARGIN_TARGET) * 100,
      status: statusOf((opMargin / OP_MARGIN_TARGET) * 100, true),
      spark: opMarginSpark,
    },
    {
      id: "equity-ratio",
      label: "Equity Ratio",
      value: `${round1(EQUITY_RATIO)}%`,
      rawValue: EQUITY_RATIO,
      target: EQUITY_RATIO_TARGET,
      unit: "%",
      change: 2.1,
      changeLabel: "YoY",
      positiveIsGood: true,
      achievementRate: (EQUITY_RATIO / EQUITY_RATIO_TARGET) * 100,
      status: statusOf((EQUITY_RATIO / EQUITY_RATIO_TARGET) * 100, true),
      spark: equityRatioSpark,
    },
    {
      id: "overall-achievement",
      label: "Budget Attainment (Company-wide)",
      value: `${round1(OVERALL_ACHIEVEMENT_RATE)}%`,
      rawValue: OVERALL_ACHIEVEMENT_RATE,
      target: OVERALL_ACHIEVE_TARGET,
      unit: "%",
      change: round1(OVERALL_ACHIEVEMENT_RATE - 98.2),
      changeLabel: "MoM",
      positiveIsGood: false,
      achievementRate: OVERALL_ACHIEVEMENT_RATE,
      status: statusOf(OVERALL_ACHIEVEMENT_RATE, false),
      spark: achievementSpark.map((v) => Math.round(v * 10) / 10),
    },
    {
      id: "budget-burn",
      label: "Budget Burn Rate",
      value: `${round1(burnRate)}%`,
      rawValue: burnRate,
      target: BUDGET_BURN_TARGET,
      unit: "%",
      change: round1(burnRate - 95.4),
      changeLabel: "MoM",
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

// ── KPI metric raw rows (reference) ──

export const kpiMetrics: KpiMetricRow[] = financeKpis.map((k) => ({
  metric_id: k.id,
  metric_name: k.label,
  value: k.rawValue,
  target: k.target,
  unit: k.unit,
  measured_at: `${plMonthly[plMonthly.length - 1].month}-01`,
  department: "Company-wide",
}))

// ── Alerts (threshold breach count and list) ──

export const alertEvents: AlertEvent[] = [
  {
    id: "alert-1",
    firedAt: `${plMonthly[plMonthly.length - 1].month}-18T09:12:00`,
    severity: "critical",
    title: "Marketing budget variance exceeded threshold",
    description: "Advertising spend this month is +18.4% vs. budget. Recommend recomputing the quarterly landing forecast.",
    metric: "department_variance_rate",
    threshold: 10,
    observed: 18.4,
  },
  {
    id: "alert-2",
    firedAt: `${plMonthly[plMonthly.length - 1].month}-16T16:38:00`,
    severity: "warning",
    title: "Operating margin below target",
    description: "Operating margin is 14.2% this month vs. 16.0% target, driven primarily by a higher cost-of-goods ratio.",
    metric: "operating_margin",
    threshold: 16.0,
    observed: 14.2,
  },
  {
    id: "alert-3",
    firedAt: `${plMonthly[plMonthly.length - 1].month}-14T11:02:00`,
    severity: "warning",
    title: "Engineering outsourcing spend spiked",
    description: "+24% MoM — verify whether this is a one-time contract renewal impact or a continuing trend.",
    metric: "cost_anomaly",
    threshold: 15,
    observed: 24.0,
  },
  {
    id: "alert-4",
    firedAt: `${plMonthly[plMonthly.length - 1].month}-12T08:45:00`,
    severity: "info",
    title: "Gross margin holding at target",
    description: "This month is 45.6%, above the 45.0% target.",
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
  { label: "All departments", value: "all" },
  ...DEPARTMENTS.map((d) => ({ label: d, value: d })),
]

export const comparisonOptions = [
  { label: "Year over year", value: "yoy" },
  { label: "Period over period", value: "pop" },
]

export const CURRENT_PERIOD = plMonthly[plMonthly.length - 1].month
