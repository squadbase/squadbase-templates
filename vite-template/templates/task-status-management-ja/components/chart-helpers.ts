export function getBaseGrid() {
  return { left: "3%", right: "4%", bottom: "12%", containLabel: true }
}

export function formatNumber(n: number): string {
  if (n >= 10_000) return `${(n / 10_000).toFixed(1)}万`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}千`
  return n.toLocaleString("ja-JP")
}

export function formatPercent(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`
}

export function formatSignedPercent(value: number, digits = 1): string {
  const sign = value > 0 ? "+" : ""
  return `${sign}${value.toFixed(digits)}%`
}
