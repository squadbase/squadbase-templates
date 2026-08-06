import { Link } from "@squadbase/vantage/router"
import { Button, Empty } from "@squadbase/vantage/ui"

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Empty
        title="404 — Page not found"
        description="The page you are looking for doesn't exist or was moved."
        action={
          <Link to="/">
            <Button>Go home</Button>
          </Link>
        }
      />
    </div>
  )
}
