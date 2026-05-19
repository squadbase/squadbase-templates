import {
  conversionFunnel,
  deviceCvr,
  exitPages,
} from "@/lib/ec-conversion-funnel-mock-data"

export interface InsightItem {
  id: "weakest-step" | "device-gap" | "top-exit"
  label: string
  text: string
  sentiment: "positive" | "neutral" | "attention"
}

const DEVICE_LABEL_JA: Record<string, string> = {
  desktop: "デスクトップ",
  mobile: "モバイル",
  tablet: "タブレット",
}

export function deriveInsights(): InsightItem[] {
  // 1. 最も転換率が低いステップ
  const stepDrops = conversionFunnel.slice(1).map((step, i) => {
    const prev = conversionFunnel[i]
    const conv = (step.value / prev.value) * 100
    return { from: prev.label, to: step.label, conv }
  })
  const weakest = [...stepDrops].sort((a, b) => a.conv - b.conv)[0]

  // 2. デバイス別CVRギャップ
  const sortedDevice = [...deviceCvr].sort((a, b) => b.overallCvr - a.overallCvr)
  const bestDevice = sortedDevice[0]
  const worstDevice = sortedDevice[sortedDevice.length - 1]
  const cvrGap = bestDevice.overallCvr - worstDevice.overallCvr
  const cvrGapPct =
    worstDevice.overallCvr > 0 ? (cvrGap / worstDevice.overallCvr) * 100 : 0

  // 3. 最も離脱率の高いページ
  const topExit = exitPages[0]

  return [
    {
      id: "weakest-step",
      label: "ファネルの弱点",
      text: `${weakest.from} → ${weakest.to} の転換率は ${weakest.conv.toFixed(1)}% で、ファネル中もっとも低い。このステップの UX 摩擦・商品適合度を点検。`,
      sentiment:
        weakest.conv >= 35 ? "positive" : weakest.conv >= 20 ? "neutral" : "attention",
    },
    {
      id: "device-gap",
      label: "デバイス間CVRギャップ",
      text: `${DEVICE_LABEL_JA[bestDevice.device]} が CVR ${bestDevice.overallCvr.toFixed(2)}% で最高、${DEVICE_LABEL_JA[worstDevice.device]} は ${worstDevice.overallCvr.toFixed(2)}% で相対差 ${cvrGapPct.toFixed(0)}%。モバイル・チェックアウトの最適化余地あり。`,
      sentiment:
        cvrGapPct < 15 ? "positive" : cvrGapPct < 35 ? "neutral" : "attention",
    },
    {
      id: "top-exit",
      label: "最も離脱の多いページ",
      text: `${topExit.pagePath} はセッションの ${topExit.exitRate.toFixed(1)}%（${topExit.exits.toLocaleString("ja-JP")}件）が離脱。改修テストの優先度最上位。`,
      sentiment:
        topExit.exitRate >= 40
          ? "attention"
          : topExit.exitRate >= 25
            ? "neutral"
            : "positive",
    },
  ]
}
