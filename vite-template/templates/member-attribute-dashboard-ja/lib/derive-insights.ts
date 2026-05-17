import {
  ageGenderCrosstab,
  attributeLtvRanking,
  acquisitionChannels,
  ageLabelMap,
  genderLabelMap,
} from "@/lib/member-attribute-dashboard-mock-data"

export interface InsightItem {
  id: "top-segment" | "ltv-leader" | "channel-mix"
  label: string
  text: string
  sentiment: "positive" | "neutral" | "attention"
}

export function deriveInsights(): InsightItem[] {
  // 1. 構成比トップのセグメント
  const sortedByShare = [...ageGenderCrosstab].sort((a, b) => b.share - a.share)
  const topShare = sortedByShare[0]

  // 2. LTV 最上位のセグメント
  const topLtv = attributeLtvRanking[0]
  const totalMembers = ageGenderCrosstab.reduce(
    (s, c) => s + c.memberCount,
    0,
  )
  const weightedLtv =
    ageGenderCrosstab.reduce((s, c) => s + c.avgLtv * c.memberCount, 0) /
    totalMembers
  const ltvLift = ((topLtv.avgLtv - weightedLtv) / weightedLtv) * 100

  // 3. 獲得チャネルの集中度
  const sortedChannels = [...acquisitionChannels].sort(
    (a, b) => b.newMembers - a.newMembers,
  )
  const topChannel = sortedChannels[0]
  const totalNew = sortedChannels.reduce((s, c) => s + c.newMembers, 0)
  const topChannelShare = (topChannel.newMembers / totalNew) * 100
  // LTV ベースで最も質の高いチャネル
  const topQualityChannel = [...acquisitionChannels].sort(
    (a, b) => b.avgLtv - a.avgLtv,
  )[0]

  return [
    {
      id: "top-segment",
      label: "最大セグメント",
      text: `${ageLabelMap[topShare.ageBand]}・${genderLabelMap[topShare.gender]} が ${topShare.share.toFixed(1)}% (${topShare.memberCount.toLocaleString("ja-JP")}名) を占め、年代×性別の中で最も大きなセグメントとなっています。`,
      sentiment: "neutral",
    },
    {
      id: "ltv-leader",
      label: "LTV リーダー",
      text: `${topLtv.segment} の平均 LTV は ¥${topLtv.avgLtv.toLocaleString("ja-JP")} で、加重平均より ${ltvLift > 0 ? "+" : ""}${ltvLift.toFixed(1)}% 上位です。リテンションとアップセル施策を優先しましょう。`,
      sentiment: ltvLift > 10 ? "positive" : "neutral",
    },
    {
      id: "channel-mix",
      label: "獲得チャネル構成",
      text: `今期は ${topChannel.channelLabel} が新規の ${topChannelShare.toFixed(1)}% を占める一方、LTV では ${topQualityChannel.channelLabel} が ¥${topQualityChannel.avgLtv.toLocaleString("ja-JP")} と最も質の高い顧客を獲得しています。LTV の高いチャネルへの投資配分を検討しましょう。`,
      sentiment: topChannelShare > 45 ? "attention" : "neutral",
    },
  ]
}
