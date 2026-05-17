import type {
  DeviceType,
  FunnelStepData,
  DeviceCvrPoint,
  ExitPageRow,
  KpiItem,
} from "@/types/ec-conversion-funnel"

// ── Seeded RNG（テンプレート固有 seed） ──

function seededRand(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const rng = seededRand(824)
function srand(min: number, max: number): number {
  return min + rng() * (max - min)
}

// ── ファネル（訪問 → 閲覧 → カート → 購入） ──
// FunnelSteps は降順前提。

const TOTAL_SESSIONS = 184_500
const VIEW_RATE = 0.62
const CART_RATE_OF_VIEWS = 0.28
const PURCHASE_RATE_OF_CARTS = 0.41

function generateFunnel(): FunnelStepData[] {
  const visits = TOTAL_SESSIONS
  const views = Math.round(visits * VIEW_RATE)
  const carts = Math.round(views * CART_RATE_OF_VIEWS)
  const purchases = Math.round(carts * PURCHASE_RATE_OF_CARTS)
  return [
    { id: "visit", label: "セッション（訪問）", value: visits },
    { id: "view", label: "商品閲覧", value: views },
    { id: "cart", label: "カート追加", value: carts },
    { id: "purchase", label: "購入", value: purchases },
  ]
}

export const conversionFunnel: FunnelStepData[] = generateFunnel()

// ── デバイス別CVR ──

const DEVICE_SHARES: Record<DeviceType, number> = {
  desktop: 0.36,
  mobile: 0.54,
  tablet: 0.1,
}

const DEVICE_MULTIPLIERS: Record<
  DeviceType,
  { view: number; cart: number; purchase: number }
> = {
  desktop: { view: 1.08, cart: 1.15, purchase: 1.22 },
  mobile: { view: 0.96, cart: 0.88, purchase: 0.84 },
  tablet: { view: 1.02, cart: 1.05, purchase: 1.0 },
}

function generateDeviceCvr(): DeviceCvrPoint[] {
  const out: DeviceCvrPoint[] = []
  for (const device of ["desktop", "mobile", "tablet"] as DeviceType[]) {
    const sessions = Math.round(TOTAL_SESSIONS * DEVICE_SHARES[device])
    const mult = DEVICE_MULTIPLIERS[device]
    const viewRate = VIEW_RATE * mult.view * 100
    const cartRate = CART_RATE_OF_VIEWS * mult.cart * 100
    const purchaseRate = PURCHASE_RATE_OF_CARTS * mult.purchase * 100
    const overallCvr = (viewRate / 100) * (cartRate / 100) * (purchaseRate / 100) * 100
    out.push({
      device,
      sessions,
      viewRate: Math.round(viewRate * 10) / 10,
      cartRate: Math.round(cartRate * 10) / 10,
      purchaseRate: Math.round(purchaseRate * 10) / 10,
      overallCvr: Math.round(overallCvr * 100) / 100,
    })
  }
  return out
}

export const deviceCvr: DeviceCvrPoint[] = generateDeviceCvr()

// ── 離脱率Top10ページ ──

const PAGE_SEEDS: Array<{
  path: string
  type: ExitPageRow["pageType"]
  baseExitRate: number
  trafficShare: number
}> = [
  { path: "/checkout/shipping", type: "checkout", baseExitRate: 0.42, trafficShare: 0.04 },
  { path: "/cart", type: "cart", baseExitRate: 0.38, trafficShare: 0.07 },
  { path: "/checkout/payment", type: "checkout", baseExitRate: 0.36, trafficShare: 0.03 },
  { path: "/product/sneaker-x90", type: "product", baseExitRate: 0.34, trafficShare: 0.06 },
  { path: "/category/men/outerwear", type: "category", baseExitRate: 0.31, trafficShare: 0.05 },
  { path: "/search?q=hoodie", type: "search", baseExitRate: 0.3, trafficShare: 0.04 },
  { path: "/product/tee-essential", type: "product", baseExitRate: 0.29, trafficShare: 0.05 },
  { path: "/category/women/dresses", type: "category", baseExitRate: 0.27, trafficShare: 0.05 },
  { path: "/product/backpack-roam", type: "product", baseExitRate: 0.26, trafficShare: 0.04 },
  { path: "/category/accessories", type: "category", baseExitRate: 0.24, trafficShare: 0.04 },
]

function generateExitPages(): ExitPageRow[] {
  return PAGE_SEEDS.map((seed, i) => {
    const sessions = Math.round(TOTAL_SESSIONS * seed.trafficShare * (0.92 + srand(0, 0.16)))
    const exitRate =
      Math.round((seed.baseExitRate + srand(-0.02, 0.02)) * 1000) / 10
    const exits = Math.round(sessions * (exitRate / 100))
    return {
      pageId: `P-${String(i + 1).padStart(3, "0")}`,
      pagePath: seed.path,
      pageType: seed.type,
      sessions,
      exits,
      exitRate,
    }
  }).sort((a, b) => b.exitRate - a.exitRate)
}

export const exitPages: ExitPageRow[] = generateExitPages()

// ── 主要KPI (5) ──
// セッション数 / 閲覧→カート率 / カート→購入率 / 総合CVR / AOV

function generateSparkline(base: number, jitter: number, len = 14): number[] {
  const arr: number[] = []
  for (let i = 0; i < len; i++) {
    arr.push(Math.round(base * (1 + srand(-jitter, jitter)) * 100) / 100)
  }
  return arr
}

function computeKpis(): KpiItem[] {
  const visits = conversionFunnel[0].value
  const views = conversionFunnel[1].value
  const carts = conversionFunnel[2].value
  const purchases = conversionFunnel[3].value
  const viewToCart = (carts / views) * 100
  const cartToPurchase = (purchases / carts) * 100
  const overallCvr = (purchases / visits) * 100
  const aov = 8_640 // 円

  return [
    {
      label: "セッション数",
      value: visits.toLocaleString("ja-JP"),
      change: 4.2,
      changeLabel: "前期間比",
      positiveIsGood: true,
      sparklineData: generateSparkline(visits / 14, 0.08),
    },
    {
      label: "閲覧 → カート",
      value: `${viewToCart.toFixed(1)}%`,
      change: 1.6,
      changeLabel: "前期間比 (pp)",
      positiveIsGood: true,
      sparklineData: generateSparkline(viewToCart, 0.05),
    },
    {
      label: "カート → 購入",
      value: `${cartToPurchase.toFixed(1)}%`,
      change: -0.8,
      changeLabel: "前期間比 (pp)",
      positiveIsGood: true,
      sparklineData: generateSparkline(cartToPurchase, 0.05),
    },
    {
      label: "総合CVR",
      value: `${overallCvr.toFixed(2)}%`,
      change: 0.4,
      changeLabel: "前期間比 (pp)",
      positiveIsGood: true,
      sparklineData: generateSparkline(overallCvr, 0.06),
    },
    {
      label: "AOV",
      value: `¥${aov.toLocaleString("ja-JP")}`,
      change: 2.1,
      changeLabel: "前期間比",
      positiveIsGood: true,
      sparklineData: generateSparkline(aov, 0.04),
    },
  ]
}

export const headerKpis: KpiItem[] = computeKpis()

// ── フィルター候補 ──

export const deviceOptions = [
  { label: "すべてのデバイス", value: "all" },
  { label: "デスクトップ", value: "desktop" },
  { label: "モバイル", value: "mobile" },
  { label: "タブレット", value: "tablet" },
]
