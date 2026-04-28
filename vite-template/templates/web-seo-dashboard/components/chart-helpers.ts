export function getBaseGrid() {
  return { left: "3%", right: "4%", bottom: "12%", containLabel: true }
}

export function getDualAxisGrid() {
  return { left: "3%", right: "6%", bottom: "12%", containLabel: true }
}

export function formatNumber(n: number): string {
  if (n >= 10_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 10_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString("en-US")
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.round(seconds % 60)
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`
}
