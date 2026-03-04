import { Suspense } from "react";
import { Routes, Route, Link, useSearchParams } from "react-router";
import { ErrorBoundary } from "@/components/error-boundary";
import { routes } from "@/routes";

function PageFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <p className="text-muted-foreground">Loading...</p>
    </div>
  );
}

function NotFound() {
  const [searchParams] = useSearchParams();
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-muted-foreground">Page not found</p>
      <Link
        to={{ pathname: "/", search: searchParams.toString() }}
        className="text-sm underline hover:text-foreground"
      >
        Go home
      </Link>
    </div>
  );
}

function PageError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8">
      <h2 className="text-xl font-semibold text-destructive">
        Something went wrong
      </h2>
      <pre className="max-w-lg overflow-auto rounded bg-muted p-4 text-sm">
        {error.message}
      </pre>
      <button
        onClick={reset}
        className="rounded bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
      >
        Try again
      </button>
    </div>
  );
}

export function PageRouter() {
  return (
    <Routes>
      {routes.map((route) => (
        <Route
          key={route.name}
          path={route.path}
          element={
            <ErrorBoundary
              fallback={(error, reset) => (
                <PageError error={error} reset={reset} />
              )}
            >
              <Suspense fallback={<PageFallback />}>
                <route.component />
              </Suspense>
            </ErrorBoundary>
          }
        />
      ))}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
