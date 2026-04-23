import { useState } from "react";
import { subMonths, startOfMonth, endOfMonth } from "date-fns";
import { Download } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/data/date-range-picker";
import { SegmentedControl } from "@/components/common/segmented-control";
import {
  PageShell,
  PageShellHeader,
  PageShellHeading,
  PageShellTitle,
  PageShellDescription,
  PageShellHeaderEnd,
  PageShellSummary,
  PageShellContent,
} from "@/components/common/page-shell";
import { InsightCards } from "@/components/finance-budget-dashboard/insight-cards";
import { OverviewTab } from "@/components/finance-budget-dashboard/overview-tab";
import { DetailTab } from "@/components/finance-budget-dashboard/detail-tab";
import { comparisonOptions } from "@/lib/finance-budget-mock-data";
import type { ComparisonMode, DashboardFilters } from "@/types/finance-budget";

const today = new Date();
const initialFilters: DashboardFilters = {
  dateRange: {
    from: startOfMonth(subMonths(today, 11)),
    to: endOfMonth(today),
  },
  comparisonMode: "yoy",
  department: "all",
};

export default function HomePage() {
  const [filters, setFilters] = useState<DashboardFilters>(initialFilters);

  const handleExport = () => {
    // テンプレートでは UI プレースホルダ: 実装はユーザーが差し替える
    console.log("Export CSV", filters);
  };

  return (
    <PageShell>
      <PageShellHeader>
        <PageShellHeading>
          <PageShellTitle>財務・予実管理ダッシュボード</PageShellTitle>
          <PageShellDescription>
            PL/BS・予実差異・部門別コスト・主要KPIを一元把握し、月次レビューと予算修正判断を支援
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
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="gap-1.5"
          >
            <Download className="size-3.5" />
            CSV出力
          </Button>
        </PageShellHeaderEnd>
        <PageShellSummary>
          <InsightCards />
        </PageShellSummary>
      </PageShellHeader>

      <PageShellContent className="space-y-6">
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">全社概況</TabsTrigger>
            <TabsTrigger value="detail">部門別詳細</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <OverviewTab />
          </TabsContent>
          <TabsContent value="detail" className="mt-6">
            <DetailTab />
          </TabsContent>
        </Tabs>
      </PageShellContent>
    </PageShell>
  );
}
