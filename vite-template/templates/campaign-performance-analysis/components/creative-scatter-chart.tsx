import type { EChartsOption } from "echarts"
import {
  EChart,
  useEChartsContrastColor,
  withAlpha,
} from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { formatCurrency, formatNumber, formatPercent } from "./chart-helpers"
import type { CreativeScatterPoint } from "@/types/campaign-performance-analysis"

interface CreativeScatterChartProps {
  data: CreativeScatterPoint[]
}

const PHASE_LABEL: Record<CreativeScatterPoint["learningPhase"], string> = {
  active: "Active",
  learning: "Learning",
  limited: "Limited",
}

export function CreativeScatterChart({ data }: CreativeScatterChartProps) {
  // Resolve CSS-variable colors at runtime — ECharts cannot parse var(...)
  const activeColor = useEChartsContrastColor("--chart-1")
  const learningColor = useEChartsContrastColor("--chart-3")
  const limitedColor = useEChartsContrastColor("--chart-5")

  const minSpend = data.reduce((m, c) => (c.spend < m ? c.spend : m), Infinity)
  const maxSpend = data.reduce((m, c) => (c.spend > m ? c.spend : m), 0)

  function symbolSizeFromSpend(spend: number): number {
    if (maxSpend === minSpend) return 14
    const t = (spend - minSpend) / (maxSpend - minSpend)
    return 10 + t * 28
  }

  function pointsForPhase(phase: CreativeScatterPoint["learningPhase"]) {
    return data
      .filter((d) => d.learningPhase === phase)
      .map((d) => ({
        value: [d.ctr, d.cvr, d.spend],
        name: d.creativeName,
        symbolSize: symbolSizeFromSpend(d.spend),
        meta: d,
      }))
  }

  const option: EChartsOption = {
    tooltip: {
      trigger: "item",
      formatter: (params: unknown) => {
        const p = params as {
          data: { meta?: CreativeScatterPoint }
        }
        const m = p.data?.meta
        if (!m) return ""
        return [
          `<strong>${m.creativeName}</strong>`,
          `Campaign: ${m.campaignName}`,
          `Format: ${m.format}`,
          `CTR: ${formatPercent(m.ctr)}`,
          `CVR: ${formatPercent(m.cvr)}`,
          `Spend: ${formatCurrency(m.spend, { short: true })}`,
          `Conversions: ${formatNumber(m.conversions)}`,
          `Phase: ${PHASE_LABEL[m.learningPhase]}`,
        ].join("<br/>")
      },
    },
    legend: { bottom: 0, data: ["Active", "Learning", "Limited"] },
    grid: { left: "5%", right: "5%", bottom: "14%", top: "6%", containLabel: true },
    xAxis: {
      name: "CTR (%)",
      nameLocation: "middle",
      nameGap: 28,
      type: "value",
      min: 0,
      axisLabel: { formatter: (v: number) => `${v}%` },
    },
    yAxis: {
      name: "CVR (%)",
      nameLocation: "middle",
      nameGap: 36,
      type: "value",
      min: 0,
      axisLabel: { formatter: (v: number) => `${v}%` },
    },
    series: [
      {
        name: "Active",
        type: "scatter",
        data: pointsForPhase("active"),
        itemStyle: activeColor
          ? { color: withAlpha(activeColor, 0.85) }
          : undefined,
        emphasis: { focus: "series" },
      },
      {
        name: "Learning",
        type: "scatter",
        data: pointsForPhase("learning"),
        itemStyle: learningColor
          ? { color: withAlpha(learningColor, 0.85) }
          : undefined,
        emphasis: { focus: "series" },
      },
      {
        name: "Limited",
        type: "scatter",
        data: pointsForPhase("limited"),
        itemStyle: limitedColor
          ? { color: withAlpha(limitedColor, 0.85) }
          : undefined,
        emphasis: { focus: "series" },
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="Creative CTR × CVR"
      description="Each point is one creative; bubble size encodes spend. Split by learning-phase status."
    >
      <EChart option={option} height="380px" />
    </DashboardCardPreset>
  )
}
