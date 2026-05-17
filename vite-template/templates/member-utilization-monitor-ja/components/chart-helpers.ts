export function getBaseGrid() {
  return { left: "3%", right: "4%", bottom: "12%", containLabel: true }
}

export function formatNumber(n: number): string {
  if (n >= 10_000) return `${(n / 10_000).toFixed(1)}万`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}千`
  return n.toLocaleString("ja-JP")
}

export function formatHours(n: number): string {
  return `${Math.round(n).toLocaleString("ja-JP")}h`
}

export function formatPercent(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`
}
