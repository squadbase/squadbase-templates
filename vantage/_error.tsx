import { Button, ErrorState } from "@squadbase/vantage/ui"

export default function RouteError({ error }: { error: unknown }) {
  const message = error instanceof Error ? error.message : String(error)
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <ErrorState
        title="This page failed to render"
        message={message}
        action={<Button onClick={() => window.location.reload()}>Reload</Button>}
      />
    </div>
  )
}
