import { useMemo, useState } from "react"
import { Download, Search } from "lucide-react"

import { definePage } from "@squadbase/vantage"
import {
  DashboardCardPreset,
  EChart,
  PageShell,
  PageShellContent,
  PageShellDescription,
  PageShellHeader,
  PageShellHeaderEnd,
  PageShellHeading,
  PageShellTitle,
  Placeholder,
  type EChartsOption,
} from "@squadbase/vantage/components"
import { Button, Input, ToggleGroup, ToggleGroupItem } from "@squadbase/vantage/ui"

import { DetailTable } from "./components/table-focus/detail-table"
import {
  detailRows,
  summaryRows,
  trendSeries,
} from "./components/table-focus/mock-data"
import type { DetailRow, TrendPoint } from "./components/table-focus/types"

export const page = definePage({
  title: "Records",
  description:
    "Workbench layout: header search + Export, status filter chips, a sortable detail table as the main element, with a trend chart and segment breakdown in a right sidebar.",
})

// ── chart helpers ───────────────────────────────────────────────────────────

function getBaseGrid() {
  return { left: "3%", right: "4%", bottom: "10%", containLabel: true }
}

function formatNumber(n: number): string {
  const sign = n < 0 ? "-" : ""
  const abs = Math.abs(n)
  if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(1)}K`
  return n.toLocaleString("en-US")
}

// ── chart options ────────────────────────────────────────────────────────────

function trendOption(data: TrendPoint[]): EChartsOption {
  return {
    tooltip: { trigger: "axis" },
    legend: { bottom: 0 },
    grid: getBaseGrid(),
    xAxis: {
      type: "category",
      data: data.map((d) => d.date),
      boundaryGap: false,
      axisLabel: { formatter: (v: string) => v.slice(5) },
    },
    yAxis: { type: "value", axisLabel: { formatter: (v: number) => formatNumber(v) } },
    series: [
      {
        name: "Series A",
        type: "line",
        smooth: true,
        showSymbol: false,
        data: data.map((d) => d.value),
        areaStyle: { opacity: 0.18 },
      },
    ],
  }
}

// ── page ─────────────────────────────────────────────────────────────────────

type StatusFilter = "all" | DetailRow["status"]

export default function HomePage() {
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<StatusFilter>("all")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return detailRows.filter((r) => {
      if (status !== "all" && r.status !== status) return false
      if (q && !r.name.toLowerCase().includes(q) && !r.owner.toLowerCase().includes(q)) return false
      return true
    })
  }, [query, status])

  return (
    <PageShell>
      <PageShellHeader>
        <PageShellHeading>
          <PageShellTitle>[Template] Records</PageShellTitle>
          <PageShellDescription>
            Browse, filter, and search the full record list.
          </PageShellDescription>
        </PageShellHeading>
        <PageShellHeaderEnd className="flex-row items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className="h-9 w-64 pl-8"
            />
          </div>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Download className="size-4" />
          </Button>
        </PageShellHeaderEnd>
      </PageShellHeader>

      <PageShellContent className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Base UI ToggleGroup is array-valued even for single select. */}
          <ToggleGroup
            value={[status]}
            onValueChange={(values) => {
              const next = values[0]
              if (next) setStatus(next as StatusFilter)
            }}
            variant="outline"
            size="sm"
          >
            <ToggleGroupItem value="all">All</ToggleGroupItem>
            <ToggleGroupItem value="active">Option A</ToggleGroupItem>
            <ToggleGroupItem value="paused">Option B</ToggleGroupItem>
            <ToggleGroupItem value="draft">Option C</ToggleGroupItem>
          </ToggleGroup>
          <span className="text-xs text-muted-foreground">
            {filtered.length} results
          </span>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <DashboardCardPreset
              title="Records"
              description="Detailed rows for the current filter"
            >
              <DetailTable data={filtered} />
            </DashboardCardPreset>
          </div>
          <div className="space-y-4">
            <DashboardCardPreset
              title="Trend"
              description="Values over the selected period"
            >
              <EChart option={trendOption(trendSeries)} height="220px" />
            </DashboardCardPreset>
            <DashboardCardPreset title="By segment" description="Share of total">
              <div className="space-y-3">
                {summaryRows.map((row) => (
                  <div key={row.segment} className="space-y-1.5">
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm font-medium">{row.segment}</span>
                      <Placeholder className="text-sm">
                        {row.revenue.toLocaleString("en-US")}
                      </Placeholder>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${(row.share * 100).toFixed(1)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </DashboardCardPreset>
          </div>
        </div>
      </PageShellContent>
    </PageShell>
  )
}
