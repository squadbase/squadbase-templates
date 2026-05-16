import type { EChartsOption } from "echarts"
import {
  EChart,
  useEChartsContrastColor,
  withAlpha,
} from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { formatNumber } from "./chart-helpers"
import type { FunnelStage } from "@/types/ui-template-funnel"

interface FunnelChartProps {
  data: FunnelStage[]
  height?: string
  display?: "count" | "percent"
}

export function FunnelChart({
  data,
  height = "440px",
  display = "count",
}: FunnelChartProps) {
  const baseColor = useEChartsContrastColor("--chart-1")
  const labelColor = useEChartsContrastColor("--foreground")
  const max = data[0]?.value ?? 0

  const alphas = [1, 0.82, 0.66, 0.5, 0.36]
  const palette = alphas.map((a) => (a === 1 ? baseColor : withAlpha(baseColor, a)))

  const option: EChartsOption = {
    tooltip: {
      trigger: "item",
      formatter: (params: unknown) => {
        const p = params as {
          name: string
          value: number
          data: { conversionRate: number; share: number }
        }
        return `${p.name}<br/>${formatNumber(p.value)} (${p.data.share.toFixed(1)}% of top)`
      },
    },
    series: [
      {
        type: "funnel",
        orient: "horizontal",
        funnelAlign: "center",
        left: "2%",
        right: "2%",
        top: 16,
        bottom: 64,
        min: 0,
        max,
        sort: "descending",
        gap: 4,
        label: {
          show: true,
          position: "bottom",
          formatter: (p: unknown) => {
            const params = p as {
              name: string
              value: number
              data: { conversionRate: number; share: number }
            }
            const main =
              display === "percent"
                ? `${params.data.share.toFixed(1)}%`
                : formatNumber(params.value)
            return `{name|${params.name}}\n{value|${main}}`
          },
          rich: {
            name: {
              fontSize: 12,
              fontWeight: 600,
              color: labelColor,
              lineHeight: 16,
              align: "center",
            },
            value: {
              fontSize: 11,
              color: labelColor,
              opacity: 0.6,
              lineHeight: 14,
              align: "center",
            },
          },
        },
        labelLine: { show: false },
        data: data.map((d, i) => ({
          name: d.stage,
          value: d.value,
          conversionRate: d.conversionRate,
          share: (d.value / Math.max(1, max)) * 100,
          itemStyle: { color: palette[i % palette.length] },
        })),
      },
    ] as EChartsOption["series"],
  }

  return (
    <DashboardCardPreset
      title="Conversion Funnel"
      description="Stage-by-stage funnel from visitors to conversions"
    >
      <EChart option={option} height={height} />
    </DashboardCardPreset>
  )
}
