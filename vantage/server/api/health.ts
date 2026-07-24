import type { ApiContext } from "@squadbase/vantage/server"

/**
 * `GET /api/health` — the seed endpoint that puts this app in fullstack mode.
 *
 * The presence of any `server/api/**` file is what makes Vantage build a server
 * bundle; delete this directory and the app builds as a pure SPA instead.
 * Secrets live on `ctx.env` and never reach the client bundle.
 */
export async function GET(_ctx: ApiContext) {
  return Response.json({ status: "ok" })
}
