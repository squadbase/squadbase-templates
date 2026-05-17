import { useState } from "react"
import { subDays, startOfDay, endOfDay } from "date-fns"
import {
  Activity,
  Clock,
  Wrench,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react"
import { DateRangePicker } from "@/components/data/date-range-picker"
import { FilterBar, FilterBarSelect } from "@/components/data/filter-bar"
import {
  PageShell,
  PageShellHeader,
  PageShellHeading,
  PageShellTitle,
  PageShellDescription,
  PageShellHeaderEnd,
  PageShellSummary,
  PageShellContent,
} from "@/components/common/page-shell"
import { InsightCards } from "@/components/equipment-maintenance-dashboard/insight-cards"
import { KpiCard } from "@/components/equipment-maintenance-dashboard/kpi-card"
import { EquipmentUptimeTable } from "@/components/equipment-maintenance-dashboard/equipment-uptime-table"
import { FailureTrendChart } from "@/components/equipment-maintenance-dashboard/failure-trend-chart"
import { PreventiveMaintenanceList } from "@/components/equipment-maintenance-dashboard/preventive-maintenance-list"
import { DowntimeHeatmap } from "@/components/equipment-maintenance-dashboard/downtime-heatmap"
import {
  headerKpis,
  equipmentUptime,
  failureTrend,
  preventiveMaintenanceTasks,
  downtimeHeatmap,
  heatmapEquipmentNames,
  categoryOptions,
  lineOptions,
} from "@/lib/equipment-maintenance-dashboard-mock-data"
import type { DashboardFilters } from "@/types/equipment-maintenance-dashboard"

const today = new Date()
const initialFilters: DashboardFilters = {
  dateRange: { from: startOfDay(subDays(today, 29)), to: endOfDay(today) },
  category: "all",
  line: "all",
}

const kpiIcons = [Activity, Clock, Wrench, AlertTriangle, CheckCircle2] as const

export default function HomePage() {
  const [filters, setFilters] = useState<DashboardFilters>(initialFilters)

  const filterValues: Record<string, string | undefined> = {
    category: filters.category,
    line: filters.line,
  }

  return (
    <PageShell>
      <PageShellHeader>
        <PageShellHeading>
          <PageShellTitle>設備保全ダッシュボード</PageShellTitle>
          <PageShellDescription>
            稼働率・MTBF/MTTR・故障件数・予防保全状況を 1 画面でまとめる保全/工務向けダッシュボード
          </PageShellDescription>
        </PageShellHeading>
        <PageShellHeaderEnd>
          <DateRangePicker
            value={filters.dateRange}
            onChange={(range) =>
              setFilters((prev) => ({ ...prev, dateRange: range }))
            }
            maxDate={today}
          />
        </PageShellHeaderEnd>
        <PageShellSummary>
          <InsightCards />
        </PageShellSummary>
      </PageShellHeader>

      <PageShellContent className="space-y-6">
        <FilterBar
          value={filterValues}
          onChange={(next) =>
            setFilters((prev) => ({
              ...prev,
              category: next.category as string | undefined,
              line: next.line as string | undefined,
            }))
          }
        >
          <FilterBarSelect
            filterKey="category"
            label="カテゴリ"
            options={categoryOptions}
          />
          <FilterBarSelect
            filterKey="line"
            label="ライン"
            options={lineOptions}
          />
        </FilterBar>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {headerKpis.map((kpi, i) => (
            <KpiCard key={kpi.label} item={kpi} icon={kpiIcons[i]} />
          ))}
        </div>

        <EquipmentUptimeTable data={equipmentUptime} />

        <FailureTrendChart data={failureTrend} />

        <PreventiveMaintenanceList data={preventiveMaintenanceTasks} />

        <DowntimeHeatmap
          data={downtimeHeatmap}
          equipmentNames={heatmapEquipmentNames}
        />
      </PageShellContent>
    </PageShell>
  )
}
