// ── Enum / Literal types ──

export type AccountCategory =
  | "Revenue"
  | "COGS"
  | "Gross Profit"
  | "SG&A"
  | "Operating Income"
  | "Non-operating Income"
  | "Ordinary Income"
  | "Income Tax"
  | "Net Income"

export type AssetCategory =
  | "Cash & Deposits"
  | "Accounts Receivable"
  | "Inventory"
  | "Other Current Assets"
  | "Tangible Fixed Assets"
  | "Intangible Fixed Assets"
  | "Investments & Other"

export type LiabilityCategory =
  | "Accounts Payable"
  | "Short-term Debt"
  | "Other Current Liabilities"
  | "Long-term Debt"
  | "Other Long-term Liabilities"
  | "Capital Stock"
  | "Retained Earnings"

export type CostCategory =
  | "Personnel"
  | "Travel"
  | "Meetings"
  | "Advertising"
  | "Rent"
  | "Utilities"
  | "Communications"
  | "Outsourcing"
  | "Depreciation"
  | "Other"

export type Department =
  | "Sales"
  | "Marketing"
  | "Product"
  | "Engineering"
  | "Corporate"
  | "Customer Success"

export type KpiStatus = "achieved" | "warning" | "unmet"

export type ComparisonMode = "yoy" | "pop"

export type AlertSeverity = "info" | "warning" | "critical"

// ── Raw data schemas (DWH-style) ──

export interface PlSummaryRow {
  period: string
  department: Department | "Company-wide"
  account_category: AccountCategory
  amount: number
}

export interface BsSnapshotRow {
  snapshot_date: string
  asset_category: AssetCategory | null
  liability_category: LiabilityCategory | null
  amount: number
}

export interface BudgetRow {
  budget_id: string
  department: Department
  account: AccountCategory
  period: string
  budget_amount: number
}

export interface ActualRow {
  actual_id: string
  department: Department
  account: AccountCategory
  period: string
  actual_amount: number
}

export interface ExpenseRow {
  expense_id: string
  department: Department
  cost_category: CostCategory
  amount: number
  expense_date: string
}

export interface BudgetHierarchyRow {
  department_id: string
  department_name: Department
  parent_id: string | null
}

export interface KpiMetricRow {
  metric_id: string
  metric_name: string
  value: number
  target: number
  unit: "%" | "$" | "count"
  measured_at: string
  department?: Department | "Company-wide"
}

export interface KpiTargetRow {
  metric_id: string
  period: string
  target_value: number
}

// ── Display / derived types ──

export interface KpiItem {
  id: string
  label: string
  value: string
  rawValue: number
  target: number
  unit: "%" | "$" | "count"
  change: number
  changeLabel: string
  positiveIsGood: boolean
  achievementRate: number
  status: KpiStatus
  spark: number[]
}

export interface WaterfallStep {
  label: string
  value: number
  type: "revenue" | "cost" | "subtotal" | "profit"
  cumulative: number
}

export interface BsCompositionItem {
  label: string
  amount: number
  percentage: number
}

export interface PlMonthlyPoint {
  month: string
  revenue: number
  cogs: number
  sga: number
  operatingIncome: number
}

export interface ExpenseStackPoint {
  month: string
  values: Record<CostCategory, number>
}

export interface BudgetVarianceRow {
  department: Department
  budget: number
  actual: number
  variance: number
  varianceRate: number
  status: KpiStatus
}

export interface DepartmentAchievement {
  department: Department
  achievementRate: number
  budget: number
  actual: number
}

export interface VarianceTrendPoint {
  period: string
  variance: number
  varianceRate: number
}

export interface CostHeatmapCell {
  department: Department
  costCategory: CostCategory
  amount: number
}

export interface CostCategoryShare {
  category: CostCategory
  amount: number
  percentage: number
}

export interface MonthlyCostPoint {
  month: string
  currentYear: number
  previousYear: number
}

export interface AlertEvent {
  id: string
  firedAt: string
  severity: AlertSeverity
  title: string
  description: string
  metric: string
  threshold: number
  observed: number
}

// ── Filter state ──

export interface DashboardFilters {
  dateRange: { from: Date | undefined; to: Date | undefined }
  comparisonMode: ComparisonMode
  department: string | undefined
}
