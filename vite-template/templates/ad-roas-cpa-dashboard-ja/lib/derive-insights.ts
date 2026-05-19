import {
  channelPerformance,
  dailySpendConv,
  headerKpis,
} from "@/lib/ad-roas-cpa-dashboard-mock-data"

export interface InsightItem {
  id: "top-channel" | "efficiency-shift" | "budget-rebalance"
  label: string
  text: string
  sentiment: "positive" | "neutral" | "attention"
}

export function deriveInsights(): InsightItem[] {
  // 1. ROAS トップ媒体
  const best = channelPerformance[0]
  const worst = channelPerformance[channelPerformance.length - 1]
  const avgRoas =
    channelPerformance.reduce((s, r) => s + r.roas, 0) / channelPerformance.length

  // 2. 効率トレンド — 直近 7 日 vs その前 7 日 の CPA
  const last7 = dailySpendConv.slice(-7)
  const prev7 = dailySpendConv.slice(-14, -7)
  const last7Cpa =
    last7.reduce((s, d) => s + d.spend, 0) /
    Math.max(1, last7.reduce((s, d) => s + d.conversions, 0))
  const prev7Cpa =
    prev7.reduce((s, d) => s + d.spend, 0) /
    Math.max(1, prev7.reduce((s, d) => s + d.conversions, 0))
  const cpaDeltaPct = ((last7Cpa - prev7Cpa) / prev7Cpa) * 100

  // 3. 予算リバランス — 平均ROASの80%未満の媒体に流れている費用シェア
  const totalSpend = channelPerformance.reduce((s, r) => s + r.spend, 0)
  const underShare =
    channelPerformance
      .filter((r) => r.roas < avgRoas * 0.8)
      .reduce((s, r) => s + r.spend, 0) / totalSpend

  const roasKpi = headerKpis[3]

  return [
    {
      id: "top-channel",
      label: "ROAS トップ媒体",
      text: `${best.channelLabel} が ROAS ${best.roas.toFixed(2)}x / CPA ¥${best.cpa.toLocaleString("ja-JP")} で全媒体をリード。ポートフォリオ平均 ${avgRoas.toFixed(2)}x を ${(((best.roas - avgRoas) / avgRoas) * 100).toFixed(0)}% 上回っています。最も低い媒体は ${worst.channelLabel} (${worst.roas.toFixed(2)}x)。`,
      sentiment: roasKpi.change >= 0 ? "positive" : "neutral",
    },
    {
      id: "efficiency-shift",
      label: "効率トレンド",
      text:
        cpaDeltaPct <= -2
          ? `直近7日のCPAは¥${Math.round(last7Cpa).toLocaleString("ja-JP")}で、前週比 ${Math.abs(cpaDeltaPct).toFixed(1)}% 改善。キャンペーン効率は良い方向に推移しています。`
          : cpaDeltaPct < 5
            ? `CPAは¥${Math.round(last7Cpa).toLocaleString("ja-JP")}で前週比 ${cpaDeltaPct >= 0 ? "+" : ""}${cpaDeltaPct.toFixed(1)}% と横ばい。ROAS が反転するまでは現在の予算ペースを維持。`
            : `直近7日のCPAは¥${Math.round(last7Cpa).toLocaleString("ja-JP")}で前週比 ${cpaDeltaPct.toFixed(1)}% 悪化。クリエイティブ消耗と入札戦略の見直しを推奨します。`,
      sentiment:
        cpaDeltaPct <= -2 ? "positive" : cpaDeltaPct < 5 ? "neutral" : "attention",
    },
    {
      id: "budget-rebalance",
      label: "予算リバランス",
      text: `平均ROASの80%未満の媒体に総予算の ${(underShare * 100).toFixed(0)}% が配分されています。その一部を ${best.channelLabel} に振り替えることで、全体ROASを推定 ${((best.roas - avgRoas) * underShare * 0.5).toFixed(2)}x 押し上げ可能です。`,
      sentiment: underShare > 0.2 ? "attention" : "neutral",
    },
  ]
}
