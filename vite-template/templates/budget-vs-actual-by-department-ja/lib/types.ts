export type Department =
  | "営業"
  | "マーケティング"
  | "エンジニアリング"
  | "オペレーション"
  | "カスタマーサクセス"
  | "経理"
  | "人事"

export interface BudgetActualRow {
  department: Department
  month: string
  budget: number
  actual: number
}

export interface KpiItem {
  label: string
  value: string
  change: number
  changeLabel: string
  positiveIsGood: boolean
  sparklineData: number[]
}

export interface DeptBudgetActual {
  department: Department
  yearBudget: number
  yearActualToDate: number
  achievementPct: number
  monthsElapsed: number
  expectedRunRate: number
  paceForecast: number
  forecastVsBudget: number
}

export interface CumulativePoint {
  month: string
  budgetCum: number
  actualCum: number
  monthBudget: number
  monthActual: number
}

export interface AchievementRow {
  rank: number
  department: Department
  yearBudget: number
  yearActualToDate: number
  achievementPct: number
  paceForecast: number
  forecastVsBudget: number
}

export interface DashboardFilters {
  dateRange: { from: Date | undefined; to: Date | undefined }
  department: string | undefined
}
