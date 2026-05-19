import type {
  Channel,
  DiscountBin,
  DiscountScatterPoint,
  CustomerDiscountRow,
  ChannelDiscountRow,
  KpiItem,
} from "@/types/discount-margin-erosion-analysis"

// ── Helpers ──

function seededRand(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const rng = seededRand(53)
function srand(min: number, max: number): number {
  return min + rng() * (max - min)
}

const CHANNELS: Channel[] = ["直販", "卸売", "店舗", "EC"]

const CHANNEL_PROFILE: Record<
  Channel,
  { avg: number; std: number; volume: number }
> = {
  直販: { avg: 0.04, std: 0.05, volume: 0.18 },
  卸売: { avg: 0.22, std: 0.08, volume: 0.28 },
  店舗: { avg: 0.12, std: 0.07, volume: 0.32 },
  EC: { avg: 0.08, std: 0.06, volume: 0.22 },
}

function gaussian(mean: number, std: number): number {
  const u1 = Math.max(1e-6, rng())
  const u2 = rng()
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
  return mean + z * std
}

const SAMPLE_SIZE = 600

function generateTransactions(): DiscountScatterPoint[] {
  const txs: DiscountScatterPoint[] = []
  for (let i = 0; i < SAMPLE_SIZE; i++) {
    const channelRoll = rng()
    let acc = 0
    let channel: Channel = "店舗"
    for (const ch of CHANNELS) {
      acc += CHANNEL_PROFILE[ch].volume
      if (channelRoll <= acc) {
        channel = ch
        break
      }
    }
    const profile = CHANNEL_PROFILE[channel]
    const discountRate = Math.max(
      0,
      Math.min(0.55, gaussian(profile.avg, profile.std)),
    )
    const listPrice = Math.round(srand(12_000, 48_000))
    const quantity = Math.max(1, Math.round(srand(1, 12)))
    const actualPrice = Math.round(listPrice * (1 - discountRate))
    const revenue = actualPrice * quantity
    const customerIdx = Math.floor(srand(0, 60))
    txs.push({
      transactionId: `T-${String(i + 1).padStart(5, "0")}`,
      customerId: `C-${String(customerIdx).padStart(3, "0")}`,
      channel,
      discountRate: Math.round(discountRate * 1000) / 1000,
      quantity,
      revenue,
    })
  }
  return txs
}

export const transactions: DiscountScatterPoint[] = generateTransactions()

function generateHistogram(): DiscountBin[] {
  const binCount = 11
  const bins: DiscountBin[] = []
  for (let i = 0; i < binCount; i++) {
    const binStart = i * 5
    const binEnd = i === binCount - 1 ? 100 : (i + 1) * 5
    bins.push({
      binStart,
      binEnd,
      label: i === binCount - 1 ? "50%以上" : `${binStart}-${binEnd}%`,
      count: 0,
      revenue: 0,
    })
  }
  for (const tx of transactions) {
    const pct = tx.discountRate * 100
    let idx = Math.floor(pct / 5)
    if (idx >= binCount) idx = binCount - 1
    bins[idx].count += 1
    bins[idx].revenue += tx.revenue
  }
  return bins
}

export const discountHistogram: DiscountBin[] = generateHistogram()

const CUSTOMER_NAMES = [
  "ノースウィンド商事",
  "アドベンチャーワークス",
  "コントソフード",
  "ファブリカム小売",
  "テイルスピン玩具",
  "ワイドワールド輸入",
  "フォースコーヒー",
  "リットウェアマート",
  "ルセルン商会",
  "ウィングチップ玩具",
  "マージートラベル",
  "プロスウェア",
  "リレクラウド",
  "ヴァンアースデル",
  "コホー酒造",
]

function generateCustomerRanking(): CustomerDiscountRow[] {
  const agg = new Map<
    string,
    {
      channel: Channel
      revenue: number
      discountAmount: number
      discountSum: number
      txCount: number
    }
  >()
  for (const tx of transactions) {
    const existing = agg.get(tx.customerId)
    const listEquivalent = tx.revenue / (1 - tx.discountRate || 1)
    const discountAmount = listEquivalent - tx.revenue
    if (existing) {
      existing.revenue += tx.revenue
      existing.discountAmount += discountAmount
      existing.discountSum += tx.discountRate
      existing.txCount += 1
    } else {
      agg.set(tx.customerId, {
        channel: tx.channel,
        revenue: tx.revenue,
        discountAmount,
        discountSum: tx.discountRate,
        txCount: 1,
      })
    }
  }
  const rows = Array.from(agg.entries()).map(([customerId, data], i) => {
    const averageDiscountRate = data.discountSum / data.txCount
    return {
      customerId,
      customerName: CUSTOMER_NAMES[i % CUSTOMER_NAMES.length],
      channel: data.channel,
      totalRevenue: Math.round(data.revenue),
      totalDiscountAmount: Math.round(data.discountAmount),
      averageDiscountRate: Math.round(averageDiscountRate * 1000) / 10,
      marginImpact: Math.round(data.discountAmount * 0.6),
    }
  })
  return rows
    .sort((a, b) => b.totalDiscountAmount - a.totalDiscountAmount)
    .slice(0, 10)
    .map((r, i) => ({ rank: i + 1, ...r }))
}

export const customerRanking: CustomerDiscountRow[] = generateCustomerRanking()

function generateChannelRanking(): ChannelDiscountRow[] {
  const agg = new Map<
    Channel,
    {
      revenue: number
      discountAmount: number
      discountSum: number
      txCount: number
      listPriceTxCount: number
    }
  >()
  for (const tx of transactions) {
    const existing =
      agg.get(tx.channel) ||
      {
        revenue: 0,
        discountAmount: 0,
        discountSum: 0,
        txCount: 0,
        listPriceTxCount: 0,
      }
    const listEquivalent = tx.revenue / (1 - tx.discountRate || 1)
    existing.revenue += tx.revenue
    existing.discountAmount += listEquivalent - tx.revenue
    existing.discountSum += tx.discountRate
    existing.txCount += 1
    if (tx.discountRate < 0.005) existing.listPriceTxCount += 1
    agg.set(tx.channel, existing)
  }
  const rows = Array.from(agg.entries()).map(([channel, data]) => ({
    channel,
    totalRevenue: Math.round(data.revenue),
    totalDiscountAmount: Math.round(data.discountAmount),
    averageDiscountRate:
      Math.round((data.discountSum / data.txCount) * 1000) / 10,
    listPriceShare:
      Math.round((data.listPriceTxCount / data.txCount) * 1000) / 10,
  }))
  return rows
    .sort((a, b) => b.totalDiscountAmount - a.totalDiscountAmount)
    .map((r, i) => ({ rank: i + 1, ...r }))
}

export const channelRanking: ChannelDiscountRow[] = generateChannelRanking()

function computeKpis(): KpiItem[] {
  const totalRevenue = transactions.reduce((s, t) => s + t.revenue, 0)
  const totalListEquivalent = transactions.reduce(
    (s, t) => s + t.revenue / (1 - t.discountRate || 1),
    0,
  )
  const totalDiscountAmount = totalListEquivalent - totalRevenue
  const avgDiscount =
    transactions.reduce((s, t) => s + t.discountRate, 0) / transactions.length
  const listPriceShare =
    transactions.filter((t) => t.discountRate < 0.005).length /
    transactions.length
  const marginImpact = totalDiscountAmount * 0.6

  const chunkSize = Math.floor(transactions.length / 12)
  const monthlyDiscount: number[] = []
  for (let i = 0; i < 12; i++) {
    const slice = transactions.slice(i * chunkSize, (i + 1) * chunkSize)
    const avg =
      slice.reduce((s, t) => s + t.discountRate, 0) / Math.max(1, slice.length)
    monthlyDiscount.push(Math.round(avg * 1000) / 10)
  }
  const monthlyDiscountImpact = monthlyDiscount.map((_, i) =>
    transactions
      .slice(i * chunkSize, (i + 1) * chunkSize)
      .reduce(
        (s, t) => s + (t.revenue / (1 - t.discountRate || 1) - t.revenue),
        0,
      ),
  )

  return [
    {
      label: "平均値引き率",
      value: `${(avgDiscount * 100).toFixed(1)}%`,
      change: Math.round((avgDiscount * 100 - 11.5) * 10) / 10,
      changeLabel: "前期比 (pp)",
      positiveIsGood: false,
      sparklineData: monthlyDiscount,
    },
    {
      label: "値引き影響額",
      value: `¥${Math.round(totalDiscountAmount / 10_000).toLocaleString("ja-JP")}万`,
      change: 8.4,
      changeLabel: "前期比",
      positiveIsGood: false,
      sparklineData: monthlyDiscountImpact,
    },
    {
      label: "定価販売比率",
      value: `${(listPriceShare * 100).toFixed(1)}%`,
      change: -2.1,
      changeLabel: "前期比 (pp)",
      positiveIsGood: true,
      sparklineData: monthlyDiscount.map((d) => Math.max(0, 30 - d)),
    },
    {
      label: "粗利インパクト",
      value: `-¥${Math.round(marginImpact / 10_000).toLocaleString("ja-JP")}万`,
      change: 6.8,
      changeLabel: "前期比",
      positiveIsGood: false,
      sparklineData: monthlyDiscountImpact.map((d) => d * 0.6),
    },
  ]
}

export const headerKpis: KpiItem[] = computeKpis()

export const channelOptions = [
  { label: "全チャネル", value: "all" },
  ...CHANNELS.map((c) => ({ label: c, value: c })),
]

export const CHANNEL_LIST = CHANNELS
