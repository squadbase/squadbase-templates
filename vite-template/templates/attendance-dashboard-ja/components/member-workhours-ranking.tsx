import type { EChartsOption } from "echarts"
import {
  EChart,
  useEChartsContrastColor,
} from "@/components/data/echart"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { formatHours } from "./chart-helpers"
import {
  OVERTIME_CAUTION,
  OVERTIME_WARNING,
} from "@/lib/attendance-dashboard-mock-data"
import type { MemberWorkHours } from "@/types/attendance-dashboard"

interface MemberWorkHoursRankingProps {
  data: MemberWorkHours[]
}

export function MemberWorkHoursRanking({ data }: MemberWorkHoursRankingProps) {
  // テーマ色を CSS 変数から解決
  const okColor = useEChartsContrastColor("--chart-1")
  const cautionColor = useEChartsContrastColor("--chart-4")
  const warningColor = useEChartsContrastColor("--chart-5")

  // 横棒チャートでは ECharts は先頭カテゴリを下に描画するため、
  // 労働時間最多を上に置くには昇順ソート
  const ordered = [...data].sort((a, b) => a.totalWorkHours - b.totalWorkHours)
  const names = ordered.map((m) => m.memberName)

  const seriesData = ordered.map((m) => ({
    value: Number(m.totalWorkHours.toFixed(1)),
    itemStyle: {
      color:
        m.overtimeHours >= OVERTIME_WARNING
          ? warningColor
          : m.overtimeHours >= OVERTIME_CAUTION
            ? cautionColor
            : okColor,
      borderRadius: [0, 3, 3, 0],
    },
    extra: m,
  }))

  const maxVal = ordered.reduce(
    (m, r) => (r.totalWorkHours > m ? r.totalWorkHours : m),
    0,
  )

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params: unknown): string => {
        const arr = params as Array<{
          data: { extra: MemberWorkHours }
        }>
        if (!arr.length) return ""
        const m = arr[0].data.extra
        return [
          `<strong>${m.memberName}</strong>`,
          `<span style="color:#737373">${m.department}</span>`,
          `合計労働時間: ${formatHours(m.totalWorkHours)}`,
          `残業時間: ${formatHours(m.overtimeHours)}`,
          `有給取得: ${m.paidLeaveDays.toFixed(1)} 日`,
          m.nightShiftDays > 0
            ? `深夜勤務: ${m.nightShiftDays} 日`
            : "",
        ]
          .filter(Boolean)
          .join("<br/>")
      },
    },
    grid: {
      left: "4%",
      right: "8%",
      top: "4%",
      bottom: "12%",
      containLabel: true,
    },
    xAxis: {
      type: "value",
      min: 0,
      max: Math.ceil((maxVal + 20) / 10) * 10,
      axisLabel: { formatter: (v: number): string => `${v}h` },
    },
    yAxis: {
      type: "category",
      data: names,
      axisTick: { show: false },
    },
    series: [
      {
        name: "労働時間合計",
        type: "bar",
        data: seriesData,
        barMaxWidth: 18,
        label: {
          show: true,
          position: "right",
          formatter: (params: { value: number }): string =>
            `${params.value.toFixed(0)}h`,
        },
        markLine: {
          symbol: "none",
          silent: true,
          lineStyle: { type: "dashed", color: "#a3a3a3" },
          label: { fontSize: 10 },
          data: [
            {
              xAxis: 160 + OVERTIME_CAUTION,
              label: { formatter: `注意 残業${OVERTIME_CAUTION}h` },
            },
            {
              xAxis: 160 + OVERTIME_WARNING,
              label: { formatter: `警告 残業${OVERTIME_WARNING}h` },
            },
          ],
        },
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="メンバー別労働時間ランキング"
      description={`メンバーごとの月次労働時間。残業時間で色分け: ${OVERTIME_CAUTION}h 未満、${OVERTIME_CAUTION}〜${OVERTIME_WARNING}h は注意、${OVERTIME_WARNING}h 以上は警告。`}
    >
      <EChart option={option} height="460px" />
    </DashboardCardPreset>
  )
}
