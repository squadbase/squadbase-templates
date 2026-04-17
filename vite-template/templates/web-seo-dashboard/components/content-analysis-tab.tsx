import { CategoryPerformanceChart } from "./category-performance-chart"
import { ContentRankingTable } from "./content-ranking-table"
import { categoryPerformance, contentRanking } from "@/lib/web-seo-mock-data"

export function ContentAnalysisTab() {
  return (
    <div className="space-y-6">
      <CategoryPerformanceChart data={categoryPerformance} />
      <ContentRankingTable data={contentRanking} />
    </div>
  )
}
