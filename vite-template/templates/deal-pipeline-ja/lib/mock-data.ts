import type {
  DealStage,
  DealPriority,
  StageFunnelStep,
  DealRecord,
  ForecastPoint,
  KpiItem,
} from "@/types/deal-pipeline"

const BASE_DATE = new Date("2024-03-15")

function isoDate(daysAhead: number): string {
  const d = new Date(BASE_DATE)
  d.setDate(d.getDate() + daysAhead)
  return d.toISOString().slice(0, 10)
}

function seededRand(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const rng = seededRand(149)
function srand(min: number, max: number): number {
  return min + rng() * (max - min)
}

const STAGE_ORDER: DealStage[] = [
  "リード",
  "適格",
  "提案",
  "交渉",
  "受注",
]

const STAGE_WEIGHTS: Record<DealStage, number> = {
  リード: 0.1,
  適格: 0.3,
  提案: 0.5,
  交渉: 0.75,
  受注: 1.0,
}

const OWNERS = [
  "山田 太郎", "佐藤 美咲", "鈴木 健", "高橋 翔", "田中 葵", "渡辺 涼",
]

const DEAL_NAMES = [
  "ノースウィンド商事 — 法人プラン",
  "アドベンチャーワークス — 更新",
  "コントソフード — 拡張",
  "ファブリカム小売 — パイロット",
  "テイルスピン玩具 — モバイル追加",
  "ワイドワールド輸入 — 連携",
  "フォースコーヒー — 多店舗化",
  "リットウェアマート — 上位プラン",
  "ルセルン商会 — 更新",
  "ウィングチップ玩具 — POC",
  "マージートラベル — カスタム構築",
  "プロスウェア — 年間契約",
  "リレクラウド — トライアル転換",
  "ヴァンアースデル — 更新",
  "コホー酒造 — 卸代理店",
  "トレイリサーチ — ラボ一括",
  "美術学校 — ライセンス一括",
  "ラムナヘルスケア — コンプラ対応",
  "アダタムコープ — オプション",
  "ファーストアップ — 更新",
]

function generateDeals(): DealRecord[] {
  const stageDistribution: Record<DealStage, number> = {
    リード: 14,
    適格: 11,
    提案: 8,
    交渉: 5,
    受注: 4,
  }
  const out: DealRecord[] = []
  let nameIdx = 0
  for (const stage of STAGE_ORDER) {
    const count = stageDistribution[stage]
    for (let i = 0; i < count; i++) {
      const amount = Math.round(srand(800_000, 9_500_000))
      const daysToClose = Math.round(srand(-8, 95))
      const priorityRoll = rng()
      const priority: DealPriority =
        priorityRoll > 0.78 ? "high" : priorityRoll > 0.4 ? "medium" : "low"
      out.push({
        dealId: `D-${String(out.length + 1).padStart(4, "0")}`,
        dealName: DEAL_NAMES[nameIdx % DEAL_NAMES.length],
        stage,
        amount,
        weightedAmount: Math.round(amount * STAGE_WEIGHTS[stage]),
        expectedCloseDate: isoDate(daysToClose),
        daysToClose,
        owner: OWNERS[Math.floor(srand(0, OWNERS.length))],
        priority,
      })
      nameIdx += 1
    }
  }
  return out
}

export const deals: DealRecord[] = generateDeals()

function generateFunnel(): StageFunnelStep[] {
  const steps: StageFunnelStep[] = []
  let prevCount = 0
  for (const stage of STAGE_ORDER) {
    const stageDeals = deals.filter((d) => d.stage === stage)
    const count = stageDeals.length
    const amount = stageDeals.reduce((s, d) => s + d.amount, 0)
    const weighted = stageDeals.reduce((s, d) => s + d.weightedAmount, 0)
    const conversionFromPrev =
      prevCount === 0 ? 100 : Math.round((count / prevCount) * 1000) / 10
    steps.push({
      stage,
      count,
      amount,
      weightedAmount: weighted,
      conversionFromPrev,
    })
    prevCount = count
  }
  return steps
}

export const stageFunnel: StageFunnelStep[] = generateFunnel()

function generateForecast(): ForecastPoint[] {
  const points: ForecastPoint[] = []
  for (let i = -3; i <= 6; i++) {
    const month = new Date(BASE_DATE)
    month.setDate(1)
    month.setMonth(month.getMonth() + i)
    const monthLabel = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`
    const base = 24_000_000 + i * 1_800_000 * (1 + srand(-0.1, 0.1))
    const variance = base * 0.12
    points.push({
      month: monthLabel,
      weightedForecast: Math.round(base),
      commitForecast: Math.round(base * 0.78),
      bestCase: Math.round(base + variance),
      worstCase: Math.round(base - variance),
      closedActual: i < 0 ? Math.round(base * (0.85 + srand(0, 0.2))) : null,
    })
  }
  return points
}

export const forecastTrend: ForecastPoint[] = generateForecast()

function computeKpis(): KpiItem[] {
  const totalCount = deals.length
  const totalAmount = deals.reduce((s, d) => s + d.amount, 0)
  const weightedAmount = deals.reduce((s, d) => s + d.weightedAmount, 0)
  const advancedCount = deals.filter((d) =>
    (["提案", "交渉", "受注"] as DealStage[]).includes(d.stage),
  ).length

  return [
    {
      label: "案件数",
      value: `${totalCount}`,
      change: 6.4,
      changeLabel: "前月比",
      positiveIsGood: true,
      sparklineData: stageFunnel.map((s) => s.count),
    },
    {
      label: "見積金額合計",
      value: `¥${(totalAmount / 100_000_000).toFixed(2)}億`,
      change: 8.1,
      changeLabel: "前月比",
      positiveIsGood: true,
      sparklineData: stageFunnel.map((s) => s.amount),
    },
    {
      label: "受注見込み (加重)",
      value: `¥${(weightedAmount / 10_000).toFixed(0)}万`,
      change: 4.6,
      changeLabel: "前月比",
      positiveIsGood: true,
      sparklineData: stageFunnel.map((s) => s.weightedAmount),
    },
    {
      label: "終盤ステージ案件",
      value: `${advancedCount}`,
      change: 12.4,
      changeLabel: "提案以降",
      positiveIsGood: true,
      sparklineData: STAGE_ORDER.slice(2).map(
        (s) => deals.filter((d) => d.stage === s).length,
      ),
    },
  ]
}

export const headerKpis: KpiItem[] = computeKpis()

export const ownerOptions = [
  { label: "全オーナー", value: "all" },
  ...OWNERS.map((o) => ({ label: o, value: o })),
]

export const stageOptions = [
  { label: "全ステージ", value: "all" },
  ...STAGE_ORDER.map((s) => ({ label: s, value: s })),
]

export const STAGE_LIST = STAGE_ORDER
