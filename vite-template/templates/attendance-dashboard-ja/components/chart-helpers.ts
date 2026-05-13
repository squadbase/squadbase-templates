export function getBaseGrid() {
  return { left: "3%", right: "4%", bottom: "12%", containLabel: true }
}

export function formatHours(n: number, digits = 1): string {
  return `${n.toFixed(digits)} h`
}

export function formatHoursShort(n: number): string {
  if (n >= 10_000) return `${(n / 10_000).toFixed(1)}万 h`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}千 h`
  return `${Math.round(n).toLocaleString("ja-JP")} h`
}

export function formatPercent(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`
}

export function formatSignedPercent(value: number, digits = 1): string {
  const sign = value > 0 ? "+" : ""
  return `${sign}${value.toFixed(digits)}%`
}

export function formatDays(n: number, digits = 1): string {
  return `${n.toFixed(digits)} 日`
}
