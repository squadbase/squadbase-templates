import { MousePointerClick, Eye, Percent, Hash } from "lucide-react"
import { KpiCard } from "./kpi-card"
import { SeoDualAxisChart } from "./seo-dual-axis-chart"
import { CtrPositionScatter } from "./ctr-position-scatter"
import { KeywordRankingTable } from "./keyword-ranking-table"
import {
  seoKpis,
  dailySearchTrend,
  ctrPositionData,
  keywordRankings,
} from "@/lib/web-seo-mock-data"

const kpiIcons = [MousePointerClick, Eye, Percent, Hash] as const

export function SeoAnalysisTab() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {seoKpis.map((kpi, i) => (
          <KpiCard key={kpi.label} item={kpi} icon={kpiIcons[i]} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SeoDualAxisChart data={dailySearchTrend} />
        </div>
        <div>
          <CtrPositionScatter data={ctrPositionData} />
        </div>
      </div>

      <KeywordRankingTable data={keywordRankings} />
    </div>
  )
}
