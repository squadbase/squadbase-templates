// ── Enum / Literal types ──

export type AccountCategory =
  | "売上高"
  | "売上原価"
  | "粗利"
  | "販管費"
  | "営業利益"
  | "営業外損益"
  | "経常利益"
  | "法人税等"
  | "当期純利益"

export type AssetCategory =
  | "現金・預金"
  | "売掛金"
  | "棚卸資産"
  | "その他流動資産"
  | "有形固定資産"
  | "無形固定資産"
  | "投資その他"

export type LiabilityCategory =
  | "買掛金"
  | "短期借入金"
  | "その他流動負債"
  | "長期借入金"
  | "その他固定負債"
  | "資本金"
  | "利益剰余金"

export type CostCategory =
  | "人件費"
  | "旅費交通費"
  | "会議費"
  | "広告宣伝費"
  | "地代家賃"
  | "水道光熱費"
  | "通信費"
  | "業務委託費"
  | "減価償却費"
  | "その他"

export type Department =
  | "営業本部"
  | "マーケティング"
  | "プロダクト"
  | "エンジニアリング"
  | "コーポレート"
  | "カスタマーサクセス"

export type KpiStatus = "achieved" | "warning" | "unmet"

export type ComparisonMode = "yoy" | "pop"

export type AlertSeverity = "info" | "warning" | "critical"

// ── Raw data schemas (DWH-style) ──

export interface PlSummaryRow {
  period: string
  department: Department | "全社"
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
  unit: "%" | "¥" | "件"
  measured_at: string
  department?: Department | "全社"
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
  unit: "%" | "¥" | "件"
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
