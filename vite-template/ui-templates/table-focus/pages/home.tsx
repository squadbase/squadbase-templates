import { useMemo, useState } from "react"
import { Download, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import {
  PageShell,
  PageShellHeader,
  PageShellHeading,
  PageShellTitle,
  PageShellDescription,
  PageShellHeaderEnd,
  PageShellContent,
} from "@/components/common/page-shell"
import { DetailTable } from "@/components/ui-template-table-focus/detail-table"
import { SupportChart } from "@/components/ui-template-table-focus/support-chart"
import { formatCurrency } from "@/components/ui-template-table-focus/chart-helpers"
import {
  detailRows,
  summaryRows,
  trendSeries,
} from "@/lib/ui-template-table-focus-mock-data"
import type { DetailRow } from "@/types/ui-template-table-focus"

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
          <PageShellTitle>[Template] Catalog Operations</PageShellTitle>
          <PageShellDescription>
            Detail-rich workbench layout with segment breakdown and a supporting activity trend
          </PageShellDescription>
        </PageShellHeading>
        <PageShellHeaderEnd className="flex-row items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search items, owners..."
              className="h-9 w-64 pl-8"
            />
          </div>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Download className="size-4" />
            Export
          </Button>
        </PageShellHeaderEnd>
      </PageShellHeader>

      <PageShellContent className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <ToggleGroup
            type="single"
            value={status}
            onValueChange={(v) => v && setStatus(v as StatusFilter)}
            variant="outline"
            size="sm"
          >
            <ToggleGroupItem value="all">All ({detailRows.length})</ToggleGroupItem>
            <ToggleGroupItem value="active">Active</ToggleGroupItem>
            <ToggleGroupItem value="paused">Paused</ToggleGroupItem>
            <ToggleGroupItem value="draft">Draft</ToggleGroupItem>
          </ToggleGroup>
          <p className="text-xs text-muted-foreground tabular-nums">
            Showing {filtered.length} of {detailRows.length} rows
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <DetailTable data={filtered} />
          </div>
          <div className="space-y-4">
            <SupportChart data={trendSeries} />
            <DashboardCardPreset
              title="By Segment"
              description="Revenue share across categories"
            >
              <div className="space-y-3">
                {summaryRows.map((row) => (
                  <div key={row.segment} className="space-y-1.5">
                    <div className="flex items-baseline justify-between text-sm">
                      <span className="font-medium">{row.segment}</span>
                      <span className="text-muted-foreground tabular-nums">
                        {formatCurrency(row.revenue, { short: true })}
                      </span>
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
