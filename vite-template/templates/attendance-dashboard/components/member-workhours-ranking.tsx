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
  // Resolve theme colors from CSS variables
  const okColor = useEChartsContrastColor("--chart-1")
  const cautionColor = useEChartsContrastColor("--chart-4")
  const warningColor = useEChartsContrastColor("--chart-5")

  // Horizontal bars: ECharts draws the first category at the bottom, so to put
  // the highest-hours member at the top we sort ASC.
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
          `Total work: ${formatHours(m.totalWorkHours)}`,
          `Overtime: ${formatHours(m.overtimeHours)}`,
          `Paid leave: ${m.paidLeaveDays.toFixed(1)} d`,
          m.nightShiftDays > 0
            ? `Night shifts: ${m.nightShiftDays} d`
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
        name: "Total work hours",
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
              label: { formatter: `caution ${OVERTIME_CAUTION}h OT` },
            },
            {
              xAxis: 160 + OVERTIME_WARNING,
              label: { formatter: `warning ${OVERTIME_WARNING}h OT` },
            },
          ],
        },
      },
    ],
  }

  return (
    <DashboardCardPreset
      title="Member Work-Hours Ranking"
      description={`Total monthly work hours per member. Bars are colored by overtime band: under ${OVERTIME_CAUTION}h, ${OVERTIME_CAUTION}-${OVERTIME_WARNING}h caution, ${OVERTIME_WARNING}h+ warning.`}
    >
      <EChart option={option} height="460px" />
    </DashboardCardPreset>
  )
}
