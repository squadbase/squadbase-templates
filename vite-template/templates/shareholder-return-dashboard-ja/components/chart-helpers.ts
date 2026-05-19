export function getBaseGrid() {
  return { left: "3%", right: "4%", bottom: "12%", containLabel: true }
}

export function formatNumber(n: number): string {
  return n.toLocaleString("ja-JP")
}

// 入力 `n` は億円単位
export function formatCurrencyOku(n: number): string {
  if (n >= 10_000) {
    const cho = n / 10_000
    return `${cho.toFixed(2)}兆円`
  }
  return `${Math.round(n).toLocaleString("ja-JP")}億円`
}

export function formatPercent(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`
}
