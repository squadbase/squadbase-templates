import { definePage } from "@squadbase/vantage"
import {
  DashboardCardPreset,
  PageShell,
  PageShellContent,
  PageShellDescription,
  PageShellHeader,
  PageShellHeading,
  PageShellTitle,
  Placeholder,
} from "@squadbase/vantage/components"

export const page = definePage({
  title: "Dashboard",
  description: "Sample data — replace with your own to get started.",
  navLabel: "Home",
})

const METRICS = [
  { label: "Metric 1", value: "1,234" },
  { label: "Metric 2", value: "5,678" },
  { label: "Metric 3", value: "90.1%" },
  { label: "Metric 4", value: "$12.3k" },
]

const CHARTS = ["Chart 1", "Chart 2"]

export default function HomePage() {
  return (
    <PageShell>
      <PageShellHeader>
        <PageShellHeading>
          <PageShellTitle>Dashboard</PageShellTitle>
          <PageShellDescription>
            Sample data — replace with your own to get started.
          </PageShellDescription>
        </PageShellHeading>
      </PageShellHeader>

      <PageShellContent>
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {METRICS.map((metric) => (
            <DashboardCardPreset key={metric.label} title={metric.label}>
              <Placeholder className="text-2xl font-bold">{metric.value}</Placeholder>
            </DashboardCardPreset>
          ))}
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {CHARTS.map((title) => (
            <DashboardCardPreset key={title} title={title}>
              <Placeholder className="h-64 w-full" />
            </DashboardCardPreset>
          ))}
        </section>
      </PageShellContent>
    </PageShell>
  )
}
