import { ArrowRightLeft, AlertOctagon } from "lucide-react"
import {
  DashboardCard,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardCardAction,
  DashboardCardContent,
} from "@/components/common/dashboard-card"
import { AchievementProgressCard } from "./achievement-progress-card"
import { PlWaterfallChart } from "./pl-waterfall-chart"
import { BulletBudgetChart } from "./bullet-budget-chart"
import { formatSignedCurrency } from "./chart-helpers"
import {
  financeKpis,
  plWaterfall,
  budgetVariance,
  OVERALL_VARIANCE,
} from "@/lib/finance-budget-mock-data"

export function OverviewTab() {
  const overallAchievement = financeKpis.find(
    (k) => k.id === "overall-achievement",
  )!

  const unmetDeptCount = budgetVariance.filter(
    (v) => v.status !== "achieved",
  ).length

  const varianceTone =
    OVERALL_VARIANCE > 0
      ? "text-rose-600 dark:text-rose-400"
      : "text-emerald-600 dark:text-emerald-400"

  const unmetTone =
    unmetDeptCount >= 3
      ? "text-rose-600 dark:text-rose-400"
      : unmetDeptCount > 0
        ? "text-amber-600 dark:text-amber-400"
        : "text-emerald-600 dark:text-emerald-400"

  return (
    <div className="space-y-6">
      <PlWaterfallChart data={plWaterfall} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AchievementProgressCard item={overallAchievement} />

        <DashboardCard>
          <DashboardCardHeader>
            <DashboardCardTitle className="font-medium text-muted-foreground">
              Variance vs. Budget (Actual − Budget)
            </DashboardCardTitle>
            <DashboardCardAction>
              <ArrowRightLeft className="size-4 text-muted-foreground" />
            </DashboardCardAction>
          </DashboardCardHeader>
          <DashboardCardContent>
            <div className={`text-2xl font-bold tabular-nums ${varianceTone}`}>
              {formatSignedCurrency(OVERALL_VARIANCE, { short: true })}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {OVERALL_VARIANCE > 0 ? "Over budget" : "Within budget"} / all departments
            </p>
          </DashboardCardContent>
        </DashboardCard>

        <DashboardCard>
          <DashboardCardHeader>
            <DashboardCardTitle className="font-medium text-muted-foreground">
              Unmet / Warning Departments
            </DashboardCardTitle>
            <DashboardCardAction>
              <AlertOctagon className="size-4 text-muted-foreground" />
            </DashboardCardAction>
          </DashboardCardHeader>
          <DashboardCardContent>
            <div className={`text-2xl font-bold tabular-nums ${unmetTone}`}>
              {unmetDeptCount}
              <span className="ml-1 text-sm font-medium text-muted-foreground">
                / {budgetVariance.length} depts
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Departments with variance rate beyond ±3% threshold
            </p>
          </DashboardCardContent>
        </DashboardCard>
      </div>

      <BulletBudgetChart data={budgetVariance} />
    </div>
  )
}
