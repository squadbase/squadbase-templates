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
  // CSS 変数は ECharts で直接読めないため、解決した値を取得して使う
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
          `<strong>${m.mediaName}</strong>${m.isNew ? " (新規)" : ""}`,
          `ASP: ${m.asp}`,
          `支出: ${formatCurrency(m.spend, { short: true })}`,
          `売上: ${formatCurrency(m.revenue, { short: true })}`,
          `CV数: ${formatNumber(m.conversions)}`,
          `ROAS: ${formatRoas(m.roas)}`,
          `CPA: ${formatCurrency(m.cpa)}`,
        ].join("<br/>")
      },
    },
    legend: { bottom: 0, data: ["既存", "新規"] },
    grid: {
      left: "6%",
      right: "5%",
      bottom: "14%",
      top: "6%",
      containLabel: true,
    },
    xAxis: {
      name: "支出",
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
      axisLabel: { formatter: (v: number) => `${v.toFixed(1)}倍` },
    },
    series: [
      {
        name: "既存",
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
            formatter: `ROAS = ${threshold.toFixed(1)}倍`,
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
        name: "新規",
        type: "scatter",
        data: pointsFor((m) => m.isNew),
        itemStyle: newColor ? { color: withAlpha(newColor, 0.85) } : undefined,
        emphasis: { focus: "series" },
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="媒体別 ROAS × 支出 散布図"
      description={`バブルサイズ=CV数。点線は ROAS 目標 ${threshold.toFixed(1)}倍 — 下回る媒体は CPA を点検したい。`}
    >
      <EChart option={option} height="420px" />
    </DashboardCardPreset>
  )
}
