import { addDays, format } from "date-fns"
import type {
  KpiItem,
  TrendPoint,
  CategoryRow,
  DetailRow,
} from "@/types/ui-template-tabbed-dashboard"

const BASE_DATE = new Date("2024-03-31")
const DAYS = 30

function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

const rand = seededRandom(57)

export const trendSeries: TrendPoint[] = Array.from({ length: DAYS }, (_, i) => {
  const date = addDays(BASE_DATE, i - DAYS + 1)
  const base = 3_800_000 + i * 32_000 + (rand() - 0.5) * 700_000
  return {
    date: format(date, "yyyy-MM-dd"),
    value: Math.max(1_500_000, Math.round(base)),
  }
})

const totalRev = trendSeries.reduce((s, p) => s + p.value, 0)

export const categoryRows: CategoryRow[] = [
  { category: "オーディオ", value: Math.round(totalRev * 0.28), share: 0.28, delta: 5.4 },
  { category: "ウェアラブル", value: Math.round(totalRev * 0.22), share: 0.22, delta: 8.1 },
  { category: "周辺機器", value: Math.round(totalRev * 0.20), share: 0.20, delta: -2.3 },
  { category: "カメラ", value: Math.round(totalRev * 0.18), share: 0.18, delta: 3.7 },
  { category: "ホーム", value: Math.round(totalRev * 0.12), share: 0.12, delta: 1.2 },
]

export const detailRows: DetailRow[] = [
  { id: "d-01", name: "Aurora ワイヤレスヘッドホン", owner: "田中 健", status: "active", value: 18_432_000, units: 1_232 },
  { id: "d-02", name: "Halo スマートウォッチ", owner: "佐藤 美咲", status: "active", value: 16_248_000, units: 812 },
  { id: "d-03", name: "Vista 4K アクションカメラ", owner: "鈴木 大樹", status: "active", value: 13_875_000, units: 463 },
  { id: "d-04", name: "Nimbus メカニカルキーボード", owner: "高橋 真衣", status: "paused", value: 12_190_000, units: 974 },
  { id: "d-05", name: "Orbit ワイヤレスマウス", owner: "伊藤 翔", status: "active", value: 9_864_000, units: 1_644 },
  { id: "d-06", name: "Pulse フィットネストラッカー", owner: "山田 美穂", status: "active", value: 8_722_000, units: 821 },
  { id: "d-07", name: "Echo Bluetooth スピーカー", owner: "田中 健", status: "active", value: 8_154_000, units: 679 },
  { id: "d-08", name: "Lumen デスクライト", owner: "佐藤 美咲", status: "paused", value: 7_241_000, units: 905 },
  { id: "d-09", name: "Nova ポータブル SSD", owner: "鈴木 大樹", status: "active", value: 6_832_000, units: 412 },
  { id: "d-10", name: "Glide エルゴノミクスチェアマット", owner: "高橋 真衣", status: "active", value: 5_418_000, units: 720 },
  { id: "d-11", name: "Beacon スマート電球 4個セット", owner: "伊藤 翔", status: "active", value: 4_965_000, units: 1_103 },
  { id: "d-12", name: "Forge USB-C ハブ", owner: "山田 美穂", status: "active", value: 4_290_000, units: 953 },
  { id: "d-13", name: "Crest ノイズキャンセリングイヤホン", owner: "田中 健", status: "paused", value: 3_824_000, units: 488 },
  { id: "d-14", name: "Spire スタンディングデスクライザー", owner: "佐藤 美咲", status: "active", value: 3_178_000, units: 256 },
]

function spark(values: number[], length = 12): number[] {
  const step = Math.max(1, Math.floor(values.length / length))
  const out: number[] = []
  for (let i = 0; i < values.length; i += step) out.push(values[i])
  return out.slice(-length)
}

const orders = Math.round(totalRev / 7_800)
const users = Math.round(orders * 2.4)
const aov = totalRev / orders

export const overviewKpis: KpiItem[] = [
  {
    id: "revenue",
    label: "総売上",
    value: `¥${(totalRev / 100_000_000).toFixed(2)}億`,
    change: 12.4,
    changeLabel: "前期比",
    positiveIsGood: true,
    sparklineData: spark(trendSeries.map((p) => p.value)),
  },
  {
    id: "orders",
    label: "総注文数",
    value: orders.toLocaleString("ja-JP"),
    change: 9.6,
    changeLabel: "前期比",
    positiveIsGood: true,
    sparklineData: spark(trendSeries.map((p) => p.value / 7_800)),
  },
  {
    id: "users",
    label: "アクティブユーザー",
    value: users.toLocaleString("ja-JP"),
    change: 6.8,
    changeLabel: "前期比",
    positiveIsGood: true,
    sparklineData: spark(trendSeries.map((p) => p.value / 3_000)),
  },
  {
    id: "aov",
    label: "平均注文額",
    value: `¥${Math.round(aov).toLocaleString("ja-JP")}`,
    change: 3.1,
    changeLabel: "前期比",
    positiveIsGood: true,
    sparklineData: spark(trendSeries.map((p) => p.value / Math.max(1, p.value / 7_800))),
  },
]

