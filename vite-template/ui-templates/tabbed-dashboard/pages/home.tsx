import { useState } from "react"
import { subDays } from "date-fns"
import { LayoutDashboard, Table2 } from "lucide-react"
import { DateRangePicker } from "@/components/data/date-range-picker"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  PageShell,
  PageShellHeader,
  PageShellHeading,
  PageShellTitle,
  PageShellDescription,
  PageShellHeaderEnd,
  PageShellContent,
} from "@/components/common/page-shell"
import { OverviewTab } from "@/components/ui-template-tabbed-dashboard/overview-tab"
import { DetailTab } from "@/components/ui-template-tabbed-dashboard/detail-tab"

const today = new Date()

export default function HomePage() {
  const [dateRange, setDateRange] = useState({
    from: subDays(today, 29) as Date | undefined,
    to: today as Date | undefined,
  })

  return (
    <PageShell>
      <PageShellHeader>
        <PageShellHeading>
          <PageShellTitle>[Template] Team overview</PageShellTitle>
          <PageShellDescription>
            Overview and detail for the selected period.
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
                Tab 1
              </TabsTrigger>
              <TabsTrigger value="detail" className="gap-2 px-1">
                <Table2 className="size-4" />
                Tab 2
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
