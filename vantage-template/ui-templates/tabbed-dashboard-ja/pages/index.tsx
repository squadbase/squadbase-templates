import { useState } from "react"
import { subDays } from "date-fns"
import { LayoutDashboard, Table2 } from "lucide-react"
import { definePage } from "@squadbase/vantage"
import {
  DateRangePicker,
  PageShell,
  PageShellHeader,
  PageShellHeading,
  PageShellTitle,
  PageShellDescription,
  PageShellHeaderEnd,
  PageShellContent,
} from "@squadbase/vantage/components"
import type { DateRange } from "@squadbase/vantage/components"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@squadbase/vantage/ui"

import { OverviewTab } from "./components/tabbed-dashboard/overview-tab"
import { DetailTab } from "./components/tabbed-dashboard/detail-tab"

export const page = definePage({
  title: "タブ付きダッシュボード",
  description:
    "underline タブでページを 2 つのワークスペース (KPI 主役の概要 / テーブル主役の詳細) に分割するダッシュボード。",
})

const today = new Date()

export default function HomePage() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(today, 29),
    to: today,
  })

  return (
    <PageShell>
      <PageShellHeader>
        <PageShellHeading>
          <PageShellTitle>[テンプレート] チーム概要</PageShellTitle>
          <PageShellDescription>
            選択期間の概要と詳細。
          </PageShellDescription>
        </PageShellHeading>
        <PageShellHeaderEnd>
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
            maxDate={today}
          />
        </PageShellHeaderEnd>
      </PageShellHeader>

      <PageShellContent>
        <Tabs defaultValue="overview">
          <div className="border-b">
            <TabsList variant="line" className="gap-4 bg-transparent -mb-px">
              <TabsTrigger value="overview" className="gap-2 px-1">
                <LayoutDashboard className="size-4" />
                タブ1
              </TabsTrigger>
              <TabsTrigger value="detail" className="gap-2 px-1">
                <Table2 className="size-4" />
                タブ2
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="overview" className="mt-6">
            <OverviewTab />
          </TabsContent>
          <TabsContent value="detail" className="mt-6">
            <DetailTab />
          </TabsContent>
        </Tabs>
      </PageShellContent>
    </PageShell>
  )
}
