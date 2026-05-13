import {
  candidates,
  declineReasons,
  declineReasonLabels,
  followUpList,
  headerKpis,
} from "@/lib/offer-acceptance-tracking-mock-data"

export interface InsightItem {
  id: "accept-momentum" | "decline-driver" | "follow-up-urgency"
  label: string
  text: string
  sentiment: "positive" | "neutral" | "attention"
}

export function deriveInsights(): InsightItem[] {
  // 1. 承諾モメンタム
  const acceptRateKpi = headerKpis[1]
  const acceptRateValue = parseFloat(acceptRateKpi.value)

  // 2. 主要辞退理由
  const topReason = declineReasons[0]
  const totalDeclines = candidates.filter((c) => c.status === "declined").length
  const topShare = topReason?.share ?? 0

  // 3. フォロー急務件数
  const highCount = followUpList.filter((r) => r.priority === "high").length
  const totalOpen = followUpList.length

  return [
    {
      id: "accept-momentum",
      label: "承諾モメンタム",
      text:
        acceptRateValue >= 75
          ? `承諾率は ${acceptRateValue.toFixed(1)}% で、健全水準 (70%) を上回っています。現行のオファー戦術を維持してください。`
          : acceptRateValue >= 60
            ? `承諾率は ${acceptRateValue.toFixed(1)}%。ピーク期もこの水準を維持できれば、新卒採用計画は順調です。`
            : `承諾率が ${acceptRateValue.toFixed(1)}% に低下しています。次のオファー前に、条件と意思決定までの期間を前年と比較してください。`,
      sentiment:
        acceptRateValue >= 75
          ? "positive"
          : acceptRateValue >= 60
            ? "neutral"
            : "attention",
    },
    {
      id: "decline-driver",
      label: "主要辞退理由",
      text: topReason
        ? `${declineReasonLabels[topReason.reason]} が今期 ${totalDeclines} 件の辞退のうち ${topShare.toFixed(1)}% を占めます。次回オファー前に採用マネージャーへ対応シナリオを共有してください。`
        : "今期の辞退はゼロです — チームで成果を共有してください。",
      sentiment: topShare >= 35 ? "attention" : topShare === 0 ? "positive" : "neutral",
    },
    {
      id: "follow-up-urgency",
      label: "フォロー急務",
      text:
        highCount === 0
          ? `進行中 ${totalOpen} 名のうち高優先のケースはありません。通常ペースを維持してください。`
          : `進行中 ${totalOpen} 名のうち ${highCount} 名が意思決定期限に接近しています。48 時間以内に個別フォローを実施してください。`,
      sentiment: highCount >= 5 ? "attention" : highCount === 0 ? "positive" : "neutral",
    },
  ]
}
