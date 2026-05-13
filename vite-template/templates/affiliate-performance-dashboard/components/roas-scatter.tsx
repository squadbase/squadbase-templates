import type { EChartsOption } from "echarts"
import {
  EChart,
  useEChartsContrastColor,
  withAlpha,
} from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { formatCurrency, formatNumber, formatRoas } from "./chart-helpers"
import type { MediaSummary } from "@/types/affiliate-performance-dashboard"

interface RoasScatterProps {
  data: MediaSummary[]
  threshold?: number
}

export function RoasScatter({ data, threshold = 3 }: RoasScatterProps) {
  // Resolve CSS-variable colors at runtime — ECharts cannot parse var(...)
  const establishedColor = useEChartsContrastColor("--chart-1")
  const newColor = useEChartsContrastColor("--chart-2")
  const gridColor = useEChartsContrastColor("--muted-foreground")

  const minConv = data.reduce(
    (m, c) => (c.conversions < m ? c.conversions : m),
    Infinity,
  )
  const maxConv = data.reduce(
    (m, c) => (c.conversions > m ? c.conversions : m),
    0,
  )

  function symbolSizeFromConv(conv: number): number {
    if (maxConv === minConv) return 14
    const t = (conv - minConv) / (maxConv - minConv)
    return 10 + t * 36
  }

  function pointsFor(filter: (m: MediaSummary) => boolean) {
    return data.filter(filter).map((m) => ({
      value: [m.spend, m.roas],
      name: m.mediaName,
      symbolSize: symbolSizeFromConv(m.conversions),
      meta: m,
    }))
  }

  const maxSpend = data.reduce((m, c) => (c.spend > m ? c.spend : m), 0)

  const option: EChartsOption = {
    tooltip: {
      trigger: "item",
      formatter: (params: unknown) => {
        const p = params as { data: { meta?: MediaSummary } }
        const m = p.data?.meta
        if (!m) return ""
        return [
          `<strong>${m.mediaName}</strong>${m.isNew ? " (New)" : ""}`,
          `ASP: ${m.asp}`,
          `Spend: ${formatCurrency(m.spend, { short: true })}`,
          `Revenue: ${formatCurrency(m.revenue, { short: true })}`,
          `Conversions: ${formatNumber(m.conversions)}`,
          `ROAS: ${formatRoas(m.roas)}`,
          `CPA: ${formatCurrency(m.cpa)}`,
        ].join("<br/>")
      },
    },
    legend: { bottom: 0, data: ["Established", "New"] },
    grid: {
      left: "6%",
      right: "5%",
      bottom: "14%",
      top: "6%",
      containLabel: true,
    },
    xAxis: {
      name: "Spend",
      nameLocation: "middle",
      nameGap: 28,
      type: "value",
      min: 0,
      axisLabel: { formatter: (v: number) => formatNumber(v) },
    },
    yAxis: {
      name: "ROAS",
      nameLocation: "middle",
      nameGap: 36,
      type: "value",
      min: 0,
      axisLabel: { formatter: (v: number) => `${v.toFixed(1)}x` },
    },
    series: [
      {
        name: "Established",
        type: "scatter",
        data: pointsFor((m) => !m.isNew),
        itemStyle: establishedColor
          ? { color: withAlpha(establishedColor, 0.78) }
          : undefined,
        emphasis: { focus: "series" },
        markLine: {
          silent: true,
          symbol: "none",
          lineStyle: gridColor
            ? { color: withAlpha(gridColor, 0.5), type: "dashed", width: 1 }
            : { type: "dashed", width: 1 },
          label: {
            formatter: `ROAS = ${threshold.toFixed(1)}x`,
            position: "insideEndTop",
            fontSize: 11,
          },
          data: [
            { yAxis: threshold },
            [
              { coord: [maxSpend * 0.6, 0] },
              { coord: [maxSpend * 0.6, threshold] },
            ],
          ],
        },
      },
      {
        name: "New",
        type: "scatter",
        data: pointsFor((m) => m.isNew),
        itemStyle: newColor ? { color: withAlpha(newColor, 0.85) } : undefined,
        emphasis: { focus: "series" },
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="ROAS × Spend by Media"
      description={`Bubble size = conversions. Dashed line marks the ${threshold.toFixed(1)}x ROAS target — points below need a CPA review.`}
    >
      <EChart option={option} height="420px" />
    </DashboardCardPreset>
  )
}
