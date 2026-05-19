import type { EChartsOption } from "echarts"
import {
  EChart,
  useEChartsContrastColor,
  withAlpha,
} from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { formatSignedPercent } from "./chart-helpers"
import type {
  FrequencyDeclineCell,
  RiskTier,
} from "@/types/churn-prediction-monitor"

interface FrequencyDeclineHeatmapProps {
  data: FrequencyDeclineCell[]
}

const TIERS: readonly RiskTier[] = ["critical", "high", "medium", "low"]
const TIER_LABELS: Record<RiskTier, string> = {
  critical: "クリティカル",
  high: "高",
  medium: "中",
  low: "低",
}
const HEATMAP_ALPHA_STOPS = [0.06, 0.18, 0.32, 0.46, 0.6, 0.78, 0.95]

export function FrequencyDeclineHeatmap({ data }: FrequencyDeclineHeatmapProps) {
  const baseColor = useEChartsContrastColor("--chart-3")
  const gradient = baseColor
    ? HEATMAP_ALPHA_STOPS.map((a) => withAlpha(baseColor, a))
    : undefined

  const weeks = Array.from(new Set(data.map((c) => c.weeksAgoBucket))).sort(
    (a, b) => a - b,
  )
  // 古い週を左、今週を右
  const weekLabels = weeks
    .slice()
    .reverse()
    .map((w) => (w === 0 ? "今週" : `${w}週前`))

  // declinePct の大きさをマグニチュード化 (色が濃いほど落ち込みが大きい)
  const magnitudes = data.map((c) => Math.max(0, -c.declinePct))
  const maxMag = magnitudes.reduce((m, v) => (v > m ? v : m), 0)

  const seriesData = data.map((c) => [
    weeks.length - 1 - c.weeksAgoBucket,
    TIERS.length - 1 - TIERS.indexOf(c.riskTier),
    Math.max(0, -c.declinePct),
  ])

  const option: EChartsOption = {
    tooltip: {
      position: "top",
      formatter: (params: unknown) => {
        const p = params as { value: [number, number, number] }
        const tier = TIERS[TIERS.length - 1 - p.value[1]]
        const weekIdx = weeks.length - 1 - p.value[0]
        const cell = data.find(
          (c) => c.weeksAgoBucket === weekIdx && c.riskTier === tier,
        )
        const label = weekIdx === 0 ? "今週" : `${weekIdx}週前`
        return [
          `<strong>${TIER_LABELS[tier]} · ${label}</strong>`,
          cell ? `平均頻度変化: ${formatSignedPercent(cell.declinePct)}` : "",
          cell ? `対象顧客: ${cell.customers}社` : "",
        ]
          .filter(Boolean)
          .join("<br/>")
      },
    },
    grid: {
      left: "4%",
      right: "4%",
      top: "6%",
      bottom: "18%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: weekLabels,
      splitArea: { show: true },
    },
    yAxis: {
      type: "category",
      data: [...TIERS].reverse().map((t) => TIER_LABELS[t]),
      splitArea: { show: true },
    },
    visualMap: {
      min: 0,
      max: maxMag,
      calculable: true,
      orient: "horizontal",
      left: "center",
      bottom: 0,
      itemWidth: 12,
      text: ["落ち込み大", "横ばい"],
      inRange: gradient ? { color: gradient } : undefined,
    },
    series: [
      {
        name: "頻度ダウン",
        type: "heatmap",
        data: seriesData,
        label: { show: false },
        emphasis: {
          itemStyle: {
            shadowBlur: 8,
            shadowColor: "rgba(0,0,0,0.3)",
          },
        },
        progressive: 0,
        animation: false,
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="リスク階層別 発注頻度ダウン (直近12週)"
      description="どの階層がいつから減速したか — 上段が濃いほど離反圧力が積み上がっているサイン"
    >
      <EChart option={option} height="320px" />
    </DashboardCardPreset>
  )
}
