import { DashboardCardPreset } from "@/components/common/dashboard-card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatCurrency } from "./chart-helpers"
import type { AchievementRow } from "@/types/budget-vs-actual-by-department"

interface AchievementRankingProps {
  data: AchievementRow[]
}

export function AchievementRanking({ data }: AchievementRankingProps) {
  const maxAch = Math.max(...data.map((r) => r.achievementPct))
  return (
    <DashboardCardPreset
      title="Achievement Ranking"
      description="Departments sorted by achievement against expected pace"
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">#</TableHead>
            <TableHead>Department</TableHead>
            <TableHead className="text-right">Annual Budget</TableHead>
            <TableHead className="text-right">YTD Actual</TableHead>
            <TableHead>Achievement</TableHead>
            <TableHead className="text-right">Forecast vs Budget</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => {
            const widthPct = (row.achievementPct / maxAch) * 100
            const barColor =
              row.achievementPct >= 102
                ? "bg-chart-2"
                : row.achievementPct < 95
                  ? "bg-destructive"
                  : "bg-chart-1"
            const forecastClass =
              row.forecastVsBudget >= 0 ? "text-chart-2" : "text-destructive"
            return (
              <TableRow key={row.department}>
                <TableCell className="text-muted-foreground tabular-nums">
                  {row.rank}
                </TableCell>
                <TableCell className="font-medium">{row.department}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCurrency(row.yearBudget, { short: true })}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCurrency(row.yearActualToDate, { short: true })}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="w-14 tabular-nums text-sm">
                      {row.achievementPct.toFixed(1)}%
                    </span>
                    <div className="h-2 flex-1 max-w-[140px] rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full ${barColor}`}
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </div>
                </TableCell>
                <TableCell
                  className={`text-right tabular-nums text-sm ${forecastClass}`}
                >
                  {row.forecastVsBudget >= 0 ? "+" : ""}
                  {row.forecastVsBudget.toFixed(1)}%
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </DashboardCardPreset>
  )
}
