import type { EChartsOption } from "echarts"
import {
  EChart,
  useEChartsContrastColor,
  withAlpha,
} from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { formatCurrency, formatNumber } from "./chart-helpers"
import type { DeptBudgetActual } from "@/types/budget-vs-actual-by-department"

interface DeptBulletBarProps {
  data: DeptBudgetActual[]
}

export function DeptBulletBar({ data }: DeptBulletBarProps) {
  const okColor = useEChartsContrastColor("--chart-1")
  const ahead = useEChartsContrastColor("--chart-2")
  const behind = useEChartsContrastColor("--chart-4")
  const trackColor = useEChartsContrastColor("--chart-1")

  const sorted = [...data].sort((a, b) => b.achievementPct - a.achievementPct)
  const depts = sorted.map((d) => d.department)

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params: unknown) => {
        const arr = params as { dataIndex: number }[]
        const idx = arr[0]?.dataIndex ?? 0
        const reversedIdx = depts.length - 1 - idx
        const d = sorted[reversedIdx]
        return [
          `<strong>${d.department}</strong>`,
          `年間予算: ${formatCurrency(d.yearBudget, { short: true })}`,
          `実績 YTD: ${formatCurrency(d.yearActualToDate, { short: true })}`,
          `想定ペース: ${formatCurrency(d.expectedRunRate, { short: true })}`,
          `達成率: ${d.achievementPct.toFixed(1)}% (対ペース)`,
          `着地予測: ${formatCurrency(d.paceForecast, { short: true })} (対予算 ${d.forecastVsBudget >= 0 ? "+" : ""}${d.forecastVsBudget.toFixed(1)}%)`,
        ].join("<br/>")
      },
    },
    legend: { bottom: 0 },
    grid: { left: "3%", right: "4%", bottom: "12%", top: "4%", containLabel: true },
    xAxis: {
      type: "value",
      min: 0,
      axisLabel: { formatter: (v: number) => formatNumber(v) },
    },
    yAxis: {
      type: "category",
      data: [...depts].reverse(),
    },
    series: [
      {
        name: "年間予算 (背景)",
        type: "bar",
        barGap: "-100%",
        barMaxWidth: 24,
        itemStyle: trackColor
          ? { color: withAlpha(trackColor, 0.18), borderRadius: 3 }
          : { borderRadius: 3 },
        data: [...sorted].reverse().map((d) => d.yearBudget),
      },
      {
        name: "実績 YTD",
        type: "bar",
        barMaxWidth: 14,
        z: 3,
        itemStyle: { borderRadius: 3 },
        data: [...sorted].reverse().map((d) => ({
          value: d.yearActualToDate,
          itemStyle: {
            color:
              d.achievementPct >= 102
                ? ahead
                : d.achievementPct < 95
                  ? behind
                  : okColor,
          },
        })),
      },
      {
        name: "想定ペース",
        type: "scatter",
        symbol: "path://M 0,-10 L 0,10",
        symbolSize: 18,
        z: 5,
        itemStyle: { color: okColor },
        data: [...sorted]
          .reverse()
          .map((d, i) => [d.expectedRunRate, i]),
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="部門別 予実 (バレットチャート)"
      description="年間予算 (背景) に YTD 実績を重ね、達成率で色分け。縦マーカーが想定ペース"
    >
      <EChart option={option} height="380px" />
    </DashboardCardPreset>
  )
}
