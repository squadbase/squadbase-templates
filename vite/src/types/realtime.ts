export type ConnectionMode = "poll" | "ws" | "sse"
export type FreshnessStatus = "fresh" | "stale" | "unknown"
export type ConnectionStatus = "connected" | "connecting" | "disconnected" | "error"

export interface FreshnessThreshold {
  freshSeconds: number
  staleSeconds: number
}
