import { formatDistanceToNow } from "date-fns"
import { ja } from "date-fns/locale"
import type { FreshnessStatus, FreshnessThreshold } from "@/types/realtime"

export function getFreshnessStatus(
  updatedAt: Date | null,
  threshold: FreshnessThreshold
): FreshnessStatus {
  if (!updatedAt) return "unknown"
  const seconds = (Date.now() - updatedAt.getTime()) / 1000
  if (seconds <= threshold.freshSeconds) return "fresh"
  if (seconds > threshold.staleSeconds) return "stale"
  return "fresh"
}

export function getRelativeTimeString(date: Date): string {
  return formatDistanceToNow(date, { addSuffix: true, locale: ja })
}
