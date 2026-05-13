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
  active: "配信中",
  learning: "学習中",
  limited: "制限",
}

const FORMAT_LABEL: Record<CreativeScatterPoint["format"], string> = {
  image: "画像",
  video: "動画",
  carousel: "カルーセル",
}

export function CreativeScatterChart({ data }: CreativeScatterChartProps) {
  // CSS 変数の色は ECharts が解釈できないため runtime resolve
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
          `キャンペーン: ${m.campaignName}`,
          `フォーマット: ${FORMAT_LABEL[m.format]}`,
          `CTR: ${formatPercent(m.ctr)}`,
          `CVR: ${formatPercent(m.cvr)}`,
          `支出: ${formatCurrency(m.spend, { short: true })}`,
          `CV 数: ${formatNumber(m.conversions)}`,
          `状態: ${PHASE_LABEL[m.learningPhase]}`,
        ].join("<br/>")
      },
    },
    legend: { bottom: 0, data: ["配信中", "学習中", "制限"] },
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
        name: "配信中",
        type: "scatter",
        data: pointsForPhase("active"),
        itemStyle: activeColor
          ? { color: withAlpha(activeColor, 0.85) }
          : undefined,
        emphasis: { focus: "series" },
      },
      {
        name: "学習中",
        type: "scatter",
        data: pointsForPhase("learning"),
        itemStyle: learningColor
          ? { color: withAlpha(learningColor, 0.85) }
          : undefined,
        emphasis: { focus: "series" },
      },
      {
        name: "制限",
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
      title="クリエイティブ別 CTR × CVR"
      description="バブル 1 個がクリエイティブ 1 本。サイズ = 支出。学習期間ステータスで色分け。"
    >
      <EChart option={option} height="380px" />
    </DashboardCardPreset>
  )
}
