import {
  members,
  boxPlot,
} from "@/lib/member-utilization-monitor-mock-data"

export interface InsightItem {
  id: "balance" | "overtime" | "team-spread"
  label: string
  text: string
  sentiment: "positive" | "neutral" | "attention"
}

export function deriveInsights(): InsightItem[] {
  const avg = members.reduce((s, m) => s + m.utilizationPct, 0) / members.length
  const high = members.filter((m) => m.utilizationPct > 95).length
  const low = members.filter((m) => m.utilizationPct < 60).length

  const totalOvertime = members.reduce((s, m) => s + m.overtimeHours, 0)
  const highOvertime = members.filter((m) => m.overtimeHours > 30)

  const spreads = boxPlot.map((b) => ({
    team: b.team,
    spread: b.values[4] - b.values[0],
  }))
  const widest = spreads.sort((a, b) => b.spread - a.spread)[0]

  return [
    {
      id: "balance",
      label: "Utilization Balance",
      text: `Average utilization is ${avg.toFixed(1)}%. ${high} member${high === 1 ? "" : "s"} above 95% and ${low} below 60% — ${high + low > members.length * 0.3 ? "load distribution is skewed; rebalancing recommended." : "balance looks healthy."}`,
      sentiment:
        high + low > members.length * 0.3 ? "attention" : "positive",
    },
    {
      id: "overtime",
      label: "Overtime Concentration",
      text:
        highOvertime.length > 0
          ? `${highOvertime.length} member${highOvertime.length === 1 ? " has" : "s have"} logged 30+ overtime hours, contributing to ${totalOvertime}h total. Focus rebalancing on these individuals first.`
          : `Total overtime is ${totalOvertime}h and no single member exceeds 30h — sustainable for now.`,
      sentiment: highOvertime.length > 0 ? "attention" : "positive",
    },
    {
      id: "team-spread",
      label: "Team Spread",
      text: `"${widest.team}" has the widest within-team spread (${widest.spread.toFixed(1)}pp range). Tackling this team's variance first will improve overall balance.`,
      sentiment: widest.spread > 30 ? "attention" : "neutral",
    },
  ]
}
