import { useMemo, useState } from "react"
import type { EChartsOption } from "echarts"
import { EChart } from "@/components/data/echart"
import {
  DashboardCard,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardCardDescription,
  DashboardCardAction,
  DashboardCardContent,
} from "@/components/common/dashboard-card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getBaseGrid, formatNumber, formatUnits } from "./chart-helpers"
import type { ProductForecastSeries } from "@/types/demand-forecast-vs-actual"

interface ForecastVsActualChartProps {
  data: ProductForecastSeries[]
}

export function ForecastVsActualChart({ data }: ForecastVsActualChartProps) {
  const [selected, setSelected] = useState<string>("all")

  const filtered = useMemo(() => {
    if (selected === "all") return data
    return data.filter((s) => s.productId === selected)
  }, [data, selected])

  const weeks = filtered[0]?.points.map((p) => p.week.slice(5)) ?? []

  const aggregated = useMemo(() => {
    if (filtered.length === 0) return { forecast: [] as number[], actual: [] as number[] }
    const len = filtered[0].points.length
    const forecast = new Array(len).fill(0)
    const actual = new Array(len).fill(0)
    for (const series of filtered) {
      series.points.forEach((p, i) => {
        forecast[i] += p.forecastQty
        actual[i] += p.actualQty
      })
    }
    return { forecast, actual }
  }, [filtered])

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      valueFormatter: (v) =>
        v === null || v === undefined ? "-" : formatUnits(v as number),
    },
    legend: { bottom: 0 },
    grid: getBaseGrid(),
    xAxis: {
      type: "category",
      data: weeks,
      boundaryGap: false,
    },
    yAxis: {
      type: "value",
      min: 0,
      axisLabel: { formatter: (v: number) => formatNumber(v) },
    },
    series: [
      {
        name: "Forecast",
        type: "line",
        smooth: true,
        showSymbol: false,
        lineStyle: { type: "dashed", width: 2 },
        data: aggregated.forecast,
      },
      {
        name: "Actual",
        type: "line",
        smooth: true,
        showSymbol: false,
        data: aggregated.actual,
        areaStyle: { opacity: 0.15 },
      },
    ],
  }

  return (
    <DashboardCard>
      <DashboardCardHeader>
        <div className="min-w-0 flex-1 space-y-1">
          <DashboardCardTitle>Forecast vs Actual by Product</DashboardCardTitle>
          <DashboardCardDescription>
            Weekly forecast against realized demand — aggregate or pick a single SKU
          </DashboardCardDescription>
        </div>
        <DashboardCardAction>
          <Select value={selected} onValueChange={setSelected}>
            <SelectTrigger className="w-[220px]" aria-label="Select product">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All products (aggregate)</SelectItem>
              {data.map((s) => (
                <SelectItem key={s.productId} value={s.productId}>
                  {s.productName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </DashboardCardAction>
      </DashboardCardHeader>
      <DashboardCardContent>
        <EChart option={option} height="320px" />
      </DashboardCardContent>
    </DashboardCard>
  )
}
